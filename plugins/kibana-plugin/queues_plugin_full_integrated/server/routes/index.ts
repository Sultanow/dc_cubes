import { IRouter } from '../../../../src/core/server';
import { schema } from '@kbn/config-schema';
import elasticsearch from 'elasticsearch';
import { VisualizationNoResults } from '../../../../src/plugins/visualizations/public';
import { xmlTestValue, timeWindow, predictionsIndex } from "../Utils";


const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

export function defineRoutes(router: IRouter) {

  router.post(
    {
      path: '/api/pic/predictions',
      validate: {
        body: schema.object({
          item: schema.string(),
          name: schema.string(),
          contenttype: schema.string(),
          gte: schema.string(),
          lte: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: predictionsIndex,
        body: {
          "_source": ["timestamp", "name", "size", "tier"],
          "query": {
            "bool": {
              "must": [
                { "match": { "items": request.body.item } },
                { "match": { "tier": "pic" } },
                { "match": { "name": request.body.name } },
                { ...(request.body.name == "products" ? { "match": { ["contenttype." + request.body.item]: request.body.contenttype } } : { "match_all": {} }) },
                { "range": { "timestamp": { "gte": request.body.gte, "lte": request.body.lte } } },
              ]
            }
          },
          "aggs": {
            "queue_enter": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "asc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier"] }
              }
            },
            "queue_left": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "desc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier"] }
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

  router.get({
    path: '/api/censhare/mock',
    validate: false
  },
    async (context, request, response) => {
      const data = xmlTestValue;
      if (!data) return response.notFound();
      return response.ok({
        body: data,
        headers: {
          'content-type': 'application/text'
        }
      });
    }
  );

  router.post({
    path: '/api/pic/getXML',
    validate: {
      body: schema.object({
        item: schema.string()
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
                { "match": { "items": request.body.item } },
                { "match": { "tier": "pic" } },
                { "match": { "name": "products" } },
                { "match": { "event": "inbox" } },
                { "match": { "brand": "A01" } }
              ]
            }
          },
          "aggs": {
            "content": {
              "sort": [{ "timestamp": { "order": "asc" } }],
              "_source": { "includes": ["timestamp", "name", "size", "tier", "content"] }
            }
          }
        },
        "size": 0
      });
      return response.ok({
        body: data,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  );

  router.get({
    path: '/api/d2c/mock',
    validate: false
  },
    async (context, request, response) => {
      const data = {
        "vib": "3CB4030X0",
        "brand": "A23",
        "locale": "es-ES",
        "xml-content": "../api/censhare/mock",
        "last-modified-date": "Thu Jan 21 18:45:03 CEST 2021",
        "zip-content": "http://fe0vm2671.bsh.corp.bshg.com:8203/d2cvib/zipcontent/es-ES/VIB_202101142T025349264_es-ES.zip"
      };
      if (!data) return response.notFound();
      return response.ok({
        body: data,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  );

  router.get({
    path: '/api/d2c/queueSize/mock',
    validate: false
  },
    async (context, request, response) => {
      const data = {
        "event-count": "3595",
        "locale": "ALL"
      };
      if (!data) return response.notFound();
      return response.ok({
        body: data,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  );

  router.get({
    path: '/api/icore/mock',
    validate: false
  },
    async (context, request, response) => {
      const data = {
        "vib": "SMU8ZDS01A",
        "brand": "A01",
        "locale": "en-NZ",
        "xml-content": "http://fe0vm2671.bsh.corp.bshg.com:8203/d2cvib/output/en-NZ/VIB_en-NZ_A01_D_SMU8ZDS01A_EPOS.xml",
        "last-modified-date": "Fri Mar 05 05:52:14 CET 2021",
        "zip-content": "http://fe0vm2671.bsh.corp.bshg.com:8203/d2cvib/zipcontent/en-NZ/VIB_202103042T101953578_en-NZ.zip",
        "icore-info": [
          {
            "region": "MCW",
            "imported-date": "Fri Mar 05 07:04:14 CET 2021",
            "file": "../api/censhare/mock"
          },
          {
            "region": "SGP",
            "imported-date": "Fri Mar 05 06:53:12 CEST 2020",
            "file": "../api/censhare/mock"
          },
          {
            "region": "MOK",
            "imported-date": "Fri Mar 05 06:53:12 CET 2021",
            "file": "wrongURL"
          }
        ]
      }
      if (!data) return response.notFound();
      return response.ok({
        body: data,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  );

  router.post(
    {
      path: '/api/contenttypes',
      validate: {
        body: schema.object({
          item: schema.string()
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
                { "match": { "items": request.body.item } },
                { "match": { "tier": "pic" } },
                { "match": { "name": "products" } }
              ]
            }
          },
          "aggs": {
            "media types": {
              "terms": {
                "field": "contenttype." + request.body.item,
                "order": { "_key": "asc" }
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
      path: '/api/censhare/item',
      validate: {
        body: schema.object({
          item: schema.string(),
          name: schema.string(),
          gte: schema.string(),
          lte: schema.string()
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
                { "match": { "items": request.body.item } },
                { "match": { "tier": "censhare" } },
                { "match": { "name": request.body.name } },
                { "range": { "timestamp": { "gte": request.body.gte, "lte": request.body.lte } } },
              ]
            }
          },
          "aggs": {
            "queue_enter": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "asc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier"] }
              }
            },
            "queue_left": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "desc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier"] }
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
          name: schema.string(),
          contenttype: schema.string(),
          gte: schema.string(),
          lte: schema.string()
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
                { "match": { "items": request.body.item } },
                { "match": { "tier": "pic" } },
                { "match": { "name": request.body.name } },
                { ...(request.body.name == "products" ? { "match": { ["contenttype." + request.body.item]: request.body.contenttype } } : { "match_all": {} }) },
                { "range": { "timestamp": { "gte": request.body.gte, "lte": request.body.lte } } },
              ]
            }
          },
          "aggs": {
            "queue_enter": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "asc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier"] }
              }
            },
            "queue_left": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "desc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier"] }
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
                { "match": { "name": request.body.name } },
                { "match": { "tier": "censhare" } }
              ]
            }
          },
          "sort": [{
            "timestamp": {
              "order": "desc"
            }
          }],
          "size": 1
        }
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
                { "match": { "name": request.body.name } },
                { "match": { "tier": "pic" } }
              ]
            }
          },
          "sort": [{
            "timestamp": {
              "order": "desc"
            }
          }],
          "size": 1
        }
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
                { "match": { "name": request.body.name } },
                { "match": { "tier": "pic" } },
                {
                  "range": {
                    "timestamp": {
                      //"gte" : "2020-06-24T12:00:00",
                      //"lt" :  "2020-06-24T13:00:00"
                      "gte": "now-" + timeWindow + "m",
                      "lt": "now"
                    }
                  }
                }
              ]
            }
          },
          "aggs": {
            "doc_early": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "asc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier", "items"] }
              }
            },
            "doc_late": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "desc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier", "items"] }
              }
            }
          },
          "size": 1
        }
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
                { "match": { "name": request.body.name } },
                { "match": { "tier": "censhare" } },
                {
                  "range": {
                    "timestamp": {
                      //"gte" : "2020-06-24T12:00:00",
                      //"lt" :  "2020-06-24T13:00:00"
                      "gte": "now-" + timeWindow + "m",
                      "lt": "now"
                    }
                  }
                }
              ]
            }
          },
          "aggs": {
            "doc_early": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "asc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier", "items"] }
              }
            },
            "doc_late": {
              "top_hits": {
                "size": 1,
                "sort": [{ "timestamp": { "order": "desc" } }],
                "_source": { "includes": ["timestamp", "name", "size", "tier", "items"] }
              }
            }
          },
          "size": 1
        }
      });
      return response.ok({
        body: {
          data: data,
        },
      });
    }
  );

}
