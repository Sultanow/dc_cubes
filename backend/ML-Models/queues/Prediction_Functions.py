# Imports
from elasticsearch import Elasticsearch
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
import keras
from keras.preprocessing.sequence import pad_sequences
import pandas as pd
import numpy as np
import datetime
import time
import pickle
from tensorflow.keras.models import load_model

# Functions

class predict():

    def es_to_df(start, end, s_rate, tier, host, port):
        """
        Returns data from ES based on the given time period and tier.
        Transforms and downsamples the data into a pandas dataframe.

        Parameters:
        start (str): start date in format "yyyy-MM-dd"
        end (str): end date in format "yyyy-MM-dd"
        s_rate (int): the sample rate, each nth entry is taken
        tier (str): name of the queue (tier) e.g. 'pic'
        host (str): name of the host e.g. 'localhost'
        port (int): number of port e.g. 9200

        Returns:
        pd.DataFrame: pandas DataFrame

        Example:
        es_timerange("2020-06-01", "2020-06-10", 10, 'pic', 'localhost', 9200)
        """

        # Establish connection
        es = Elasticsearch([host], port=port)

        # Create a list of the given dates between start date and end date
        slist = start.split("-")
        slist = map(int, slist)
        slist = list(slist)

        elist = end.split("-")
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
            res = es.search(index="queues", body={"query": {
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
            }, size=1440)  # defined size of 1440 entries per day
            daily_data = [elem['_source'] for elem in res['hits']['hits']]
            final_data.extend(daily_data)

        # Create pandas dataframe from final_data list
        df = pd.DataFrame(final_data)

        # Downsample the entries
        df = df.iloc[::s_rate, :].copy()  # take every nth entry
        # Format the timestamp
        df.index = df["timestamp"]
        df.index = pd.to_datetime(df.index, format='%Y-%m-%dT%H:%M:%S.%f%z').sort_values()
        df.drop(columns=['timestamp', 'name'], inplace=True)  # drop unnecassry columns
        # Create a list of the items
        df['items'] = [[str(x)] if len(str(x)) < 10 else str(x).split(" ")
                       for x in df['items']]  # convert items to list
        # Change datatype of size
        df['size'] = pd.to_numeric(df['size'])

        return df


    def create_dataset_predict(q_one, q_two):
        """Adds features to the dataframe and returns the prepared dataset containing
        the sample items and the matching target variables

        Parameters:
        q_one (pd.DataFrame): dataframe containing entries of the first queue
        q_two (pd.DataFrame): dataframe containing entries of the second queue

        Returns:
        data_x (list): list containing the selected sample items
        data_y (list): list containing the target sequences
        """

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

        # Create each sample
        for item in q_one_mlb.columns: #first queue
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

                # Create list of steps it stays in the queue
                steps_list = list(range(1, diff+1))

                # Create a dataframe and fill in the features
                X_item = pd.DataFrame(data=steps_list, columns=[item]).astype(str).astype(int)
                X_item['Q_size_one'] = size_one
                X_item['Q_size_two'] = size_two
                X_item['n_added_two'] = added
                X_item['n_removed_two'] = removed
                X_item['q_one'] = 1 #mark that it appeared in the first queue

                # Filter out items with no values
                if len(X_item) == 0:
                    continue

                data_x.append(X_item)

            else:
                continue


        for item in q_two_mlb.columns:
            if ((item not in q_one_mlb.columns) and (item not in exclude_first and item not in exclude_last)):

                # Mark the occourence of the item in the queue
                mask = q_two_mlb[item] != 0

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

                # Create a dataframe and fill in the features
                X_item = pd.DataFrame(data=steps_list, columns=[item]).astype(str).astype(int)
                X_item['Q_size_one'] = size_one
                X_item['Q_size_two'] = size_two
                X_item['n_added_two'] = added
                X_item['n_removed_two'] = removed
                X_item['q_one'] = 0 #mark that it didn't appear in the first queue

                data_x.append(X_item)

            else:
                continue

        return data_x


    def scale_pad(dataset, maxlen):
        '''Scales and pads the sequences (samples)

        Parameters:
        dataset (list): list containing the samples
        maxlen (int): max number of timesteps/value to pad

        Returns:
        X_pad_scaled (list): list with padded and scaled sequences
        X_pad (list): list with padded sequences'''

        # Load the scaler used for training
        scaler_X = pickle.load(open("scaler_x_2q.p", "rb"))

        # Scale the dataset
        _ = [scaler_X.partial_fit(x) for x in dataset]
        X_scaled = [scaler_X.transform(x) for x in dataset]

        # Pad the sequences

        def pad(sequence, maxlen):
            # fills list post (at the end) with 0s to make even sized sequences
            return pad_sequences(sequence, maxlen=maxlen, dtype='float32', padding='post', value=0.0)

        X_pad_scaled = pad([x for x in X_scaled], maxlen)
        X_pad = pad([x.values for x in dataset], maxlen)

        return X_pad_scaled, X_pad


    def predict_upload(q_two, dataset, dataset_pad, dataset_scaled, host, port, model, index_es):
        '''Generates a prediction for each item and uploads the
        transformed data to ES

        Parameters:
        q_two (pd.DataFrame): dataframe of the second queue
        dataset (list): original dataset
        dataset_scaled (list): list with padded and scaled sequences
        host (str): name of the host e.g. 'localhost'
        port (int): number of port e.g. 9200
        model (str): filepath to keras model h5 file
        index_es (str): indexname where predictions are stored
        '''
        # Establish connection to ES
        es = Elasticsearch([host], port=port)

        # Load the pretrained model, predict and rescale the prediction
        model = load_model(model)  # "model_2q_10epochs.h5"
        pred = model.predict(dataset_scaled)
        scaler_y = pickle.load(open("scaler_y_2q.p", "rb"))
        pred_rescaled = scaler_y.inverse_transform(pred.reshape(-1, 1)).reshape(pred.shape)

        # Create a list containing the maximum number of steps for each item
        max_steps = list()
        for item in dataset_pad:
            max_step = max(item[:, 0])
            max_steps.append(max_step)

        # Create lists containing the predictions and corresponding item numbers
        pred_list = list()
        pred_only = list()
        for x in range(len(dataset_pad)):
            # take the prediction at the last step
            predict = (int(pred_rescaled[x][int(max_steps[x]-1)]))
            item = dataset[x].columns[0]  # get the item number
            item_predict = [item, predict]
            pred_list.append(item_predict)
            pred_only.append(predict)

        # Create the final list to match the ES structure
        final_list = list()

        for x in range(int(max(pred_only))):
            items = ''
            for prediction in pred_list:
                if prediction[1] >= x:
                    item = prediction[0] + ' '
                    items += item
            final_list.append(items)

        # Create the final DataFrame
        final_df = pd.DataFrame()
        final_df['items'] = final_list
        final_df['size'] = final_df['items'].apply(lambda x: len(
            x.split(" "))-1)  # calculate the size based on items

        # Generate timestamps based on the last timestamp
        time_stamps = pd.date_range(
            start=q_two.index[-1]+datetime.timedelta(minutes=10), periods=len(final_df), freq='10min')
        final_df['timestamp'] = time_stamps
        final_df['timestamp'] = final_df.timestamp.map(
            lambda x: datetime.datetime.strftime(x, '%Y-%m-%dT%H:%M:%S.%f%z'))

        # Upload the data back to ES
        # Delete old prediction data
        es.indices.delete(index=index_es, ignore=[400, 404])
        # Create new index to store again
        es.indices.create(index=index_es, ignore=400)

        count = 0
        for index, row in final_df.iterrows():
            doc_data = {
                'timestamp': row['timestamp'],
                'tier': 'pic',
                'name': 'products',
                # 'querytime' : 0,
                'size': row['size'],
                'items': row['items']
                # 'cen' : row['cen']
            }
            count += 1
            es.index(index_es, body=doc_data)
            if count % 10 == 0:
                print(str(count) + " Elemente hochgeladen")
