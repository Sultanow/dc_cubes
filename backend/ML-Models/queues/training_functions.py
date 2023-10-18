# Imports
from elasticsearch import Elasticsearch
from sklearn.linear_model import LinearRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from keras.preprocessing.sequence import pad_sequences
from keras.models import Sequential
from keras.layers import Dense, Masking, LSTM, Dropout
from keras.callbacks import EarlyStopping, ModelCheckpoint
import pandas as pd
import numpy as np
import datetime
import time
import math
import pickle
from tensorflow.keras.models import load_model
import logging
import matplotlib.pyplot as plt

import math

def es_to_df(start_date, end_date, s_rate, tier, host, port):
    """
    Returns data from ES based on the given time period and tier.
    Transforms and downsamples the data into a pandas dataframe.

    Parameters:
    start_date (str): start date in format "yyyy-MM-dd"
    end_date (str): end date in format "yyyy-MM-dd"
    s_rate (int): the sample rate, each nth entry is taken
    tier (str): name of the queue (tier) e.g. 'pic'
    host (str): name of the host e.g. 'localhost'
    port (int): number of port e.g. 9200

    Returns:
    pd.DataFrame: pandas DataFrame

    Example:
    es_timerange("2020-06-01", "2020-06-10", 10, 'pic', 'localhost', 9200)
    """

    start = time.time()

    # Establish connection
    es = Elasticsearch([host], port=port)

    # Create a list of the given dates between start date and end date
    slist = start_date.split("-")
    slist = map(int, slist)
    slist = list(slist)

    elist = end_date.split("-")
    elist = map(int, elist)
    elist = list(elist)

    sdate = datetime.date(slist[0], slist[1], slist[2])
    edate = datetime.date(elist[0], elist[1], elist[2])
    delta = edate - sdate

    datelist = list()

    for i in range(delta.days + 1):
        day = sdate + datetime.timedelta(days=i)
        datelist.append(day)


    # Get the matching data for each day and store it in a list
    final_data = list()

    for date in datelist:
        res = es.search(index="queues", body={
            "from": 0, "size": 4000,
            "query": {
                "bool": {
                    "must": [
                        {"match": {
                            "name": "products"}},
                        {"match": {
                            "tier": tier}},
                        {"range": {
                            "timestamp": {
                                "gte": str(date),
                                "lte": str(date),
                                "format": "yyyy-MM-dd"
                            }
                        }
                        }
                    ]
                }
        }
        })  # defined size of 2880 entries per day
        daily_data = [elem['_source'] for elem in res['hits']['hits']]
        final_data.extend(daily_data)

    # Create pandas dataframe from final_data list
    df = pd.DataFrame(final_data)

    # Format the timestamp
    df.index = df['timestamp']
    df.index = pd.to_datetime(df.index, format='%Y-%m-%dT%H:%M:%S.%f%z')
    
    # Sort the index
    df = df.sort_index().copy()

    # Downsample the entries
    df = df.iloc[::s_rate, :].copy()  # take every nth entry
    
    # Drop unnecessary columns
    df.drop(columns=['timestamp', 'name'], inplace=True)  # drop unnecessary columns
    
    # Create a list of the items
    df['items'] = [[str(x)] if len(str(x)) < 10 else str(x).split(" ")
                   for x in df['items']]  # convert items to list
    
    # Change datatype of size
    df['size'] = pd.to_numeric(df['size'])

    end = time.time()
    logging.info(f'ES to Df: {end - start:.2f} time elapsed')

    return df


