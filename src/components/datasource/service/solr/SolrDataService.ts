import httpClient from 'axios';
import AggregationType from '../../../../model/AggregationType'
import DataSourceService from '../../../../model/DataSourceService'

export default class SolrDataService implements DataSourceService {

    solrBaseUrl: string
    solrCore: string
    resultLimit = 2147483647 // Maximum of integer type

    constructor(solrBaseUrl: string, solrCore: string) {
        this.solrBaseUrl = solrBaseUrl
        this.solrCore = solrCore
    }

    /**
    * Query the Solr index for the specified date interval. Default value for endDateTime is today's date.
    * The Solr instance needs to send the appropriate CORS headers. 
    * More information: https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/
    */
    getLogData = (from: string, to: string): any => {
        const query = '/query?q=*:*&fq=timestamp:[' + from + ' TO ' + to + ']&sort=timestamp+asc&rows=' + this.resultLimit
        const url = this.solrBaseUrl + this.solrCore + query
        return httpClient.get(url)
    }

    getAllLogData = () => {
        const query = '/query?q=*:*&sort=timestamp+asc&rows=' + this.resultLimit
        const url = this.solrBaseUrl + this.solrCore + query
        return httpClient.get(url)
    }
        
    getAggregatedLogData = (from: string, to: string, selectedMeasure: string, aggregationType: AggregationType) => {
        const query = {
            "query": "*:*",
            "filter": "timestamp:[" + from + " TO " + to + "]",
            "limit": this.resultLimit,
            "facet": {
                "datacenters": {
                    "type": "terms",
                    "field": "dc",
                    "limit": this.resultLimit,
                    "facet": {
                        "clusters": {
                            "type": "terms",
                            "field": "cluster",
                            "limit": this.resultLimit,
                            "facet": {
                                "instances": {
                                    "type": "terms",
                                    "field": "instanz",
                                    "limit": this.resultLimit,
                                    "facet" : {
                                        "aggregatedValue" : aggregationType + "(" + selectedMeasure + ")",
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const url = this.solrBaseUrl + this.solrCore + "/query"
        return httpClient.post(url, query);
    }
}
