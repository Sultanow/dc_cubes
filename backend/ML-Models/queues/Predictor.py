# Imports
from prediction_functions import *
import os
import logging
import sys

class Predictor:

    def __init__(self):
        # Initialize model and scaler file path via name in the ./models/ folder
        model_files = list(os.listdir('./models'))
        for f_name in model_files:
            if 'best' in f_name:
                self.model_path = './models/' + f_name
            elif 'scalerx' in f_name:
                self.scalerx_path = './models/' + f_name
            elif 'scalery' in f_name:
                self.scalery_path = './models/' + f_name
        logging.info('Model PATH:' + self.model_path)
        logging.info('Scaler X PATH:' + self.scalerx_path)
        logging.info('Scaler Y PATH:' + self.scalery_path)

    def run(self, start, end):
        start_time = time.time()
        # Initialize variables
        self.start = start
        self.end = end   
        host = 'localhost'
        port = 9200
        index_es = 'queues-predictions'
        # Get steps and sample rate from model_name
        steps = int(self.model_path.split('_')[-2].split('steps')[0])
        srate = int(self.model_path.split('_')[-1].split('srate')[0])

        # Find out number of days used for training
        start_date = self.model_path.split('_')[-5]
        slist = start_date.split("-")
        slist = map(int, slist)
        slist = list(slist)

        end_date = self.model_path.split('_')[-4]
        elist = end_date.split("-")
        elist = map(int, elist)
        elist = list(elist)

        sdate = datetime.date(slist[0], slist[1], slist[2])
        edate = datetime.date(elist[0], elist[1], elist[2])

        delta = edate - sdate

        time_range = delta.days + 2

        # Get data from ES
        q_one = es_to_df(start, end, srate, "censhare", host, port, steps, time_range)
        q_two = es_to_df(start, end, srate, "pic", host, port, steps, time_range)

        logging.info(f'Expected queue data length: {steps}')
        logging.info(f'Queue One data length: {len(q_one)}')
        logging.info(f'Queue Two data length: {len(q_two)}')

        # Create dataset
        X = create_dataset_predict(q_one, q_two)
        if X == []:
                logging.info(f'Prediction failed, no data available')
                sys.exit
        else:
            # Scale
            X_pad_scaled, X_pad = scale_pad(X, steps, self.scalerx_path)

            # Predict and upload
            predict_upload(q_two, X, X_pad, X_pad_scaled, self.scalery_path, host, port, 
                        self.model_path, index_es, srate)

            end_time = time.time()
            logging.info(f'Prediction upload finished: {end_time - start_time:.2f} time elapsed')
