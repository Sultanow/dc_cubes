#!/usr/bin/env python
# coding: utf-8

# In[15]:


import pandas as pd
import numpy as np
import pickle
import time

from numpy import array
from datetime import timedelta  
from sklearn.preprocessing import StandardScaler
from keras.models import load_model
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import Flatten
from keras.layers import LSTM, GRU
from keras.layers import RepeatVector
from keras.layers import TimeDistributed
from keras.layers import Bidirectional
from keras.callbacks import EarlyStopping
from keras.callbacks import ModelCheckpoint
from sklearn.decomposition import PCA
from keras.layers import TimeDistributed
from keras.layers import Bidirectional
from keras.layers import Conv1D
from keras.layers import MaxPooling1D
from fbprophet import Prophet
from scipy.stats import boxcox
from scipy.special import inv_boxcox
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.statespace.sarimax import SARIMAX, SARIMAXResults
from pmdarima import auto_arima
from datetime import timedelta 

import plotly
import chart_studio.plotly as py
import plotly.graph_objs as go
from plotly.offline import init_notebook_mode


# In[2]:


timestamp = "timestamp"
predictionColumn = "cpuusage_ps"


# In[3]:


def plot_real_data_train(df, n_history):
    data = df.reset_index()[[timestamp, predictionColumn]][:-n_history]
    data.columns = ['date','Train Data']
    data.set_index('date', inplace=True)
    return data

def plot_real_data_test(df, pred_horizon):
    data = df.reset_index()[[timestamp, predictionColumn]]
    data = data.tail(pred_horizon)
    data.columns = ['date','Test Data']
    data.set_index('date', inplace=True)
    return data


# In[4]:


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


# In[5]:


def generate_index_forecast(df, df_forecast, pred_horizon):
    minutesBetweenMeasures = 15
    temp = df.reset_index()[[timestamp]]
    lastTrainDataTimeStamp = temp.tail(pred_horizon)[timestamp].iloc[0]
    nextTimeStamp = lastTrainDataTimeStamp
    for i in df_forecast.index:
        nextTimeStamp = nextTimeStamp + timedelta(minutes=minutesBetweenMeasures)
        df_forecast.at[i, 'date'] = nextTimeStamp
    df_forecast.set_index('date', inplace=True)
    return df_forecast    


# In[13]:


# split a multivariate sequence into samples
# https://machinelearningmastery.com/how-to-develop-lstm-models-for-time-series-forecasting/
def split_sequences(sequences, n_steps_in, n_steps_out):
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


# In[7]:


def lstm_data_preprocessing(df, n_history, pred_horizon):
    if not df.index.name == timestamp:
        dataset = df.set_index(timestamp)
    else:
        dataset = df
    
    y = dataset[predictionColumn].copy()
    x = dataset.drop(columns=predictionColumn)
    
    scalerX = StandardScaler()
    scalerX.fit(x)
    x = scalerX.transform(x)
    scalerY = StandardScaler()
   # .reshape(-1, 1) # needed for standardScaler
    scalerY.fit(y.values.reshape(-1,1))
    y = scalerY.transform(y.values.reshape(-1,1))
    
    pcaTransformer = PCA(0.95) # keep 95% variance
    pcaTransformer.fit(x)
    x = pcaTransformer.transform(x)
    df_with_pca = pd.DataFrame().from_records(x)
    df_with_pca[predictionColumn] = y
    print(''' *** PCA Result***\n Started with %d features, reduced to %d features''' % (len(df.columns)-1, pcaTransformer.n_components_))
    df_with_pca.reset_index(inplace=True)
    x, y = split_sequences(df_with_pca.values, n_steps_in=n_history, n_steps_out=pred_horizon)
    return x, y, scalerX, scalerY

def lstm_split_train_test(x, y, pred_horizon):
    x_train = x[:-pred_horizon]
    x_test = x[-pred_horizon:]
    y_train = y[:-pred_horizon]
    y_test = y[-pred_horizon:]
    
    return x_train, x_test, y_train, y_test

