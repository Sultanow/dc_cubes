'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })


async function run () {
/*
  // Search
  const { body } = await client.search({
    index: 'dc_cubes',
    body: {
        query: {
            range: {
              "@timestamp": {
                "time_zone": "+02:00",
                "gte": "2018-08-01T04:45:00",
                "lte": "2018-08-01T04:45:00"
              },
            },
            range: {
              "instanz": {
                "gte": "5",
                "lte": "7"
              }
            }
        },
        size: 3
    }
  })

  console.log("Results: " + JSON.stringify(body.hits.hits, null, 2))
}
*/

var from = "2018-08-01T04:45:00"
var to = "2018-08-01T04:45:00"
var index = "dc_cubes"
var measure = "avg"

var params = {  "index": index, 
                "body": { 
                  "query": { 
                    "range": { 
                      "@timestamp": { 
                        "time_zone": "+02:00", 
                        "gte": from, 
                        "lte": to }, 
                      }, 
                        "range": { 
                          "instanz": { 
                            "gte": "5", 
                            "lte": "7" 
                          } 
                        } 
                  }, 
                  "size": 5 
                } 
              }

var maxAvg = {  
    "index": index, 
    "body": {
        "query": {
            "match_all": { }
        },
        "sort": [{
            "avg": {
                "order": "desc"
            }
        }],
        "size": 1
    }
}


var maxSelectedMeasure = {  
  "index": index, 
  body: {
    "query": {
        "range": { 
            "@timestamp": { 
                "time_zone": "+02:00", 
                "gte": from, 
                "lte": to 
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
}

var sortTime = {  
    "index": index, 
    "body": {
        "query": {
            "match_all": { }
        },
        "sort": [{
            "timestamp": {
                "order": "asc"
            }
        }],
        "size": 2
    }
}

var id = {
  "index": index, 
    "body": {
        "query": {
          "bool": { 
            "filter": [ 
              { "term":  { "count": 423 }}
            ]
          }
        }
    }
}

var aggTest = {
  "index": index, 
    "body": {
      "aggs" : {
        "whatever_you_like_here" : {
            "terms" : { "field" : "count", "size":10000 }
        }
    },
    "size" : 3 
    }
}


const { body } = await client.search(maxSelectedMeasure)
console.log(body.hits.hits[0]._source.count)

//console.log(body.hits.hits[0]._source.avg)

/*
  function getHistorical(from, to, index){ //"2018-08-01T04:45:00"
  }
*/

  
 //const res = getHistorical("2018-08-01T04:45:00", "2018-08-01T04:45:00", "dc_cubes")
  //console.log("Results: " + JSON.stringify(body.hits.hits, null, 2))

}

run().catch(console.log)