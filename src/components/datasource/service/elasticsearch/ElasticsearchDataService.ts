//import httpClient from 'axios';
import AggregationType from '../../../../model/AggregationType'
import DataSourceService from '../../../../model/DataSourceService'

import {
    Client,
    // Object that contains the type definitions of every API method
    RequestParams,
    // Interface of the generic API response
    ApiResponse,
  } from '@elastic/elasticsearch'

const client = new Client({ node: 'http://localhost:9200',
                            maxRetries: 5,
                            requestTimeout: 60000,
                            sniffOnStart: true })

export default class ElasticsearchDataService implements DataSourceService {

   
    //resultLimit = 2147483647 // Maximum of integer type

    elasticsearchIndex: string;
    elasticsearchForecastIndex: string;
    elasticsearchMergedIndex: string;

    constructor(elasticsearchIndex: string, elasticsearchForecastIndex: string, elasticsearchMergedIndex: string) {
        this.elasticsearchIndex = elasticsearchIndex;
        this.elasticsearchForecastIndex = elasticsearchForecastIndex;
        this.elasticsearchMergedIndex = elasticsearchMergedIndex;
    }

    /* Elasticsearch API */

    async getHistorical(from: string, to: string) {
        //const from = "2018-08-01T04:45:00"
        //const to = "2018-08-01T04:45:00"

        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchIndex, 
            "body": { 
                "query": { 
                "range": { 
                    "@timestamp": { 
                    "time_zone": "+02:00", 
                    "gte": from, 
                    "lte": to }, 
                    }
                } 
            }, 
            //"size": 5 
        }
        const {body}: ApiResponse = await client.search(searchParams)
        return body
    }

    async getForecast(from: string, to: string) {
        //const from = "2018-08-01T04:45:00"
        //const to = "2018-08-01T04:45:00"

        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchForecastIndex, 
            "body": { 
                "query": { 
                "range": { 
                    "@timestamp": { 
                    "time_zone": "+02:00", 
                    "gte": from, 
                    "lte": to }, 
                    }
                } 
            }
        }
        const {body}: ApiResponse = await client.search(searchParams)
        return body
    }

    async getAllHistorical() {
        //const from = "2018-08-01T04:45:00"
        //const to = "2018-08-01T04:45:00"

        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchIndex, 
            "body": { 
                "query": {
                    "match_all": { }
                },
                "sort": [{
                    "timestamp": {
                        "order": "asc"
                    }
                }]
            }
        }
        const {body}: ApiResponse = await client.search(searchParams)
        return body
    }

    async getAggregatedLogData(from: string, to: string, selectedMeasure: string, aggregationType: AggregationType){
        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchForecastIndex, 
            "body": { 
                "query": { 
                    "range": { 
                        "@timestamp": { 
                        "time_zone": "+02:00", 
                        "gte": from, 
                        "lte": to }, 
                    }
                },
                "aggs" : {
                    aggregationType : {
                        "terms" : { "field" : "lorem" }
                    }
                }
            }
        }
        const {body}: ApiResponse = await client.search(searchParams)
        return body
    }

    async getDistinctTimestamps(index: string){
        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchIndex, 
            "body": { 
                "query": {
                    "match_all": { }
                }
            } 
        }
        const {body}: ApiResponse = await client.search(searchParams)
        return body
    }

    async getAggregatedValueForEachTimestamp(selectedMeasure: string, aggregationType: AggregationType, elasticsearchIndex: string){
        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchIndex, 
            "body": { 
                "query": {
                    "match_all": { }
                }
            }
        }
        const {body}: ApiResponse = await client.search(searchParams)
        return body
    }

    async getMaxValueOfTwoCores(from: string, to: string, selectedMeasure: string): Promise<number>{
        const searchParams: RequestParams.Search = 
        {
            "index": this.elasticsearchIndex, 
            "body": {
                "query": {
                    "match_all": { }
                },
                "sort": [{
                    selectedMeasure: {
                        "order": "desc"
                    }
                }],
                "size": 1
            }
        }
        const searchParamsForecast: RequestParams.Search = 
        {
            "index": this.elasticsearchForecastIndex, 
            "body": {
                "query": {
                    "match_all": { }
                },
                "sort": [{
                    selectedMeasure: {
                        "order": "desc"
                    }
                }],
                "size": 1
            }
        }

        var {body}: ApiResponse = await client.search(searchParams)
        const maxValue: number = body.hits.hits[0].selectedMeasure;

        //var {body} = await client.search(searchParams)
        const maxForecast: number = body.hits.hits[0].selectedMeasure;

        if(maxValue > maxForecast){
            return maxValue
        }
        else{
            return maxForecast
        }
    }
}
