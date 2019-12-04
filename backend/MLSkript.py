import requests
import pandas as pd
import json
import csv
import pickle
import numpy as np
import keras
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout

counter = 0
model_file_path = "model.pkl"
core_name = "dc_cubes_forecaste"

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

    # else forecast core doesn't exist
    else:
        print(core_name + " doesn't exist")

        # create an new forecast solr core

        # init schema

    # get data from historic solr core

    # transform the data to fit as model input

    # load the trained models

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


def deleteSolrCore(core_name, deleteEverything=False):
    url = "http://localhost:8983/solr/admin/cores?action=UNLOAD&core="+core_name
    if (deleteEverything):
        url += "&deleteInstanceDir=true"
    requests.get(url)
    print(core_name, " deleted")


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
