# Imports
from flask import Flask, request
import sys
import logging

from run_predict import Predictor

app = Flask(__name__)

@app.route("/")
def home():
    return '<h1>Start the prediction <a href=/run_prediction>here</a></h1>'

@app.route("/run_prediction", methods=['GET', 'POST'])
def run_prediction():
    model.run()
    if request.method == 'GET':
        print('Prediction uploaded')
        return 'Prediction uploaded'
    else:
        return 'Prediction uploaded'

if __name__=='__main__':
    logging.basicConfig(level=logging.INFO)
    # To turn off all elasticsearch entries the level is set to warning
    logging.getLogger("elasticsearch").setLevel(logging.WARNING)
    model = Predictor()
    app.run(debug=True)
