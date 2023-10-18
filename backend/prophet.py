#!/usr/bin/python
# -*- coding:utf-8 -*-

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

import pandas as pd
import json
import csv
import pickle
import numpy as np

from fbprophet import Prophet

counter = 0
historic_core_name = "dc_cubes"
core_name = "dc_cubes_forecast"
merged_core_name = "dc_cubes_merged"
forecast_steps = 672


def pushData(row):
    global core_name
    global counter
    # defining the api-endpoint
    url = "http://localhost:8983/solr/"+core_name+"/update/json/docs"
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
        print("Commiting... counter:", counter, flush=True)
        requests.get("http://localhost:8983/solr/" +
                     core_name+"/update?commit=true")


def createSolrCore(core_name):
    url = "http://localhost:8983/solr/admin/cores?action=CREATE&name=" + \
        core_name+"&configSet=_default"
    requests.post(url=url)
    print(core_name, " created")


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


def getHistoricData():
    url = 'http://localhost:8983/solr/dc_cubes/select?q=*:*&sort=timestamp%20desc&rows=100000'
    response = requests.get(url).json()['response']
    response
    return response['docs']


def mergeTwoCores(merged_core_name, core1, core2):
    url = "http://localhost:8983/solr/admin/cores?action=mergeindexes&core=" + \
        merged_core_name + "&srcCore=" + core1 + "&srcCore=" + core2
    requests.get(url=url)
    # Commit to materialize changes
    requests.get("http://localhost:8983/solr/" +
                 merged_core_name+"/update?commit=true")
    print(core1 + " and " + core2 + " have been merged to " + merged_core_name)

# splits the data of each cube from the whole df in its own dataframe


def splitInCubesFrames(df):
    unique_server_names = df.server.unique()
    splitted_frames = []
    for name in unique_server_names:
        new_df = df[df['server'] == name].copy()
        splitted_frames.append(new_df)
    return splitted_frames


def makePredictionFrame(cubes_frames, last_timestamp):
    prediction_frames = []
    count_forecasted=1
    count_forcsasts_todo = len(cubes_frames)
    for cube in cubes_frames:

        # extracting information from the current cube
        last_timestamp = cube['timestamp'].iloc[0]
        server_name = cube['server'].iloc[0]
        cluster = cube['cluster'].iloc[0]
        dc = cube['dc'].iloc[0]
        perm = cube['perm'].iloc[0]
        instanz = cube['instanz'].iloc[0]
        verfahren = cube['verfahren'].iloc[0]
        service = cube['service'].iloc[0]

        # get only timestamp and count from the data
        dataset = cube.drop(cube.columns.difference(['timestamp', 'count']), 1)

        # removing timezone from timestamp
        dataset['timestamp'] = pd.to_datetime(dataset['timestamp'])
        dataset['timestamp'] = dataset['timestamp'].dt.tz_localize(None)

        # renaming columns for prophet input requirements
        dataset.rename(columns={"timestamp": "ds", "count": "y"}, inplace=True)

        # predict
        m = Prophet()
        m.fit(dataset)
        future = m.make_future_dataframe(periods=forecast_steps, freq='15min')
        forecast = m.predict(future)
        forecast = forecast['yhat'].tail(672)
        forecast = forecast.astype(int, copy=True)
        forecast *= (forecast > 0)

        # make the dataframe
        next_timestamps = pd.date_range(
            start=last_timestamp, periods=forecast_steps+1, freq='15min',  closed='right')
        
        # create the prediction dataframe for the current server
        d = {'timestamp': next_timestamps, 'cluster': cluster, 'dc': dc,
             'perm': perm, 'instanz': instanz,  'verfahren': verfahren, 'service': service, 'response': 200}
        pred_df = pd.DataFrame(data=d)
        pred_df['count'] = forecast.values
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
        print("predicted: ", count_forecasted, " of ", count_forcsasts_todo,flush=True)
        count_forecasted+=1
    print("Made predictions",flush=True)
    return pd.concat(prediction_frames, ignore_index=True)


if __name__ == "__main__":
    print("Started prophet.py ...", flush=True)

    # get existing solr cores
    url = "http://localhost:8983/solr/admin/cores?action=STATUS"
    response = requests.get(url).json()
    activeCores = response['status'].keys()

    # if forecast core exists
    if core_name in activeCores:
        print(core_name + " already exists")
        # delete old data/predictions
        deleteCoreDocuments(core_name)
    # else forecast core doesn't exist
    else:
        print(core_name + " doesn't exist")
        # create an new forecast solr core
        createSolrCore(core_name)
        # init schema
        initSchema(core_name)

    # get data from historic solr core
    df = pd.DataFrame.from_dict(getHistoricData())
    # df = df.set_index('timestamp')
    last_timestamp = df['timestamp'][0]
    # df.index = pd.to_datetime(df.index).sort_values()

    # split cubes in own frames
    cubes_frames = splitInCubesFrames(df)

    # forecast
    prediction_df = makePredictionFrame(cubes_frames, last_timestamp)
    prediction_df.apply(pushData, axis=1)
    print("Last Commit...",flush=True)
    requests.get("http://localhost:8983/solr/"+core_name+"/update?commit=true")

    # if merged core exists
    if merged_core_name in activeCores:
        print(merged_core_name + " already exists")
        # delete old data/predictions
        deleteCoreDocuments(merged_core_name)
    # else forecast core doesn't exist
    else:
        print(merged_core_name + " doesn't exist")
        # create an new forecast solr core
        createSolrCore(merged_core_name)
        # init schema
        initSchema(merged_core_name)

    # merged historic and forecast core
    mergeTwoCores(merged_core_name, historic_core_name, core_name)
    print("Finished", flush=True)
