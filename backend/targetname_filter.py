# %%
import pandas as pd
filename = "C:/Users/Ivan/Development/Bachelorarbeit/ml/export_db_mv-details_raw_20190927.dsv"
chunksize = 500000
df = pd.DataFrame()

# Der Target Name, für den die Daten aus dem Datensatz gefilter werden sollen
targetname = 'ISTATX_istatx1'

# %%
# WARNUNG: Diese Zelle braucht lange um vollständig ausgeführt zu werden,
#          da der gesamte Datensatz (30gb) chunkweise abgelaufen werden muss
print('processing...')
for chunk in pd.read_csv(filename, chunksize=chunksize, sep="|", encoding="latin1", low_memory=False):
    df = df.append(chunk.loc[(chunk['TARGET_NAME'] == targetname)])
    print(chunk.index)
print('END')

# %%
# Dataframe prewiev
df.head(10)

# %%
# CSV export damit die Daten des gewünschten Targets nicht erneut gefilter werden müssen
df.to_csv('backend/ISTATX_istatx1_new.csv', encoding='utf-8', index=False)
# Beachte das diese Daten nicht gepsuht werden sollen!

# %%
# Liste der Auslatungswerte des Targets (features)
df['COLUMN_LABEL'].unique()

#%%
# Anzahl der Auslatungswerte des Targets (features)
df['COLUMN_LABEL'].nunique()

#%%
# Wahl der Zeitreihen eines Auslastungswertes (als Bsp. CPU Usage)
cpu_usage=df[df['COLUMN_LABEL']=='CPU Usage (per second)'].copy()
cpu_usage.head()

#%% Cast string to numeric
cpu_usage['VALUE'] = [x.replace(',', '.') for x in cpu_usage['VALUE']] 
cpu_usage['VALUE'] = pd.to_numeric(cpu_usage['VALUE'])

#%%
# plot mit plotly (hübsch)
import plotly.express as px
fig = px.line(cpu_usage, x="COLLECTION_TIMESTAMP", y="VALUE", width=700, height=400)
fig.show()

#%% plot mit pandas integrietem matplotlib
cpu_usage.plot.line( x="COLLECTION_TIMESTAMP",y='VALUE',figsize=(15,5))
