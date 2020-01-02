import http from 'http'
import express from 'express'
import cors from 'cors'
import config from './nodeConfig.json'

const app = express();
app.use(cors());

const port = config.port;
const historical = config.historicalDataCore;
const forecast = config.forecastDataCore;

app.get("/", function (req, res) {
    res.send("node is online");
});

app.get("/historical/:from/:to", function (req, res) {
    let solrQuery = getQueryHistorical(req.params.from, req.params.to);
    // TODO: should from & to be query params to make them optional?
    querySolr(solrQuery, res);
});

app.get("/forecast/:from/:to", function (req, res) {
    let solrQuery = getQueryForecast(req.params.from, req.params.to);
    querySolr(solrQuery, res);
});

app.listen(port, function () {
    console.log("NodeServer listening on Port " + port);
});


// TODO Personalize query / change query params
function getQueryHistorical(from, to) {
    return `/solr/${historical}/query?q=*:*&start=0&rows=30000`;
}
function getQueryForecast(from, to) {
    return `/solr/${forecast}/query?q=*:*&start=0&rows=30000`;
}


function querySolr(queryString, originalRes ) {
    const options = {
        host: '127.0.0.1',
        port: "8983",
        path: queryString
    };

    let queryResult = null;
    let requestSolr = http.get(options, function (response) {
        // Buffer the body entirely for processing as a whole.
        let bodyChunks = [];
        response.on('data', function (chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function () {
            queryResult =  Buffer.concat(bodyChunks);
            if(queryResult) {
                originalRes.status(200);
                originalRes.write(queryResult);
                originalRes.send();
            }
            else {
                originalRes.status(404);
                originalRes.send();
            }
        })
    });
    requestSolr.on('error', function (e) {
        console.log('historicalData -> query Solr, ERROR: ' + e.message);
    });

}