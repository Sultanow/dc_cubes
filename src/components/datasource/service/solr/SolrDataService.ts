import httpClient from 'axios';

export default class SolrDataService {

    /**
    * Query the Solr index for the specified date interval. Default value for endDateTime is today's date.
    * The Solr instance needs to send the appropriate CORS headers. 
    * More information: https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/
    */
    getLogDataFromSolr = (baseUrl:string, selectedCore:string, startDateTime: string, endDateTime: string = new Date().toISOString().split('.')[0] + 'Z'): any => {
        //const sortBy = '&sort=timestamp+asc'
        //const query = 'q=*:*&fq=timestamp:[' + startDateTime + ' TO ' + endDateTime + ']' + sortBy;
        const query = '/dc_cubes/query?q=*:*&start=0&rows=30000';
        return httpClient.get(baseUrl.concat(query));
    };

    getAggregatedLogDataFromSolr = (startDate: string, endDate: string, typeOfAggregation: string) => {
        // TODO: implement aggregation queries
    };

    getAllSolrCores = () => {

    };
}
