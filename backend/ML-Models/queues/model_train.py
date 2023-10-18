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
    parser.add_argument('--sample_rate', help="Sample rate used in training e.g. 10 equals to every 10th entry", type=int, default=20)
    parser.add_argument('--neurons', help="Number of neurons used in the model", type=int, default=10)
    parser.add_argument('--epochs', help="Number of epochs used in the training process", type=int, default=20)
    parser.add_argument('--masking', help="Turn the masking layer on and off", action='store_true')
    parser.add_argument('--sample_weight', help="Turn sample weighting on and off", action='store_true')
    parser.add_argument('--save_fig', help="Turn figure saving on and off", action='store_false')

    
    # Parse the arguments
    args = parser.parse_args()

    start_time = time.time()

    (start, end, host, port, outlier_min, outlier_max, test_size, sample_size, sample_rate, 
        neurons, epochs, masking, sample_weight, save_fig, model_name) = (args.start, 
        args.end, args.host, args.port, args.outlier_min, args.outlier_max, 
        args.test_size, args.sample_size, args.sample_rate, args.neurons, args.epochs, 
        args.masking, args.sample_weight, args.save_fig, args.model_name)

    # Get data from ES
    q_one = es_to_df(start, end, sample_rate, "censhare", host, port)
    q_two = es_to_df(start, end, sample_rate, "pic", host, port)

    # Create dataset
    X, y, maxlen = create_dataset_train(q_one, q_two, outlier_min=outlier_min, outlier_max=outlier_max)

    # Get max steps in queue per item
    maxlenlist, mean, median = get_max_len_list_mean_median(y)

    # Scale
    X_scaled, y_scaled = scale(X, y, start, end, str(epochs), str(maxlen), str(sample_rate), model_name)

    # Padding
    X_train, X_test, y_train, y_test = pad_split(X_scaled, y_scaled, maxlen, test_size=test_size)

    # Downsampling
    X_train_sampled, X_test_sampled, y_train_sampled, y_test_sampled = downsample(X_train, X_test, y_train, y_test, sample_size)

    # Model building
    m_name = build_model(X_train_sampled, y_train_sampled, maxlenlist, neurons, epochs, start, end, sample_rate,
                        masking = masking, model_name = model_name, sample_weight=sample_weight)

    m_name = m_name.split('/')[1]

    end_time = time.time()
    logging.info(f'Model building finished: {end_time - start_time:.2f} time elapsed')

    # Predict MAE
    pred_mae(X_test_sampled, y_test_sampled, y, (f'models/best_{model_name}_{start}_{end}_{epochs}epochs_{maxlen}steps_{sample_rate}srate.h5'), 
            (f"models/scalery_{model_name}_{start}_{end}_{epochs}epochs_{maxlen}steps_{sample_rate}srate.p"), 3, 1, m_name, save_fig)

    