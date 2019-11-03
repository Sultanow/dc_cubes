import httpClient from 'axios';

export default class SolrDataService {

    backendUrl: string

    constructor(backendUrl: string) {
        this.backendUrl = backendUrl
    }

    /**
    * Query the Solr index for the specified date interval. Default value for endDateTime is today's date.
    * The Solr instance needs to send the appropriate CORS headers. 
    * More information: https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/
    */
    getLogDataFromSolr = (solrQuery:string): any => {
        //const sortBy = '&sort=timestamp+asc'
        //const query = 'q=*:*&fq=timestamp:[' + startDateTime + ' TO ' + endDateTime + ']' + sortBy;
        const url = this.backendUrl + "/historical/?" + encodeURIComponent("solrQuery") + '=' + encodeURIComponent(solrQuery)
        return httpClient.get(url);
    };
        
    getAggregatedLogDataFromSolr = (startDate: string, endDate: string, typeOfAggregation: string) => {
        // TODO: implement aggregation queries
    };

    getAllSolrCores = () => {

    };
}
