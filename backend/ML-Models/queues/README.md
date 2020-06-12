# Queue Prediction
### File Overview
* **PredictorES** is as simple script to show the ability to connect to the ElasticSearch, retrieve some data, make a prediction based on the AR Model and writes the predicted values with the matching timestamps back to ES afterwards.
* **PredictorJSON** can predict based on the json file retrieved from ES and write the results back to a json file, which could be uploaded via elasticdump.
* **PredictorES-LSTM** exchanges the model with an LSTM build model, which procedure is shown in **/Concepts/Queue-Size-Prediction-LSTM-Concept.ipynb**

### Testing environment
All models have been trained on a Mac with a quad-core Intel i7 2,9 GHz and 16 GB of RAM.
