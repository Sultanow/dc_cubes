import httpClient from 'axios';
import AggregationType from '../../../../model/AggregationType'
import DataSourceService from '../../../../model/DataSourceService'

export default class ElasticsearchDataService implements DataSourceService {

    elasticsearchIndex: string;
    elasticsearchForecastIndex: string;
    elasticsearchMergedIndex: string;

    //resultLimit = 2147483647 // Maximum of integer type
    fieldList = "timestamp,cluster,dc,instanz,cpuusage_ps"

    host = "http://localhost:5000/"

    constructor(elasticsearchIndex: string, elasticsearchForecastIndex: string, elasticsearchMergedIndex: string) {
        this.elasticsearchIndex = elasticsearchIndex;
        this.elasticsearchForecastIndex = elasticsearchForecastIndex;
        this.elasticsearchMergedIndex = elasticsearchMergedIndex;
    }

    getHistorical = (from: string, to: string): any => {
        return httpClient.get(this.host + this.elasticsearchIndex + "/" + from + "/" + to)
    };

    getForecast = (from: string, to: string): any => {
        return httpClient.get(this.host + this.elasticsearchForecastIndex + "/" + from + "/" + to)
    }

    getAllHistorical = () => {
        return httpClient.get(this.host + this.elasticsearchIndex)
    }



    getAggregatedLogData = (from: string, to: string, selectedMeasure: string, aggregationType: AggregationType) => {
        return httpClient.get(this.host + this.elasticsearchIndex + "/" + from + "/" + to + "/" + selectedMeasure + "/" + aggregationType)
    }

    /*
    getAggregatedLogData = (from: string, to: string, selectedMeasure: string, aggregationType: AggregationType) => {
        const query = {
            "query": "*:*",
            "filter": "timestamp:[" + from + " TO " + to + "]",
            "limit": this.resultLimit,
            "params": {
                "fl": this.fieldList,
            },
            "facet": {
                "datacenters": {
                    "type": "terms",
                    "field": "dc",
                    "limit": this.resultLimit,
                    "params": {
                        "fl": this.fieldList,
                    },
                    "facet": {
                        "clusters": {
                            "type": "terms",
                            "field": "cluster",
                            "limit": this.resultLimit,
                            "params": {
                                "fl": this.fieldList,
                            },
                            "facet": {
                                "instances": {
                                    "type": "terms",
                                    "field": "instanz",
                                    "limit": this.resultLimit,
                                    "params": {
                                        "fl": this.fieldList,
                                    },
                                    "facet": {
                                        "aggregatedValue": aggregationType + "(" + selectedMeasure + ")",
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const url = this.solrBaseUrl + this.solrMergedCore + "/query"
        return httpClient.post(url, query);
    }
    */

    getDistinctTimestamps = (core: string): any => {
        
    }
    /*
    getDistinctTimestamps = (core: string): any => {
        const query = '/query?q=*:*&stats=true&stats.field=timestamp&rows=0&indent=true&stats.calcdistinct=true';
        const url = this.solrBaseUrl + core + query;
        return new Promise((resolve, reject) => {
            httpClient.get(url).then((data: any) => {
                return resolve(data.data.stats.stats_fields.timestamp.distinctValues)
            }).catch((error: any) => {
                return reject(error)
            });
        })
    }
    */
    
    getAggregatedValueForEachTimestamp = (selectedMeasure: string, aggregationType: AggregationType, solrCore: string): any => {
        return httpClient.get("http://localhost:5000/dummy/data")
    }
    /*
    getAggregatedValueForEachTimestamp = (selectedMeasure: string, aggregationType: AggregationType, solrCore: string): any => {
        const query = {
            "query": "*:*",
            "limit": this.resultLimit,
            "facet": {
                "timestamps": {
                    "type": "terms",
                    "field": "timestamp",
                    "sort": "index",
                    "limit": this.resultLimit,
                    "facet": {
                        "value": aggregationType + "(" + selectedMeasure + ")",
                    }
                }
            }
        }
        const url = this.solrBaseUrl + solrCore + "/query";

        return new Promise((resolve, reject) => {
            httpClient.post(url, query).then((data: any) => {
                let timestamps: any[] = data.data.facets.timestamps.buckets
                let newObj: object[] = []
                timestamps.map(el => {
                    newObj.push({ "timestamp": el.val, "count": el.value })
                })
                return resolve(newObj)
            }).catch((error: any) => {
                return reject(error)
            });
        })
    }

    /*
    getMaxValueOfTwoCores = (from: string, to: string, selectedMeasure: string): any => {
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
    }
    */
    getMaxValueOfTwoCores = (from: string, to: string, selectedMeasure: string): any => {

        const url = this.host + this.elasticsearchIndex + "/" + from + "/" + to + "/" + selectedMeasure;
        const urlForecast = this.host + this.elasticsearchForecastIndex + "/" + from + "/" + to + "/" + selectedMeasure;

        let maxValue: number;

        return new Promise((resolve, reject) => {
            httpClient.get(url)
                .then(data => {
                    let maxValue = data.data.message[0]._source.cpuusage_ps
                    console.log(maxValue)
                    httpClient.get(urlForecast)
                        .then(forecastData => {
                            const forecastMax: number = forecastData.data.message[0]._source.cpuusage_ps
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
    }
}
