from training_functions import *
import argparse
import logging

# Main function
if __name__ == '__main__':
    
    logging.basicConfig(level=logging.INFO)

    # Initialize the parser
    parser = argparse.ArgumentParser(
        description="Training script for two queues"
    )

    # Add Parameters
    parser.add_argument('model_name', help="Name the model e.g. 'model_2q'", type=str)
    parser.add_argument('start', help="Start date e.g. 2020-06-09, type 0 for automatic timeframe", type=str)
    parser.add_argument('end', help="End date e.g. 2020-06-13, type 0 for automatic timeframe", type=str)
    parser.add_argument('--host', help="Name of the host e.g. 'localhost'", type=str, default='localhost')
    parser.add_argument('--port', help="Number of port e.g. 9200", type=int, default=9200)
    parser.add_argument('--outlier_min', help="Mininum outlier threshold", type=int, default=0)
    parser.add_argument('--outlier_max', help="Maximum outlier threshold", type=int, default=10000)
    parser.add_argument('--test_size', help="Train Test Split e.g. 0.3 equals 30 test size", type=float, default=0.3)
    parser.add_argument('--sample_size', help="Downsample size e.g. 0.3 equals 30 of the samples are kept ", type=float, default=0.8)
    parser.add_argument('--neurons', help="Number of neurons used in the model", type=int, default=10)
    parser.add_argument('--epochs', help="Number of epochs used in the training process", type=int, default=20)
    parser.add_argument('--masking', help="Turn the masking layer on and off", action='store_true')
    parser.add_argument('--sample_weight', help="Turn sample weighting on and off", action='store_true')
    
    # Parse the arguments
    args = parser.parse_args()

    start_time = time.time()

    start, end, host, port, outlier_min, outlier_max, test_size, sample_size, neurons, epochs, masking, sample_weight, model_name = (args.start, 
        args.end, args.host, args.port, args.outlier_min, args.outlier_max, 
        args.test_size, args.sample_size, args.neurons, args.epochs, 
        args.masking, args.sample_weight, args.model_name)

    print(start, end, model_name)
    # Get data from ES
    q_one = es_to_df(start, end, 20, "censhare", host, port)
    q_two = es_to_df(start, end, 20, "pic", host, port)

    # Create dataset
    X, y, maxlen = create_dataset_train(q_one, q_two, outlier_min=outlier_min, outlier_max=outlier_max)

    # Get max steps in queue per item
    maxlenlist = get_max_len_list(y)

    # Scale
    X_scaled, y_scaled = scale(X, y, model_name)

    # Padding
    X_train, X_test, y_train, y_test = pad_split(X_scaled, y_scaled, maxlen, test_size=test_size)

    # Downsampling
    X_train_sampled, X_test_sampled, y_train_sampled, y_test_sampled = downsample(X_train, X_test, y_train, y_test, sample_size)

    # Model building
    build_model(X_train_sampled, y_train_sampled, maxlenlist, neurons, epochs, 
                masking = masking, model_name = model_name, sample_weight=sample_weight)

    end = time.time()
    logging.info(f'Model building finished: {end - start_time:.2f} time elapsed')