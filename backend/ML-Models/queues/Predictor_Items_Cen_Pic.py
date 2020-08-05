# Imports
from elasticsearch import Elasticsearch
import pandas as pd
import numpy as np
import datetime
import keras
import pickle
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import time
from sklearn.preprocessing import MultiLabelBinarizer
from keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
import pickle
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model

# Functions


def es_timerange(start, end, rate, tier, host, port):
    """
    a function that returns data from ES based on the time period
    and also transforms and resamples the data into a pandas dataframe to further work with

    start : startdate in format "yyyy-MM-dd"
    end : enddate in format "yyyy-MM-dd"
    rate : the sample rate, each nth entry is taken
    tier : name of the queues
    host : name of the host e.g. 'localhost'
    port : number of port e.g. 9200

    example:
    es_timerange("2020-06-01","2020-06-10", 10, 'pic', 'localhost', 9200)
    """
    es = Elasticsearch([host], port=port)
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
        }, size=1440)  # define size
        daily_data = [elem['_source'] for elem in res['hits']['hits']]
        final_data.extend(daily_data)

    df = pd.DataFrame(final_data)

    df = df.iloc[::rate, :].copy()  # take every nth entry
    df.index = df["timestamp"]
    df.index = pd.to_datetime(df.index, format='%Y-%m-%dT%H:%M:%S.%f%z').sort_values()
    df.drop(columns=['timestamp', 'name'], inplace=True)  # drop unnecassry columns
    df['items'] = [[str(x)] if len(str(x)) < 10 else str(x).split(" ")
                   for x in df['items']]  # convert items to list
    df['size'] = pd.to_numeric(df['size'])
    return df


def create_dataset(df_pic, df_cen):
    """Adds features to the dataframe and returns the prepared X dataset

    df_pic : dataframe containing entries of the pic queue
    df_cen : dataframe containing entries of the censhare queue
    """

    # Create a multi label binarized dataframe
    mlb = MultiLabelBinarizer()
    df_cen_mlb = pd.DataFrame(mlb.fit_transform(df_cen['items']), columns=mlb.classes_)
    df_pic_mlb = pd.DataFrame(mlb.fit_transform(df_pic['items']), columns=mlb.classes_)

    # Add features "n_added", "n_removed" items
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

    sizes_pic = df_pic['size'].values
    added_pic = df_pic['n_added_items'].values
    removed_pic = df_pic['n_removed_items'].values
    df_pic_cumsum = df_pic_mlb.cumsum()
    df_pic_cumsum_rev = df_pic_mlb.iloc[::-1].cumsum().iloc[::-1]
    # items to predict, which are left at the last timestamp
    pred = df_pic['items'][-1]+df_cen['items'][-1]

    data_x = list()

    for item in df_cen_mlb.columns:
        if item in pred:
            if item in df_pic_mlb.columns:

                mask_cen = df_cen_mlb[item] != 0
                mask_pic = df_pic_mlb[item] != 0

                position_cen = df_cen_mlb[item][mask_cen].index[0]
                position_pic = df_pic_mlb[item][mask_pic].index[-1]
                position_pic_first = df_pic_mlb[item][mask_pic].index[0]

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

                steps_list = list(range(1, diff+1))

                df_item = pd.DataFrame(data=steps_list, columns=[item]).astype(str).astype(int)

                df_item['Q_size'] = size
                df_item['n_added'] = added
                df_item['n_removed'] = removed
                df_item['cen'] = 1

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
                #df_item['cen'] = 1

                data_x.append(df_item)
        else:
            continue

    for item in df_pic_mlb.columns:
        if item in pred:
            if item not in df_cen_mlb.columns:
                mask = df_pic_mlb[item] != 0

                X_item = pd.DataFrame(df_pic_cumsum[item][mask])
                #X_item = X_item.rename(columns = {item: 'n_steps_in_Q'})
                X_item['Q_size'] = sizes_pic[mask]
                X_item['n_added'] = added_pic[mask]
                X_item['n_removed'] = removed_pic[mask]
                X_item['cen'] = 0

                data_x.append(X_item)

            else:
                continue

    return data_x


def pad(sequence, maxlen):
    # fills list post (at the end) with 0s to make even sized sequences
    return pad_sequences(sequence, maxlen=720, dtype='float32', padding='post', value=0.0)


def predict_items(host, port, progress, start, stop):
    es = Elasticsearch([host], port=port)
    # Get Data from ES
    df_pic = es_timerange(start, stop, 10, "pic", host, port)
    df_cen = es_timerange(start, stop, 10, "censhare", host, port)

    # Create the dataset based on the 2 dataframes for each queue
    X = create_dataset(df_pic, df_cen)

    # Pad the sequences
    X_pr = pad([x.values for x in X], 720)

    # Scale the sequences
    scaler_X = pickle.load(open("res_scaler_X_cen_pic.p", "rb"))
    scaler_y = pickle.load(open("res_scaler_y_cen_pic.p", "rb"))
    # n = number of samples, ts = number of Timesteps, d = dimension of input(Features)
    n_tr, ts, d_X = X_pr.shape
    X_pr_scaled = scaler_X.fit_transform(X_pr.reshape(n_tr*ts, d_X)).reshape(X_pr.shape)

    # Create a list containing the max number of steps for each item
    steps_X = list()
    for x in X_pr:
        ma = max(x[:, 0])
        steps_X.append(ma)

    # Load model, predict and rescale
    model = load_model("res_model_items_pic_cen.h5")
    pred = model.predict(X_pr_scaled)
    y_pred = scaler_y.inverse_transform(pred.reshape(-1, 1)).reshape(pred.shape)

    # Create two lists, one containing only the predictions and one with the corresponding item number
    pred_list = list()
    pred_only = list()
    for x in range(len(X_pr)):
        predict = (int(y_pred[x][int(steps_X[x]-1)]))
        item = X[x].columns[0]
        item_predict = [item, predict]
        pred_list.append(item_predict)
        pred_only.append(predict)

    # Create a final list, imitating the ES structure,
    final_list = list()

    for x in range(int(max(pred_only))):
        items = ''
        for y in pred_list:
            if y[1] >= x:
                ite = y[0] + ' '
                items += ite
        final_list.append(items)

    # Create the final DataFrame
    final_df = pd.DataFrame()
    final_df['items'] = final_list
    # Calculate sizes
    final_df['size'] = final_df['items'].apply(lambda x: len(x.split(" "))-1)
    # Add timestamps
    time_stamps = pd.date_range(
        start=df_pic.index[-1]+datetime.timedelta(minutes=5), periods=len(final_df), freq='10min')  # add timestamps
    final_df['timestamp'] = time_stamps
    final_df['timestamp'] = final_df.timestamp.map(
        lambda x: datetime.datetime.strftime(x, '%Y-%m-%dT%H:%M:%S.%f%z'))

    # Upload data to ES
    count = 0
    for index, row in final_df.iterrows():
        doc_data = {
            'timestamp': row['timestamp'],
            'tier': 'pic',
            'name': 'products',
            #     'querytime' : 0,
            'size': row['size'],
            'items': row['items']
            # 'cen' : row['cen']
        }
        count += 1
        es.index('queues-prediction', body=doc_data)
        if count % progress == 0:
            print(str(count) + " Elemente hochgeladen")
