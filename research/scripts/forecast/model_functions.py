# Imports
import numpy as np
import pandas as pd
import scipy as sp
import matplotlib.pyplot as plt
from pandas import datetime
import pickle

import math
from sklearn.metrics import mean_squared_error, mean_absolute_error, accuracy_score, r2_score
from sklearn import metrics
from sklearn.preprocessing import LabelBinarizer, MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split

from sklearn.neighbors import KNeighborsRegressor
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import DotProduct, WhiteKernel, RBF, ConstantKernel
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.neural_network import MLPRegressor
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.ar_model import AR
from statsmodels.tsa.arima_model import ARIMA
import pmdarima as pm
from statsmodels.tsa.statespace.sarimax import SARIMAX
import statsmodels.api as sm

# import warnings filter
# ignore all future warnings
from warnings import simplefilter
simplefilter(action='ignore', category=FutureWarning)

# Functions

# MAPE Score


def mape(y_pred, y_true):
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

# Get Score/Return result df


def get_score(y_test, pred_test, output=True):

    mse = mean_squared_error(y_test, pred_test)
    rmse = math.sqrt(mean_squared_error(y_test, pred_test))
    mae = mean_absolute_error(y_test, pred_test)
    mape_score = mape(y_test, pred_test)
    r2 = r2_score(y_test, pred_test)

    if output == True:
        print('MSE : {0}'.format(mse))
        print('RMSE: {0}'.format(rmse))
        print('MAE : {0}'.format(mae))
        print('MAPE: {0}'.format(mape_score))
        print('R2  : {0}'.format(r2))
    else:
        return [mse, rmse, mae, mape_score, r2]

# Feature Preprocessing


# Generate time features based on datetime features
def get_time_features(ds):
    ds['weekday'] = ds.index.strftime('%w')
    ds['hour'] = ds.index.strftime('%H')
    ds['minute'] = ds.index.strftime('%M')

    # Sin/cos
    ds['week_sin'] = np.sin(2*np.pi * ds.weekday.astype(float)/7.0)
    ds['week_cos'] = np.cos(2 * np.pi * ds.weekday.astype(float)/7.0)
    ds['hour_sin'] = np.sin(2*np.pi * ds.hour.astype(float)/24.0)
    ds['hour_cos'] = np.cos(2 * np.pi * ds.hour.astype(float)/24.0)
    ds['minute_sin'] = np.sin(2*np.pi * ds.minute.astype(float)/60.0)
    ds['minute_cos'] = np.cos(2 * np.pi * ds.minute.astype(float)/60.0)

    # Extra Features
    ds['is_weekend'] = 0
    ds.loc[(ds.weekday.astype(int) == 6) | (ds.weekday.astype(int) == 0), 'is_weekend'] = 1

    ds['is_6am'] = 0
    ds.loc[ds.hour.astype(int) < 18, 'is_6am'] = 1
    ds.loc[ds.hour.astype(int) < 6, 'is_6am'] = 0

    # Bin 8 categories
    #ds["hour_num"] = pd.to_numeric(ds.hour, errors='coerce')
    #ds["bin"] = pd.qcut(ds.hour_num, q=8)

    return ds

# Extract Time Features/Return x (Feature Array)


def extract_time_features(ds, feature_map='cyc'):
    # options: feature_map ['cyclidical', 'orig', 'all']
    # cyclidical = sin/cos transformation
    # orig = original 0-6,0-23..
    # is_6am or is_weekend features in every option
    # all = all feature columns, including all time features
    if feature_map == 'cyc':
        X = ds[['hour_sin', 'hour_cos', 'week_sin', 'week_cos',
                'minute_sin', 'minute_cos', 'is_weekend', 'is_6am']].values

    if feature_map == 'orig':
        X = ds[['weekday', 'hour', 'minute', 'is_weekend', 'is_6am']].values

    if feature_map == 'all':
        X = ds.drop(columns="cpu")

    return X


# Scale Train Test/different Scalers
def scale_train_test(train, test, scaler='minmax'):
    # options: ['minmax','standard','label_bin']
    if scaler == 'minmax':
        scaler = MinMaxScaler()
        train = scaler.fit_transform(train)
        test = scaler.transform(test)
    if scaler == 'standard':
        scaler = StandardScaler()
        train = scaler.fit_transform(train)
        test = scaler.transform(test)
    return train, test


