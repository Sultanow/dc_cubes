import { IRouter } from '../../../../src/core/server';
import { schema } from '@kbn/config-schema';
import elasticsearch from 'elasticsearch'

const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

export function defineRoutes(router: IRouter) {
  router.post(
    {
      path: '/api/censhare/item',
      validate: {
        body: schema.object({
            item: schema.string(),
            name: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: 'queues',
        body: {
          "_source": ["timestamp", "name", "size", "tier"],
          "query": {
            "bool": {
              "must": [
                { "match": { "items": request.body.item }},
                { "match": { "tier": "censhare" }},
                { "match": { "name": request.body.name }}
              ]
            }
          },
          "aggs": {
            "queue_enter" : {
              "top_hits": {
                "size": 1,
                "sort": [ { "timestamp": { "order": "asc" } } ],
                "_source": { "includes": [ "timestamp", "name", "size", "tier" ] }
              }
            },
            "queue_left" : {
              "top_hits": {
                "size": 1,
                "sort": [ { "timestamp": { "order": "desc" } } ],
                "_source": { "includes": [ "timestamp", "name", "size", "tier" ] }
              }
            }
          }
        },
        "size": 0
      });
      return response.ok({
        body: {
          data: data,
        },
      });
		}
  );

  router.post(
    {
      path: '/api/pic/item',
      validate: {
        body: schema.object({
            item: schema.string(),
            name: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: 'queues',
        body: {
          "_source": ["timestamp", "name", "size", "tier"],
          "query": {
            "bool": {
              "must": [
                { "match": { "items": request.body.item }},
                { "match": { "tier": "pic" }},
                { "match": { "name": "products" }},
                { "match": { "name": request.body.name }},
              ]
            }
          },
          "aggs": {
            "queue_enter" : {
              "top_hits": {
                "size": 1,
                "sort": [ { "timestamp": { "order": "asc" } } ],
                "_source": { "includes": [ "timestamp", "name", "size", "tier" ] }
              }
            },
            "queue_left" : {
              "top_hits": {
                "size": 1,
                "sort": [ { "timestamp": { "order": "desc" } } ],
                "_source": { "includes": [ "timestamp", "name", "size", "tier" ] }
              }
            }
          }
        },
        "size": 0
      });
      return response.ok({
        body: {
          data: data,
        },
      });
		}
  );

  router.post(
    {
      path: '/api/censhare/size',
      validate: {
        body: schema.object({
            name: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: 'queues',
        body: {
          "_source": ["timestamp", "name", "size", "tier"],
          "query": {
            "bool": {
              "must": [
                { "match": { "name": request.body.name  }},
                { "match": { "tier": "censhare" }}
              ]
            }
          },
          "sort": [{
            "timestamp": {
              "order": "desc"
            }
        }],
        "size": 1
       }});
      return response.ok({
        body: {
          data: data,
        },
      });
		}
  );

  router.post(
    {
      path: '/api/pic/size',
      validate: {
        body: schema.object({
            name: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: 'queues',
        body: {
          "_source": ["timestamp", "name", "size", "tier"],
          "query": {
            "bool": {
              "must": [
                { "match": { "name": request.body.name  }},
                { "match": { "tier": "pic" }}
              ]
            }
          },
          "sort": [{
            "timestamp": {
              "order": "desc"
            }
        }],
        "size": 1
       }});
      return response.ok({
        body: {
          data: data,
        },
      });
		}
  );

  router.post(
    {
      path: '/api/pic/throughput/items',
      validate: {
        body: schema.object({
            name: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: 'queues',
        body: {
          "_source": ["timestamp", "name", "size", "tier"],
  "query": {
    "bool": {
        "must": [
          { "match": { "name": request.body.name }},
          { "match": { "tier": "pic" }},
          {"range" : {
            "timestamp" : {
              // in production -> "gte":"now-1m", "lt":"now"
              "gte" : "2020-06-25T05:25:00",
              "lt" :  "2020-06-25T05:27:00"
          }}
      }
        ]
      }
    },
    "aggs": {
      "doc_early" : {
        "top_hits": {
          "size": 1,
          "sort": [ { "timestamp": { "order": "asc" } } ],
          "_source": { "includes": [ "timestamp", "name", "size", "tier", "items" ] }
        }
      },
      "doc_late" : {
        "top_hits": {
          "size": 1,
          "sort": [ { "timestamp": { "order": "desc" } } ],
          "_source": { "includes": [ "timestamp", "name", "size", "tier", "items" ] }
        }
      }
    },
    "size": 1}});
      return response.ok({
        body: {
          data: data,
        },
      });
		}
  );


  router.post(
    {
      path: '/api/censhare/throughput/items',
      validate: {
        body: schema.object({
            name: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: 'queues',
        body: {
          "_source": ["timestamp", "name", "size", "tier"],
  "query": {
    "bool": {
        "must": [
          { "match": { "name": request.body.name }},
          { "match": { "tier": "pic" }},
          {"range" : {
            "timestamp" : {
              // in production -> "gte":"now-1m", "lt":"now"
              "gte" : "2020-06-25T05:25:00",
              "lt" :  "2020-06-25T05:27:00"
          }}
      }
        ]
      }
    },
    "aggs": {
      "doc_early" : {
        "top_hits": {
          "size": 1,
          "sort": [ { "timestamp": { "order": "asc" } } ],
          "_source": { "includes": [ "timestamp", "name", "size", "tier", "items" ] }
        }
      },
      "doc_late" : {
        "top_hits": {
          "size": 1,
          "sort": [ { "timestamp": { "order": "desc" } } ],
          "_source": { "includes": [ "timestamp", "name", "size", "tier", "items" ] }
        }
      }
    },
    "size": 1}});
      return response.ok({
        body: {
          data: data,
        },
      });
		}
  );

}