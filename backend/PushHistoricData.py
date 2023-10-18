import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

import pandas as pd
import json
import csv
import pickle
import numpy as np

counter = 0
core_name = "dc_cubes_historic"
predictionColumn = "cpuusage_ps"

def pushData(row):
    global core_name
    global counter
    global allMetrics
    global predictionColumn
    # defining the api-endpoint
    url = "http://localhost:8983/solr/"+core_name+"/update/json/docs"
    # data to be sent to api
    data = {
                "timestamp": str(row["timestamp"]),
                "cluster": row["cluster"],
                "dc": row["dc"],
                "perm": -1, #row["perm"],
                "instanz": row["instanz"],
                "verfahren": "-1",# row["verfahren"],
                "service": "-1" ,#row["verfahren"],
                "response": -1 ,#row["response"],
                "count": row[predictionColumn],
                "minv":  -1,#row["minv"],
                "maxv":  -1,#row["maxv"],
                "avg": -1, #row["avg"],
                "var": -1 ,#row["var"],
                "dev_upp": -1, #row["dev_upp"],
                "dev_low": -1, #row["dev_low"],
                "perc90": -1 ,#row["perc90"],
                "perc95": -1 ,#row["perc95"],
                "perc99": -1 ,#row["perc99.9"],
                "sum": -1, #row["sum"],
                "sum_of_squares": -1, #row["sum_of_squares"],
                "server": "-1", #row["server"]
            }
    
    for metric in allMetrics:
        data[metric] = row[metric]
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
        requests.get("http://localhost:8983/solr/"+core_name+"/update?commit=true")


def createSolrCore(core_name):
    url = "http://localhost:8983/solr/admin/cores?action=CREATE&name=" + \
        core_name+"&configSet=_default"
    requests.post(url=url)
    print(core_name, " created")

def initSchema(core_name, allMetrics):
    url = "http://localhost:8983/solr/"+core_name+"/schema"
    headers = {'Content-type': 'application/json'}
    rowsDict = {
        "timestamp": "pdate", "host": "string", "cluster": "pint", "dc": "pint", "perm": "pint", "instanz": "string", "verfahren": "string",
        "service": "string", "response": "pint", "count": "pfloat", "minv": "pint", "maxv": "pint", "avg": "pfloat", "var": "pfloat",
        "dev_upp": "pfloat", "dev_low": "pfloat", "perc90": "pfloat", "perc95": "pfloat", "perc99": "pfloat", "sum": "pint",
        "sum_of_squares": "pint", "server": "string"}

    for name in rowsDict:
        data = {
            "add-field": {"stored": "true", "docValues": "true", "indexed": "false", "multiValued": "false", "name": name, "type": rowsDict[name]}
        }
        requests.post(url=url, data=json.dumps(data), headers=headers)
        
    for metric in allMetrics:
        if metric not in rowsDict:
            data = {
                "add-field": {"stored": "true", "docValues": "true", "indexed": "false", "multiValued": "false", "name": metric, "type": "pfloat"}
            }
            requests.post(url=url, data=json.dumps(data), headers=headers)
      
    
    print(core_name, " schema inited")

def deleteCoreDocuments(core_name):
    url = "http://localhost:8983/solr/"+core_name + \
        "/update?commitWithin=1000&overwrite=true&wt=json"
    headers = {'Content-type': 'application/json'}
    data = {'delete': {'query': '*:*'}}
    requests.post(url=url, data=json.dumps(data), headers=headers)
    print("deleted old documents from "+core_name+" core")


# There are two dc's: 0 and 1
# dc 0 has clusters 6 and 8
# dc 1 has clusters 5 and 7
# Every Cluster has all 8 instances

def pushDataForAllInstances(df):
    instances = ["1","2","3","4","5","6","7","8" ]
    for instanz in instances:
        df["instanz"] = instanz
        df.apply(pushData, axis=1)


# get existing solr cores
url = "http://localhost:8983/solr/admin/cores?action=STATUS"
response = requests.get(url).json()
activeCores = response['status'].keys()

if core_name in activeCores:
    print(core_name + " already exists")
    # delete old data/predictions
#     deleteCoreDocuments(core_name)
# else forecast core doesn't exist
else:
    print(core_name + " doesn't exist")
    # create an new forecast solr core
    createSolrCore(core_name)
    # init schema
    initSchema(core_name)


# Read data from pickle file
with open("./4week_transformed_droppedErrors_filled.pkl", "rb") as pickleFile:
    df = pickle.load(pickleFile)
df = df.reset_index()
allMetrics = df.columns
allMetrics = allMetrics.drop("timestamp")
initSchema(core_name, allMetrics)

df["dc"] = 0
df["cluster"] = 6
pushDataForAllInstances(df)

df["cluster"] = 8
pushDataForAllInstances(df)

df["dc"] = 1
df["cluster"] = 5
pushDataForAllInstances(df)

df["cluster"] = 7
pushDataForAllInstances(df)

