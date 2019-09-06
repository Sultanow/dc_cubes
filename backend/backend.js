const http = require('http');
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const config = require("./nodeConfig.json");

const port = config.port;
const historical = config.historicalDataCore;
const forecast = config.forecastDataCore;

app.get("/", function (req, res) {
    res.send("node is online");
});

app.listen(8080, function () {
    console.log("NodeServer listening on Port " + port);
});

app.get("/historicalData/:from/:to", function (req, res) {
    let solrQuery = getQueryHistorical(req.params.from, req.params.to);
    // TODO: Refactor to avoid code duplication at forecast
    var options = {
        host: '127.0.0.1',
        port: "8983",
        path: solrQuery
    };

    var queryResult = null;
    let requestSolr = http.get(options, function (response) {
        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        response.on('data', function (chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function () {
            queryResult =  Buffer.concat(bodyChunks);
            if(queryResult) {
                res.status(200);
                res.write(queryResult);
                res.send();
            }
            else {
                res.status(404);
                res.send();
            }
        })
    });
    requestSolr.on('error', function (e) {
        console.log('historicalData -> query Solr, ERROR: ' + e.message);
    });

});

app.get("/forecast/:from/:to", function (req, res) {
    let solrQuery = getQueryForecast(req.params.from, req.params.to);
    var options = {
        host: '127.0.0.1',
        port: "8983",
        path: solrQuery
    };

    var queryResult = null;
    let requestSolr = http.get(options, function (response) {
        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        response.on('data', function (chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function () {
            queryResult =  Buffer.concat(bodyChunks);
            if(queryResult) {
                res.statusCode(200);
                res.write(queryResult);
                res.send();
            }
            else {
                res.statusCode(404);
                res.send();
            }
        })
    });
    requestSolr.on('error', function (e) {
        console.log('historicalData -> query Solr, ERROR: ' + e.message);
    });
});

// TODO Personalize query / change query params
function getQueryHistorical(params) {
    return `/solr/${historical}/query?q=*:*&start=0&rows=30000`;
}
function getQueryForecast(params) {
    return `/solr/${forecast}/query?q=*:*&start=0&rows=30000`;
}
