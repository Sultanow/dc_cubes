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
const { body } = await client.search(params)
console.log(body.hits.hits)
/*
  function getHistorical(from, to, index){ //"2018-08-01T04:45:00"
  }
*/

  
 //const res = getHistorical("2018-08-01T04:45:00", "2018-08-01T04:45:00", "dc_cubes")
  //console.log("Results: " + JSON.stringify(body.hits.hits, null, 2))

}

run().catch(console.log)