def train_lstm(df, n_history, pred_horizon):
    # data split / preprocessing
    x, y, scalerX, scalerY = lstm_data_preprocessing(df, n_history=n_history, pred_horizon=pred_horizon)
    print("SHAPES: ", x.shape, y.shape)
    numberOfFeatures = x.shape[2]
    x_train, x_test, y_train, y_test = lstm_split_train_test(x, y, pred_horizon)
    print("Shapes: xtr, xte, ytr, yte: ", x_train.shape, x_test.shape, y_train.shape, y_test.shape)
    preprocessingResult = [x_train, x_test, y_train, y_test, scalerX, scalerY]
    with(open("lstm_preprocessingResult.pkl", "wb")) as pkl:
        pickle.dump(preprocessingResult, pkl)

    # model definition
    model = Sequential()
    model.add(LSTM(75, activation='tanh', return_sequences=True, input_shape=(n_history, numberOfFeatures)))
    model.add(LSTM(75, activation="tanh", return_sequences=True))
    model.add(LSTM(75, activation="tanh"))
    model.add(Dense(pred_horizon))
    model.compile(optimizer='adam', loss='mse', metrics=['mse'])
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=20)
    mc = ModelCheckpoint('lstm_multistep_multivariate.h5', monitor='val_loss' , mode='min', verbose=1, save_best_only=True)
    # model train
    model.fit(x_train, y_train,  validation_split=0.1, epochs=200, callbacks=[es, mc])
    print('''*** Model fitted ***''')
    return None

def forecast_lstm(df, n_history, pred_horizon):
    model = load_model('lstm_multistep_multivariate.h5')
    with(open("lstm_preprocessingResult.pkl", "rb")) as pkl:
        x_train, x_test, y_train, y_test, scalerX, scalerY = pickle.load(pkl)
    numberOfFeatures = x_train.shape[2]
    pred_input = x_train[-1]
    pred_input = pred_input.reshape((1, pred_input.shape[0],pred_input.shape[1]))
    
    prediction = model.predict(pred_input)
    prediction = prediction.reshape((pred_horizon,1))
    prediction = np.hstack((prediction, np.zeros((prediction.shape[0], numberOfFeatures-1), dtype=prediction.dtype)))
    prediction = scalerY.inverse_transform(prediction)
    
    df_forecast = pd.DataFrame(prediction[:,[0]], columns=['LSTM Multistep Multivariate'])
    return generate_index_forecast(df, df_forecast, pred_horizon=pred_horizon)


# In[11]:


def gru_data_preprocessing(df, n_history, pred_horizon):
    if not df.index.name == timestamp:
        dataset = df.set_index(timestamp)
    else:
        dataset = df
    
    y = dataset[predictionColumn].copy()
    x = dataset.drop(columns=predictionColumn)
    
    scalerX = StandardScaler()
    scalerX.fit(x)
    x = scalerX.transform(x)
    scalerY = StandardScaler()
   # .reshape(-1, 1) # needed for standardScaler
    scalerY.fit(y.values.reshape(-1,1))
    y = scalerY.transform(y.values.reshape(-1,1))
    
    pcaTransformer = PCA(0.95) # keep 95% variance
    pcaTransformer.fit(x)
    x = pcaTransformer.transform(x)
    df_with_pca = pd.DataFrame().from_records(x)
    df_with_pca[predictionColumn] = y
    print(''' *** PCA Result***\n Started with %d features, reduced to %d features''' % (len(df.columns)-1, pcaTransformer.n_components_))
    df_with_pca.reset_index(inplace=True)
    x, y = split_sequences(df_with_pca.values, n_steps_in=n_history, n_steps_out=pred_horizon)
    return x, y, scalerX, scalerY

def gru_split_train_test(x, y, pred_horizon):
    x_train = x[:-pred_horizon]
    x_test = x[-pred_horizon:]
    y_train = y[:-pred_horizon]
    y_test = y[-pred_horizon:]
    
    return x_train, x_test, y_train, y_test