def create_dataset_train(q_one, q_two, outlier_min=0, outlier_max=10000):
    """Adds features to the dataframe and returns the prepared dataset containing
    the sample items and the matching target variables

    Parameters:
    q_one (pd.DataFrame): dataframe containing entries of the first queue
    q_two (pd.DataFrame): dataframe containing entries of the second queue
    outlier_min (int): outlier minimum steps to be considered in the queue
    outlier_max (int): outlier maximum steps to be considered in the queue

    Returns:
    data_x (list): list containing the selected sample items
    data_y (list): list containing the target sequences
    maxlen (int): length of the dataframe
    """

    start = time.time()

    # Create MultiLabelBinarized DataFrames for both queues
    mlb = MultiLabelBinarizer()
    q_one_mlb = pd.DataFrame(mlb.fit_transform(q_one['items']), columns=mlb.classes_)
    q_two_mlb = pd.DataFrame(mlb.fit_transform(q_two['items']), columns=mlb.classes_)

    # # Add features: "n_added_items", "n_removed_items" for queue one
    # lists = q_one['items'].tolist()
    # current = lists[0]
    # diff_sets = [[]]
    # diff_sets_rev = [[]]
    # for next_list in lists[1:]:
    #     diff_sets.append(sorted(set(current).difference(set(next_list))))
    #     diff_sets_rev.append(sorted(set(next_list).difference(set(current))))
    #     current = next_list

    # q_one['diff_items'] = diff_sets
    # q_one['diff_items_rev'] = diff_sets_rev
    # q_one['n_removed_items'] = q_one['diff_items'].apply(lambda x: len(x))
    # q_one['n_added_items'] = q_one['diff_items_rev'].apply(lambda x: len(x))

    # Add features: "n_added_items", "n_removed_items" for queue two
    lists = q_two['items'].tolist()
    current = lists[0]
    diff_sets = [[]]
    diff_sets_rev = [[]]
    for next_list in lists[1:]:
        diff_sets.append(sorted(set(current).difference(set(next_list))))
        diff_sets_rev.append(sorted(set(next_list).difference(set(current))))
        current = next_list

    q_two['diff_items'] = diff_sets
    q_two['diff_items_rev'] = diff_sets_rev
    q_two['n_removed_items'] = q_two['diff_items'].apply(lambda x: len(x))
    q_two['n_added_items'] = q_two['diff_items_rev'].apply(lambda x: len(x))

    # Get only the values from each column
    sizes_q_one = q_one['size'].values
#   added_q_two = q_one['n_added_items'].values
#   removed_q_two = q_one['n_removed_items'].values

    sizes_q_two = q_two['size'].values
    added_q_two = q_two['n_added_items'].values
    removed_q_two = q_two['n_removed_items'].values

    # Exclude items which are already in the queue and haven´t left at the last timestamp
    exclude_first = q_two['items'][0]
    exclude_last = q_two['items'][-1]

    data_x = list()
    data_y = list()

    # Count the items that are in the first and second queue
    count = 0

    # Create each sample
    for item in q_one_mlb.columns:  # first queue
        if ((item in q_two_mlb.columns) and (item not in exclude_first and item not in exclude_last)):

            # Mask the occurence of the item in both queues
            mask_q_one = q_one_mlb[item] != 0
            mask_q_two = q_two_mlb[item] != 0

            # Get the position it appears in the first queue and the first and last time in the second queue
            position_q_one_first = q_one_mlb[item][mask_q_one].index[0]
            position_q_two_first = q_two_mlb[item][mask_q_two].index[0]
            position_q_two_last = q_two_mlb[item][mask_q_two].index[-1]

            # Filter out odd behaviour (if it first appears in the second and afterwards in the first)
            # and slice the features based on the positions

            if position_q_one_first > position_q_two_last:
                diff = position_q_two_last - position_q_two_first
                size_one = sizes_q_one[position_q_two_first:position_q_two_last]
                size_two = sizes_q_two[position_q_two_first:position_q_two_last]
                added = added_q_two[position_q_two_first:position_q_two_last]
                removed = removed_q_two[position_q_two_first:position_q_two_last]
            else:
                diff = position_q_two_last - position_q_one_first
                size_one = sizes_q_one[position_q_one_first:position_q_two_last]
                size_two = sizes_q_two[position_q_one_first:position_q_two_last]
                added = added_q_two[position_q_one_first:position_q_two_last]
                removed = removed_q_two[position_q_one_first:position_q_two_last]

            # Create list of steps it stays in the queue and define the starting q point of the item 
            steps_list = list(range(1, diff+1))
            start_Q = 0
          
            # Create a dataframe and fill in the features
            data = [steps_list, size_one, size_two, added, removed, len(steps_list) * [start_Q]]
            columns = [item, 'Q_size_one', 'Q_size_two', 'n_added_two', 'n_removed_two', 'Q_start']
            X_item = pd.DataFrame.from_dict({col: d for col, d in zip(columns, data)})

            # Create target data
            y_item = pd.DataFrame(data=steps_list[::-1], columns=[item])

            # Filter out items with no values
            if len(y_item) == 0:
                continue

            # Filter out Outlier
            if len(y_item) < outlier_min or len(y_item) > outlier_max:
                continue

            data_x.append(X_item)
            data_y.append(y_item)

            count += 1

        else:
            continue

    logging.info(f'{len(data_x)} items in the first and second queue')

    for item in q_two_mlb.columns:
        if ((item not in q_one_mlb.columns) and (item not in exclude_first and item not in exclude_last)):

            #count += 1
            # Mark the occourence of the item in the queue
            mask_q_two = q_two_mlb[item] != 0

            # Get the first and last appearance of the item in the queue
            position_q_two_first = q_two_mlb[item][mask_q_two].index[0]
            position_q_two_last = q_two_mlb[item][mask_q_two].index[-1]

            # Slice the features based on the positions
            diff = position_q_two_last - position_q_two_first
            size_one = sizes_q_one[position_q_two_first:position_q_two_last]
            size_two = sizes_q_two[position_q_two_first:position_q_two_last]
            added = added_q_two[position_q_two_first:position_q_two_last]
            removed = removed_q_two[position_q_two_first:position_q_two_last]

            # Create list of steps it stays in the queue
            steps_list = list(range(1, diff+1))

            start_Q = 1
            # Create a dataframe and fill in the features
            data = [steps_list, size_one, size_two, added, removed, len(steps_list) * [start_Q]]
            columns=[item, 'Q_size_one', 'Q_size_two', 'n_added_two', 'n_removed_two', 'Q_start']
            X_item = pd.DataFrame.from_dict({col: d for col, d in zip(columns, data)})

