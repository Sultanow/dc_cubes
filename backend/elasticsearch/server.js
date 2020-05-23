var express = require("express");
var router = express.Router();

var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
    host: "http://localhost:9200"
})

const app = express();
const port = 5000;
app.use(express.json());

const fieldList = [
    "@timestamp",
    "cluster",
    "dc",
    "perm",
    "instanz",
    "verfahren",
    "service",
    "response",
    "count",
    "minv",
    "maxv",
    "avg",
    "var",
    "dev_upp",
    "dev_low",
    "perc90",
    "perc95",
    "perc99",
    "sum",
    "sum_of_squares",
    "server",
    "cpuusage_ps"
    ]

router.use((req, res, next) => {
    console.log(req.method, req.url);

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Reuested-With, content-type");

    next();
})


// GET all data by index
router.get("/:index", (req, res) => {
    client.search({
        index: req.params.index,
        body: {
            "_source": {
                "includes": fieldList
            },
            "query": {
                "match_all": {
                }
            },
            "size": 10000,
        }
    }, function (err, response, status) {
        if (err) {
            console.log(err)
        }
        else {
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})


// GET all data by index and id
router.get("/:index/:id", (req, res) => {
    client.search({
        index: req.params.index,
        body: {
            "_source": {
                "includes": fieldList
            },
            "query": {
                "bool": {
                    "filter": [
                        { "term": { "_id": req.params.id } }
                    ]
                }
            }
            
        }
    }, function (err, response, status) {
        if (err) {
            console.log(err)
        }
        else {
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})

// GET allHistorical 
router.get("/:index/:from/:to", (req, res) => {
    client.search({
        index: req.params.index,
        body: {
            "_source": {
                "includes": fieldList
            },
            "query": {
                "range": {
                    "@timestamp": {
                        "time_zone": "+02:00",
                        "gte": req.params.from,
                        "lte": req.params.to
                    }
                }
            }, 
            "size": 10000,
        }
    }, function (err, response, status) {
        if (err) {
            console.log(err)
        }
        else {
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})

// GET aggregatedLogData
router.get("/:index/:from/:to/:selectedMeasure/avg", (req, res) => {
    
    client.search({
        index: req.params.index,
        body: {
            "_source": {
                "includes": fieldList
            },
            "query": {
                "range": {
                    "@timestamp": {
                        "time_zone": "+02:00",
                        "gte": req.params.from,
                        "lte": req.params.to
                    }
                }
            },
            "size": 10000,
            "aggs": {
                "datacenters": {
                    "terms": {
                        "field": "dc",
                    },
                    "aggs": {
                        "clusters": {
                            "terms": {
                                "field": "cluster",
                            },
                            "aggs": {
                                "instances": {
                                    "terms": {
                                        "field": "instanz"
                                    },
                                    "aggs": {
                                        "aggregatedValue": { 
                                            "avg" : { 
                                                "field": req.params.selectedMeasure 
                                            } 
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, function (err, response, status) {
        if (err) {
            console.log(err)
        }
        else {
            res.status(200).send({
                message: response
            })
            console.log("elasticsearch response", response);
        }
    })
})

// GET max cpuusage_ps value of index in time range
router.get("/:index/:from/:to/cpuusage_ps/", (req, res) => {
    client.search({
        index: req.params.index,
        body: {
            "_source": {
                "includes": fieldList
            },
            "query": {
                "range": {
                    "@timestamp": {
                        "time_zone": "+02:00",
                        "gte": req.params.from,
                        "lte": req.params.to
                    }
                }
            },
            "sort": [{
                "count": {
                    "order": "desc"
                }
            }],
            "size": 1
        }
    }, function (err, response, status) {
        if (err) {
            console.log(err)
        }
        else {
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})

app.use("/", router);

app.listen(port, function () {
    console.log("NodeServer listening on Port " + port);
});

module.exports = router