def train_gru(df, n_history, pred_horizon):
    # data split / preprocessing
    x, y, scalerX, scalerY = gru_data_preprocessing(df, n_history=n_history, pred_horizon=pred_horizon)
    print("SHAPES: ", x.shape, y.shape)
    numberOfFeatures = x.shape[2]
    x_train, x_test, y_train, y_test = gru_split_train_test(x, y, pred_horizon)
    print("Shapes: xtr, xte, ytr, yte: ", x_train.shape, x_test.shape, y_train.shape, y_test.shape)
    preprocessingResult = [x_train, x_test, y_train, y_test, scalerX, scalerY]
    with(open("gru_preprocessingResult.pkl", "wb")) as pkl:
        pickle.dump(preprocessingResult, pkl)

    # model definition
    model = Sequential()
    model.add(GRU(75, activation='tanh', return_sequences=True, input_shape=(n_history, numberOfFeatures)))
    model.add(GRU(75, activation="tanh", return_sequences=True))
    model.add(GRU(75, activation="tanh"))
    model.add(Dense(pred_horizon))
    model.compile(optimizer='adam', loss='mse', metrics=['mse'])
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=20)
    mc = ModelCheckpoint('gru_multistep_multivariate.h5', monitor='val_loss' , mode='min', verbose=1, save_best_only=True)
    # model train
    model.fit(x_train, y_train,  validation_split=0.1, epochs=200, callbacks=[es, mc])
    print('''*** Model fitted ***''')
    return None

def forecast_gru(df, n_history, pred_horizon):
    model = load_model('gru_multistep_multivariate.h5')
    with(open("gru_preprocessingResult.pkl", "rb")) as pkl:
        x_train, x_test, y_train, y_test, scalerX, scalerY = pickle.load(pkl)
    numberOfFeatures = x_train.shape[2]
    pred_input = x_train[-1]
    pred_input = pred_input.reshape((1, pred_input.shape[0],pred_input.shape[1]))
    
    prediction = model.predict(pred_input)
    prediction = prediction.reshape((pred_horizon,1))
    prediction = np.hstack((prediction, np.zeros((prediction.shape[0], numberOfFeatures-1), dtype=prediction.dtype)))
    prediction = scalerY.inverse_transform(prediction)
    
    df_forecast = pd.DataFrame(prediction[:,[0]], columns=['GRU Multistep Multivariate'])
    return generate_index_forecast(df, df_forecast, pred_horizon=pred_horizon)


# In[8]:


def mlp_data_preprocessing(df, n_history, pred_horizon):
    if not df.index.name == timestamp:
        dataset = df.set_index(timestamp)
    else:
        dataset = df
         
    y = dataset[predictionColumn].copy()
    x = dataset.drop(columns=predictionColumn)
    
    scalerX = StandardScaler()
    scalerX.fit(x)
    x = scalerX.transform(x)
    scalerY = StandardScaler()
   # .reshape(-1, 1) # needed for standardScaler
    scalerY.fit(y.values.reshape(-1,1))
    y = scalerY.transform(y.values.reshape(-1,1))
    
    pcaTransformer = PCA(0.95) # keep 95% variance
    pcaTransformer.fit(x)
    x = pcaTransformer.transform(x)
    df_with_pca = pd.DataFrame().from_records(x)
    df_with_pca[predictionColumn] = y
    print(''' *** PCA Result***\n Started with %d features, reduced to %d features''' % (len(df.columns)-1, pcaTransformer.n_components_))
    df_with_pca.reset_index(inplace=True)
    x, y = split_sequences(df_with_pca.values, n_steps_in=n_history, n_steps_out=pred_horizon)
    return x, y, scalerX, scalerY


def train_mlp(df, n_history, pred_horizon):
    x, y, scalerX, scalerY = mlp_data_preprocessing(df, n_history=n_history, pred_horizon=pred_horizon)
    print("SHAPES: ", x.shape, y.shape)
    x_train, x_test, y_train, y_test = lstm_split_train_test(x, y, pred_horizon)
    print("Shapes: xtr, xte, ytr, yte: ", x_train.shape, x_test.shape, y_train.shape, y_test.shape)
    n_input = x_train.shape[1] * x_train.shape[2]
    x_train = x_train.reshape((x_train.shape[0], n_input))
    n_neurons = int((n_input + pred_horizon)/2)
    preprocessingResult = [x_train, x_test, y_train, y_test, scalerX, scalerY]
    with(open("mlp_preprocessingResult.pkl", "wb")) as pkl:
        pickle.dump(preprocessingResult, pkl)
        
    model = Sequential()
    model.add(Dense(n_neurons, activation='tanh', input_dim=n_input))
    model.add(Dense(n_neurons, activation="tanh"))
    model.add(Dense(n_neurons, activation="tanh"))
    model.add(Dense(pred_horizon))
    model.compile(optimizer='adam', loss='mse')
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=30)
    mc = ModelCheckpoint('mlp_multistep_multivariate.h5', monitor='val_loss' , mode='min', verbose=1, save_best_only=True)    
    model.fit(x_train, y_train, validation_split=0.1, epochs=200, callbacks=[es, mc])
    return None

