# %%
import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima_model import ARIMA, ARIMAResults
from pmdarima import auto_arima  # for determining ARIMA orders

# %%
from statsmodels.tsa.stattools import adfuller


def adf_test(series, title=''):
    """
    Pass in a time series and an optional title, returns an ADF report
    """
    print(f'Augmented Dickey-Fuller Test: {title}')
    # .dropna() handles differenced data
    result = adfuller(series.dropna(), autolag='AIC')

    labels = ['ADF test statistic', 'p-value', '# lags used', '# observations']
    out = pd.Series(result[0:4], index=labels)

    for key, val in result[4].items():
        out[f'critical value ({key})'] = val

    # .to_string() removes the line "dtype: float64"
    print(out.to_string())

    if result[1] <= 0.05:
        print("Strong evidence against the null hypothesis")
        print("Reject the null hypothesis")
        print("Data has no unit root and is stationary")
    else:
        print("Weak evidence against the null hypothesis")
        print("Fail to reject the null hypothesis")
        print("Data has a unit root and is non-stationary")


# %%
# die ISTATX_istatx1.csv muss, falls schon nicht vorhanden, mit dem file targetname_filter.py erstellt werden
df = pd.read_csv(r'backend\ISTATX_istatx1.csv',
                 index_col='COLLECTION_TIMESTAMP')
df.index = pd.to_datetime(df.index)
df['COLUMN_LABEL'].unique()
# beachte, dass die Daten nicht gepusht werden sollen

# %%
df = df.loc[df['COLUMN_LABEL'] == 'CPU Usage (per transaction)']
df['VALUE'] = [x.replace(',', '.') for x in df['VALUE']]
df['VALUE'] = pd.to_numeric(df['VALUE'])
df.head()

# %%
# suche nach den arima orders 
auto_arima(df['VALUE'],seasonal=False).summary()

# %% stationarity test
adf_test(df['VALUE'])

# %% 95% Train 5% Test split
train = df[:int(len(df)*0.95)].copy()
test = df[int(len(df)*0.95):].copy()


#%% train the model
from statsmodels.tsa.statespace.sarimax import SARIMAX
model = ARIMA(train['VALUE'],order=(3,1,4))
fit = model.fit()
fit.summary()

#%% Forecast
start=len(train)
end=len(train)+len(test)-1
predictions = fit.predict(start=start, end=end, dynamic=False).rename('SARIMAX(1,1,2)(2,0,0,7) Predictions')
#Passing dynamic=False means that forecasts at each point are generated using the full history up to that point (all lagged values).

#%% Plot
test['forecasted_values']=predictions.values
# train['VALUE'].plot(legend=True,label='TRAIN')
test['VALUE'].plot(legend=True,label='TEST',figsize=(12,8))
test['forecasted_values'].plot(legend=True,label='PREDICTION')

#%%
