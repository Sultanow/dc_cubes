import httpClient from 'axios';

export default class SolrDataService {
    baseUrl = 'http://localhost:8983/solr/test/query?';
    currentquerie = "q=*:*&start=0&rows=30000&sort=id+desc";

    getInitialData() {
        console.log('Running getInitialData');
        httpClient.get(this.baseUrl.concat(this.currentquerie))
            .then(function (response) {
                // handle success
                console.log('Http Request to Solr successful');
                return response;
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
                // always executed
            });
        // return this.httpClient.get(this.baseUrl.concat(this.currentquerie))
    };
}
