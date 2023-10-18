import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

import pandas as pd
import json
import csv
import pickle
import numpy as np
from keras.models import load_model
counter = 0
core_name = "dc_cubes_historic"
predictionColumn = "cpuusage_ps"


def makePredictionFrame(model, cubes_frames, last_timestamp, predictionColumn = "cpuusage_ps"):
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

        dropCols = ["id", "cluster",
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
        
        dataset = cube.drop(dropCols,axis=1)
        y = dataset[predictionColumn].copy() # prediction column was pushed to count
        x = dataset.drop(columns=[predictionColumn, "count"])
#         print(x.shape)
        # Standardise
        allMetrics =  dataset.columns.tolist()


   #     dataset = cube.values

        # standardise
        scalerX = StandardScaler()
        scalerX.fit(x)
        x = scalerX.transform(x)
        scalerY = StandardScaler()
       # .reshape(-1, 1) # needed for standardScaler
        scalerY.fit(y.values.reshape(-1,1))
        y = scalerY.transform(y.values.reshape(-1,1))
        
        #PCA
        pcaTransformer = PCA(n_components=63) # keep 95% variance
        pcaTransformer.fit(x)
        x = pcaTransformer.transform(x)
        
        #transformed_df = pd.DataFrame().from_records(x)
        #transformed_df[predictionColumn] = y
        numberOfFeatures = pcaTransformer.n_components_
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
        
#         print("pre inverse scaling", prediction)
        prediction = scalerY.inverse_transform(prediction)
#         print("post inverse scaling", prediction)
        # transform pre solr
#         prediction = prediction.reshape((forecast_steps, 1))
#         prediction = np.hstack((prediction, np.zeros(
#             (prediction.shape[0], 3), dtype=prediction.dtype)))
#         prediction = prediction = scaler.inverse_transform(prediction)
#         prediction = prediction[:, [0]]
#         int_prediction = prediction.astype(int, copy=True)
#         prediction = int_prediction
#         prediction *= (prediction > 0)
        prediction = prediction.reshape(prediction.shape[1])
        # make the dataframe
        next_timestamps = pd.date_range(
            start=last_timestamp, periods=forecast_steps+1, freq='15min',  closed='right')
        # create the prediction dataframe for the current server
        d = {'timestamp': next_timestamps, 'cluster': cluster, 'dc': dc,
             'perm': perm, 'instanz': instanz,  'verfahren': verfahren, 'service': service, 'response': 200}
        pred_df = pd.DataFrame(data=d)
        for metric in allMetrics:
            df[metric] = -1
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

def getData(core_name):
    # from 1 Month, there are about 90k entries. 2 clusters * 2 dcs * 8 instances * (4 weeks * 7 days * 24 hours * 4 (15min intervall))
    url = 'http://localhost:8983/solr/'+core_name+'/select?q=*:*&sort=timestamp%20asc&rows=100000'
    response = requests.get(url).json()['response']
    response
    return response['docs']

def pushForecastData(row):
    global forecast_core_name
    global counter
    global allColumns
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
    
    for col in allColumns:
        if col not in data:
            data[col] = -1
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

# splits the data of each cube from the whole df in its own dataframe and takes only the last -history_steps
def splitInCubesFrames(df):
    unique_server_names = df.server.unique()
    splitted_frames = []
    for name in unique_server_names:
        new_df = df[df['server'] == name].copy()
        splitted_frames.append(new_df)
    return splitted_frames


forecast_core_name = "dc_cubes_forecast"
hist_df = pd.DataFrame.from_dict(getData(historicCoreName))
allColumns = hist_df.columns.to_list()

url = "http://localhost:8983/solr/admin/cores?action=STATUS"
response = requests.get(url).json()
activeCores = response['status'].keys()

# if forecast core exists
if forecast_core_name in activeCores:
    print(forecast_core_name + " already exists")
    deleteSolrCore(forecast_core_name)
    # delete old data/predictions
    createSolrCore(forecast_core_name)
    # init schema
    initSchema(forecast_core_name, allColumns)
    #deleteCoreDocuments(forecast_core_name)
# else forecast core doesn't exist
else:
    print(forecast_core_name + " doesn't exist")
    # create an new forecast solr core
    createSolrCore(forecast_core_name)
    # init schema
    initSchema(forecast_core_name, allColumns)

historicCoreName = "dc_cubes_historic"
measureInterval = 15 #min
daysToPredict = 5
pred_horizon = (60//measureInterval) * 24 * daysToPredict #5 days (4*24*5), timestep = 15min
hours_history = 8
n_history = (60//measureInterval)*hours_history 
history_steps = n_history
forecast_steps = pred_horizon

timestamp = "timestamp"
last_timestamp = hist_df.timestamp.max()
hist_df[timestamp] = pd.to_datetime(hist_df.timestamp)
# generate features/columns from the timestamp
hist_df["dayOfWeek"] = hist_df[timestamp].map(lambda x: x.dayofweek)
hist_df["isWeekend"] = hist_df.dayOfWeek.map(lambda x: 0 if (x < 5) else 1) # saturday.dayofweek = 5, monday=0
hist_df["weekofyear"] = hist_df[timestamp].map(lambda x: x.weekofyear)
hist_df["hour"] = hist_df[timestamp].map(lambda x: x.hour)
hist_df["minute"]= hist_df[timestamp].map(lambda x: x.minute)
hist_df = hist_df.set_index('timestamp')

hist_df.index = pd.to_datetime(hist_df.index).sort_values()

# split cubes in own frames
cubes_frames = splitInCubesFrames(hist_df)

# load the trained model
model = load_model('cnn_multistep_multivariate.h5')
prediction_df = makePredictionFrame(model, cubes_frames, last_timestamp)

prediction_df.apply(pushForecastData, axis=1)
print("Last Commit...")
requests.get("http://localhost:8983/solr/"+forecast_core_name+"/update?commit=true")