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
        "size": 2
    }
    
    res = es.search(index=index_name, body=body)


    #print("Got %d Hits: " % res["hits"]["total"]["value"])
    #for hit in res['hits']['hits']:
        #printPretty(hit["_source"])

    resHits = res["hits"]
    #printPretty(resHits)

    return resHits

def splitInCubesFrames(df):
    unique_server_names = df.server.unique()
    splitted_frames = []
    for name in unique_server_names:
        new_df = df[df["server"] == name][-history_steps:].copy()
        splitted_frames.append(new_df)
    return splitted_frames


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

def mergeTwoIndices(index1, index2, es):
    #es.inidices.forcemerge(index="%s,%s"%index1,index2)
    
    # Get existing elasticsearch indices
    index_alias = "dc_cubes_*"
    activeIndices = es.indices.get_alias("dc_cubes*")
    print("########### Active Indices with alias: " + index_alias + " ###########")
    printPretty(activeIndices)


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

        cube.drop(cube.columns.difference(['count']), 1, inplace=True)

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
            createIndex(forecast_index, es)

        # Get Data from historic index
        historic_data = getHistoricData("dc_cubes")
        print(type(historic_data))

        df = pd.DataFrame.from_dict(historic_data)
        #df = df.set_index("timestamp") #Error 
        last_timestamp = df.index[0]
        df.index = pd.to_datetime(df.index).sort_values()

        # Split cubes in own frames
        cubes_frames = splitInCubesFrames(df)

        # Load the trained model
        model = load_model("dc_lstm_model_retrained.h5")

        # Forecast 
        prediction_df = makePredictionFrame(model, cubes_frames, last_timestamp)
        prediction_df.appy(pushData, axis=1)
        print("Last Commit...")

        # If merged index exists
        if dc_cubes_merged in activeIndices:
            print("########### " + merged_index + " does already exists! ###########")
            # Delete old merged data
            es.indices.delete(merged_index)
        else:
            print("########### " + merged_index + " doesn't exist! ###########")
            createIndex(merged_index, es)

        # Merge historic and forecast indices
        #mergeTwoIndices(merged_index, historic_index, )

        # Get mapping of index
        #printPretty(es.indices.get_mapping(index="dc_cubes"))
        
        #printPretty(es.indices.get_mapping(index="dc_cubes_forecast"))
       
    else:
        print("########### No Elasticsearch cluster running on port 9200 ###########")
