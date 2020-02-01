#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import pandas as pd
import numpy as np


# In[ ]:


def plot_real_data_train(df, n_history):
    data = df.reset_index()[['10MIN_TIMESTAMP','CPU Usage (per second)']][:-n_history]
    data.columns = ['date','Real Train Data']
    data.set_index('date', inplace=True)
    return data

def plot_real_data_test(df, n_history):
    data = df.reset_index()[['10MIN_TIMESTAMP','CPU Usage (per second)']][-n_history:]
    data.columns = ['date','Real Test Data']
    data.set_index('date', inplace=True)
    return data


# In[ ]:


from numpy import array
from datetime import timedelta  

def to_supervised(train, n_input, n_out):
    data=train
    X, y = list(), list()
    in_start = 0
    # step over the entire history one time step at a time
    for _ in range(len(data)):
        # define the end of the input sequence
        in_end = in_start + n_input
        out_end = in_end + n_out
        # ensure we have enough data for this instance
        if out_end <= len(data):
            X.append(data[in_start:in_end, :])
            y.append(data[in_end:out_end,[2]]) # 2 =  Host CPU Utilization (%)
        # move along one time step
        in_start += 1
    return array(X), array(y)

def generate_index_forecast(df, df_forecast, n_history):
    lastTrainDataTimeStamp = df.reset_index()[['10MIN_TIMESTAMP']][:-n_history].tail(1)['10MIN_TIMESTAMP'].iloc[0]
    nextTimeStamp = lastTrainDataTimeStamp
    for i in df_forecast.index:
        nextTimeStamp = nextTimeStamp + timedelta(minutes=10)
        df_forecast.at[i, 'date'] = nextTimeStamp
    df_forecast.set_index('date', inplace=True)
    return df_forecast    


# In[ ]:


from sklearn.preprocessing import StandardScaler
from keras.models import load_model
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import Flatten
from keras.layers import LSTM
from keras.layers import RepeatVector
from keras.layers import TimeDistributed
from keras.layers import Bidirectional
from keras.callbacks import EarlyStopping
from keras.callbacks import ModelCheckpoint

def lstm_data_preprocessing(df, pred_horizon, n_history):
    df.set_index('10MIN_TIMESTAMP')
    features_considered=['CPU Usage (per second)','CPU Usage (per transaction)','Host CPU Utilization (%)','Average Instance CPU (%)','Database CPU Time (%)','Database Time (centiseconds per second)','Active Sessions Using CPU','Average Active Sessions','Active Sessions Waiting: I/O','Wait Time (%)','Enqueue Waits (per transaction)','Enqueue Waits (per second)','I/O Requests (per second)','Enqueue Requests (per second)','Enqueue Requests (per transaction)']
    features = df[features_considered]
    features.index = df['10MIN_TIMESTAMP']
    dataset = features.values
    # standardise
    scaler = StandardScaler()
    scaler.fit(dataset[:-pred_horizon])
    dataset = scaler.transform(dataset)
    train = dataset[:-pred_horizon]
    test = dataset[-pred_horizon:,[0]] # Host CPU Utilization (%)
    return train, test, scaler

def train_lstm(df, pred_horizon, n_history):
    # data split / preprocessing
    train, test, scaler = lstm_data_preprocessing(df, pred_horizon, n_history)
    X_train , y_train = to_supervised(train, n_history, pred_horizon)
    y_train = y_train.reshape((y_train.shape[0], y_train.shape[1]))
    # model definition
    model = Sequential()
    model.add(LSTM(100, activation='relu', input_shape=(n_history, 15)))
    model.add(Dense(pred_horizon))
    model.compile(optimizer='adam', loss='mse', metrics=['accuracy'])
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=20)
    mc = ModelCheckpoint('lstm_multistep_multivariate.h5', monitor='val_accuracy' , mode='max', verbose=1, save_best_only=True)
    # model train
    model.fit(X_train, y_train,  validation_split=0.1,epochs=100, callbacks=[es, mc])
    return None

def forecast_lstm(df, pred_horizon, n_history):
    model = load_model('lstm_multistep_multivariate.h5')
    train, test, scaler = lstm_data_preprocessing(df, pred_horizon, n_history)
    pred_input = train[-n_history:]
    pred_input.shape
    pred_input = pred_input.reshape((1, pred_input.shape[0],15))
    prediction = model.predict(pred_input)
    prediction = prediction.reshape((pred_horizon,1))
    prediction = np.hstack((prediction, np.zeros((prediction.shape[0], 14), dtype=prediction.dtype)))
    prediction = prediction = scaler.inverse_transform(prediction)
    df_forecast = pd.DataFrame(prediction[:,[0]], columns=['LSTM Multistep Multivariate'])
    return generate_index_forecast(df, df_forecast, n_history)


