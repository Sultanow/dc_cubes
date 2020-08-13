# imports
from elasticsearch import Elasticsearch
import pandas as pd
import datetime
from statsmodels.tsa.ar_model import AR


def es_predict(host, port, progress):
    # Connect to Elasticsearch
    es = Elasticsearch([host], port=port)
    #es.indices.create(index='queues-prediction', ignore=400)

    # Search the ES Stack
    res = es.search(index="queues", body={"query": {
        "match": {
            "name": "products"
        }}}, size=1000)  # define size
    # Get Source Data
    d = [elem['_source'] for elem in res['hits']['hits']]
    for elem in d:
        del elem['items']
        del elem['querytime']
    # Build Dataframe
    df = pd.DataFrame(d)
    df.index = df["timestamp"]
    df.index = pd.to_datetime(df.index, format='%Y-%m-%dT%H:%M:%S.%f%z').sort_values()
    df.drop(columns=['timestamp', 'name', 'tier'], inplace=True)
    # Resample Data to 1min Interval
    df = df.resample('1T').mean()
    df = df.fillna(0)

    # Model
    pred_horizon = 20
    data = df['size']

    # AR
    model_ar = AR(data)
    model_ar_fit = model_ar.fit(maxlag=10, ic='bic', trend='nc', method='cmle', maxiter=20)
    # predict
    pred_test = model_ar_fit.predict(start=len(data), end=len(data)+pred_horizon-1, dynamic=True)

    # Build Prediction Dataframe
    time_stamps = pd.date_range(
        start=data.index[-1]+datetime.timedelta(minutes=1), periods=20, freq='T', tz='utc')

    d = {'timestamp': time_stamps, 'size': pred_test}

    pred_df = pd.DataFrame(data=d)

    pred_df['timestamp'] = pred_df.timestamp.map(
        lambda x: datetime.datetime.strftime(x, '%Y-%m-%dT%H:%M:%S.%f%z'))

    # Upload Data to ES
    count = 0
    for index, row in pred_df.iterrows():
        doc_data = {
            'timestamp': row['timestamp'],
            'tier': 'pic',
            'name': 'products',
            #     'querytime' : 0,
            'size': row['size'],
            #     'items' : " ".join(items)
        }
        count += 1
        es.index('queues-prediction', body=doc_data)
        if count % progress == 0:
            print(str(count) + " Elemente hochgeladen")
