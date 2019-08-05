import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DataStatusService {
  baseUrl =  'http://localhost:8983/solr/test/query?';
  currentquerie = "q=*:*&start=0&rows=30000&sort=id+desc"
  constructor(private httpClient: HttpClient) { }


  setUrl (url:string) {
    this.baseUrl = url
  }

  getUrl (){
    return this.baseUrl
  }

  setCurrentquery (query){
    this.currentquerie = query
  }

  getCurrentquery (){
    return this.currentquerie
  }


  getInitialData() {
    return this.httpClient.get(this.baseUrl.concat(this.currentquerie))

    //return this.httpClient.get("http://localhost:8983/solr/test/query?q=*:*&fq=timestamp:[2018-08-01T00:00:00Z%20TO%202018-08-05T00:15:00Z]&sort=id+desc")
    //return this.httpClient.get("http://localhost:8983/solr/test/query?q=*:*&fq=timestamp:[2018-08-01T00:00:00Z%20TO%20*]&sort=id+desc")
    return(this.httpClient.get("q=*:*&start=0&rows=30000&sort=id+desc"))
  }
  
}