# In[ ]:


from sklearn.preprocessing import StandardScaler
from keras.models import load_model
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import Flatten
from keras.layers import LSTM
from keras.layers import RepeatVector
from keras.layers import TimeDistributed
from keras.callbacks import EarlyStopping
from keras.callbacks import ModelCheckpoint

def mlp_data_preprocessing(df, pred_horizon, n_history):
    df.set_index('10MIN_TIMESTAMP')
    features_considered=['CPU Usage (per second)','CPU Usage (per transaction)','Host CPU Utilization (%)','Average Instance CPU (%)','Database CPU Time (%)','Database Time (centiseconds per second)','Active Sessions Using CPU','Average Active Sessions','Active Sessions Waiting: I/O','Wait Time (%)','Enqueue Waits (per transaction)','Enqueue Waits (per second)','I/O Requests (per second)','Enqueue Requests (per second)','Enqueue Requests (per transaction)']
    features = df[features_considered]
    features.index = df['10MIN_TIMESTAMP']
    dataset = features.values
    scaler = StandardScaler()
    scaler.fit(dataset[:-pred_horizon])
    dataset = scaler.transform(dataset)
    train = dataset[:-pred_horizon]
    dataset = np.append(dataset, dataset[:,[2]], axis=1)
    sequences = dataset[:-pred_horizon]
    return sequences, scaler, train

def mlp_split_sequences(sequences, n_steps_in, n_steps_out):
    X, y = list(), list()
    for i in range(len(sequences)):
        # find the end of this pattern
        end_ix = i + n_steps_in
        out_end_ix = end_ix + n_steps_out-1
        # check if we are beyond the dataset
        if out_end_ix > len(sequences):
            break
        # gather input and output parts of the pattern
        seq_x, seq_y = sequences[i:end_ix, :-1], sequences[end_ix-1:out_end_ix, -1]
        X.append(seq_x)
        y.append(seq_y)
    return array(X), array(y) 

def train_mlp(df, pred_horizon, n_history):
    sequences, scaler, train = mlp_data_preprocessing(df, pred_horizon, n_history)
    X, y = mlp_split_sequences(sequences, n_history, pred_horizon)
    n_input = X.shape[1] * X.shape[2]
    X = X.reshape((X.shape[0], n_input))
    n_neurons = int((n_input + pred_horizon)/2)
    model = Sequential()
    model.add(Dense(n_neurons, activation='relu', input_dim=n_input))
    model.add(Dense(pred_horizon))
    model.compile(optimizer='adam', loss='mse', metrics= ['accuracy'])
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=1000)
    mc = ModelCheckpoint('mlp_multistep_multivariate.h5', monitor='val_accuracy' , mode='max', verbose=1, save_best_only=True)    
    model.fit(X, y, validation_split=0.1, epochs=10000, callbacks=[es, mc])
    return None

def forecast_mlp(df, pred_horizon, n_history):
    model_mlp = load_model('mlp_multistep_multivariate.h5')
    sequences, scaler, train = mlp_data_preprocessing(df, pred_horizon, n_history)
    pred_input = train[-n_history:]
    n_input = pred_input.shape[0] * pred_input.shape[1]
    pred_input = pred_input.reshape((1,n_input))
    prediction = model_mlp.predict(pred_input)
    prediction = prediction.reshape((pred_horizon,1))
    prediction = np.hstack((prediction, np.zeros((prediction.shape[0], 14), dtype=prediction.dtype)))
    prediction = prediction = scaler.inverse_transform(prediction)
    df_forecast = pd.DataFrame(prediction[:,[0]], columns=['MLP Multistep Multivariate'])
    return generate_index_forecast(df, df_forecast, n_history)       


# In[ ]:


from keras.models import load_model
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import Flatten
from keras.layers import LSTM
from keras.layers import RepeatVector
from keras.layers import TimeDistributed
from keras.layers import Bidirectional
from keras.layers import Conv1D
from keras.layers import MaxPooling1D
from keras.callbacks import EarlyStopping
from keras.callbacks import ModelCheckpoint

