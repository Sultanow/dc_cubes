import requests
import pandas as pd
import json
import csv
import random
import matplotlib.pyplot as plt
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
    # mockupData = pd.read_csv("../../data/data.dsv", header=0, sep="|", index_col=0, low_memory=False)
    # unwantedCols = ["host","cluster","dc","perm","instanz","verfahren","service","response","minv","maxv","avg","var","dev_upp","dev_low","perc90","perc95","perc99.9","sum","sum_of_squares", "server"]
    # mockupData.drop(unwantedCols, axis=1, inplace=True)
    # mockupData.plot(x="timestamp", y="count")
    # plt.show()

    filename = "../../data/data.dsv"
    chunksize = 100000
    datatypes = {
        "TARGET_NAME": object,
        "TARGET_TYPE": object,
        "TARGET_GUID": object,
        "METRIC_NAME": object,
        "METRIC_TYPE": int,
        "METRIC_COLUMN": object,
        "METRIC_GUID": object,
        "METRIC_LABEL": object,
        "COLUMN_LABEL": object,
        "COLLECTION_TIMESTAMP": object,
        "KEY_VALUE": object,
        "KEY_VALUE2": object,
        "KEY_VALUE3": object,
        "KEY_VALUE4": object,
        "KEY_VALUE5": object,
        "KEY_VALUE6": object,
        "KEY_VALUE7": object,
    }

    colsWithDates = ["COLLECTION_TIMESTAMP"]
    counter = 0

    pd.set_option('display.max_colwidth', -1)
    pd.set_option('display.max_columns', None)

    irrelevantColumns = ["KEY_VALUE",
                      "KEY_VALUE2",
                      "KEY_VALUE3",
                      "KEY_VALUE4",
                      "TARGET_TYPE",
                      "KEY_VALUE5",
                      "KEY_VALUE6",
                      "METRIC_NAME",
                      "METRIC_TYPE",
                      "KEY_VALUE7"]

    abbreviatedFeatures = []
    fullFeatures = []
    for chunk in pd.read_csv(filename, chunksize=chunksize, sep="|", encoding="latin1", parse_dates=colsWithDates,
                             dtype=datatypes):

        abbNames = chunk["METRIC_COLUMN"].unique()
        fullNames= chunk["COLUMN_LABEL"].unique()

        for name in abbNames:
            if name not in abbreviatedFeatures:
                abbreviatedFeatures.append(name)
        for name in fullNames:
            if name not in fullFeatures:
                fullFeatures.append(name)

        # chunk.drop(irrelevantColumns, axis="columns", inplace=True)
        counter = counter + 1
        print("\n\n ++++chunk NR: %5d ++++" % counter)
        # print("head: ", chunk.head(1))

    with open("listObject.pkl", "wb") as pickleFile:
        pickle.dump([abbreviatedFeatures, fullFeatures], pickleFile)

    with open("features.csv", 'w', newline='') as featuresFile:
        writer = csv.writer(featuresFile, delimiter=",")
        writer.writerow(["shortName", "fullName"])

        for index, row in enumerate(abbreviatedFeatures):
            writer.writerow([row, fullFeatures[index]])
