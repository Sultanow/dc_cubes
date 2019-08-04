
export class DataService {
  baseUrl =  'http://localhost:8983/solr/test/query?';
  currentquerie = "q=*:*&start=0&rows=30000&sort=id+desc"
  constructor(private httpClient: HttpClient) { } // this is the http client from angular, TODO: find an http client implementation/caller for react
  getInitialData() {
    return this.httpClient.get(this.baseUrl.concat(this.currentquerie))

  }
}