def data_preprocessing_cnn(df, pred_horizon, n_history):
    df.set_index('10MIN_TIMESTAMP')
    features_considered=['CPU Usage (per second)','CPU Usage (per transaction)','Host CPU Utilization (%)','Average Instance CPU (%)','Database CPU Time (%)','Database Time (centiseconds per second)','Active Sessions Using CPU','Average Active Sessions','Active Sessions Waiting: I/O','Wait Time (%)','Enqueue Waits (per transaction)','Enqueue Waits (per second)','I/O Requests (per second)','Enqueue Requests (per second)','Enqueue Requests (per transaction)']
    features = df[features_considered]
    features.index = df['10MIN_TIMESTAMP']
    dataset = features.values
    # standardise
    scaler = StandardScaler()
    scaler.fit(dataset[:-pred_horizon])
    dataset = scaler.transform(dataset)
    train = dataset[:-pred_horizon]
    return len(features_considered), train, scaler

def train_cnn(df, pred_horizon, n_history):
    n_features, train, scaler = data_preprocessing_cnn(df, pred_horizon, n_history)
    X_train, y_train = to_supervised(train, n_history, pred_horizon)
    y_train = y_train.reshape((y_train.shape[0], y_train.shape[1]))
    n_features = X_train.shape[2]
    model = Sequential()
    model.add(Conv1D(filters=75, kernel_size=3, activation='relu', input_shape=(n_history, n_features)))
    model.add(MaxPooling1D(pool_size=2))
    model.add(Conv1D(filters=38, kernel_size=3, activation='relu'))
    model.add(MaxPooling1D(pool_size=2))
    model.add(LSTM(100, activation='relu',return_sequences=True))
    model.add(LSTM(50, activation='relu'))
    model.add(Dense(pred_horizon))
    model.compile(loss='mse', optimizer='adam',  metrics=['accuracy'])
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=100)
    mc = ModelCheckpoint('cnn_multistep_multivariate.h5', monitor='val_accuracy' , mode='max', verbose=1, save_best_only=True) 
    model.fit(X_train, y_train,  validation_split=0.1, epochs=1000, callbacks=[es, mc])   
    return None

def forecast_cnn(df, pred_horizon, n_history):
    model = load_model('cnn_multistep_multivariate.h5')
    n_features, train, scaler = data_preprocessing_cnn(df, pred_horizon, n_history)
    pred_input = train[-n_history:] 
    pred_input = pred_input.reshape((1, pred_input.shape[0],pred_input.shape[1]))
    prediction = model.predict(pred_input)
    prediction = prediction.reshape((pred_horizon,1))
    prediction = np.hstack((prediction, np.zeros((prediction.shape[0], n_features-1), dtype=prediction.dtype)))
    prediction = prediction = scaler.inverse_transform(prediction)
    df_forecast = pd.DataFrame(prediction[:,[0]], columns=['CNN Multistep Multivariate'])
    return generate_index_forecast(df, df_forecast, n_history)  


# In[ ]:


import pickle
from fbprophet import Prophet
from scipy.stats import boxcox
from scipy.special import inv_boxcox

def train_fbprophet_additiv(df, n_history):
    train = df.reset_index()[['10MIN_TIMESTAMP','CPU Usage (per second)']][:-n_history]
    train.columns = ["ds","y"]
    m = Prophet()
    m.fit(train)
    with open('fbprophet_additiv.pckl', 'wb') as fout:
        pickle.dump(m, fout)
    return None

def train_fbprophet_boxcox(df, n_history):
    train = df.reset_index()[['10MIN_TIMESTAMP','CPU Usage (per second)']][:-n_history]
    train.columns = ["ds","y"]
    train['y'], lam = boxcox(train['y'])
    m = Prophet()
    m.fit(train)
    with open('fbprophet_boxcox.pckl', 'wb') as fout:
        pickle.dump(m, fout)
    return lam

def forecast_fbprophet_additiv(pred_horizon):
    with open('fbprophet_additiv.pckl', 'rb') as fin:
        m = pickle.load(fin)
    future = m.make_future_dataframe(periods=pred_horizon,freq='10min')
    m.make_future_dataframe
    forecast_prophet = m.predict(future)[['ds', 'yhat']]
    forecast_prophet.columns = ['date','FBProphet Additiv']
    forecast_prophet.set_index('date', inplace=True)
    return forecast_prophet.tail(pred_horizon) 

def forecast_fbprophet_boxcox(pred_horizon, lam):
    with open('fbprophet_boxcox.pckl', 'rb') as fin:
        m = pickle.load(fin)
    future = m.make_future_dataframe(periods=pred_horizon,freq='10min')
    m.make_future_dataframe
    forecast_prophet_box_cox = m.predict(future)[['ds', 'yhat']]
    forecast_prophet_box_cox['yhat'] = forecast_prophet_box_cox['yhat'].apply(lambda x: inv_boxcox(x, lam))
    forecast_prophet_box_cox.columns = ['date','FBProphet Box-Cox-Transform']
    forecast_prophet_box_cox.set_index('date', inplace=True)
    return forecast_prophet_box_cox.tail(pred_horizon)     


