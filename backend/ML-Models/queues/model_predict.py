# Imports
from prediction_functions import *
import argparse
import logging
import sys

# Main function
if __name__ == '__main__':

    logging.basicConfig(level=logging.INFO)
    #logging.getLogger("elasticsearch").setLevel(logging.WARNING)

    # Initialize the parser
    parser = argparse.ArgumentParser(
        description="Prediction script for two queues"
    )

    # Add Parameters
    parser.add_argument('model', help="File path to keras model h5 file e.g. ./models/model.h5", type=str)
    parser.add_argument('scaler_x', help="File path to the x scaler e.g. ./models/scaler_x.p", type=str)
    parser.add_argument('scaler_y', help="File path to the y scaler e.g. ./models/scaler_y.p", type=str)
    parser.add_argument('--start', help="Start date e.g. 2020-06-09, type 0 for automatic timeframe", type=str, default='0')
    parser.add_argument('--end', help="End date e.g. 2020-06-13, type 0 for automatic timeframe", type=str, default='0')
    parser.add_argument('--host', help="Name of the host e.g. 'localhost'", type=str, default='localhost')
    parser.add_argument('--port', help="Number of port e.g. 9200", type=int, default=9200)
    parser.add_argument('--index_es', help="Indexname for ES to store predictions", type=str, default='queues-prediction')
    

    # Parse the arguments
    args = parser.parse_args()

    start_time = time.time()

    model, scaler_x, scaler_y, start, end, host, port, index_es = args.model, args.scaler_x, args.scaler_y, args.start, args.end, args.host, args.port, args.index_es

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
        X_pad_scaled, X_pad = scale_pad(X, steps, scaler_x)

        # Predict and upload
        predict_upload(q_two, X, X_pad, X_pad_scaled, scaler_y, host, port, model, index_es, srate)

        end = time.time()
        logging.info(f'Prediction upload finished: {end - start_time:.2f} time elapsed')