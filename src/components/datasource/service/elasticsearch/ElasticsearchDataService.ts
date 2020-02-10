import httpClient from 'axios';
import AggregationType from '../../../../model/AggregationType'
import DataSourceService from '../../../../model/DataSourceService'

import {
    Client,
    // Object that contains the type definitions of every API method
    RequestParams,
    // Interface of the generic API response
    ApiResponse,
  } from '@elastic/elasticsearch'

const client = new Client({ node: 'http://localhost:9200' })

export default class ElasticsearchDataService /* implements DataSourceService*/ {

   
    resultLimit = 2147483647 // Maximum of integer type

    elasticsearchIndex: string;
    elasticsearchForecastIndex: string;
    elasticsearchMergedIndex: string;

    constructor(elasticsearchIndex: string, elasticsearchForecastIndex: string, elasticsearchMergedIndex: string) {
        this.elasticsearchIndex = elasticsearchIndex;
        this.elasticsearchForecastIndex = elasticsearchForecastIndex;
        this.elasticsearchMergedIndex = elasticsearchMergedIndex;
    }

    /* Elasticsearch API */

    async getHistoricalE(from: string, to: string) {
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
        const response: ApiResponse = await client.search(searchParams)
        return response
    }

    async getForecastE(from: string, to: string) {
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
        const response: ApiResponse = await client.search(searchParams)
        return response
    }

    async getAllHistoricalE() {
        //const from = "2018-08-01T04:45:00"
        //const to = "2018-08-01T04:45:00"

        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchIndex, 
            "body": { 
                "query": {
                    "match_all": { }
                }
            }
        }
        const response: ApiResponse = await client.search(searchParams)
        return response
    }

    async getAggregatedLogDataE(from: string, to: string, selectedMeasure: string, aggregationType: AggregationType){
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
        const response: ApiResponse = await client.search(searchParams)
        return response
    }

    async getDistinctTimestampsE(index: string){
        const searchParams: RequestParams.Search = 
        {
        "index": this.elasticsearchIndex, 
            "body": { 
                "query": {
                    "match_all": { }
                }
            } 
        }
        const response: ApiResponse = await client.search(searchParams)
        return response
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
        const response: ApiResponse = await client.search(searchParams)
        return response
    }

    async getMaxValueOfTwoIndices(from: string, to: string, selectedMeasure: string){
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
            }
        }

        /*
        const query = {
            "query": "*:*",
            "filter": "timestamp:[" + from + " TO " + to + "]",
            "limit": this.resultLimit,
            "facet": {
                "maxValue": "max(" + selectedMeasure + ")",
            }
        }
        const url = this.solrBaseUrl + this.solrCore + "/query";
        const urlForecast = this.solrBaseUrl + this.solrForecastCore + "/query";
        
        let maxValue: number;
        return new Promise((resolve, reject) => {
            httpClient.post(url, query).then((data: any) => {
                maxValue = data.data.facets.maxValue          
                httpClient.post(urlForecast, query).then((forecastData: any) => {
                    const forecastMax: number = forecastData.data.facets.maxValue
                    if (forecastMax !== undefined && maxValue < forecastMax) {
                        maxValue = forecastMax
                    }
                    return resolve(maxValue)
                }).catch((error: any) => {
                    return resolve(maxValue)
                });
            }).catch((error: any) => {
                return reject(error)
            });
        })
        */
    }
}
