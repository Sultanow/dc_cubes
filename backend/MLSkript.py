import requests
import pandas as pd
import json
import csv
import pickle
import numpy as np
import keras
from keras.models import Sequential, load_model
from keras.layers import Dense, Activation, Dropout

counter = 0
model_file_path = "model.pkl"
core_name = "test"
history_steps = 384


def pushData(row):
    # defining the api-endpoint
    url = "http://localhost:8983/solr/pyTest/update/json?wt=json"

    # data to be sent to api
    data = {
        "add": {
            "doc": {
                "timestamp": row["timestamp"],
                "host": row["host"],
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
        }
    }
    headers = {'Content-type': 'application/json'}
    # sending post request
    requests.post(url=url, data=json.dumps(data), headers=headers)
    counter += 1
    if (counter % 1000 == 0):
        print("Commiting... counter:", counter)
        requests.post("http://localhost:8983/solr/" +
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

# löscht immer den ganzen core


def deleteSolrCore(core_name, deleteEverything):
    url = "http://localhost:8983/solr/admin/cores?action=UNLOAD&core="+core_name
    print(deleteEverything)
    if (deleteEverything):
        url += "&deleteInstanceDir=true"
    requests.get(url)
    print(core_name, "old documents deleted")


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
    url = 'http://localhost:8983/solr/dc_cubes/select?q=*:*&sort=timestamp%20desc&rows=15000'
    response = requests.get(url).json()['response']
    response
    return response['docs']


# splits the data of each cube from the whole df in its own dataframe
def splitInCubesFrames(df):
    unique_server_names = df.server.unique()
    splitted_frames = []
    for name in unique_server_names:
        new_df = df[df['server'] == name][-382:].copy()
        splitted_frames.append(new_df)
    return splitted_frames


if __name__ == "__main__":
    print("MLSkript.py wird ausgeführt")

    # get existing solr cores
    url = "http://localhost:8983/solr/admin/cores?action=STATUS"
    response = requests.get(url).json()
    activeCores = response['status'].keys()

    # if forecast core exists
    if core_name in activeCores:
        print(core_name + " already exists")

        # delete old data/predictions
        deleteSolrCore(core_name, False)

    # else forecast core doesn't exist
    else:
        print(core_name + " doesn't exist")

        # create an new forecast solr core
        createSolrCore(core_name)

        # init schema
        initSchema(core_name)

    # get data from historic solr core
    df = pd.DataFrame.from_dict(getHistoricData())
    df = df.set_index('timestamp')
    last_timestamp = df.index[0]
    df.index = pd.to_datetime(df.index).sort_values()
    print(last_timestamp)

    # split cubes in own frames
    cubes_frames = splitInCubesFrames(df)
    # print(last_timestamp)

    # load the trained model
    model = load_model('dc_lstm_ml_model.h5')

    # forecast

    # transform the forecast

    # push the data to the forecast core

    # ----------------------------------------
    # load Model
    # with open(filePath, "rb") as pklfile:
    #     model = pickle.load(pklfile)
    # xinput = "...."
    # model.predict(xinput, verbose=0)
    # deleteSolrCore(core_name)
    # createSolrCore(core_name)
    # initSchema(core_name)

    #df = pd.read_csv(filePath, sep=",", encoding="latin1")
    #df.apply(pushData, axis=1)