def forecast_mlp(df, n_history, pred_horizon):
    model_mlp = load_model('mlp_multistep_multivariate.h5')
    with(open("mlp_preprocessingResult.pkl", "rb")) as pkl:
        x_train, x_test, y_train, y_test, scalerX, scalerY = pickle.load(pkl)

    numberOfFeatures =  x_train.shape[1] // n_history # was reshaped to featureNumber * n_history, so divide it to get number of features = 61
    pred_input = x_train[-1:]
    n_input = pred_input.shape[0] * pred_input.shape[1]
    pred_input = pred_input.reshape((1,n_input))
    
    prediction = model_mlp.predict(pred_input)
    prediction = prediction.reshape((pred_horizon,1))
    prediction = np.hstack((prediction, np.zeros((prediction.shape[0], numberOfFeatures-1), dtype=prediction.dtype)))
    prediction = scalerY.inverse_transform(prediction)
    
    df_forecast = pd.DataFrame(prediction[:,[0]], columns=['MLP Multistep Multivariate'])
    return generate_index_forecast(df, df_forecast, pred_horizon=pred_horizon)       


# In[9]:


def cnn_data_preprocessing(df, n_history, pred_horizon):
    if not df.index.name == timestamp:
        dataset = df.set_index(timestamp)
    else:
        dataset = df
    
    y = dataset[predictionColumn].copy()
    x = dataset.drop(columns=predictionColumn)
    
    scalerX = StandardScaler()
    scalerX.fit(x)
    x = scalerX.transform(x)
    scalerY = StandardScaler()
   # .reshape(-1, 1) # needed for standardScaler
    scalerY.fit(y.values.reshape(-1,1))
    y = scalerY.transform(y.values.reshape(-1,1))
    
    pcaTransformer = PCA(0.95) # keep 95% variance
    pcaTransformer.fit(x)
    x = pcaTransformer.transform(x)
    df_with_pca = pd.DataFrame().from_records(x)
    df_with_pca[predictionColumn] = y
    print(''' *** PCA Result***\n Started with %d features, reduced to %d features''' % (len(df.columns)-1, pcaTransformer.n_components_))
    df_with_pca.reset_index(inplace=True)
    x, y = split_sequences(df_with_pca.values, n_steps_in=n_history, n_steps_out=pred_horizon)
    return x, y, scalerX, scalerY

def train_cnn(df, pred_horizon, n_history):
    x, y, scalerX, scalerY = cnn_data_preprocessing(df, n_history=n_history, pred_horizon=pred_horizon)
    print("SHAPES: ", x.shape, y.shape)
    numberOfFeatures = x.shape[2]
    x_train, x_test, y_train, y_test = lstm_split_train_test(x, y, pred_horizon)
    print("Shapes: xtr, xte, ytr, yte: ", x_train.shape, x_test.shape, y_train.shape, y_test.shape)
    preprocessingResult = [x_train, x_test, y_train, y_test, scalerX, scalerY]
    with(open("lstm_preprocessingResult.pkl", "wb")) as pkl:
        pickle.dump(preprocessingResult, pkl)
        
    model = Sequential()
    model.add(Conv1D(filters=75, kernel_size=3, activation='relu', input_shape=(n_history, numberOfFeatures)))
    model.add(MaxPooling1D(pool_size=2))
    model.add(Conv1D(filters=38, kernel_size=3, activation='relu'))
    model.add(MaxPooling1D(pool_size=2))
    model.add(LSTM(100, activation='tanh',return_sequences=True))
    model.add(LSTM(50, activation='tanh'))
    model.add(Dense(pred_horizon))
    model.compile(loss='mse', optimizer='adam')
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=100)
    mc = ModelCheckpoint('cnn_multistep_multivariate.h5', monitor='val_loss' , mode='min', verbose=1, save_best_only=True)
    model.fit(x_train, y_train,  validation_split=0.1, epochs=200, callbacks=[es, mc])
    print('''*** Model fitted ***''') 
    return None

