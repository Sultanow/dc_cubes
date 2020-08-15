# Imports
from elasticsearch import Elasticsearch
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
import keras
from keras.preprocessing.sequence import pad_sequences
import pandas as pd
import numpy as np
import datetime
import time
import pickle
from tensorflow.keras.models import load_model

# Functions


def es_to_df(start, end, s_rate, tier, host, port):
    """
    Returns data from ES based on the given time period and tier.
    Transforms and downsamples the data into a pandas dataframe.

    Parameters:
    start (str): start date in format "yyyy-MM-dd"
    end (str): end date in format "yyyy-MM-dd"
    s_rate (int): the sample rate, each nth entry is taken
    tier (str): name of the queue (tier) e.g. 'pic'
    host (str): name of the host e.g. 'localhost'
    port (int): number of port e.g. 9200

    Returns:
    pd.DataFrame: pandas DataFrame

    Example:
    es_timerange("2020-06-01", "2020-06-10", 10, 'pic', 'localhost', 9200)
    """

    # Establish connection
    es = Elasticsearch([host], port=port)

    # Create a list of the given dates between start date and end date
    slist = start.split("-")
    slist = map(int, slist)
    slist = list(slist)

    elist = end.split("-")
    elist = map(int, elist)
    elist = list(elist)

    sdate = datetime.date(slist[0], slist[1], slist[2])
    edate = datetime.date(elist[0], elist[1], elist[2])
    delta = edate - sdate

    datelist = list()

    for i in range(delta.days + 1):
        day = sdate + datetime.timedelta(days=i)
        datelist.append(day)

    # Get the matching data for each day and store it in a list
    final_data = list()

    for date in datelist:
        res = es.search(index="queues", body={"query": {
            "bool": {
                                              "must": [
                                                  {"match": {
                                                      "name": "products"}},
                                                  {"match": {
                                                      "tier": tier}},
                                                  {"range": {
                                                      "timestamp": {
                                                          "gte": str(date),
                                                          "lte": str(date),
                                                          "format": "yyyy-MM-dd"
                                                      }
                                                  }
                                                  }
                                              ]
                                              }
        }
        }, size=1440)  # defined size of 1440 entries per day
        daily_data = [elem['_source'] for elem in res['hits']['hits']]
        final_data.extend(daily_data)

    # Create pandas dataframe from final_data list
    df = pd.DataFrame(final_data)

    # Downsample the entries
    df = df.iloc[::s_rate, :].copy()  # take every nth entry
    # Format the timestamp
    df.index = df["timestamp"]
    df.index = pd.to_datetime(df.index, format='%Y-%m-%dT%H:%M:%S.%f%z').sort_values()
    df.drop(columns=['timestamp', 'name'], inplace=True)  # drop unnecassry columns
    # Create a list of the items
    df['items'] = [[str(x)] if len(str(x)) < 10 else str(x).split(" ")
                   for x in df['items']]  # convert items to list
    # Change datatype of size
    df['size'] = pd.to_numeric(df['size'])

    return df


