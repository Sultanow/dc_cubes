import requests
import pandas as pd
import json
import matplotlib.pyplot as plt

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
    mockupData = pd.read_csv("../src/data/df_all_pseudo-01.csv", header=0, delimiter=",", index_col=0)
    unwantedCols = ["host","cluster","dc","perm","instanz","verfahren","service","response","minv","maxv","avg","var","dev_upp","dev_low","perc90","perc95","perc99.9","sum","sum_of_squares", "server"]
    # mockupData.drop(unwantedCols, axis=1, inplace=True)
    mockupData.plot(x="timestamp", y="count")
    plt.show()


   # for index, row in mockupData.iterrows():
   #     pushData(row)
