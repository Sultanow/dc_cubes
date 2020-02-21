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


/*
//GET specific dc_cubes doc by id
router.get("/:index/:id", (req, res) => {
    let doc;

    client.get({
        index: req.params.index,
        id: req.params.id
    }, function(err, resp, status){
        if(err){
            console.log(err)
        }
        else{
            doc = resp._source
        }
    })

    if(!doc){
        return res.status(400).send({
            message: "dc_cubes document is not found for id " + req.params.id + "."
        })
    }
    return res.status(200).send({
        message: "GET dc_cubes document call fo id " + req.params.id + " succeedeed.",
        message: doc
    });
})
*/


// GET all data by index
router.get("/:index/", (req, res) => {
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
router.get("/:index/:id", (req, res) => {
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


app.use("/", router);

app.listen(port, function () {
    console.log("NodeServer listening on Port " + port);
});

module.exports = router