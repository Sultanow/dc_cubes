#import requests
#from requests.adapters import HTTPAdapter
#from requests.packages.urllib3.util.retry import Retry

import pandas as pd
import json
import csv
import pickle
import numpy as np
        
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from elasticsearch import Elasticsearch
from elasticsearch import helpers

from keras.models import load_model


def printPretty(np):
    print(json.dumps(np, indent=2))

def createIndex(new_index_name, es):
    request_body = {
                "settings" : {
                    "number_of_shards": 5,
                    "number_of_replicas": 1
                }
            }
    es.indices.create(index = new_index_name, body = request_body)
    print(new_index_name + " created!")



# There are two dc's: 0 and 1
# dc 0 has clusters 6 and 8
# dc 1 has clusters 5 and 7
# Every Cluster has all 8 instances

def pushDataForAllInstances(df):
    #instances = ["1"]
    instances = [1,2,3,4,5,6,7,8 ]
    for instanz in instances:
        df["instanz"] = instanz
        df.apply(pushData, axis=1)



# splits the data of each cube from the whole df in its own dataframe and takes only the last -history_steps
def splitInCubesFrames(df):
    unique_server_names = df.server.unique()
    splitted_frames = []
    for name in unique_server_names:
        new_df = df[df['server'] == name].copy()
        splitted_frames.append(new_df)
    return splitted_frames


def makePredictionFrame(modelDc0, modelDc1, cubes_frames, last_timestamp, predictionColumn = "cpuusage_ps"):
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

        print("DATACENTER: ", dc)
        if(int(dc) == 0):
            model = modelDc0
        else:
            model = modelDc1
            
        dropCols = [
                "id", 
                "cluster",
                "dc",
                "perm",
                "instanz",
                "verfahren",
                "service",
                "response",
                "minv",
                "maxv", 
                "avg",
                "var",
                "dev_upp",
                "dev_low",
                "perc90",
                "perc95",
                "perc99",
                "sum",
                "sum_of_squares",
                "server"]
        # Converting the index as date
#         pdb.set_trace()
        cube.index = pd.to_datetime(cube.index).sort_values()

        cube = cube.drop(dropCols,axis=1)
        dataset = cube
#         if dc == 0:
#             allCols = cube.columns
#             cube[allCols] = cube[allCols].apply(pd.to_numeric, errors="coerce")
#             dataset = cube.dropna(axis=1, how="all")
#             dataset["dummy1"] = 1
#             dataset["dummy2"] = 0
        y = dataset[predictionColumn].copy() # prediction column was pushed to count
        x = dataset.drop(columns=[predictionColumn, "count"])
#         print(x.shape)
        # Standardise
        allMetrics =  dataset.columns.tolist()
        print("X SHAPE", x.shape)

        # standardise
        scalerX = StandardScaler()
        scalerX.fit(x)
        x = scalerX.transform(x)
        scalerY = StandardScaler()
       # .reshape(-1, 1) # needed for standardScaler
        scalerY.fit(y.values.reshape(-1,1))
        y = scalerY.transform(y.values.reshape(-1,1))
        
        #PCA
#         pcaTransformer = PCA(n_components=63) # keep 95% variance
#         pcaTransformer.fit(x)
#         x = pcaTransformer.transform(x)

        #transformed_df = pd.DataFrame().from_records(x)
        #transformed_df[predictionColumn] = y
        numberOfFeatures = x.shape[1]
        # predict
        pred_input = x[x.shape[0]-history_steps:]
#         print("***mean, std", x.mean(), x.std())
#         print("************\n", pred_input)
#         pdb.set_trace()
        pred_input = pred_input.reshape(
            (1, history_steps, numberOfFeatures)) # alternative (1, pred_input.shape[0],pred_input.shape[1])
        prediction = model.predict(pred_input)
#         print("prediction: ", prediction, prediction.shape)
        #prediction = np.hstack((prediction, np.zeros((prediction.shape[0], numberOfFeatures-1), dtype=prediction.dtype)))
        
    #    print("pre inverse scaling", prediction)
        prediction = scalerY.inverse_transform(prediction)
