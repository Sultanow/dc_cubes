var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require("path");
var express = require("express");
var app = express();
var dir = path.join(__dirname, 'public');

const port = 8080;

app.get("/", function (req, res) {
    res.send("node is online");
});

app.listen(8080, function () {
    console.log("NodeServer listening on Port " + port);
});

app.get("/historicalData", function (req, res) {
    let solrQuery = ""//req.
    if (!queryIsSelect()) {
        res.writeHead(403);
        res.setHeader('Content-Type', 'text/plain');
    }
    else {
        req.on("end", function () {
            try {
                querySolr(solrQuery, function (result) {
                    res.writeHead(200);
                    // since its a http result object and the function param is also called result,
                    //you have to call result.result to get what you would expect
                    res.write(JSON.stringify(result.result));
                    res.end();
                });
            }
            catch (e) {
                console.log(e);
                res.end();
            }

        });
    }
    return res.end('Forbidden');
    //res.send("Responding with historical Data from Solr");
});

app.get("/forecast", function (req, res) {
    res.send("Responding with forecast Data from Solr");
});


function queryIsSelect(solrQuery) {
    // check if the query is a select query, otherwise (update, delete) stop handling the request
    let indexOfMarker = solrQuery.indexOf("?");
    if (indexOfMarker < 0) { // cancel if "?" doesnt exist in solrQuery
        return false;
    }
    let solrAction = (solrQuery.substr(0, indexOfMarker));
    solrAction = solrAction.substr(solrAction.lastIndexOf("/") + 1);

    return (solrAction === "select");
}

function querySolr(query, callback) {

    return http.get({
        host: '127.0.0.1',
        port: "8983",
        path: query
    }, function (response) {
        // Continuously update stream with data
        var body = '';
        // build up the result chunk by chunk
        response.on('data', function (chunk) {
            body += chunk;
        });
        // when all chunks arrived:
        response.on('end', function () {

            // json has to be parsed
            try {
                var parsed = JSON.parse(body);
            }
            catch (e) {
                console.log("error parse", e);
                parsed = ("{}");
            }
            // call the callback function with the parsed solrquery result
            callback({
                result: parsed
            });
        });
    })
        .on("error", function (e) {
            console.log("Error while querying Solr (is it running?): ", e);
            return {};
        });
}