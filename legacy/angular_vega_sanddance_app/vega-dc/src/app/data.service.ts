import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseUrl =  'http://localhost:8983/solr/test/query?';
  currentquerie = "q=*:*&start=0&rows=30000&sort=id+desc"
  constructor(private httpClient: HttpClient) { }

  getInitialData() {
    return this.httpClient.get(this.baseUrl.concat(this.currentquerie))

  }
}