#             # Create a dataframe and fill in the features
#             X_item = pd.DataFrame(data=steps_list, columns=[item]).astype(str).astype(int)
#             X_item['Q_size_one'] = size_one
#             X_item['Q_size_two'] = size_two
#             X_item['n_added_two'] = added
#             X_item['n_removed_two'] = removed
#             X_item['Q_start'] = 1 #mark that it didn't appear in the first queue

            # Create target data
            y_item = pd.DataFrame(data=steps_list[::-1], columns=[item])

            if len(y_item) == 0:
                continue

            # Filter out Outlier
            if len(y_item) < outlier_min or len(y_item) > outlier_max:
                continue

            data_x.append(X_item)
            data_y.append(y_item)

        else:
            continue

    
    maxlen = len(q_two)
    
    logging.info(f'{len(data_x)-count} items in the second queue only')
    logging.info(f'{len(data_x)} items in the whole dataset')

    end = time.time()
    logging.info(f'Create dataset: {end - start:.2f} time elapsed')
    
    return data_x, data_y, maxlen


def get_max_len_list_mean_median(y):
    """ Creates a list containing the maximum number of steps for every item

    Parameters:
    y (list) : containing the target sequences (data_y)

    Returns:
    maxlenlist (list) : list containing only the maximum number of steps
    mean (int) : mean of the item lengths
    median (int) : median of the item lenths
    """

    maxlenlist = []
    for x in y:
        maxlenlist.append(x.iloc[0][0])

    mean = int(np.mean(maxlenlist))
    median = int(np.median(maxlenlist))

    return maxlenlist, mean, median


def scale(X, y, start_date, end_date, epochs, steps, s_rate, model_name=None):
    """ Scales the datasets and saves the scaler

    Parameters:
    X : preprocessed dataset including features
    y : preprocessed dataset with target variable
    start_date (str) : start date of model training
    end_date (str) : end date of model training
    epochs (str) : number of epochs used for model training
    steps (str) : maximum number of steps per item
    s_rate (str) : the sample rate, each nth entry is taken
    model_name (str) : set model name to match the scaler to the model

    Returns:
    X_scaled : scaled dataset
    y_scaled : scaled dataset
    """
    
    start = time.time()

    # Initiate the scaler
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()

    # Scale the datasets
    _ = [scaler_X.partial_fit(x) for x in X]
    _ = [scaler_y.partial_fit(x) for x in y]
    X_scaled = [scaler_X.transform(x) for x in X]
    y_scaled = [scaler_y.transform(x) for x in y]

    # Save the scaler
    if model_name is not None:
        pickle.dump(scaler_X, open(f"models/scalerx_{model_name}_{start_date}_{end_date}_{epochs}epochs_{steps}steps_{s_rate}srate.p", "wb"))
        pickle.dump(scaler_y, open(f"models/scalery_{model_name}_{start_date}_{end_date}_{epochs}epochs_{steps}steps_{s_rate}srate.p", "wb"))

    end = time.time()
    logging.info(f'Scale: {end - start:.2f} time elapsed')

    return X_scaled, y_scaled


