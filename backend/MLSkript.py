#!/usr/bin/python
#-*- coding:utf-8 -*-

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

import pandas as pd
import json
import csv
import pickle
import numpy as np
import keras
from keras.models import Sequential, load_model
from keras.layers import Dense, Activation, Dropout
measureInterval = 15 #min
daysToPredict = 5
pred_horizon = (60//measureInterval) * 24 * daysToPredict #5 days (4*24*5), timestep = 15min
hours_history = 8
n_history = (60//measureInterval)*hours_history 
counter = 0

historic_core_name = "dc_cubes_historic"
forecast_core_name = "dc_cubes_forecast"
merged_core_name = "dc_cubes_merged"
history_steps = n_history
forecast_steps = pred_horizon


def pushForecastData(row):
    global forecast_core_name
    global counter
    # defining the api-endpoint
    url = "http://localhost:8983/solr/"+forecast_core_name+"/update/json/docs"
    # data to be sent to api
    data = {
                "timestamp": row["timestamp"],
                "cluster": row["cluster"],
                "dc": row["dc"],
                "perm": row["perm"],
                "instanz": row["instanz"],
                "verfahren": row["verfahren"],
                "service": row["verfahren"],
                "response": row["response"],
                "count": row["count"],
                "minv": row["minv"],
                "maxv": row["maxv"],
                "avg": row["avg"],
                "var": row["var"],
                "dev_upp": row["dev_upp"],
                "dev_low": row["dev_low"],
                "perc90": row["perc90"],
                "perc95": row["perc95"],
                "perc99": row["perc99.9"],
                "sum": row["sum"],
                "sum_of_squares": row["sum_of_squares"],
                "server": row["server"]
            }
    session = requests.Session()
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    session.get(url)
    headers = {'Content-type': 'application/json'}
    # sending post request
    session.post(url=url, data=json.dumps(data), headers=headers)
    counter += 1
    if (counter % 1000 == 0):
        print("Commiting... counter:", counter)
        requests.get("http://localhost:8983/solr/"+forecast_core_name+"/update?commit=true")

def createSolrCore(forecast_core_name):
    url = "http://localhost:8983/solr/admin/cores?action=CREATE&name=" + \
        forecast_core_name+"&configSet=_default"
    requests.post(url=url)
    print(forecast_core_name, " created")


"""
if deleteEverything = True all files associated with the core are deleted aswell.
See: https://lucene.apache.org/solr/guide/6_6/coreadmin-api.html#CoreAdminAPI-UNLOAD
"""


def deleteSolrCore(core_name, deleteEverything):  # löscht immer den ganzen core
    url = "http://localhost:8983/solr/admin/cores?action=UNLOAD&core="+core_name
    
    if (deleteEverything):
        url += "&deleteInstanceDir=true"
    requests.get(url)
    print(core_name, " core deleted")


def deleteCoreDocuments(core_name):
    url = "http://localhost:8983/solr/"+core_name + \
        "/update?commitWithin=1000&overwrite=true&wt=json"
    headers = {'Content-type': 'application/json'}
    data = {'delete': {'query': '*:*'}}
    requests.post(url=url, data=json.dumps(data), headers=headers)
    print("deleted old documents from "+core_name+" core")


def initSchema(core_name):
    url = "http://localhost:8983/solr/"+core_name+"/schema"
    headers = {'Content-type': 'application/json'}
    rowsDict = {
        "timestamp": "pdate", "host": "string", "cluster": "pint", "dc": "pint", "perm": "pint", "instanz": "string", "verfahren": "string",
        "service": "string", "response": "pint", "count": "pint", "minv": "pint", "maxv": "pint", "avg": "pfloat", "var": "pfloat",
        "dev_upp": "pfloat", "dev_low": "pfloat", "perc90": "pfloat", "perc95": "pfloat", "perc99": "pfloat", "sum": "pint",
        "sum_of_squares": "pint", "server": "string"}

    for name in rowsDict:
        data = {
            "add-field": {"stored": "true", "docValues": "true", "indexed": "false", "multiValued": "false", "name": name, "type": rowsDict[name]}
        }
        requests.post(url=url, data=json.dumps(data), headers=headers)
    print(core_name, " schema inited")


def getData(core_name):
    # from 1 Month, there are about 90k entries. 2 clusters * 2 dcs * 8 instances * (4 weeks * 7 days * 24 hours * 4 (15min intervall))
    url = 'http://localhost:8983/solr/'+core_name+'/select?q=*:*&sort=timestamp%20asc&rows=100000'
    response = requests.get(url).json()['response']
    response
    return response['docs']

def mergeTwoCores(merged_core_name, core1, core2):
    url = "http://localhost:8983/solr/admin/cores?action=mergeindexes&core=" + merged_core_name + "&srcCore=" + core1 + "&srcCore=" + core2
    requests.get(url=url)
    # Commit to materialize changes
    requests.get("http://localhost:8983/solr/"+merged_core_name+"/update?commit=true")
    print(core1 + " and " +  core2 + " have been merged to " + merged_core_name)

# splits the data of each cube from the whole df in its own dataframe
def splitInCubesFrames(df):
    unique_server_names = df.server.unique()
    splitted_frames = []
    for name in unique_server_names:
        new_df = df[df['server'] == name][-history_steps:].copy()
        splitted_frames.append(new_df)
    return splitted_frames


def makePredictionFrame(model, cubes_frames, last_timestamp):
    prediction_frames = []
    for cube in cubes_frames:
        # transform pre prediction input

        # extracting information from the current server
        last_timestamp = cube.index[-1]
        server_name = cube['server'].iloc[0]
        cluster = cube['cluster'].iloc[0]
        dc = cube['dc'].iloc[0]
        perm = cube['perm'].iloc[0]
        instanz = cube['instanz'].iloc[0]
        verfahren = cube['verfahren'].iloc[0]
        service = cube['service'].iloc[0]

        cube.drop(cube.columns.difference(['count']), axis=1, inplace=True)

        # Converting the index as date
        cube.index = pd.to_datetime(cube.index).sort_values()

        # feature engineering
        minutes = cube.index.minute
        hours = cube.index.hour
        day = cube.index.dayofweek
        cube['minute'] = minutes
        cube['hour'] = hours
        cube['day'] = day

        # Standardise
        import numpy as np
        from sklearn.preprocessing import MinMaxScaler

        dataset = cube.values

        # standardise
        scaler = MinMaxScaler()
        scaler.fit(dataset)
        dataset = scaler.transform(dataset)

        # predict
        pred_input = dataset
        pred_input.shape
        pred_input = pred_input.reshape(
            (1, pred_input.shape[0], pred_input.shape[1]))
        prediction = model.predict(pred_input)

        # transform pre solr
        prediction = prediction.reshape((forecast_steps, 1))
        prediction = np.hstack((prediction, np.zeros(
            (prediction.shape[0], 3), dtype=prediction.dtype)))
        prediction = prediction = scaler.inverse_transform(prediction)
        prediction = prediction[:, [0]]
        int_prediction = prediction.astype(int, copy=True)
        prediction = int_prediction
        prediction *= (prediction > 0)

        # make the dataframe
        next_timestamps = pd.date_range(
            start=last_timestamp, periods=forecast_steps+1, freq='15min',  closed='right')
        # create the prediction dataframe for the current server
        d = {'timestamp': next_timestamps, 'cluster': cluster, 'dc': dc,
             'perm': perm, 'instanz': instanz,  'verfahren': verfahren, 'service': service, 'response': 200}
        pred_df = pd.DataFrame(data=d)
        pred_df['count'] = prediction
        pred_df['minv'] = 0
        pred_df['maxv'] = 0
        pred_df['avg'] = 0
        pred_df['var'] = 0
        pred_df['dev_upp'] = 0
        pred_df['dev_low'] = 0
        pred_df['perc90'] = 0
        pred_df['perc95'] = 0
        pred_df['perc99.9'] = 0
        pred_df['sum'] = 0
        pred_df['sum_of_squares'] = 0
        pred_df['server'] = server_name

        pred_df['timestamp'] = pred_df['timestamp'].dt.strftime(
            '%Y-%m-%dT%H:%M:00Z')
        prediction_frames.append(pred_df)
    print("Made predictions")
    return pd.concat(prediction_frames, ignore_index=True)


if __name__ == "__main__":
    print("Started MLSkript.py ...")

    # get existing solr cores
    url = "http://localhost:8983/solr/admin/cores?action=STATUS"
    response = requests.get(url).json()
    activeCores = response['status'].keys()

    # if forecast core exists
    if forecast_core_name in activeCores:
        print(forecast_core_name + " already exists")
        # delete old data/predictions
        deleteCoreDocuments(forecast_core_name)
    # else forecast core doesn't exist
    else:
        print(forecast_core_name + " doesn't exist")
        # create an new forecast solr core
        createSolrCore(forecast_core_name)
        # init schema
        initSchema(forecast_core_name)

    # get data from historic solr core
    df = pd.DataFrame.from_dict(getData(historic_core_name))
    last_timestamp = df.timestamp.max()
    df = df.set_index('timestamp')
    df.index = pd.to_datetime(df.index).sort_values()

    # split cubes in own frames
    cubes_frames = splitInCubesFrames(df)

    # load the trained model
    model = load_model('cnn_multistep_multivariate.h5')

    # forecast
    prediction_df = makePredictionFrame(model, cubes_frames, last_timestamp)
    prediction_df.apply(pushForecastData, axis=1)
    print("Last Commit...")
    requests.get("http://localhost:8983/solr/"+forecast_core_name+"/update?commit=true")

    # # if merged core exists
    # if merged_core_name in activeCores:
    #     print(merged_core_name + " already exists")
    #     # delete old data/predictions
    #     deleteCoreDocuments(merged_core_name)
    # # else forecast core doesn't exist
    # else:
    #     print(merged_core_name + " doesn't exist")
    #     # create an new forecast solr core
    #     createSolrCore(merged_core_name)
    #     # init schema
    #     initSchema(merged_core_name)

    # # merged historic and forecast core
    # mergeTwoCores(merged_core_name, historic_core_name, forecast_core_name)
