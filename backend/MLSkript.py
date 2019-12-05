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
    url = "http://localhost:8983/solr/"+core_name+"/update/json/docs"
    global counter
    # data to be sent to api
    data = {
        "add": {
            "doc": {
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
        }
    }
    headers = {'Content-type': 'application/json'}
    # sending post request
    requests.post(url=url, data=data, headers=headers)
    counter += 1
    if (counter % 1000 == 0):
        print("Commiting... counter:", counter)
        requests.post("http://localhost:8983/solr/" +
                      core_name+"/update?commit=true")
    # needs last commit? for all data index > last 1k


def createSolrCore(core_name):
    url = "http://localhost:8983/solr/admin/cores?action=CREATE&name=" + \
        core_name+"&configSet=_default"
    requests.post(url=url)
    print(core_name, " created")


"""
if deleteEverything = True all files associated with the core are deleted aswell.
See: https://lucene.apache.org/solr/guide/6_6/coreadmin-api.html#CoreAdminAPI-UNLOAD
"""


def deleteSolrCore(core_name, deleteEverything):  # löscht immer den ganzen coreF
    url = "http://localhost:8983/solr/admin/cores?action=UNLOAD&core="+core_name
    print(deleteEverything)
    if (deleteEverything):
        url += "&deleteInstanceDir=true"
    requests.get(url)
    print(core_name, " core deleted")


def deleteCoreDocuments(core_name):
    url = "http://localhost:8983/solr/"+core_name + \
        "/update?stream.body=<delete><query>*:*</query></delete>&commit=true"
    requests.get(url)
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
    url = 'http://localhost:8983/solr/dc_cubes/select?q=*:*&sort=timestamp%20desc&rows=15000'
    response = requests.get(url).json()['response']
    response
    return response['docs']


# splits the data of each cube from the whole df in its own dataframe
def splitInCubesFrames(df):
    unique_server_names = df.server.unique()
    splitted_frames = []
    for name in unique_server_names:
        new_df = df[df['server'] == name][-384:].copy()
        splitted_frames.append(new_df)
    return splitted_frames


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
        cube["weekend"] = (cube["day"] > 5).astype(int)

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
        prediction = prediction.reshape((192, 1))
        prediction = np.hstack((prediction, np.zeros(
            (prediction.shape[0], 4), dtype=prediction.dtype)))
        prediction = prediction = scaler.inverse_transform(prediction)
        prediction = prediction[:, [0]]
        int_prediction = prediction.astype(int, copy=True)
        prediction = int_prediction
        prediction *= (prediction > 0)

        # make the dataframe
        next_timestamps = pd.date_range(
            start=last_timestamp, periods=192+1, freq='15min',  closed='right')
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
            '%Y-%m-%d:%H:%M:00Z')
        prediction_frames.append(pred_df)
    print("made predictions")
    return pd.concat(prediction_frames, ignore_index=True)


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
    df = df.set_index('timestamp')
    last_timestamp = df.index[0]
    df.index = pd.to_datetime(df.index).sort_values()

    # split cubes in own frames
    cubes_frames = splitInCubesFrames(df)

    # load the trained model
    model = load_model('dc_lstm_ml_model.h5')

    # forecast
    prediction_df = makePredictionFrame(model, cubes_frames, last_timestamp)
    print(prediction_df)

    # push the data to the forecast core
    for index, row in prediction_df.iterrows():
        pushData(row)

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