def pad_split(X, y, maxlen, **kwargs):
    """ Pads the sequences to a global length and splits them into
    train and test set

    Parameters:
    X : preprocessed and scaled dataset including features
    y : preprocessed and scaled datasets with target variable
    maxlen (int): max number of timesteps/value to pad

    Returns:
    X_train : feature sequences padded with 0 in shape (number of samples, timesteps, features)
    X_test : feature sequences padded with 0 in shape (number of samples, timesteps, features)
    y_train : target sequences padded with 0 in shape (number of samples, timesteps, features)
    y_test : target sequences padded with 0 in shape (number of samples, timesteps, features)
    """

    start = time.time()

    def pad(sequence, maxlen):
        # fills list post (at the end) with 0s to make even sized sequences
        return pad_sequences(sequence, maxlen=maxlen, dtype='float32', padding='post', value=0.0)

    X_pad = pad([x for x in X], maxlen)
    y_pad = pad([x for x in y], maxlen)


    #train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X_pad, y_pad, **kwargs)

    end = time.time()
    logging.info(f'Pad Split: {end - start:.2f} time elapsed')

    return X_train, X_test, y_train, y_test


def downsample(X_train, X_test, y_train, y_test, rate):
    """ Downsamples the number of items based on given rate

    Parameters:
    X_train : feature sequences
    X_test : feature sequences
    y_train : target sequences
    y_test : target sequences
    rate (float): rate of downsampling e.g. 0.8 means keep 80% of samples

    Returns:
    X_train_sampled: downsampled feature sequences
    X_test_sampled: downsampled feature sequences
    y_train_sampled: downsampled target sequences
    y_test_sampled: downsampled target sequences
    """

    start = time.time()

    # Mask random choosen samples based on rate
    mask_train = np.random.choice([False, True], len(X_train), p=[1-rate, rate])
    mask_test = np.random.choice([False, True], len(X_test), p=[1-rate, rate])

    X_train_sampled = X_train[mask_train]
    y_train_sampled = y_train[mask_train]

    X_test_sampled = X_test[mask_test]
    y_test_sampled = y_test[mask_test]

    end = time.time()
    logging.info(f'Downsample: {end - start:.2f} time elapsed')

    return X_train_sampled, X_test_sampled, y_train_sampled, y_test_sampled


def build_model(X_train_sampled, y_train_sampled, max_steps, n_neurons, n_epochs, start_date, end_date, s_rate,
                masking=True, model_name='model_2q', sample_weight=False):
    """ Model building function

    Parameters:
    X_train_sampled : preprocessed, scaled and downsampled dataset X
    y_train_sampled : preprocessed, scaled and downsampled dataset y
    max_steps (list) : list of maximum number of steps per item in the queue (maxlenlist)
    n_neurons (int) : number of neurons per LSTM Layer
    n_epochs (int) : number of epochs used for training
    start_date (str) : start date of model training
    end_date (str) : end date of model training
    s_rate (str) : the sample rate, each nth entry is taken
    masking (bool) : use masking layer
    model_name (str) : set model name
    sample_weight (bool) : use sampling weight
    

    Returns:
    saves trained model in the directory
    """

    start = time.time()

    # Build the model
    n_steps = X_train_sampled.shape[1]  # number of steps
    n_features = X_train_sampled.shape[2]  # number of features

    # Set sample weighting
    sample_weight = 1/np.array(max_steps) if sample_weight else None

    # Create model layer
    model = Sequential()
    if masking:
        model.add(Masking(mask_value=0.0, input_shape=(n_steps, n_features)))  # Masking Layer for padding
    model.add(LSTM(n_neurons, return_sequences=True))
    model.add(Dropout(0.1))
    model.add(LSTM(n_neurons, return_sequences=True))
    model.add(Dense(1, input_dim=n_neurons))  # Dense Layer to generate 1Dimensional Outputs
    model.compile(loss='mae', optimizer='adam', metrics=['mae'])

    # Define CallBacks
    early_stop = EarlyStopping(monitor='mae', mode='min', patience=10)
    mcp_save = ModelCheckpoint(f'models/best_{model_name}_{start_date}_{end_date}_{n_epochs}epochs_{n_steps}steps_{s_rate}srate.h5', 
                                save_best_only=True, monitor='mae', mode='min')

    # Start training
    model.fit(X_train_sampled, y_train_sampled, epochs=n_epochs, validation_split=0.2,
              callbacks=[early_stop, mcp_save], sample_weight=sample_weight)

    # Save the model in models directory
    model.save(f'models/{model_name}_{start_date}_{end_date}_{n_epochs}epochs_{n_steps}steps_{s_rate}srate.h5')

    m_name = (f'models/{model_name}_{start_date}_{end_date}_{n_epochs}epochs_{n_steps}steps_{s_rate}srate.h5')

    end = time.time()
    logging.info(f'Model building: {end - start:.2f} time elapsed')
    return m_name


