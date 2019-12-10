import httpClient from 'axios';
import AggregationType from '../../../../model/AggregationType'
import DataSourceService from '../../../../model/DataSourceService'

export default class SolrDataService implements DataSourceService {

    solrBaseUrl: string;
    solrCore: string;
    solrForecastCore: string;
    resultLimit = 2147483647 // Maximum of integer type

    constructor(solrBaseUrl: string, solrCore: string, solrForecastCore: string) {
        this.solrBaseUrl = solrBaseUrl;
        this.solrCore = solrCore;
        this.solrForecastCore = solrForecastCore;
    }

    /**
    * Query the Solr index for the specified date interval. Default value for endDateTime is today's date.
    * The Solr instance needs to send the appropriate CORS headers. 
    * More information: https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/
    */
    getLogData = (from: string, to: string): any => {
        const query = '/query?q=*:*&fq=timestamp:[' + from + ' TO ' + to + ']&sort=timestamp+asc&rows=' + this.resultLimit;
        const url = this.solrBaseUrl + this.solrCore + query;
        return httpClient.get(url);
    };

    getForecast = (from: string, to: string): any => {
        const query = '/query?q=*:*&fq=timestamp:[' + from + ' TO ' + to + ']&sort=timestamp+asc&rows=' + this.resultLimit;
        const url = this.solrBaseUrl + this.solrForecastCore + query;
        return httpClient.get(url);
    };

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
                let timestamps = data.data.facets.timestamps.buckets
                let newObj = []
                timestamps.map(el => {
                    newObj.push({"timestamp": el.val, "count": el.value})
                })
                return resolve(newObj)
            }).catch((error: any) => {
                return reject(error)
            });
        })
    }


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
        
        let maxValue;
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

    getAggregatedLogDataFromSolr = (startDate: string, endDate: string, aggregationType: AggregationType) => {
        // TODO: implement aggregation queries
    };

    getAllSolrCores = () => {

    };

    renameProp = (
        oldProp,
        newProp,
    { [oldProp]: old, ...others }
    ) => ({
        [newProp]: old,
        ...others
    })
}
