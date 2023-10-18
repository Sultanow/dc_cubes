# Imports
from flask import Flask, request
import sys
import logging

from Predictor import Predictor

app = Flask(__name__)

@app.route("/")
def home():
    return '<h1>Start the prediction <a href=/run_prediction>here</a></h1>'

@app.route("/run_prediction", methods=['GET', 'POST'])
def run_prediction():
    #model.run()
    if request.method == 'GET':
        # Get URL arguments
        start = request.args.get('start')
        end = request.args.get('end')
        # When there are no arguments given start the prediction in live mode
        if start == None:
            start = '0' #'2020-11-05 00:00:00'
            end = '0' #'2020-11-13 13:00:00'
        model.run(start,end)
        print('Prediction finished')
        return f'Prediction finished based on time range {start} - {end}'
    else:
        return 'Prediction finished'

if __name__=='__main__':
    logging.basicConfig(level=logging.INFO)
    # To turn off all elasticsearch entries the level is set to warning
    # logging.getLogger("elasticsearch").setLevel(logging.WARNING)
    model = Predictor()
    app.run(debug=True)