def compute_pred_list(pred, y_target, y_test_sampled):
    """ Compute the prediction and target list for score calculation and display purposes without the padded values

    Parameters:
    pred (list) : list containing the predictions for each step
    y_target (list) : list containing the target values for each step
    y_test_sampled (list) : list containing the original target values of the test set

    Returns:
    prediction_list (list) : list of all the predictions for each sample
    target_list (list) : list of all target values for each sample
    """

    # Mask to filter out the padded values
    y_test_sampled_masked = list()
    for x in y_test_sampled:
        mask = np.ma.masked_where(x != 0, x)
        y_test_sampled_masked.append(mask.mask)
    # Create final lists containing target and prediction for score calculation and display purposes
    target_list = list()
    prediction_list = list()
    for x in range(len(y_target)):
        mask = y_test_sampled_masked[x]
        target = y_target[x][mask]
        prediction = pred[x][mask]
        target_list.append(target)
        prediction_list.append(prediction)
    return prediction_list, target_list


def flatten_list(t):
    """ Flattens the list to compute mae afterwards

    Parameters:
    t (list) : list 

    Returns:
    flattened list
    """
    return [item for sublist in t for item in sublist]


def compute_mae(pred_list, target_list):
    """ Compute the MAE based on the prediction and target list

    Parameters:
    pred_list (list) : list of all the predictions for each sample
    target_list (list) : list of all target values for each sample
    """
    pred_list_flat, target_list_flat = flatten_list(pred_list), flatten_list(target_list)
    # Calculate the MAE over every step 
    mae = mean_absolute_error(target_list_flat, pred_list_flat)
    return mae


def plot_samples(n_plots, seed, save_fig, pred_list, pred_mean_list, pred_median_list, target_list, 
                pred_mae, pred_mean_mae, pred_median_mae, model_name):
    """ Plot the samples together with mean/median and save the figures

    Parameters:
    n_plot (int) : number of sample plots to display (gets squared)
    seed (int) : seed used to recreate the displayed samples
    save_fig (bool) : control the figure saving
    pred_list (list) : list of all the predictions for each sample
    pred_mean_list (list) : list of all the mean predictions for each sample
    pred_median_list (list) : list of all the median predictions for each sample
    target_list (list) : list of all target values for each sample
    model_name (str) : set model name to name figure

    Returns:
    displays the figures and
    """

    # Set the seed
    np.random.seed(seed)

    # Pick the samples
    sample_list = np.random.choice(range(len(target_list)), n_plots**2, replace=False)

    # Create the plots
    fig, axs = plt.subplots(nrows=n_plots, ncols=n_plots, sharex=True, sharey=True, figsize=(12, 12))

    for i in range(n_plots):
        for j in range(n_plots):
            x = sample_list[i*n_plots+j]
            axs[i, j].plot(target_list[x], label='Target')
            axs[i, j].plot(pred_list[x], label='Prediction')
            axs[i, j].plot(pred_mean_list[x], label='Prediction Mean')
            axs[i, j].plot(pred_median_list[x], label='Prediction Median')
            axs[0, 0].set_title(f'{model_name}', fontsize=7)
            if i == n_plots - 1:
                axs[i, j].set_xlabel('Step')
            if j == 0:
                axs[i, j].set_ylabel('Step noch in Queue')
            if j == n_plots - 1:
                axs[i, j].legend()
    plt.tight_layout()
    if save_fig:
        plt.savefig(f'figures/{model_name}_mae_{pred_mae:.2f}_mean_{pred_mean_mae:.2f}_median_{pred_median_mae:.2f}.png')
    plt.show()


