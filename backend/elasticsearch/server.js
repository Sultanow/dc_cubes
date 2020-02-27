var express = require("express");
var router = express.Router();

var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
    host: "http://localhost:9200"
})

const app = express();
const port = 5000;
app.use(express.json());



router.use((req, res, next)=> {
    console.log(req.method, req.url);

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4201");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Reuested-With, content-type");

    next();
})

/*
// GET all docs
router.get("/:index", (req, res) => {
    return res.status(200).send({
        message: "GET docs call succeeded",
        dc_cubes: req.params.index
    });
})
*/


// GET all data by index
router.get("/indices/:index/", (req, res) => {
    client.search({
        index: req.params.index,
        body: {
            "query": {
                "match_all": { }
            }
        }
    }, function(err, response, status){
        if(err){
            console.log(err)
        }
        else{
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})


// GET all data by index and id
router.get("/indices/:index/id/:id", (req, res) => {
    client.search({
        index: req.params.index,
        body: {
            "query": {
                "bool": { 
                    "filter": [ 
                        { "term":  { "_id": req.params.id }}
                    ]
                }
            }       
        }
    }, function(err, response, status){
        if(err){
            console.log(err)
        }
        else{
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})

// GET allHistorical 
router.get("/indices/:index/from/:from/to/:to", (req, res) => {
    client.search({
        index: req.params.index,
        body: {
            "query": {
                "range": { 
                    "@timestamp": { 
                        "time_zone": "+02:00", 
                        "gte": req.params.from, 
                        "lte": req.params.to 
                    }
                }
            }       
        }
    }, function(err, response, status){
        if(err){
            console.log(err)
        }
        else{
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})


/*
// TODO GET all aggegated value for each timestamp by selectedMeasure
router.get("/:index/:from/:to/:selectedMeasure/:aggregationType", (req, res) => {
    client.search({
        index: req.params.index, 
        body: {
            "query": {
                "range": { 
                    "@timestamp": { 
                        "time_zone": "+02:00", 
                        "gte": req.params.from, 
                        "lte": req.params.to 
                    }, 
                },
                "bool": { 
                    "filter": [ 
                        { "term":  { "_id": req.params.id }}
                    ]
                }
            }       
        }
    }, function(err, response, status){
        if(err){
            console.log(err)
        }
        else{
            res.status(200).send({
                message: response.hits.hits
            })
            console.log("elasticsearch response", response);
        }
    })
})
*/

app.use("/", router);

app.listen(port, function () {
    console.log("NodeServer listening on Port " + port);
});

module.exports = router