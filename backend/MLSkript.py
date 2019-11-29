import requests
import pandas as pd
import json
import csv
import pickle

def pushData(row):
    # defining the api-endpoint
    url = "http://localhost:8983/solr/dc_cubes_forecast/update/json?commit=true&wt=json"

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


if __name__ == "__main__":
    print("MLSkript.py ausgeführt")
    filePath = "../predictions.csv"
    df = pd.read_csv(filePath, sep=",", encoding="latin1")
    df.apply(pushData, axis=1)
    print("Data was pushed to Solr/dc_cubes_forecast.")
