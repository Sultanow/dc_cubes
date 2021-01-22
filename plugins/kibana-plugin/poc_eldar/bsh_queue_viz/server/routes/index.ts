import { IRouter } from '..\..\../../src/core/server';
import { schema } from '@kbn/config-schema';
import elasticsearch from 'elasticsearch'

const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

export function defineRoutes(router: IRouter) {
  router.post(
    {
      path: '/api/bsh_queue_viz/itemsearch',
      //see https://discuss.elastic.co/t/extract-post-data-from-request/237962/2
      validate: {
        body: schema.object({
            item: schema.string(),
            gte: schema.string(),
            lte: schema.string()
        }),
      }
    },
    async (context, request, response) => {
      const data = await client.search({
        index: 'queues',
        body: {
          "_source": ["timestamp", "name", "size"],
          "query": {
            "bool": {
              "must": [
                { "match": { "items": request.body.item }},
                { "range": { "timestamp": { "gte": request.body.gte,  "lte": request.body.lte }}},
              ]
            }
          },
          "aggs": {
            "group_by_queue" : {
              "terms" : {
                "field": "name.keyword"
              },
              "aggs": {
                "queue_enter" : {
                  "top_hits": {
                    "size": 1,
                    "sort": [ { "timestamp": { "order": "asc" } } ],
                    "_source": { "includes": [ "timestamp", "name", "size" ] }
                  }
                },
                "queue_left" : {
                  "top_hits": {
                    "size": 1,
                    "sort": [ { "timestamp": { "order": "desc" } } ],
                    "_source": { "includes": [ "timestamp", "name", "size" ] }
                  }
                }
              }
            }
          },
          "size": 0
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