def forecast_cnn(df, n_history, pred_horizon):
    model = load_model('cnn_multistep_multivariate.h5')
    with(open("lstm_preprocessingResult.pkl", "rb")) as pkl:
        x_train, x_test, y_train, y_test, scalerX, scalerY = pickle.load(pkl)
    numberOfFeatures = x_train.shape[2]
    pred_input = x_train[-1] 
    pred_input = pred_input.reshape((1, pred_input.shape[0],pred_input.shape[1]))
    
    prediction = model.predict(pred_input)
    prediction = prediction.reshape((pred_horizon,1))
    prediction = np.hstack((prediction, np.zeros((prediction.shape[0], numberOfFeatures-1), dtype=prediction.dtype)))
    prediction = prediction = scalerY.inverse_transform(prediction)
    
    df_forecast = pd.DataFrame(prediction[:,[0]], columns=['CNN Multistep Multivariate'])
    return generate_index_forecast(df, df_forecast, pred_horizon=pred_horizon) 


# In[10]:


def train_fbprophet_additiv(df, n_history):
    train = df.reset_index()[[timestamp, predictionColumn]][:-n_history]
    train.columns = ["ds","y"]
    m = Prophet(weekly_seasonality=True, yearly_seasonality=True)
    m.fit(train)
    with open('fbprophet_additiv.pckl', 'wb') as fout:
        pickle.dump(m, fout)
    return None

def train_fbprophet_boxcox(df, n_history):
    train = df.reset_index()[[timestamp, predictionColumn]][:-n_history]
    train.columns = ["ds","y"]
    train["y"] = pd.to_numeric(train["y"])
    train['y'], lam = boxcox(train['y'])
    m = Prophet(weekly_seasonality=True, yearly_seasonality=True)
    m.fit(train)
    with open('fbprophet_boxcox.pckl', 'wb') as fout:
        pickle.dump(m, fout)
    return lam

def forecast_fbprophet_additiv(pred_horizon):
    with open('fbprophet_additiv.pckl', 'rb') as fin:
        m = pickle.load(fin)
    future = m.make_future_dataframe(periods=pred_horizon, freq='15min')
    forecast_prophet = m.predict(future)[['ds', 'yhat']]
    forecast_prophet.columns = ['date','FBProphet without Box-Cox-Transform']
    forecast_prophet.set_index('date', inplace=True)
    return forecast_prophet.tail(pred_horizon) 

def forecast_fbprophet_boxcox(pred_horizon, lam):
    with open('fbprophet_boxcox.pckl', 'rb') as fin:
        m = pickle.load(fin)
    future = m.make_future_dataframe(periods=pred_horizon, freq='15min')
    forecast_prophet_box_cox = m.predict(future)[['ds', 'yhat']]
    forecast_prophet_box_cox['yhat'] = forecast_prophet_box_cox['yhat'].apply(lambda x: inv_boxcox(x, lam))
    forecast_prophet_box_cox.columns = ['date','FBProphet with Box-Cox-Transform']
    forecast_prophet_box_cox.set_index('date', inplace=True)
    return forecast_prophet_box_cox.tail(pred_horizon)     


# In[13]:


def train_sarima(df, n_history, pred_horizon, order, seasonal_order):
    trainingData = pd.DataFrame(df[predictionColumn], columns=[predictionColumn])
    print(trainingData.head())
    model = SARIMAX(trainingData[predictionColumn],order=order, seasonal_order=seasonal_order, start_p = 1, start_q = 1)
    fit = model.fit()
    fit.save("sarima.pkl")

    return None    

