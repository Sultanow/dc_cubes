# Imports
from elasticsearch import Elasticsearch
import pandas as pd
import datetime
import numpy as np
import keras
import pickle
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model
from keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
import time

# Create Dataset


def create_dataset(df_binarized, df_overall):
    """ Creates two lists containing the dataset
    for the features X and the variable target y,
    based on two dataframes

    Parameters:
    df_binarized : a multilabel binarized dataframe
    df_overall : a non binarized dataframe

    Returns :
    X : a list of dataframes enriched with features
    y : a list of target variables - the remaining steps in Q
    """

    # extract general features
    # for each item create a corresponding dataset X, y and then concatenate

    # cumsum for ascending steps in Q
    Xs = df_binarized.cumsum()
    # reverse, cumsum, reverse again for remaining steps in Q
    Ys = df_binarized.iloc[::-1].cumsum().iloc[::-1]

    # get features from df_overall
    Q_sizes = df_overall['size'].values
    #Q_items = df_overall['items'].values
    n_added = df_overall['n_added'].values
    n_removed = df_overall['n_removed'].values

    X = list()
    y = list()

    for item in df_binarized.columns:
        # for one item select the rows where it is still in Q
        mask = df_binarized[item] != 0

        # labels to predict (how many remaining steps in Q)
        Y_item = Ys[item][mask]

        # create features (number of steps in Q already in Xs)
        X_item = pd.DataFrame(Xs[item][mask])
        #X_item = X_item.rename(columns = {item: 'n_steps_in_Q'})

        # get the Queue sizes
        X_item['Q_size'] = Q_sizes[mask]

        # Q difference
        X_item['n_added'] = n_added[mask]
        X_item['n_removed'] = n_removed[mask]
        X.append(X_item)
        y.append(Y_item)
    return X, y


# Padding to match the model structure
def pad(sequence, maxlen):
    # fills list post (at the end) with 0s to make even sized sequences
    return pad_sequences(sequence, maxlen=604, dtype='float32', padding='post', value=0.0)


def es_predict(host, port, progress, date):
    start = time.time()
    # Connect to Elasticsearch
    es = Elasticsearch([host], port=port)
    #es.indices.create(index='queues-prediction', ignore=400)

    # Search the ES Stack
    d = []
    for x in range(date-4, date):
        res = es.search(index="queues", body={"query": {
            "bool": {
                "must": [
                    {"match": {
                        "name": "products"}},
                    {"range": {
                        "timestamp": {
                            "gte": "2019-12-"+str(x),
                            "lte": "2019-12-"+str(x),
                            "format": "yyyy-MM-dd"
                        }
                    }
                    }
                ]
            }
        }
        }, size=1440)  # define size
        c = [elem['_source'] for elem in res['hits']['hits']]
        d.extend(c)

    print("Fetching data complete: ", time.time() - start)

    # Build DataFrames
    df = pd.DataFrame(d)
    df = df.iloc[::10, :].copy()  # take ever 10th entry
    df.index = df["timestamp"]
    df.index = pd.to_datetime(df.index, format='%Y-%m-%dT%H:%M:%S.%f%z').sort_values()
    df.drop(columns=['timestamp', 'name', 'tier'], inplace=True)
    df['items'] = [[str(x)] if len(str(x)) < 10 else str(x).split(" ") for x in df['items']]

    # Add features
    lists = df['items'].tolist()
    current = lists[0]
    diff_sets = [[]]
    diff_sets_rev = [[]]
    for next_list in lists[1:]:
        diff_sets.append(sorted(set(current).difference(set(next_list))))
        diff_sets_rev.append(sorted(set(next_list).difference(set(current))))
        current = next_list

    df['diff_items'] = diff_sets
    df['diff_items_rev'] = diff_sets_rev
    df['n_removed'] = df['diff_items'].apply(lambda x: len(x))
    df['n_added'] = df['diff_items_rev'].apply(lambda x: len(x))

    from sklearn.preprocessing import MultiLabelBinarizer
    mlb = MultiLabelBinarizer()
    df_mlb = pd.DataFrame(mlb.fit_transform(df['items']), columns=mlb.classes_)

    X, y = create_dataset(df_mlb, df)

    print("Dataset created: ", time.time() - start)

    # Take the sample data, only items that are in the queue at the last timestamp
    items_pred = df['items'][-1]

    X_pred = list()
    for item in X:
        if item.columns[0] in items_pred:
            X_pred.append(item)

    X_pr = pad([x.values for x in X_pred], 604)

    # Scaling - the same scaler is applied as the one for the model
    scaler_X = pickle.load(open("res_scaler_X_1w.p", "rb"))
    scaler_y = pickle.load(open("res_scaler_y_1w.p", "rb"))

    # n = number of samples, ts = number of Timesteps, d = dimension of input(Features)
    n_tr, ts, d_X = X_pr.shape

    # Create a list to keep track on the steps each item is in the queue, to get the matching prediction later
    steps_X = list()
    for x in X_pr:
        ma = max(x[:, 0])
        steps_X.append(ma)

    # Load the pretrained model and predict with it
    model = load_model("res_model_items_1w.h5")

    pred = model.predict(X_pr)
    # Rescale the predictions
    y_pred = scaler_y.inverse_transform(pred.reshape(-1, 1)).reshape(pred.shape)

    print("Prediction complete: ", time.time() - start)

    # Build the target DF
    pred_list = list()  # item nr., prediction steps
    pred_only = list()  # only the prediction steps
    for x in range(len(X_pr)):
        predict = (int(y_pred[x][int(steps_X[x])]))
        item = X_pred[x].columns[0]
        item_predict = [item, predict]
        pred_list.append(item_predict)
        pred_only.append(predict)

    # Create final data list for the target df containing the items for each future steps
    final_list = list()

    for x in range(int(max(pred_only))):
        items = ''
        for y in pred_list:
            if y[1] >= x:
                ite = y[0] + ' '
                items += ite
        final_list.append(items)

    final_df = pd.DataFrame()
    final_df['items'] = final_list
    final_df['size'] = final_df['items'].apply(lambda x: len(x.split(" ")))
    time_stamps = pd.date_range(
        start=df.index[-1]+datetime.timedelta(minutes=5), periods=len(final_df), freq='5min')
    final_df['timestamp'] = time_stamps
    final_df['timestamp'] = final_df.timestamp.map(
        lambda x: datetime.datetime.strftime(x, '%Y-%m-%dT%H:%M:%S.%f%z'))

    # Uploading the predicted data to ES
    count = 0
    for index, row in final_df.iterrows():
        doc_data = {
            'timestamp': row['timestamp'],
            'tier': 'pic',
            'name': 'products',
            #     'querytime' : 0,
            'size': row['size'],
            'items': row['items']
        }
        count += 1
        es.index('queues-prediction', body=doc_data)
        if count % progress == 0:
            print(str(count) + " Elemente hochgeladen")
    print("Upload complete: ", time.time() - start)
