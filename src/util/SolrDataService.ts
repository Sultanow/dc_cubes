import httpClient from 'axios';

export default class SolrDataService {
    baseUrl = 'http://localhost:8983/solr/test/query?';

    /**
    * Query the Solr index for the specified date interval. Default value for endDateTime is today's date.
    * The Solr instance needs to send the appropriate CORS headers. 
    * More information: https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/
    */
    getLogDataFromSolr = (startDateTime:string, endDateTime:string = new Date().toISOString().split('.')[0]+'Z'): any => {
        const sortBy = '&sort=timestamp+asc'
        const query = 'q=*:*&fq=timestamp:[' + startDateTime + ' TO ' + endDateTime + ']' + sortBy;
        return httpClient.get(this.baseUrl.concat(query));
    };

    getAggregatedLogDataFromSolr = (startDate:Date, endDate:Date, typeOfAggregation:string) => {
        // TODO: implement aggregation queries
    };
}