def pred_baseline(value, X, pred):
    """ Create the baseline prediction based on mean/median

    Parameters:
    value (int) : value for the previous computed mean/median
    X (list) : list containing the test samples
    pred (list) : list containing the predictions

    Returns:
    pred (list) : list containing the predictions for mean/median
    """
    
    # Create lists that imitate the prediction based on the value
    pred = np.zeros_like(pred)
    pred_steps = len(pred[0,:,0])
    for i, item in enumerate(X):
        max_step = max(item[:,0])
        pred_i = list(reversed(range(int(value)-int(max_step))))
        pred[i,:,0] = pred_i + (pred_steps-len(pred_i)) * [0]
    return pred


def pred_mae(X_test_sampled, y_test_sampled, y, model, scaler_y, n_plots, seed, model_name, save_fig):
    """ Calculates the predictions and the MAE and displays the plots
    
    Parameters:
    X_test_sampled : preprocessed, scaled and downsampled test dataset X
    y_test_sampled : preprocessed, scaled and downsampled test dataset y
    y : preprocessed and scaled datasets with target variable
    model (str) : filepath to the model
    scaler_y (str) : filepath to the y scaler
    n_plots (int) : number of sample plots to display (gets squared)
    seed (int) : seed used to recreate the displayed samples
    save_fig (str) : set the figure name

    Returns:
    shows the MAE for the predictions including the mean/median prediction and displays the sample plots
    
    """

    # Load the pretrained model
    model = load_model(model)

    # Get mean and median
    _, mean, median = get_max_len_list_mean_median(y)
    
    # Predict and rescale the prediction
    pred = model.predict(X_test_sampled)
    pred_mean = pred_baseline(mean, X_test_sampled, pred)
    pred_median = pred_baseline(median, X_test_sampled, pred)
    
    # Mask again to filter out the padded values
    y_test_sampled_masked = list()
    for x in y_test_sampled:
        mask = np.ma.masked_where(x != 0, x)
        y_test_sampled_masked.append(mask.mask)

    # Load the scalers used for training and rescale our target and prediction
    scaler_y = pickle.load(open(scaler_y, "rb"))

    pred = scaler_y.inverse_transform(pred.reshape(-1, 1)).reshape(pred.shape)
    y_target = scaler_y.inverse_transform(y_test_sampled.reshape(-1, 1)).reshape(y_test_sampled.shape)

    pred_list, target_list = compute_pred_list(pred, y_target, y_test_sampled)
    pred_mean_list, _ = compute_pred_list(pred_mean, y_target, y_test_sampled)
    pred_median_list, _ = compute_pred_list(pred_median, y_target, y_test_sampled)
    
    pred_mae = round(compute_mae(pred_list, target_list), 2)
    pred_mean_mae = round(compute_mae(pred_mean_list, target_list), 2)
    pred_median_mae = round(compute_mae(pred_median_list, target_list), 2)
    print('MAE        : ', pred_mae)
    print('MAE Mean   : ', pred_mean_mae)
    print('MAE Median : ', pred_median_mae)
    
    plot_samples(n_plots, seed, save_fig, pred_list, pred_mean_list, pred_median_list, target_list, 
                pred_mae, pred_mean_mae, pred_median_mae, model_name)
    


def split_train_test(X, y, **kwargs):
    """ Splits the dataset into train und test set for supervised models

    Parameters:
    X : dataset X
    y : dataset y

    Returns:
    X_train : feature sequences
    X_test : feature sequences
    y_train : target sequences
    y_test : target sequences

    """

    # Split into train and test set and stack the sequences
    X_train, X_test, y_train, y_test = train_test_split(X, y, **kwargs)
    X_train = np.vstack([x.values for x in X_train])
    X_test = np.vstack([x.values for x in X_test])
    y_train = np.concatenate([y.values for y in y_train])
    y_test = np.concatenate([y.values for y in y_test])

    return X_train, X_test, y_train, y_test


def scale_sv(X_train, X_test):
    """ Scales the features for the supervised models

    Parameters: 
    X_train : feature sequences
    X_test : feature sequences

    Returns:
    X_train : scaled feature sequences
    X_test : scaled feature sequences
    """

    # Inititate the standard scaler
    scaler = StandardScaler()

    # Fit and transform the data
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    return X_train, X_test

def get_mae_score_sv(y_test, pred_test):
    """ Calculates the MAE score for the supervised model
    """
    mae = mean_absolute_error(y_test, pred_test)
    return mae