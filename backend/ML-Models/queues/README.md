# Queue Prediction


### File Overview
* **models** folder that contains the models and scaler for training and prediction
* **Train_Two_Queues.ipynb** jupyter notebook showing the item training process for two queues and additional test results
* **Testing_Two_Queues_Items.ipynb** jupyter notebook showing the item testing process for the prediction script
* **model_predict.py** python script that runs the prediction process for two queues with CLI
* **model_train.py** python script that runs the training process for two queues 
* **prediction_functions.py** containing the functions which are imported in the prediction script
* **training_functions.py** containing the functions which are imported in the training script
* **scaler_x_2q, scaler_y_2q** pickled StandardScaler from trainingsprocess
* **model_2q_best.h5** keras H5 format, contains the model´s architecture, weight values and compile() information


### Requirements.txt

To install all needed librarys and tools use (or requirements_predict.txt):
```
pip install -r requirements.txt
```



## Data Exploration


#### Queues
We have data from two consecutively queues, which are stored in an ElasticStack. The first queue is called "censhare" and the following is called "pic". Every 30 seconds there is an entry containing the queue size and the item names, which are at each timestamp in the queue waiting to be processed.

![queue_overview](https://user-images.githubusercontent.com/9306218/90044529-0bf1ef80-dcce-11ea-8f42-bbe772cb02ae.png)

In the future we want to predict even more consecutive queues!

![Queue Overview](https://user-images.githubusercontent.com/9306218/96201335-98ce5900-0f5c-11eb-8297-99cef51bf1fe.png)


The logic is the following: Every item that entered censhare will enter pic eventually, but not every item that entered pic must have been in censhare!

We aim to predict, when each item has left the second queue. In order for that we need to extract each item individually and put together a dataset of sample items. This dataset will be trained on an LSTM to make prediction of the remaining time each item will stay in the queue.

Overview of the item size in the censhare queue in June:

![june_cen](https://user-images.githubusercontent.com/9306218/90045506-6b043400-dccf-11ea-952e-946af2d7c71f.jpeg)


Overview of the item size in the pic queue in June:


![june_pic](https://user-images.githubusercontent.com/9306218/90045532-76575f80-dccf-11ea-818b-6ece0ee21e4e.jpeg)



## LSTM Model building process

### Data Preparation

To get an overview of the data preprocessing process the following section contains simplified sample data to illustrate the process.

#### Get the data from ES

The raw data is loaded from ES.

**Raw data from Queue 1**

| name | timestamp | querytime | items | tier | size |
| --- | --- | --- | --- | --- | --- |
| products | 2019-12-31T00:00:00.000000+00:00 | 0 |  | cen | 0 |
| products | 2019-12-31T00:00:30.000000+00:00 | 0 | AAAA BBBB | cen | 2 |
| products | 2019-12-31T00:01:00.000000+00:00 | 0 | BBBB CCCC | cen | 2 |
| products | 2019-12-31T00:01:30.000000+00:00 | 0 | CCCC | cen | 1 |
| products | 2019-12-31T00:02:00.000000+00:00 | 0 | CCCC | cen | 1 |


#### Prepare each dataframe

To work with the data we have to transform the data and build two main dataframes from which we can build our dataset consisting of individual item samples. First we add the features *n_added_items* and *n_removed_items* based on the given items. Afterwards we use the MultiLabelBinarizer on each dataframe to get a column for each item, so we can see when an item entered the queue and left it.

**Raw dataframe Queue 1 with added features**

| timestamp | items | size | n_added_items | n_removed_items |
| --- | --- | --- | --- | --- |
| 2019-12-31 00:00:00.000000+00:00 | [] | 0 | 0 | 0 |
| 2019-12-31 00:00:30.000000+00:00 | [**AAAA**, BBBB] | 2 | 2 | 0 |
| 2019-12-31 00:01:00.000000+00:00 | [BBBB, CCCC] | 2 | 1 | 1 |
| 2019-12-31 00:01:30.000000+00:00 | [CCCC] | 1 | 0 | 1 |
| 2019-12-31 00:02:00.000000+00:00 | [CCCC] | 1 | 0 | 0 |
| 2019-12-31 00:02:30.000000+00:00 | [] | 0 | 0 | 1 |

**MultiLabelBinarized dataframe Queue 1**

| AAAA | BBBB | CCCC | ... |
| --- | --- | --- | --- |
| 0 | 0 | 0 | ... |
| 1 | 1 | 0 | ... |
| 0 | 1 | 1 | ... |
| 0 | 0 | 1 | ... |
| 0 | 0 | 1 | ... |
| 0 | 0 | 0 | ... |


**Raw dataframe Queue 2 with added features**

| timestamp | items | size | n_added_items | n_removed_items |
| --- | --- | --- | --- | --- |
| 2019-12-31 00:00:00.000000+00:00 | [] | 0 | 0 | 0 |
| 2019-12-31 00:00:30.000000+00:00 | [**1000**, 2000] | 2 | 2 | 0 |
| 2019-12-31 00:01:00.000000+00:00 | [**1000**, 2000, 3000] | 3 | 1 | 0 |
| 2019-12-31 00:01:30.000000+00:00 | [**AAAA**, 2000, 3000] | 3 | 1 | 1 |
| 2019-12-31 00:02:00.000000+00:00 | [**AAAA**, BBBB, 3000] | 3 | 1 | 1 |
| 2019-12-31 00:02:30.000000+00:00 | [BBBB] | 1 | 0 | 2 |

**MultiLabelBinarized dataframe Queue 2**

| *1000* | 2000 | 3000 | *AAAA* | BBBB | CCCC | ... |
| --- | --- | --- | --- | --- | --- | --- |
| **0** | 0 | 0 | **0** | 0 | 0 | ... |
| **1** | 1 | 0 | **0** | 0 | 0 | ... |
| **1** | 1 | 1 | **0** | 0 | 0 | ... |
| **0** | 1 | 1 | **1** | 0 | 0 | ... |
| **0** | 0 | 1 | **1** | 1 | 0 | ... |
| **0** | 0 | 0 | **0** | 1 | 0 | ... |

Above we see that e.g. the item *AAAA* first entered the Queue 1 at index 1 and left Queue 1 at index 1. Afterwards it entered Queue 2 at index 3 and left at index 4. To find the first and last position for each item and for each queue we use a mask in our dataset creation function. We utilize that knowledge in the next step.


#### Create the dataset

Now we can build our dataset (X,y). **X** contains per item each timestep it stays in the queue with the corresponding features Q_size, numbers of items added, numbers of items removed and Q_start, which indicates in which Queue the item started (0 for first, 1 for second). We fill in these features based on the first an last index the item occured in each MLB dataframe.**y** contains an array with the remaining steps the item is in the queue. We leave out items that haven´t left the queue at the last timestamp and those, which are in the queue at the first timestamp, in order to get only items that have been processed fully.

Sample data X for item ***AAAA***

| n_steps_in_Q | Q_size_one | Q_size_two | n_added_two | n_removed_two | Q_start |
| --- | --- | --- | --- | --- | --- |
| 1 | 2| 2 | 2 | 0 | 0 |
| 2 | 2 | 3 | 1 | 1 | 0 |
| 3 | 1 | 3 | 1 | 1 | 0 |
| 4 | 1 | 3 | 1 | 1 | 0 |

Sample data y for item ***AAAA***

| AAAA |
| --- |
| 4 |
| 3 |
| 2 |
| 1 |

Sample data X for item ***1000***

| n_steps_in_Q | Q_size_one | Q_size_two | n_added_two | n_removed_two | Q_start |
| --- | --- | --- | --- | --- | --- |
| 1 | 2| 2 | 2 | 0 | 1 |
| 2 | 2 | 3 | 1 | 1 | 1 |


Sample data y for item ***1000***

| 1000 |
| --- |
| 2 |
| 1 |


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
All models have been trained on a PC with a AMD Ryzen 5 2600 Six-Core Processor with 3400 MHz and 16 GB of RAM.


#### Testdata

For training we used items that entered and left the queue between the 9th und 13th of June. With a resampling rate of 20 the total number of items in the dataset in that timeframe is 14786. 30% of them is then used in the test dataset, to later determine the MAE. Downsampling rate is 0.8, so in total we train our model with 8272 items and test with 3560 items.

#### Resampling

Because we have a large dataset with a lot of entries for each item, we resample the dataset by taking every 20th datapoint, to boost our performance. Thus we now have a sample rate of 10 minutes instead of 30 seconds. While doing it, we loose some short staying items, but our main focus is to predict items that stay for a rather long time in the queue.


#### Effects of resampling

Downsampling rate of 0.25 is used on the dataset for this test, so the number of items in the training set is to multiply by 0.25

*Numbers are approximate*

| Resampling rate | time for 1 epoch | number of items in training set |
| --- | --- | --- |
| 1 | 23min | 17500 |
| 5 | 195s | 16100 |
| 10 | 85s | 15500 |
| 20 | 40s | 14800 |

#### Downsampling

Another way of boosting the performance is to use downsampling. We just simply take only a percentage of items in our training dataset to train our model.

#### Effects of downsampling

Resampling rate is 20.

*Numbers are approximate*

| Number of samples | time for 1 epoch |
| --- | --- |
| 10000 | 150s |
| 5000 | 80s |
| 2500 | 40s |


#### Predictions

Due to the inconsistency of the initial queue waiting time, the prediction is tailored for each item individually and has various lengths. Down below are example comparisons of our target value und the predicted output from the best performing model. The target value is the actual number of steps the item is still in the queue. To compare the prediction there is also a mean and median prediction for each item. Both values have been calculated before over the dataset. E.g. if the median is 150 and the item is already 100 steps in the queue, the median model will then output 50 steps.  


![figure_50epochs](https://user-images.githubusercontent.com/9306218/103972176-bfbbb600-516c-11eb-9774-4e59e8b89546.png)

The predictions are also displayed in the notebook **Train_Two_Queues.ipynb**

Below is a comparison of the actual item size in the second queue and the item size based only on the predicted items for the 14th June. We consider items that started in the first queue aswell, the real size only shows items in the second queue. Because there is a gap before the items enter the second queue, that might explain why it takes some time until the queue size reaches 0.

![14junerealvsitem](https://user-images.githubusercontent.com/9306218/103972357-1fb25c80-516d-11eb-937f-53697bce437a.png)

The figure can also be seen in the notebook **Testing_Two_Queues.ipynb**

#### Score based on epochs

The score is based on each timestep for each item compared to prediction step by step. MAE in time is based on the 10 minute steps used in the model.

| Number of epochs | MAE |
| --- | --- |
| 10 | 41 |
| 25 | 43 |
| 50 | 39 |

The best model performance shows a MAE of **39**, in comparison if we used the mean MAE it shows **76** and the median MAE shows **78**.


## Prediction Process

We load 5 days (or how many days we took for training) from ES. Then create our dataset similiar to the training process, except that we only take the items for predicting which are present at the last timestamp and leave out generating our target variables. After loading our pretrained model, we can start the prediction. As we only need one value, we create a list, storing the number of steps each item has been in the queue and match that with the indice of our prediction. In order to store our data the same way we retrieved it earlier, we create a dataframe in the structure of our loaded data. That means at each timestamp, there is a list of item numbers which are in the queue at that point and the amount of items is stored under size.


#### Prediction Statistics

![Predictionprocess](https://user-images.githubusercontent.com/9306218/90158161-eed12580-dd8e-11ea-8723-0d2a629eb666.png)


Table showing time from start for different steps of the prediction process.

| Number of items | Dataframe | Dataset | Prediction & Upload |
| --- | --- | --- | --- |
| 748 | 2s | 4s | 15s |
| 4091 | 3s | 13s | 42s |
| 10300 | 6s | 32s | 96s |


#### Structure in ES

Screenshot of example predictions uploaded back into ES


![Bildschirmfoto 2020-08-14 um 00 44 02](https://user-images.githubusercontent.com/9306218/90194310-45f2ec80-ddc7-11ea-860e-042bb584c451.png)


### Start the script
To start the script you need to navigate your terminal to the folder containing **model_predict.py**, **prediction_functions.py** and in a subfolder ./models  **model_2q_best.h5**, **scaler_x_2q.p** and **scaler_y_2q.p** 

To view the additional informations about the arguments and default arguments for **model_predict.py** use:
```
python Predict_Two_Queues_Items_Script_CLI.py -h
```

An example call with defined start and end date would look like:
```
python .\model_predict.py  .\models\model.h5 .\models\scaler_x.p .\models\scaler_y.p --start 2020-06-14 --end 2020-06-18 
```

If you wish to just take the last 5 days use:
```
python .\model_predict.py  .\models\model.h5 .\models\scaler_x.p .\models\scaler_y.p
```


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


## Concept for multiple queues and defined switching timestamps

Below is a graphic inserted detailing the concept for multiple queues and the way to define, when each item left a queue and entered the following. The main difference compared to the existing model is that now there are 2 columns to predict, one now representing the queue number.


![Concept1Q](https://user-images.githubusercontent.com/9306218/96201255-69b7e780-0f5c-11eb-8439-e98f625e4497.png)
