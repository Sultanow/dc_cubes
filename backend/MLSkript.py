#!/usr/bin/python
#-*- coding:utf-8 -*-

import requests
import pandas as pd
import json
import csv
import pickle
import numpy as np
import keras
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout

def pushData(row):
    global counter
    global coreName
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
        requests.post("http://localhost:8983/solr/"+coreName+"/update?commit=true")

def createSolrCore(coreName):
    url = "http://localhost:8983/solr/admin/cores?action=CREATE&name="+coreName+"&configSet=_default"
    requests.post(url = url)
    print(coreName, " created")

"""
if deleteEverything = True all files associated with the core are deleted aswell.
See: https://lucene.apache.org/solr/guide/6_6/coreadmin-api.html#CoreAdminAPI-UNLOAD
"""
def deleteSolrCore(coreName, deleteEverything = False):
    url = "http://localhost:8983/solr/admin/cores?action=UNLOAD&core="+coreName
    if (deleteEverything):
        url += "&deleteInstanceDir=true"
    requests.get(url)
    print(coreName, " deleted")

def initSchema(coreName):
    url = "http://localhost:8983/solr/"+coreName+"/schema"
    headers = {'Content-type': 'application/json'}
    rowsDict =  {
        "timestamp": "pdate", "host": "string", "cluster": "pint", "dc": "pint", "perm": "pint", "instanz": "string", "verfahren": "string",
        "service": "string", "response": "pint", "count": "pint", "minv": "pint", "maxv": "pint", "avg": "pfloat", "var": "pfloat",
        "dev_upp": "pfloat", "dev_low": "pfloat", "perc90": "pfloat", "perc95": "pfloat", "perc99": "pfloat", "sum": "pint",
        "sum_of_squares": "pint", "server": "string"}

    for name in rowsDict:
        data = {
            "add-field":{"stored": "true","docValues": "true","indexed": "false", "multiValued": "false", "name":name,"type":rowsDict[name]}
        }
        requests.post(url=url, data=json.dumps(data), headers=headers)
    print(coreName, " schema inited")
    

if __name__ == "__main__":
    print("MLSkript.py ausgeführt")
<<<<<<< Updated upstream
    counter = 0;
    filePath = "model.pkl"
    coreName = "dc_cubes_forecast"

    # load Model
    with open(filePath, "rb") as pklfile:
        model = pickle.load(pklfile)
    xinput = "...." 
    model.predict(xinput, verbose=0)
    # deleteSolrCore(coreName)
    # createSolrCore(coreName)
    # initSchema(coreName)

    #df = pd.read_csv(filePath, sep=",", encoding="latin1")
    #df.apply(pushData, axis=1)
=======
    filePath = "/home/burak/Schreibtisch/dc_cubes/src/scripts/PresentationPrediction.csv"
    df = pd.read_csv(filePath, sep=",", encoding="latin1")
    df.apply(pushData, axis=1)
    print("Data was pushed to Solr/dc_cubes_forecast.")
>>>>>>> Stashed changes
