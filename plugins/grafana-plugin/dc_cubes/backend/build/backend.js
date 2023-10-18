"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var backendConfig_json_1 = __importDefault(require("./backendConfig.json"));
var app = express_1.default();
app.use(cors_1.default());
var port = backendConfig_json_1.default.port;
var historical = backendConfig_json_1.default.solrConfig.historicalDataCore;
var forecast = backendConfig_json_1.default.solrConfig.forecastDataCore;
app.get("/", function (req, res) {
    res.send("node is online");
});
app.get("/historical/:solrQuery", function (req, res) {
    console.log(1);
    //let solrQuery = getQueryHistorical(req.params.from, req.params.to);
    // TODO: should from & to be query params to make them optional?
    var solrQuery = req.params.solrQuery;
    querySolr(solrQuery, res);
});
app.get("/forecast/:from/:to", function (req, res) {
    var solrQuery = getQueryForecast(req.params.from, req.params.to);
    querySolr(solrQuery, res);
});
app.listen(port, function () {
    console.log("NodeServer listening on Port " + port);
});
// TODO Personalize query / change query params
function getQueryHistorical(from, to) {
    return "/solr/" + historical + "/query?q=*:*&start=0&rows=30000";
}
function getQueryForecast(from, to) {
    return "/solr/" + forecast + "/query?q=*:*&start=0&rows=30000";
}
function querySolr(queryString, originalRes) {
    var options = {
        host: '127.0.0.1',
        port: '8983',
        path: queryString
    };
    var queryResult = null;
    var requestSolr = http_1.default.get(options, function (response) {
        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        response.on('data', function (chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function () {
            queryResult = Buffer.concat(bodyChunks);
            if (queryResult) {
                console.log(queryResult);
                originalRes.status(200);
                originalRes.write(queryResult);
                originalRes.send();
            }
            else {
                originalRes.status(404);
                originalRes.send();
            }
        });
    });
    requestSolr.on('error', function (e) {
        console.log('historicalData -> query Solr, ERROR: ' + e.message);
    });
}
