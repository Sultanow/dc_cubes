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

from elasticsearch import Elasticsearch
from elasticsearch import helpers

historic_index = "dc_cubes"
forecast_index = "dc_cubes_forecast"
merged_index = "dc_cubes_merged"

host = "http://localhost:9200/"


data = [
    {
        "_index": "customer",
        "_type": "external",
        "_id": 3,
        "doc" : {"name": "test"}
    },
    {
        "_index": "customer",
        "_type": "external",
        "_id": 4,
        "doc" : {"name": "test"}
    },
    {
        "_index": "customer",
        "_type": "external",
        "_id": 5,
        "doc" : {"name": "test"}
    },
    {
        "_index": "customer",
        "_type": "external",
        "_id": 6,
        "doc" : {"name": "test"}
    },
]


def printPretty(np):
    print(json.dumps(np, indent=2))


def getHistoricData(index_name):
    es.indices.refresh(index=index_name)
        
    body={
        "query": {
            "match_all": {
            }
        }, 
        "size": 2
    }
    
    res = es.search(index=index_name, body=body)


    print("Got %d Hits: " % res["hits"]["total"]["value"])
    for hit in res['hits']['hits']:
        printPretty(hit["_source"])

    resHits = res["hits"]
    #printPretty(resHits)

    print("TESTER")

    return resHits

def createIndex(new_index_name, es):
    request_body = {
                "settings" : {
                    "number_of_shards": 5,
                    "number_of_replicas": 1
                },
                "mappings": {
                    "properties": {
                        "@timestamp": {
                            "type":"date"
                        },
                        "host": {
                            "type": "text"
                        },
                        "cluster": {
                            "type": "long"
                        },
                        "dc": {
                            "type": "long"
                        },
                        "perm": {
                            "type": "long"
                        },    
                        "instanz": {
                            "type": "long"
                        },
                        "verfahren": {
                            "type": "text"
                        },
                        "service": {
                            "type": "text"
                        },  
                        "response": {
                            "type": "long"
                        },  
                        "count": {
                            "type": "long"
                        },
                        "minv": {
                            "type": "long"
                        },
                        "maxv": {
                            "type": "long"
                        },
                        "avg": {
                            "type": "float"
                        },
                        "var": {
                            "type": "float"
                        },
                        "dev_upp": {
                            "type": "float"
                        },
                         "dev_low": {
                            "type": "float"
                        },
                        "perc90": {
                            "type": "float"
                        },
                        "perc95": {
                            "type": "float"
                        },
                        "perc99": {
                            "type": "float"
                        },
                        "sum": {
                            "type": "text"
                        },
                        "sum_of_squares": {
                            "type": "long"
                        },
                        "server": {
                            "type": "text"
                        }
                    }
                },
            }
    es.indices.create(index = new_index_name, body = request_body)
    print("########### " + "Index: " + new_index_name + " created! ###########")

def createIndex2(new_index_name, es):
    request_body = {
                "settings" : {
                    "number_of_shards": 5,
                    "number_of_replicas": 1
                },
                "mappings": {
                    "properties": {
                        "user": {
                            "type":"text"
                        },
                        "post_date": {
                            "type": "date"
                        },
                        "message": {
                            "type": "text"
                        }
                    }
                },
            }
    es.indices.create(index = new_index_name, body = request_body)
    print("########### " + "Index: " + new_index_name + " created! ###########")


def pushData(row):
    global historic_index
    global counter
    global allMetrics
    global predictionColumn

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
                "server": "PBZ0%dE00_PERM02_S0%s_OSB" % (row["cluster"], row["instanz"]), #row["server"]
            }
    
    for metric in allMetrics:
        data[metric] = row[metric]

    counter += 1
    if (counter % 1000 == 0):
        print("Commiting... counter:", counter)
        es.index(index=historic_index, doc_type="_doc", id=1, body=json.dumps(data))
   


















if __name__ == "__main__":
    print("########### Started MLSkript.py ... ###########")
    
    res = requests.get("http://localhost:9200")
    #print(res.content)

    # Connect to Elasticearch cluster
    es = Elasticsearch([{"host":"localhost", "port": 9200}])


    # check cluster status
    if res.status_code == 200:

        es.indices.delete("dc_cubes_historic")

        #printPretty(es.info())
        #print("########### Elasticsearch cluster status: ok ###########")

        requestBody = {
            "user2" : "kimchy",
            "post_date2" : "2009-11-15T14:12:12",
            "message2" : "trying out Elasticsearch"
        }
        
        #es.index(index="dc_cubes", doc_type="post", id=1, body=requestBody)

        # Get existing elasticsearch indices
        #index_alias = "dc_cubes_*"
        #activeIndices = es.indices.get_alias("dc_cubes*")
        #print("########### Active Indices with alias: " + index_alias + " ###########")
        #printPretty(activeIndices)

        #createIndex2("test_index2", es)
        #es.index(index="test_index", doc_type="_doc", id=1, body=requestBody)
        #getHistoricData("test_index")
        
    
    else:
        print("########### No Elasticsearch cluster running on port 9200 ###########")
