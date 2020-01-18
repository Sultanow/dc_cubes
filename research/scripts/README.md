# Scripts

## forecast.zip

### Prerequisites 
A python environment (e.g. https://www.anaconda.com/distribution) with the following packages must be installed:
- conda install -c conda-forge keras
- conda install -c conda-forge fbprophet
- conda install -c plotly plotly
- conda install -c plotly chart-studio
- conda install -c saravji pmdarima

### Inputs
You have to set the required file paths for data in train_plot.py / train_plot.ipynb.<br />
(The file ISTATX_transformed.csv was created by data procesing from ISTATX_istatx1.csv.)

| Path  | Lines |
| ------------- | ------------- |
| /backend/ML-Models/ISTATX_transformed.csv  |  312, 327 |
| /backend/ML-Models/ISTATX_istatx1.csv  | 380  |


### Usage train_plot.py [train_plot.ipynb]
Attention: Existing models / html plots in the working directory are overwritten.
- Comment out / uncomment train functions (lines: 384-390)
- Comment out / uncomment forecast functions (lines: 389-403)
    - forecast_fbprophet_boxcox(...) in line 399 requires uncomment line 385 or 386
- Set title on line 406
- run: python train_plot.py

### Output train_plot.py [train_plot.ipynb]
- Titled (line 406) html file in working directory