def forecast_sarima(df, n_history, pred_horizon):

    start = len(df[:-pred_horizon]) - 1
    end = start + pred_horizon - 1
    starttime = time.time()
    
    order = (1, 3, 0)
    seasonal_order = (1, 1, 1, n_history) #last parameter should be 52 for weekly saisonality
    train_sarima(df, n_history = n_history, pred_horizon=pred_horizon, order=order, seasonal_order=seasonal_order)
    print("training sarima took ", time.time() - starttime)

    model = SARIMAXResults.load('sarima.pkl')
    
    predictions = model.predict(start=start, end=end, dynamic=False).rename('SARIMAX Predictions' % n_history)
    
    df_forecast = pd.DataFrame(predictions.values, columns=['SARIMA Predictions (1, 3, 0)(1, 1, 1, n_history) ' % n_history])
    return generate_index_forecast(df, df_forecast, pred_horizon=pred_horizon) 


# In[7]:


# Declaration
skip_csv_rows = 0
measureInterval = 15 #min
daysToPredict = 5
pred_horizon = (60//measureInterval) * 24 * daysToPredict #5 days (4*24*5), timestep = 15min
hours_history = 8
n_history = (60//measureInterval)*hours_history 

# Read data from pickle file
with open("./4week_transformed_droppedErrors_filled.pkl", "rb") as pickleFile:
    df = pickle.load(pickleFile)


# In[8]:


df = df.reset_index()


# In[9]:


df[predictionColumn] = pd.to_numeric(df[predictionColumn])


# In[18]:


starttime = time.time()
train_fbprophet_additiv(df, pred_horizon)
print("training prophet without boxcox took ", time.time() - starttime)
starttime = time.time()
fbprophet_boxcox_lam = train_fbprophet_boxcox(df, pred_horizon)
print("training prophet with boxcox took ", time.time() - starttime)


# In[16]:


starttime = time.time()
train_lstm(df.copy().reset_index(), n_history=n_history, pred_horizon=pred_horizon)
print("training lstm took ", time.time() - starttime)


# In[19]:


starttime = time.time()
train_mlp(df.copy().reset_index(), pred_horizon=pred_horizon, n_history=n_history)
print("training mlp took ", time.time() - starttime)


# In[16]:


starttime = time.time()
train_cnn(df.copy().reset_index(), pred_horizon=pred_horizon, n_history=n_history)
print("training cnn took ", time.time() - starttime)


# In[16]:


starttime = time.time()
train_gru(df.copy().reset_index(), pred_horizon=pred_horizon, n_history=n_history)
print("training GRU took ", time.time() - starttime)


# In[7]:


# this produces a memory error with 8gb RAM even when changing the paging size
#auto_arima(df[predictionColumn], start_p=1, start_q=1,
#                          test='adf',
#                          max_p=2, max_q=2, m=52,
#                          start_P=0, seasonal=True,
#                          d=None, D=1, trace=True,
#                          error_action='ignore',  
#                          suppress_warnings=True, 
#                          stepwise=True)
# m=52 for weekly seasonality https://alkaline-ml.com/pmdarima/tips_and_tricks.html#period


# In[17]:


# Real data
plot_frames = []
plot_frames.append(plot_real_data_train(df, n_history))
plot_frames.append(plot_real_data_test(df, pred_horizon))


# In[20]:


plot_frames.append(forecast_gru(df.copy().reset_index(), n_history = n_history, pred_horizon = pred_horizon))


# In[21]:


plot_frames.append(forecast_fbprophet_additiv(pred_horizon))
plot_frames.append(forecast_fbprophet_boxcox(pred_horizon, fbprophet_boxcox_lam))
plot_frames.append(forecast_lstm(df.copy().reset_index(), n_history = n_history, pred_horizon = pred_horizon))
plot_frames.append(forecast_mlp(df.copy().reset_index(), n_history = n_history, pred_horizon = pred_horizon))
plot_frames.append(forecast_cnn(df.copy().reset_index(), n_history = n_history, pred_horizon = pred_horizon))
plot_frames.append(forecast_sarima(df.copy().reset_index(), n_history = n_history, pred_horizon = pred_horizon))


# In[21]:


# Plot
plot_data(pd.concat(plot_frames, sort=True),'Vergleich ML-Models')


# In[ ]:




