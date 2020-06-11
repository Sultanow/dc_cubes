# Imports
import pandas as pd
# imports pandas as pd. Pandas is a python module, mainly for data analysis and manipulation.
import json
# imports json, a python built-in package for working with JSON Data
from pandas.io.json import json_normalize
from statsmodels.tsa.ar_model import AR
# imports the autoregressive model from statsmodels a python module for statistical models
import datetime
# imports the python datetime module


def simplepredict(source_name, output_name):

    # Open the SourceFile
    with open(source_name, 'r') as f:
        res = list()
        for line in f.readlines():
            res.append(json.loads(line))

    df = pd.DataFrame(res)
    df = df['_source']
    df = json_normalize(df)
    df = df[df['name'] == "products"]
    df.index = df["timestamp"]
    df.index = pd.to_datetime(df.index, format='%Y-%m-%dT%H:%M:%S.%f%z').sort_values()
    df.drop(columns=['timestamp', 'name', 'tier', 'items', 'querytime'], inplace=True)
    df = df.resample('1T').mean()
    df = df.fillna(0)

    pred_horizon = 20  # minutes
    data = df['size']

    model_ar = AR(data)
    model_ar_fit = model_ar.fit(maxlag=10, ic='bic', trend='nc', method='cmle', maxiter=20)

    pred_test = model_ar_fit.predict(start=len(data), end=len(data)+pred_horizon-1, dynamic=True)

    time_stamps = pd.date_range(
        start=data.index[-1]+datetime.timedelta(minutes=1), periods=20, freq='T', tz='utc')

    d = {'timestamp': time_stamps, 'size': pred_test}
    pred_df = pd.DataFrame(data=d)

    pred_df['timestamp'] = pred_df.timestamp.map(
        lambda x: datetime.datetime.strftime(x, '%Y-%m-%dT%H:%M:%S.%f%z'))

    final = []
    for index, row in pred_df.iterrows():
        doc_data = {'_index': 'queues',
                    '_type': '_doc',
                    # '_id': 'random',
                    #  '_score': 1,
                    '_source': {
                        'timestamp': row['timestamp'],
                        'tier': 'pic',
                        'name': 'products',
                        #     'querytime' : 0,
                        'size': row['size'],
                        #     'items' : " ".join(items)
                    }}
        final.append(doc_data)

    with open(output_name, 'w') as f:
        f.writelines([json.dumps(elem) for elem in final])
