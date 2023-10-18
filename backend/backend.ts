import http from 'http'
import express from 'express'
import cors from 'cors'
import config from './dc_cubes_config.json'

const app = express();
app.use(cors());

const port = config.backendPort;
const historical = config.solrSettings.historicalDataCore;
const forecast = config.solrSettings.forecastDataCore;

// const { spawn } = require("child_process");
// const pythonProcess = spawn("python", ["MLSkript.py"]);
// pythonProcess.stdout.on('data', function (data) {
//     process.stdout.write(data);
// });

app.get("/", function (req, res) {
    res.send("node is online");
});

/**
 * Get initial config from server
 */
app.get("/initialconfig", function (req, res) {
    res.json(config);
});

/**
 * Update config on server
 */
app.put("/initialconfig", function (req, res) {
    res.json(config);
});

app.get("/historical/", function (req, res) {
    const solrQuery = getQueryHistorical(req.query.solrQuery);
    querySolr(solrQuery, res);
    //let solrQuery = getQueryHistorical(req.params.from, req.params.to);
    // TODO: should from & to be query params to make them optional?
    //querySolr(solrQuery, res);
});

app.get("/forecast/:from/:to", function (req, res) {
    let solrQuery = getQueryForecast(req.params.from, req.params.to);
    querySolr(solrQuery, res);
});

app.get("/startScript", function (req, res) {
    const { spawn } = require("child_process");
    const pythonProcess = spawn("python", ["proofOfConcept.py"]);
    let dataChunks = [];
    let pythonOutput = null;
    pythonProcess.stdout.on("data", function (chunk) {
        dataChunks.push(chunk);
    }).on('end', function () {
        pythonOutput = Buffer.concat(dataChunks);
        console.log("success: ", pythonOutput.toString());
        if (pythonOutput) {
            res.write(pythonOutput);
            res.status(200);
            res.send();
        } else {
            res.status(404);
            res.send();
        }
    })
});

app.listen(port, function () {
    console.log("NodeServer listening on Port " + port);
});


// TODO Personalize query / change query params
function getQueryHistorical(solrQuery) {
    return `/solr/${historical}${solrQuery}`;
}
function getQueryForecast(from, to) {
    return `/solr/${forecast}/query?q=*:*&start=0&rows=30000`;
}


function querySolr(queryString, originalRes) {
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
            queryResult = Buffer.concat(bodyChunks);
            if (queryResult) {
                originalRes.status(200);
                originalRes.write(queryResult);
                originalRes.send();
            } else {
                originalRes.status(404);
                originalRes.send();
            }
        })
    });
    requestSolr.on('error', function (e) {
        console.log('historicalData -> query Solr, ERROR: ' + e.message);
    });

}