#        print("post inverse scaling", prediction)
        # transform pre solr
#         prediction = prediction.reshape((forecast_steps, 1))
#         prediction = np.hstack((prediction, np.zeros(
#             (prediction.shape[0], 3), dtype=prediction.dtype)))
#         prediction = prediction = scaler.inverse_transform(prediction)
#         prediction = prediction[:, [0]]
#         int_prediction = prediction.astype(int, copy=True)
#         prediction = int_prediction

        prediction = prediction.reshape(prediction.shape[1])
        # make the dataframe
        next_timestamps = pd.date_range(
            start=last_timestamp, periods=forecast_steps+1, freq='15min',  closed='right')
        # create the prediction dataframe for the current server
        d = {'timestamp': next_timestamps, 'cluster': cluster, 'dc': dc,
             'perm': perm, 'instanz': instanz,  'verfahren': verfahren, 'service': service, 'response': 200}
        pred_df = pd.DataFrame(data=d)
        for metric in allMetrics:
            pred_df[metric] = -1
#         print("Length:", len(pred_df), "::::::", prediction.shape)
        pred_df['count'] = prediction
        pred_df[predictionColumn] = prediction
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

import datetime as dt
 
def pushData(row):
    global index_name
    global counter
    global allMetrics
    global predictionColumn

    data = {
                "timestamp": str(row["timestamp"]).replace(" ", "T"),
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
    
    es.index(index=index_name, doc_type="_doc", id=counter, body=json.dumps(data))
    counter = counter + 1

    if (counter % 1000 == 0):
        print("Commiting... counter:", counter)
        

def getData(index_name):

    es.indices.refresh(index=index_name)
        
    body={
        "_source": {
            "includes": [
                "timestamp",
                "cluster",
                "dc",
                "perm",
                "instanz",
                "verfahren",
                "service",
                "response",
                "count",
                "minv",
                "maxv",
                "avg",
                "var",
                "dev_upp",
                "dev_low",
                "perc90",
                "perc95",
                "perc99",
                "sum",
                "sum_of_squares",
                "server",
                "cpuusage_ps"
                ]
        },
        "query": {
            "match_all": {
            }
        }
    }
    
    res = es.search(index=index_name, body=body)


    #print("Got %d Hits: " % res["hits"]["total"]["value"])
    #for hit in res['hits']['hits']:
        #printPretty(hit["_source"])

    resHits = res["hits"]["hits"]
    #printPretty(resHits)

    return resHits


def transformData(data):
    printPretty(data)
    transformed_docs = []

    for doc in data:
        _id = doc["_id"]
        doc_tmp = doc["_source"]
        doc_tmp["id"] = _id
        transformed_docs.append(doc_tmp)

    return transformed_docs

################################################################################################################################

counter = 0
index_name = "dc_cubes_historic"
predictionColumn = "cpuusage_ps"

# Connect to Elasticearch cluster
es = Elasticsearch([{"host":"localhost", "port": 9200}])

#res3 = es.indices.get_mapping(index="dc_cubes")
#printPretty(res3)

# get existing elasticsearch indices
index_alias = "dc_cubes_*"
activeIndices = es.indices.get_alias(index_alias)

if index_name in activeIndices:
    print(index_name + " already exists")
    # Delete old data
    es.indices.delete(index_name)
    print(index_name + " deleted")

# else index doesn't exist
else:
    print(index_name + " doesn't exist")
    # create an new elasticsearch index
    createIndex(index_name, es)
    print(index_name + " created")

#res4 = es.indices.get_mapping(index="dc_cubes_historic")
#printPretty(res4)

# Read data from pickle file
with open("../research/scripts/forecast/data_pblm1.pkl", "rb") as pickleFile:
    pblm1 = pickle.load(pickleFile)
pblm1 = pblm1.reset_index()

# Read data from pickle file
with open("../research/scripts/forecast/data_pblm2.pkl", "rb") as pickleFile:
    pblm2 = pickle.load(pickleFile)
pblm2 = pblm2.reset_index()

pblm2.timestamp.max()

# missing 2020-01-23 09:30:00
copyRow = pblm2[pblm2.timestamp == pblm2.timestamp.max()].copy()

copyRow.timestamp = pd.Timestamp("2020-01-23 09:45:00")

pblm2 = pblm2.append(copyRow, ignore_index=True)

allMetrics = pblm2.columns # type: <class "pandas.core.indexes.base.Index">

allMetrics = allMetrics.drop("timestamp")

pblm2[allMetrics] = pblm2[allMetrics].apply(pd.to_numeric, errors="coerce") # cast all to numeric because values arent getting pushed correctly to solr otherwise

pblm1[allMetrics] = pblm1[allMetrics].apply(pd.to_numeric, errors="coerce")

print(type(allMetrics))

#initSchema(core_name, allMetrics)

pblm2["dc"] = 0 # this will be pblm_2

pblm2["cluster"] = 6

pushDataForAllInstances(pblm2)

pblm2["cluster"] = 8

pushDataForAllInstances(pblm2)

pblm1["dc"] = 1

pblm1["cluster"] = 5

pushDataForAllInstances(pblm1)

pblm1["cluster"] = 7

pushDataForAllInstances(pblm1)


forecast_index_name = "dc_cubes_forecast"
historicIndexName = "dc_cubes_historic"

transformed_data = transformData(getData(historicIndexName))

hist_df = pd.DataFrame.from_dict(transformed_data)
allColumns = hist_df.columns.to_list()

if forecast_index_name in activeIndices:
    print(forecast_index_name + " already exists")
    # Delete old data
    es.indices.delete(forecast_index_name)
    createIndex(forecast_index_name, es)

# else index doesn't exist
else:
    print(forecast_index_name + " doesn't exist")
    # create an new elasticsearch index
    createIndex(forecast_index_name, es)


measureInterval = 15 #min
hoursToPredict = 24 * 4
pred_horizon = int((60//measureInterval) * hoursToPredict) #(4*hours), timestep = 15min
days_history = 1
hours_history = int(24 * days_history)
n_history = int((60//measureInterval)*hours_history)

history_steps = n_history
forecast_steps = pred_horizon

timestamp = "timestamp"
hist_df.reset_index(inplace=True)

last_timestamp = hist_df[timestamp].max()
hist_df[timestamp] = pd.to_datetime(hist_df[timestamp])
# generate features/columns from the timestamp
hist_df["dayOfWeek"] = hist_df[timestamp].map(lambda x: x.dayofweek)
hist_df["isWeekend"] = hist_df.dayOfWeek.map(lambda x: 0 if (x < 5) else 1) # saturday.dayofweek = 5, monday=0
#hist_df["weekofyear"] = hist_df[timestamp].map(lambda x: x.weekofyear)
hist_df["hour"] = hist_df[timestamp].map(lambda x: x.hour)
hist_df["minute"]= hist_df[timestamp].map(lambda x: x.minute)
hist_df = hist_df.set_index(timestamp)

hist_df.index = pd.to_datetime(hist_df.index).sort_values()


# split cubes in own frames
cubes_frames = splitInCubesFrames(hist_df)

# load the trained model
modelDc0 = load_model('../research/scripts/forecast/final_cnn_pblm2.h5')
modelDc1 = load_model('../research/scripts/forecast/final_cnn_pblm1.h5')

prediction_df = makePredictionFrame(modelDc0, modelDc1, cubes_frames, last_timestamp)

prediction_df.head()

prediction_df.apply(pushForecastData, axis=1)
print("Last Commit...")
#requests.get("http://localhost:8983/solr/"+forecast_core_name+"/update?commit=true")



merged_core_name = "dc_cubes_merged"
# merge indices with "alias"



