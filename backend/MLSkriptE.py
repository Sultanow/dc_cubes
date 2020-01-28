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
#import keras
#from keras.models import Sequential, load_model
#rom keras.layers import Dense, Activation, Dropout

from elasticsearch import Elasticsearch

historic_index = "dc_cubes"
forecast_index = "dc_cubes_forecast"
merged_index = "dc_cubes_merged"


def printPretty(np):
    print(json.dumps(np, indent=2))

def getHistoricData(index_name):
    es.indices.refresh(index=index_name)
        
    body={
        "query": {
            "match_all": {
            }
        }, 
        "size": 1
    }
    
    res = es.search(index=index_name, body=body)

    #print("Got %d Hits: " % res2["hits"]["total"]["value"])
    for hit in res['hits']['hits']:
        printPretty(hit["_source"])
    
    printPretty(res)
    return res




if __name__ == "__main__":
    print("########### Started MLSkript.py ... ###########")
    
    res = requests.get("http://localhost:9200")
    #print(res.content)

    # Connect to Elasticearch cluster
    es = Elasticsearch([{"host":"localhost", "port": 9200}])

    # check cluster status
    if res.status_code == 200:
        print("########### Elasticsearch cluster status: ok ###########")

        # Get existing elasticsearch indices
        index_alias = "dc_cubes_*"
        activeIndices = es.indices.get_alias("dc_cubes*")
        print("########### Active Indices with alias: " + index_alias + " ###########")
        printPretty(activeIndices)


        # Check existence of forecast index
        if forecast_index in activeIndices:
            print("########### " + forecast_index + " does already exists! ###########")

            # Delete old Data/Predictions
            es.indices.delete(forecast_index)
            print("########### " + forecast_index + " deleted! ###########")
        else:
            print("########### " + forecast_index + " doesn't exist! ###########")
            request_body = {
                "settings" : {
                    "number_of_shards": 5,
                    "number_of_replicas": 1
                },
                "mappings": {
                    "properties": {
                        "@timestamp": {
                        "type": "date"
                        },
                        "avg": {
                        "type": "double"
                        },
                        "cluster": {
                        "type": "long"
                        },
                        "column1": {
                        "type": "long"
                        },
                        "count": {
                        "type": "long"
                        },
                        "dc": {
                        "type": "long"
                        },
                        "dev_low": {
                        "type": "double"
                        },
                        "dev_upp": {
                        "type": "double"
                        },
                        "host": {
                        "type": "long"
                        },
                        "instanz": {
                        "type": "long"
                        },
                        "maxv": {
                        "type": "long"
                        },
                        "minv": {
                        "type": "long"
                        },
                        "perc90": {
                        "type": "double"
                        },
                        "perc95": {
                        "type": "double"
                        },
                        "perc99_9": {
                        "type": "double"
                        },
                        "perm": {
                        "type": "long"
                        },
                        "response": {
                        "type": "long"
                        },
                        "server": {
                        "type": "keyword"
                        },
                        "service": {
                        "type": "long"
                        },
                        "sum": {
                        "type": "long"
                        },
                        "sum_of_squares": {
                        "type": "long"
                        },
                        "timestamp": {
                        "type": "date",
                        "format": "yyyy-MM-dd HH:mm:ss"
                        },
                        "var": {
                        "type": "double"
                        },
                        "verfahren": {
                        "type": "long"
                        }
                    }
                },
            }
            es.indices.create(index = forecast_index, body = request_body)
            print("########### " + forecast_index + " created! ###########")

        # Get Data from historic index
        historic_data = getHistoricData("dc_cubes")
        df = pd.DataFrame.from_dict(historic_data)
        #df = df.set_index("@timestamp")
        #last_timestamp = df.index[0]
        #df.idnex = pd.to_datetime(df.index).sort_values()

        # Split cubes in own frames
        
        # Get mapping of index
        #printPretty(es.indices.get_mapping(index="dc_cubes"))
       

    else:
        print("########### No Elasticsearch cluster running on port 9200 ###########")
 
    

