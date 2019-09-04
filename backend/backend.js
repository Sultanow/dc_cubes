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
    res.send("Responding with historical Data from Solr");
});

app.get("/forecast", function (req, res) {
    res.send("Responding with forecast Data from Solr");
});