# Queue Prediction


### File Overview
* **archive** folder that contains multiple concepts and previous build models for item and size prediction
* **Predict_Two_Queues_Items.ipynb** jupyter notebook showing the item prediction process for two queues
* **Predict_Two_Queues_Items_Script.py** python script that runs the prediction process for two queues
* **Live_Predict_Two_Queues_Items.ipynb** notebook with ES call for live data
* **scaler_x_2q, scaler_y_2q** pickled StandardScaler from trainingsprocess
* **model_2q_10epochs.h5** keras H5 format, contains the model´s architecture, weight values and compile() information


### Requirements.txt

To install all needed librarys and tools use (or requirements_predict.txt):
```
pip install -r requirements.txt
```


## Data Exploration


#### Queues
We have data from two consecutively queues, which are stored in an ElasticStack. The first queue is "censhare" and the following is "pic". Every minute there is an entry containing the queue size and the item names, which are at each timestamp in the queue waiting to be processed.

![queue_overview](https://user-images.githubusercontent.com/9306218/90044529-0bf1ef80-dcce-11ea-8f42-bbe772cb02ae.png)

The logic is the following: Every item that entered censhare will enter pic eventually, but not every item that entered pic must have been in censhare!

We aim to predict, when each item has left the second queue. In order for that we need to extract each item individually and put together a dataset of sample items. This dataset will be trained on an LSTM to make prediction of the remaining time each item will stay in the queue.

Overview of the item size in the censhare queue in June:

![june_cen](https://user-images.githubusercontent.com/9306218/90045506-6b043400-dccf-11ea-952e-946af2d7c71f.jpeg)


Overview of the item size in the pic queue in June:


![june_pic](https://user-images.githubusercontent.com/9306218/90045532-76575f80-dccf-11ea-818b-6ece0ee21e4e.jpeg)


Items that started in censhare are treated in our model, as if they were already in the pic queue. That means, we use the features size, n_added_items and n_removed_items of the pic queue, but also mark them in an extra feature "cen" as 1, while items that haven´t gone through censhare are marked with 0.


## LSTM Model building process


#### Get the data from ES

The raw data is loaded from ES.

| name | timestamp | querytime | items | tier | size |
| --- | --- | --- | --- | --- | --- |
| products | 2019-12-31T00:02:00.000000+00:00 | 0 | 1000 2000 | pic | 2 |
| products | 2019-12-31T00:01:30.000000+00:00 | 0 | 2000 3000 | pic | 2 |
| products | 2019-12-31T00:01:00.000000+00:00	 | 0 | 3000 | pic | 1 |


#### Prepare the data

To work with the data we have to transform the data and build two main dataframes from which we can build our dataset. The first one is enriched with additional features (e.g. the number of items added each timestep). For the second one we use the MultiLabelBinarizer to get a column for each item, so we can count the steps per item in the queue.


| timestamp | items | size | diff | diff_items | diff_items_rev | n_removed_items | n_added_items |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2019-12-31 00:02:00.000000+00:00 | [1000, 2000] | 2 | 0.0 | [] | [] | 0 | 0 |
| 2019-12-31 00:01:30.000000+00:00 | [2000, 3000] | 2 | 0.0 | [1000] | [3000] | 1 | 1 |
| 2019-12-31 00:01:00.000000+00:00 | [3000] | 1 | -1.0 | [2000] | [] | 1 | 0  |


| 1000 | 2000 | 3000 | ... |
| --- | --- | --- | --- |
| 1 | 1 | 0 | ... |
| 0 | 1 | 1 | ... |
| 0 | 1 | 1 | ... |


#### Create the dataset

Now we can build our dataset (X,y) combining these two dataframes. X contains per item each timestep it stays in the queue with the corresponding features Q_size, numbers of items added and numbers of items removed. y contains an array with the remaining steps the item is in the queue. We leave out items that haven´t left the queue at the last timestamp and those, which are in the queue at the first timestamp, in order to get only items that have been processed fully.

| n_steps_in_Q | Q_size | n_added | n_removed | cen |
| --- | --- | --- | --- | --- |
| 1 | 5000 | 10 | 5 | 0 |
| 2 | 5010 | 20 | 10 | 0 |
| ... | ... | ... | ... | ... |
| 1000 | 4000 | 5 | 15 | 0 |


| |
| --- |
| 1000 |
| 999 |
| ... |
| 1|


#### Scale, pad and split the dataset

We first standardize the features with the StandardScaler and afterwards pad the sequences (adding additional 0s) to even the length of each item sample. Our prepared datasets now have the form of (number of samples, number of timesteps, number of features). At last we split our samples into training and test set.


#### Training

Model Summary:

```
Layer (type)                 Output Shape              Param #   
=================================================================
masking_8 (Masking)          (None, 720, 5)            0         
_________________________________________________________________
lstm_15 (LSTM)               (None, 720, 20)           2080      
_________________________________________________________________
dropout_8 (Dropout)          (None, 720, 20)           0         
_________________________________________________________________
lstm_16 (LSTM)               (None, 720, 20)           3280      
_________________________________________________________________
dense_8 (Dense)              (None, 720, 1)            21        
=================================================================
Total params: 5,381
Trainable params: 5,381
Non-trainable params: 0
___________________________
```

## Testing


#### Testing environment
All models have been trained on a Mac with a quad-core Intel i7 2,9 GHz and 16 GB of RAM.


#### Resampling

Because we have a large dataset with a lot of entries for each item, we resample the dataset by taking every 10th datapoint, to boost our performance. Thus we now have a sample rate of 10 minutes instead of 1 minute. While doing it, we loose some short staying items, but our main focus is to predict items that stay for a rather long time in the queue.


#### Effects of resampling

For 2500 items

*Numbers are approximate*

| Resampling rate | time per epoch |
| --- | --- |
| 5 | 5min |
| 10 | 2:30min |
| 20 | 1:20min |

#### Downsampling

Another way of boosting the performance is to use downsampling. We just simply take only a percentage of items in our training dataset to train our model.

#### Effects of downsampling

*Numbers are approximate*

| Number of samples | time per epoch |
| --- | --- |
| 9000 | 8min |
| 6000 | 6min |
| 2500 | 2:30min |


#### Predictions

Due to the inconsistency of the initial queue waiting time, the prediction is tailored for each item individually and has various lengths. Down below are 3 example comparisons of our target value und the predicted output. The target value is the actual number of steps the item is still in the queue.


![Sample1](https://user-images.githubusercontent.com/9306218/90815747-77ba0500-e32b-11ea-97a2-0ddba9f87350.png)
![Sample2](https://user-images.githubusercontent.com/9306218/90815875-aafc9400-e32b-11ea-9b5d-faa78527244c.png)
![Sample3](https://user-images.githubusercontent.com/9306218/90815879-ac2dc100-e32b-11ea-8f06-ca9f7abc865a.png)
![Sample4](https://user-images.githubusercontent.com/9306218/90815888-adf78480-e32b-11ea-9fe6-f96198ea5d77.png)
![Sample5](https://user-images.githubusercontent.com/9306218/90815891-af28b180-e32b-11ea-831a-97b379ffcf11.png)
![Sample6](https://user-images.githubusercontent.com/9306218/90815894-b059de80-e32b-11ea-946a-b1659dd70f1f.png)

Below is a comparison of the actual item size and the item size based only on the predicted items for the 19th June.

![Unknown-9](https://user-images.githubusercontent.com/9306218/90815971-d1baca80-e32b-11ea-9ccd-bdfc007ecb4e.png)


#### Score based on epochs

The score is based on each timestep for each item compared to prediction step by step. MAE in time is based on the 10 minute steps used in the model. 5 Epochs of training equal approximately 35mins of training based on the data from 8.-12. and around 6000 Samples used for training.

| Number of epochs | MAE | MAE in time |
| --- | --- | --- |
| 5 | 40 | 6:30h |
| 10 | 28 | 4:35h |


## Prediction Process

We load 5 days (or how many days we took for training) from ES. Then create our dataset similiar to the training process, except that we only take the items for predicting which are present at the last timestamp and leave out generating our target variables. After loading our pretrained model, we can start the prediction. As we only need one value, we create a list, storing the number of steps each item has been in the queue and match that with the indice of our prediction. In order to store our data the same way we retrieved it earlier, we create a dataframe in the structure of our loaded data. That means at each timestamp, there is a list of item numbers which are in the queue at that point and the amount of items is stored under size.


#### Prediction Statistics

![Predictionprocess](https://user-images.githubusercontent.com/9306218/90158161-eed12580-dd8e-11ea-8723-0d2a629eb666.png)


Table showing time from start for different steps of the prediction process.

| Number of items | Dataframe | Dataset | Prediction & Upload |
| --- | --- | --- | --- |
| 153 | 1s | 3s | 13s |
| 435 | 8s | 13s | 28s |
| 2550 | 1s | 11s | 62s |
| 7900 | 8s | 36s | 179s |


#### Structure in ES

Screenshot of example predictions uploaded back into ES


![Bildschirmfoto 2020-08-14 um 00 44 02](https://user-images.githubusercontent.com/9306218/90194310-45f2ec80-ddc7-11ea-860e-042bb584c451.png)


## Previous tests


#### Create the dataset for supervised models

For the creation of supervised models we just take each row of each item with the corresponding target value. That leaves us with an huge amount of samples.

[1, 5000 , 10, 5 ] for X and 1000 for y


#### Scoring

To score the models we use the MAE, which shows us how close our predictions are. The LSTM score is based on the 1% downsampled model, so the real score may vary. The time error recalculates the 10 min steps, so it basically is the average timeframe the prediction misses on average.


| Model | MAE | time error |
| --- | --- | --- |
| LSTM | 136 | ~11h |
| LSTM resampled | 46 | ~4h |
| Linear Regression | 644 | ~54h |
| Decision Trees | 402 | ~47h |
