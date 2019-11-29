import httpClient from 'axios';
import AggregationType from '../../../../model/AggregationType'
import DataSourceService from '../../../../model/DataSourceService'

export default class SolrDataService implements DataSourceService {

    solrBaseUrl: string;
    solrCore: string;
    solrForecastCore: string;

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
        const query = '/query?q=*:*&fq=timestamp:[' + from + ' TO ' + to + ']' + '&sort=timestamp+asc' + '&rows=2147483647';
        const url = this.solrBaseUrl + this.solrCore + query;
        return httpClient.get(url);
    };

    getForecast = (from: string, to: string): any => {
        const query = '/query?q=*:*&fq=timestamp:[' + from + ' TO ' + to + ']' + '&sort=timestamp+asc' + '&rows=2147483647';
        const url = this.solrBaseUrl + this.solrForecastCore + query;
        return httpClient.get(url);
    };


    getAggregatedLogDataFromSolr = (startDate: string, endDate: string, aggregationType: AggregationType) => {
        // TODO: implement aggregation queries
    };

    getAllSolrCores = () => {

    };
}
