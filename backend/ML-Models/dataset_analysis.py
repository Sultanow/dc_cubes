# %% Imports
import pandas as pd
import time

# %% Presettings
target_names_chunk_list = []
target_types_chunk_list = []
metric_names_chunk_list = []
metric_columns_chunk_list = []
metric_labels_chunk_list = []
column_labels_chunk_list = []

filename = "export_db_mv-details_7days_raw.dsv"
chunksize = 500000

# %% Filter
print("Processing ...")
start = time.time()
for chunk in pd.read_csv(filename, chunksize=chunksize, sep="|", encoding="latin1", low_memory=False):
        target_names_chunk_list += chunk['TARGET_NAME'].unique().tolist()
        target_types_chunk_list += chunk['TARGET_TYPE'].unique().tolist()
        metric_names_chunk_list += chunk['METRIC_NAME'].unique().tolist()
        metric_columns_chunk_list += chunk['METRIC_COLUMN'].unique().tolist()
        metric_labels_chunk_list += chunk['METRIC_LABEL'].unique().tolist()
        column_labels_chunk_list += chunk['COLUMN_LABEL'].unique().tolist()
        print(chunk.index)
end = time.time()
print("Durration: " + str(end - start) + " sec.")

# %% TARGET NAMES
unique_target_names_df = pd.DataFrame(target_names_chunk_list)
unique_target_names_df.rename(columns={0: "TARGET_NAME"}, inplace=True)
unique_target_names = unique_target_names_df['TARGET_NAME'].unique().tolist()
print(unique_target_names)
print(len(unique_target_names))

# %% TARGET TYPES
unique_target_types_df = pd.DataFrame(target_types_chunk_list)
unique_target_types_df.rename(columns={0: "TARGET_TYPE"}, inplace=True)
unique_target_types = unique_target_types_df['TARGET_TYPE'].unique().tolist()
print(unique_target_types)
print(len(unique_target_types))

#%% METRIC NAMES
unique_metric_names_df = pd.DataFrame(metric_names_chunk_list)
unique_metric_names_df.rename(columns={0: "METRIC_NAME"}, inplace=True)
unique_metric_names = unique_metric_names_df['METRIC_NAME'].unique().tolist()
print(unique_metric_names)
print(len(unique_metric_names))

#%% METRIC COLUMNS
unique_metric_columns_df = pd.DataFrame(metric_columns_chunk_list)
unique_metric_columns_df.rename(columns={0: "METRIC_COLUMN"}, inplace=True)
unique_metric_columns = unique_metric_columns_df['METRIC_COLUMN'].unique().tolist()
print(unique_metric_columns)
print(len(unique_metric_columns))

#%% METRIC LABELS
unique_metric_labels_df = pd.DataFrame(metric_labels_chunk_list)
unique_metric_labels_df.rename(columns={0: "METRIC_LABEL"}, inplace=True)
unique_metric_labels = unique_metric_labels_df['METRIC_LABEL'].unique().tolist()
print(unique_metric_labels)
print(len(unique_metric_labels))

#%% COLUMN LABELS
unique_column_labels_df = pd.DataFrame(column_labels_chunk_list)
unique_column_labels_df.rename(columns={0: "COLUMN_LABEL"}, inplace=True)
unique_column_labels = unique_column_labels_df['COLUMN_LABEL'].unique().tolist()
print(unique_column_labels)
print(len(unique_column_labels))


#%%
# df = pd.DataFrame(data={"UNIQUE_COLUMN_LABELS": unique_column_labels})
# df.to_csv("./file.csv", sep=',',index=False)