# Plotting
def plot_train_test(pred_train, y_train, pred_test, y_test):
    plt.title('Training')
    plt.plot(pred_train, alpha=0.7, label='prediction')
    plt.plot(y_train, alpha=0.7, label='true')
    plt.legend()
    plt.grid(linestyle="--")
    plt.show()

    plt.title('Testing')
    plt.plot(pred_test, alpha=0.7, label='prediction')
    plt.plot(y_test, alpha=0.7, label='true')
    plt.legend()
    plt.grid(linestyle="--")
    plt.show()


# Plotting arima
def plot_train_test_ar(pred_test, y_test):
    plt.title('Testing')
    plt.plot(pred_test, alpha=0.7, label='prediction')
    plt.plot(y_test, alpha=0.7, label='true')
    plt.legend()
    plt.grid(linestyle="--")
    plt.show()


# Measure Performance
def measure_performance(X_train, X_test, y_train, y_test, ml_mods):
    score_data = []

    for model in ml_mods:
        if model == "knn":
            #nei = round(math.sqrt(len(X_train)))
            nei = 49
            model_knn = KNeighborsRegressor(
                n_neighbors=nei, metric='euclidean', weights='uniform', algorithm='brute')
            model_knn.fit(X_train, y_train)

            pred_train = model_knn.predict(X_train)
            pred_test = model_knn.predict(X_test)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

        elif model == "gp":
            kernel = (ConstantKernel() * DotProduct()
                      + ConstantKernel() * WhiteKernel()
                      + ConstantKernel() * RBF())
            model_gpr = GaussianProcessRegressor(
                kernel=kernel, random_state=0).fit(X_train, y_train)

            pred_train = model_gpr.predict(X_train)
            pred_test = model_gpr.predict(X_test)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

        elif model == "lr":
            model_lr = LinearRegression(fit_intercept=True)
            model_lr.fit(X_train, y_train)

            pred_train = model_lr.predict(X_train)
            pred_test = model_lr.predict(X_test)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

        elif model == "dt":
            model_dt = DecisionTreeRegressor(random_state=0)
            model_dt.fit(X_train, y_train)

            pred_train = model_dt.predict(X_train)
            pred_test = model_dt.predict(X_test)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

        elif model == "mlp":
            model_nn = MLPRegressor(hidden_layer_sizes=[50, 50])
            model_nn.fit(X_train, y_train)

            pred_train = model_nn.predict(X_train)
            pred_test = model_nn.predict(X_test)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

    score_metrics = ['MSE', 'RMSE', 'MAE', 'MAPE', 'R2']
    res_df = pd.DataFrame(score_data, index=[x for x in ml_mods], columns=[
                          x for x in score_metrics])
    return res_df


# Models AR
def measure_performance_ar(y_train, y_test, ml_mods):
    score_data = []

    for model in ml_mods:
        if model == "ar":
            model_ar = AR(y_train)
            model_ar_fit = model_ar.fit(maxlag=20, ic='bic', trend='nc', method='cmle', maxiter=20)

            pred_test = model_ar_fit.predict(
                start=len(y_train), end=len(y_train)+len(y_test)-1, dynamic=True)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

        elif model == "arima":
            model_arima = ARIMA(y_train, order=(20, 0, 3))
            model_arima_fit = model_arima.fit()

            pred_test = model_arima_fit.predict(
                start=len(y_train), end=len(y_train)+len(y_test)-1, dynamic=True)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

        elif model == "sarima":
            model_sarima = sm.tsa.statespace.SARIMAX(y_train, trend="c", order=(20, 0, 2))
            model_sarima_fit = model_sarima.fit(disp=False)

            pred_test = model_sarima_fit.predict(
                start=len(y_train), end=len(y_train)+len(y_test)-1, dynamic=True)

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

        elif model == "autoarima":
            model_auto = pm.auto_arima(y_train, start_p=1, start_q=1,
                                       test='adf',       # use adftest to find optimal 'd'
                                       max_p=20, max_q=3,  # maximum p and q
                                       m=20,              # frequency of series
                                       d=None,           # let model determine 'd'
                                       seasonal=False,   # No Seasonality
                                       start_P=0,
                                       D=0,
                                       trace=True,
                                       error_action='ignore',
                                       suppress_warnings=True,
                                       stepwise=False)
            model_auto_fit = model_auto.fit(y_train)

            pred_test = model_auto_fit.predict(n_periods=y_test.shape[0])

            score = get_score(y_test, pred_test, output=False)
            score_data.append(score)

    score_metrics = ['MSE', 'RMSE', 'MAE', 'MAPE', 'R2']
    res_df = pd.DataFrame(score_data, index=[x for x in ml_mods], columns=[
                          x for x in score_metrics])
    return res_df
