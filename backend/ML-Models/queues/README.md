# Queue Prediction
### File Overview
* **PredictorES** is as simple script to show the ability to connect to the ElasticSearch, retrieve some data, make a prediction based on the AR Model and writes the predicted values with the matching timestamps back to ES afterwards.
* **PredictorJSON** can predict based on the json file retrieved from ES and write the results back to a json file, which could be uploaded via elasticdump.
* **PredictorES-LSTM** exchanges the model with an LSTM build model, which procedure is shown in **/Concepts/Queue-Size-Prediction-LSTM-Concept.ipynb**

### Testing environment
All models have been trained on a Mac with a quad-core Intel i7 2,9 GHz and 16 GB of RAM.

### Data Exploration
For testing the models we choose a timeframe of 8 days. That took 4.7 seconds to load from ES. In the timeframe we have 35096 unique items, each item is on average 1339 timesteps (~11h) in the queue. For the model training we have the shape of (24567, 6035, 4) for X and (24567, 6036, 1) for y.

![Queue Size 8 days](https://user-images.githubusercontent.com/9306218/86410850-dcf26200-bcbb-11ea-8d4a-29511d926523.png)

## LSTM Model building process

### Get the data from ES

The raw data is loaded from ES.

| name | timestamp | querytime | items | tier | size |
| --- | --- | --- | --- | --- | --- |
| products | 2019-12-31T00:02:00.000000+00:00 | 0 | 1000 2000 | pic | 2 |
| products | 2019-12-31T00:01:30.000000+00:00 | 0 | 2000 3000 | pic | 2 |
| products | 2019-12-31T00:01:00.000000+00:00	 | 0 | 3000 | pic | 1 |

### Prepare the data

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


### Create the dataset

Now we can build our dataset (X,y) combining these two dataframes. X contains per item each timestep it stays in the queue with the corresponding features Q_size, numbers of items added and numbers of items removed. y contains an array with the remaining steps the item is in the queue.

| n_steps_in_Q | Q_size | n_added | n_removed |
| --- | --- | --- | --- |
| 1 | 5000 | 10 | 5 |
| 2 | 5010 | 20 | 10 |
| ... | ... | ... | ... |
| 1000 | 4000 | 5 | 15 |


| |
| --- |
| 1000 |
| 999 |
| ... |
| 1|


### Create the dataset for supervised models

For the supervised models we just take each row of each item with the corresponding target value. That leaves us with an huge amount of samples (42427571)

[1, 5000 , 10, 5 ] for X and 1000 for y

### Pad, split and scale the dataset

Because each item has a different amount of steps in the queue, we need to pad the sequences, to even them out. After that we split the sequences into our training and test set. Our prepared datasets now have the form of (number of samples, number of timesteps, number of features). At last we standardize the features with the StandardScaler before we can forward our transformed dataset into the LSTM model and start the training process.

### Downsampling

Our dataset is pretty large, so we use downsampling to compare the times it takes the model to train for 1 epoch. Several epochs are needed to get a stable model. We break down our 24500 samples into portions of approximatley 1%, 10% and 100%.

| Number of samples | time per epoch |
| --- | --- |
| 226 | ~210s |
| 1948 | ~27min |
| 19653 | ~4:47h |

### Resampling

We try to resample the dataset aswell to see how the performance improves by taking every 10th datapoint. Thus we now have a sample rate of 5 minutes instead of 30 seconds. While doing it, we loose some short staying items (now we only got 34404 items compared to 35096), but our main focus is to predict items that stay for a rather long time in the queue.

| Number of samples | time per epoch |
| --- | --- |
| 208 | ~18s |
| 1900 | ~2min |
| 19265 | ~33min |


### Scoring

To score the models we use the MAE, which shows us how close our predictions are. The LSTM score is based on the 1% downsampled model, so the real score may vary. The time error recalculates the 5min steps, so it basically is the average timeframe the prediction misses on average.

| Model | MAE | time error |
| --- | --- | --- |
| LSTM | 136 | ~11h |
| LSTM resampled | 46 | ~4h |
| Linear Regression | 644 | ~54h |
| Decision Trees | 402 | ~47h |


### Predictions

Due to the inconsistency of the initial queue waiting time, the prediction is tailored for each item individually and has various outcomes. Down below there are 3 example comparisons.

Example 1

![Prediction_sample1](https://user-images.githubusercontent.com/9306218/87714106-9452a280-c7ab-11ea-871c-5fca757004fe.png)

Example 2

![Prediction_sample2](https://user-images.githubusercontent.com/9306218/87714191-b3513480-c7ab-11ea-8e2e-c6ca0e233652.png)

Example 3

![Prediction_sample3](https://user-images.githubusercontent.com/9306218/87714224-be0bc980-c7ab-11ea-9e41-9b4f53caa3fe.png)


## Concept for two queues

Now that there are two queues, with one following the other we treat both as one. Note that there is some logic behind them. Items can occur first in the prior queue (censhare), but don´t have to ! If they occur they will definitely get into the following queue (pic). Items can also only start in the second one. So we mark items that started in the first queue with an additional feature and count their steps from first occurence in the first until the last occurence in the second combining with the features (size, n_added, n_removed) of the second queue. 

Example item from above with additional feature:

| n_steps_in_Q | Q_size | n_added | n_removed | cen |
| --- | --- | --- | --- | --- |
| 1 | 5000 | 10 | 5 | 1 |
| 2 | 5010 | 20 | 10 | 1 |
| ... | ... | ... | ... | ... |
| 1000 | 4000 | 5 | 15 | 1 |