def create_dataset_predict(df_pic, df_cen):
    """Adds features to the dataframe and returns the prepared dataset containing
    the sample items

    Parameters:
    df_pic (pd.DataFrame): dataframe containing entries of the pic queue
    df_cen (pd.DataFrame): dataframe containing entries of the censhare queue

    Returns:
    list: list containing the selected sample items
    """

    # Create a multi label binarized dataframe
    mlb = MultiLabelBinarizer()
    df_cen_mlb = pd.DataFrame(mlb.fit_transform(df_cen['items']), columns=mlb.classes_)
    df_pic_mlb = pd.DataFrame(mlb.fit_transform(df_pic['items']), columns=mlb.classes_)

    # Add features: "n_added_items", "n_removed_items"
    lists = df_pic['items'].tolist()
    current = lists[0]
    diff_sets = [[]]
    diff_sets_rev = [[]]
    for next_list in lists[1:]:
        diff_sets.append(sorted(set(current).difference(set(next_list))))
        diff_sets_rev.append(sorted(set(next_list).difference(set(current))))
        current = next_list

    df_pic['diff_items'] = diff_sets
    df_pic['diff_items_rev'] = diff_sets_rev
    df_pic['n_removed_items'] = df_pic['diff_items'].apply(lambda x: len(x))
    df_pic['n_added_items'] = df_pic['diff_items_rev'].apply(lambda x: len(x))

    # Get only the values from each column
    sizes_pic = df_pic['size'].values
    added_pic = df_pic['n_added_items'].values
    removed_pic = df_pic['n_removed_items'].values

    # Cummulate multi label binarized dataframe
    df_pic_cumsum = df_pic_mlb.cumsum()
    df_pic_cumsum_rev = df_pic_mlb.iloc[::-1].cumsum().iloc[::-1]

    # Items to predict, which are left at the last timestamp in both queues
    pred = df_pic['items'][-1]+df_cen['items'][-1]

    data_x = list()

    # Create each sample
    for item in df_cen_mlb.columns:  # first queue
        if item in pred:
            if item in df_pic_mlb.columns:

                # Mask the occurence of the item in both queues
                mask_cen = df_cen_mlb[item] != 0
                mask_pic = df_pic_mlb[item] != 0

                # Get the position it appears in the first queue and the first and last time in the second queue
                position_cen = df_cen_mlb[item][mask_cen].index[0]
                position_pic = df_pic_mlb[item][mask_pic].index[-1]
                position_pic_first = df_pic_mlb[item][mask_pic].index[0]

                # Filter out odd behaviour (if it first appears in the second and afterwards in the first)
                # and slice the features based on the positions
                if position_cen > position_pic:
                    diff = position_pic - position_pic_first
                    size = sizes_pic[position_pic_first:position_pic]
                    added = added_pic[position_pic_first:position_pic]
                    removed = removed_pic[position_pic_first:position_pic]
                else:
                    diff = position_pic - position_cen
                    size = sizes_pic[position_cen:position_pic]
                    added = added_pic[position_cen:position_pic]
                    removed = removed_pic[position_cen:position_pic]

                # Create list of steps it stays in the queue
                steps_list = list(range(1, diff+1))

                # Create a dataframe and fill in the features
                df_item = pd.DataFrame(data=steps_list, columns=[item]).astype(str).astype(int)
                df_item['Q_size'] = size
                df_item['n_added'] = added
                df_item['n_removed'] = removed
                df_item['cen'] = 1  # mark that it appeared in the first queue

                # Filter out items with no values
                if len(df_item) == 0:
                    continue

                data_x.append(df_item)

            else:
                mask_cen = df_cen_mlb[item] != 0

                position_cen = df_cen_mlb[item][mask_cen].index[0]

                diff = len(df_cen_mlb) - position_cen

                size = sizes_pic[position_cen:]
                added = added_pic[position_cen:]
                removed = removed_pic[position_cen:]

                steps_list = list(range(1, diff+1))

                df_item = pd.DataFrame(data=steps_list, columns=[item])
                df_item['Q_size'] = size
                df_item['n_added'] = added
                df_item['n_removed'] = removed
                df_item['cen'] = 1

                data_x.append(df_item)
        else:
            continue

    for item in df_pic_mlb.columns:
        if item in pred:
            if item not in df_cen_mlb.columns:
                mask = df_pic_mlb[item] != 0

                df_item = pd.DataFrame(df_pic_cumsum[item][mask])
                #X_item = X_item.rename(columns = {item: 'n_steps_in_Q'})
                df_item['Q_size'] = sizes_pic[mask]
                df_item['n_added'] = added_pic[mask]
                df_item['n_removed'] = removed_pic[mask]
                df_item['cen'] = 0

                data_x.append(df_item)

            else:
                continue

    return data_x


def scale_pad(dataset, maxlen):
    '''Scales and pads the sequences (samples)

    Parameters:
    dataset (list): list containing the samples
    maxlen (int): max number of timesteps/value to pad

    Returns:
    X_pad_scaled (list): list with padded and scaled sequences
    X_pad (list): list with padded sequences'''

    # Load the scaler used for training
    scaler_X = pickle.load(open("scaler_x_2q.p", "rb"))

    # Scale the dataset
    _ = [scaler_X.partial_fit(x) for x in dataset]
    X_scaled = [scaler_X.transform(x) for x in dataset]

    # Pad the sequences

    def pad(sequence, maxlen):
        # fills list post (at the end) with 0s to make even sized sequences
        return pad_sequences(sequence, maxlen=maxlen, dtype='float32', padding='post', value=0.0)

    X_pad_scaled = pad([x for x in X_scaled], maxlen)
    X_pad = pad([x.values for x in dataset], maxlen)

    return X_pad_scaled, X_pad


