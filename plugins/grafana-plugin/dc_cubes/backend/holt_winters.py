# %%
import pandas as pd 
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing

#%%
# die ISTATX_istatx1.csv muss, falls schon nicht vorhanden, mit dem file targetname_filter.py erstellt werden
df = pd.read_csv(r'backend\ISTATX_istatx1.csv',index_col='COLLECTION_TIMESTAMP')
df.index = pd.to_datetime(df.index)
# beachte, dass die Daten nicht gepusht werden sollen

#%%
df=df.loc[df['COLUMN_LABEL']=='CPU Usage (per second)']
df['VALUE'] = [x.replace(',', '.') for x in df['VALUE']]
df['VALUE'] = pd.to_numeric(df['VALUE'])
df.head()

#%% 98% Train 2% Test split 
train = df[:int(len(df)*0.98)].copy()
test = df[int(len(df)*0.98):].copy()

#%%
# Forecast Holt Winter Multiplitive method
fit = ExponentialSmoothing(train['VALUE'], seasonal_periods=7, trend='mul', seasonal='mul').fit()
forecast = fit.forecast(len(test))
test['forecasted_values_mul']=forecast.values


#%%
train['VALUE'].plot(legend=True,label='TRAIN')
test['VALUE'].plot(legend=True,label='TEST',figsize=(12,8))
test['forecasted_values_mul'].plot(legend=True,label='PREDICTION')


#%%
train['VALUE'].plot(legend=True,label='TRAIN')
test['VALUE'].plot(legend=True,label='TEST',figsize=(12,8))
test['forecasted_values_mul'].plot(legend=True,label='PREDICTION',xlim=['2019-09-19 10:01:48','2019-09-19 13:51:48'])


#%%
