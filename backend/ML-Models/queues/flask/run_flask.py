from flask import Flask, request
import sys

app = Flask(__name__)

@app.route("/")
def home():
    return '<h1>Start the prediction <a href=/run_prediction>here</a> or go to http://127.0.0.1:5000/run_prediction</h1>'

@app.route("/run_prediction", methods=['GET', 'POST'])
def run_prediction():
    if request.method == 'GET':
        print('Prediction loading')
        #start = request.args.get('start')
        #end = request.args.get('end')
        file = open(r'./run_predict.py', 'r').read()
        #sys.argv = [r'./run_predict.py', start, end]
        exec(file)
        return 'Prediction uploaded'

if __name__=='__main__':
    app.run(debug=True)