def predict_upload(df_pic, dataset, dataset_pad, dataset_scaled, host, port):
    '''Generates a prediction for each item and uploads the
    transformed data to ES

    Parameters:
    df_pic (pd.DataFrame): dataframe of the second queue
    dataset (list): original dataset
    dataset_scaled (list): list with padded and scaled sequences
    host (str): name of the host e.g. 'localhost'
    port (int): number of port e.g. 9200

    '''
    # Establish connection to ES
    es = Elasticsearch([host], port=port)

    # Load the pretrained model, predict and rescale the prediction
    model = load_model("model_2q_10epochs.h5")
    pred = model.predict(dataset_scaled)
    scaler_y = pickle.load(open("scaler_y_2q.p", "rb"))
    pred_rescaled = scaler_y.inverse_transform(pred.reshape(-1, 1)).reshape(pred.shape)

    # Create a list containing the maximum number of steps for each item
    max_steps = list()
    for item in dataset_pad:
        max_step = max(item[:, 0])
        max_steps.append(max_step)

    # Create lists containing the predictions and corresponding item numbers
    pred_list = list()
    pred_only = list()
    for x in range(len(dataset_pad)):
        # take the prediction at the last step
        predict = (int(pred_rescaled[x][int(max_steps[x]-1)]))
        item = dataset[x].columns[0]  # get the item number
        item_predict = [item, predict]
        pred_list.append(item_predict)
        pred_only.append(predict)

    # Create the final list to match the ES structure
    final_list = list()

    for x in range(int(max(pred_only))):
        items = ''
        for prediction in pred_list:
            if prediction[1] >= x:
                item = prediction[0] + ' '
                items += item
        final_list.append(items)

    # Create the final DataFrame
    final_df = pd.DataFrame()
    final_df['items'] = final_list
    final_df['size'] = final_df['items'].apply(lambda x: len(
        x.split(" "))-1)  # calculate the size based on items

    # Generate timestamps based on the last timestamp
    time_stamps = pd.date_range(
        start=df_pic.index[-1]+datetime.timedelta(minutes=10), periods=len(final_df), freq='10min')
    final_df['timestamp'] = time_stamps
    final_df['timestamp'] = final_df.timestamp.map(
        lambda x: datetime.datetime.strftime(x, '%Y-%m-%dT%H:%M:%S.%f%z'))

    # Upload the data back to ES
    # Delete old prediction data
    es.indices.delete(index='queues-prediction', ignore=[400, 404])
    # Create new index to store again
    es.indices.create(index='queues-prediction', ignore=400)

    count = 0
    for index, row in final_df.iterrows():
        doc_data = {
            'timestamp': row['timestamp'],
            'tier': 'pic',
            'name': 'products',
            # 'querytime' : 0,
            'size': row['size'],
            'items': row['items']
            # 'cen' : row['cen']
        }
        count += 1
        es.index('queues-prediction', body=doc_data)
        if count % 10 == 0:
            print(str(count) + " Elemente hochgeladen")


def predict(start, end, host, port):
    """Whole prediction process in one function

    Parameters:
    start (str): start date in format "yyyy-MM-dd"
    end (str): end date in format "yyyy-MM-dd"
    host (str): name of the host e.g. 'localhost'
    port (int): number of port e.g. 9200

    """
    start_time = time.time()

    df_pic = es_to_df(start, end, 10, "pic", host, port)
    df_cen = es_to_df(start, end, 10, "censhare", host, port)

    print("DataFrame complete: ", time.time() - start_time)

    X = create_dataset_predict(df_pic, df_cen)

    print("Dataset with", len(X), "items complete: ", time.time() - start_time)

    X_pad_scaled, X_pad = scale_pad(X, 720)

    predict_upload(df_pic, X, X_pad, X_pad_scaled, host, port)

    print("Upload complete: ", time.time() - start_time)


predict("2020-06-08", "2020-06-12", 'localhost', 9200)