# In[ ]:


from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima_model import ARIMA, ARIMAResults
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.statespace.sarimax import SARIMAX
from pmdarima import auto_arima
from datetime import timedelta 

def train_arima(pred_horizon):
    df = pd.read_csv('ISTATX_istatx1.csv', index_col='COLLECTION_TIMESTAMP')
    df.index = pd.to_datetime(df.index)
    df['COLUMN_LABEL'].unique()
    df = df.loc[df['COLUMN_LABEL'] == 'CPU Usage (per transaction)']
    df['VALUE'] = [x.replace(',', '.') for x in df['VALUE']]
    df['VALUE'] = pd.to_numeric(df['VALUE'])    
    auto_arima(df['VALUE'],seasonal=False).summary()
    train = df[:-pred_horizon].copy()
    print(len(train))
    model = ARIMA(train['VALUE'],order=(3,1,4))
    fit = model.fit()
    fit.save('arima.pkl')    
    return None    

def forecast_arima(df_transformed, pred_horizon, n_history):
    df = pd.read_csv('ISTATX_istatx1.csv', index_col='COLLECTION_TIMESTAMP')
    df.index = pd.to_datetime(df.index)
    df['COLUMN_LABEL'].unique()
    df = df.loc[df['COLUMN_LABEL'] == 'CPU Usage (per transaction)']
    df['VALUE'] = [x.replace(',', '.') for x in df['VALUE']]
    df['VALUE'] = pd.to_numeric(df['VALUE'])   
    start = len(df[:-pred_horizon]) - 1
    end = start + pred_horizon - 1
    model = ARIMAResults.load('arima.pkl')
    predictions = model.predict(start=start, end=end, dynamic=False).rename('SARIMAX(1,1,2)(2,0,0,7) Predictions')
    df_forecast = pd.DataFrame(predictions.values, columns=['ARIMA'])
    return generate_index_forecast(df_transformed, df_forecast, n_history)


# In[ ]:


import plotly
import chart_studio.plotly as py
import plotly.graph_objs as go
from plotly.offline import init_notebook_mode
plotly.offline.init_notebook_mode(connected=True)

def plot_data(df, plotTitle):
    map_plotly_series = dict()
    for columnName in df.columns:
        s = go.Scatter(
            x=df.index,
            y=df[columnName],
            name = columnName,
            hoverinfo='none',
            opacity = 0.8)
        map_plotly_series[columnName] = s
    data = list(map_plotly_series.values())
    layout = dict(
        title = plotTitle,
        xaxis = dict(
            range = [df.index.min(),df.index.max()])
    )
    fig = dict(data=data, layout=layout)
    plotly.offline.plot(fig, filename = plotTitle + '.html')
    return None 


# In[ ]:


# Declaration
skip_csv_rows = 0
pred_horizon = 432 #3 days (6*24*3)
n_history = 36 #6 hours

# Read data from csv file
df = pd.read_csv('ISTATX_transformed.csv', sep=',', parse_dates=['10MIN_TIMESTAMP'], index_col=0, skiprows=range(1, skip_csv_rows))
df.dropna(inplace=True)

# Train
train_fbprophet_additiv(df, n_history)
#fbprophet_boxcox_lam = -2.0665863314901394
fbprophet_boxcox_lam = train_fbprophet_boxcox(df, n_history)
train_lstm(df.copy().reset_index(), pred_horizon, n_history)
train_mlp(df.copy().reset_index(), pred_horizon, n_history)
train_cnn(df.copy().reset_index(), pred_horizon, n_history)
#train_arima(pred_horizon)

# Real data
plot_frames = []
plot_frames.append(plot_real_data_train(df, n_history))
plot_frames.append(plot_real_data_test(df, n_history))

# Forecast data
plot_frames.append(forecast_fbprophet_additiv(pred_horizon))
plot_frames.append(forecast_fbprophet_boxcox(pred_horizon, fbprophet_boxcox_lam))
plot_frames.append(forecast_lstm(df.copy().reset_index(), pred_horizon, n_history))
plot_frames.append(forecast_mlp(df.copy().reset_index(), pred_horizon, n_history))
plot_frames.append(forecast_cnn(df.copy().reset_index(), pred_horizon, n_history))
#plot_frames.append(forecast_arima(df.copy().reset_index(), pred_horizon, n_history))

# Plot
plot_data(pd.concat(plot_frames, sort=True),'ML-Models')


# 
