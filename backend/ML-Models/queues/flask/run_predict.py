from prediction_functions import *
import glob
from pathlib import Path
import logging


start_time = time.time()

# Get the models and scaler based on filepath

for x in Path('./models').glob('*.h5'):
    model = str(x)

for x in Path('./models').glob('*.p'):
    scaler_x = str(x)
    break

for x in Path('./models').glob('*.p'):
    scaler_y = str(x)
    continue

# Set variables

start = '0'                    # example date '2020-11-10 00:00:00'
end = '0'                      # example date '2020-11-16 10:00:00'
host = 'localhost'
port = 9200
index_es = 'queues-prediction'

# Get steps and sample rate from model_name
steps = int(model.split('_')[-2].split('steps')[0])
srate = int(model.split('_')[-1].split('srate')[0])

# Find out number of days used for training
start_date = model.split('_')[-5]
slist = start_date.split("-")
slist = map(int, slist)
slist = list(slist)

end_date = model.split('_')[-4]
elist = end_date.split("-")
elist = map(int, elist)
elist = list(elist)

sdate = datetime.date(slist[0], slist[1], slist[2])
edate = datetime.date(elist[0], elist[1], elist[2])

delta = edate - sdate

time_range = delta.days

# Get data from ES
q_one = es_to_df(start, end, 20, "censhare", host, port, steps, time_range)
q_two = es_to_df(start, end, 20, "pic", host, port, steps, time_range)

# Create dataset
X = create_dataset_predict(q_one, q_two)

# Scale
X_pad_scaled, X_pad = scale_pad(X, steps, scaler_x)

# Predict and upload
predict_upload(q_two, X, X_pad, X_pad_scaled, scaler_y, host, port, model, index_es, srate)

end = time.time()
logging.info(f'Prediction upload finished: {end - start_time:.2f} time elapsed')

    # return 'OK'