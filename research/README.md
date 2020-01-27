# Research

## Scientific Work
In the following you will find a list of the scientific work, produced within the DC Cube project:
- [Paper: Visualization and Machine Learning for Data Center Management](https://dl.gi.de/handle/20.500.12116/25052)
- [Thesis: Nicolas Walk](docs/bachelorthesis_walk_nicolas.pdf)

## Proving Machine Learning Models

Crucial to the outlook for expectable infrastructure data, four different approaches have been tested so far:
- [FBProphet](#fbprophet)
- [Multilayer Perceptron](#multilayer-perceptron)
- [Long Short-Term Memory](#long-short-term-memory)
- [Convolutional Neural Network](#convolutional-neural-network)

In the following chart, all forecasts of the respective models are visualized with the specific parameter set:

| Parameter  | Value |
| ------------- | ------------- |
| prediction horizon  | 432 (3 days)  |
| n history  | 36 (6 hours)  |

<img src="img/ml-all.png" width="560" alt="ml-compare" /><br />
The individual results are considered in detail below and also available as [plotly html view](docs/plotly.zip).

### FBProphet
The Python framework FBProphet was used for prototyping with the following parameters:

| Parameter  | Value |
| ------------- | ------------- |
| changepoints  | default  |
| seasonality_mode  | additive  |

<img src="img/ml-fbprophet.png" width="560" alt="ml-fpprophet" /><br />
 Further information: [FBProphet](https://facebook.github.io/prophet/), [Prophet: forecasting at scale](https://research.fb.com/blog/2017/02/prophet-forecasting-at-scale/)

### Multilayer Perceptron
The Python frameworks Keras/Scikit-Learn were used for prototyping with the following parameters:

| Parameter  | Value |
| ------------- | ------------- |
| activation  | relu  |
| solver/optimizer  | adam  |
| loss  | mse  |
| metrics  | accuracy  |

<img src="img/ml-mlp.png" width="560" alt="ml-mlp" /><br />
Further information: [Multilayer Perceptron](https://en.wikipedia.org/wiki/Multilayer_perceptron), [Keras](https://keras.io/)

### Long Short-Term Memory
The Python frameworks Keras/Scikit-Learn were used for prototyping with the following parameters:

| Parameter  | Value |
| ------------- | ------------- |
| activation  | relu  |
| solver/optimizer  | adam  |
| loss  | mse  |
| metrics  | accuracy  |

<img src="img/ml-lstm.png" width="560" alt="ml-lstm" /><br />
Further information: [Long Short-Term Memory](https://en.wikipedia.org/wiki/Long_short-term_memory), [Keras](https://keras.io/)

### Convolutional Neural Network
The Python frameworks Keras/Scikit-Learn were used for prototyping with the following parameters:

| Parameter  | Value |
| ------------- | ------------- |
| activation  | relu  |
| solver/optimizer  | adam  |
| loss  | mse  |
| metrics  | accuracy  |

<img src="img/ml-cnn.png" width="560" alt="ml-cnn" /><br />
Further information: [Convolutional Neural Network](https://en.wikipedia.org/wiki/Convolutional_neural_network), [Keras](https://keras.io/)

## Proving Stats Models

### AutoRegressive Integrated Moving Average
The Python frameworks Statsmodels/Scikit-Learn were used for prototyping.<br />
<img src="img/stats-arima.png" width="560" alt="ml-arima" /><br />
Further information: [AutoRegressive Integrated Moving Average](https://en.wikipedia.org/wiki/Autoregressive_integrated_moving_average), [Statsmodels](https://www.statsmodels.org/stable/tsa.html)

## Optimization
PCA (Principal Component Analysis): We use PCA (https://en.wikipedia.org/wiki/Principal_component_analysis) to reduce the dimension/feature-count of our data while retaining most of the information (e.g. > 95%). Therefore we can lessen the effect of the so called "curse of dimensionality" (https://en.wikipedia.org/wiki/Curse_of_dimensionality) and speed up the training of the ANN. PCA itself can be considered as an unsupervised machine learning algorithm. 

