# Imports
import Prediction_Functions as pf
import argparse
import time


# Main function
if __name__ == '__main__':
    # Initialize the parser
    parser = argparse.ArgumentParser(
        description="Prediction Script for Two Queues"
    )

    # Add Parameters
    parser.add_argument('start', help="Start date e.g. 2020-06-09, type 0 for automatic timeframe", type=str)
    parser.add_argument('end', help="End date e.g. 2020-06-13, type 0 for automatic timeframe", type=str)
    parser.add_argument('host', help="Name of the host e.g. 'localhost'", type=str)
    parser.add_argument('port', help="Number of port e.g. 9200", type=int)
    parser.add_argument('model', help="File path to keras model h5 file e.g. ./model.h5", type=str)
    parser.add_argument('index_es', help="Indexname for ES to store predictions", type=str)

    # Parse the arguments
    args = parser.parse_args()

    # print(args)
    start_time = time.time()

    start, end, host, port, model, index_es = args.start, args.end, args.host, args.port, args.model, args.index_es

    q_one = pf.predict.es_to_df(start, end, 20, "censhare", host, port)
    q_two = pf.predict.es_to_df(start, end, 20, "pic", host, port)


    print("DataFrame complete: ", time.time() - start_time)

    X = pf.predict.create_dataset_predict(q_one, q_two)

    print("Dataset with", len(X), "items complete: ", time.time() - start_time)

    X_pad_scaled, X_pad = pf.predict.scale_pad(X, 720)

    pf.predict.predict_upload(q_two, X, X_pad, X_pad_scaled, host, port, model, index_es)

    print("Upload complete: ", time.time() - start_time)
