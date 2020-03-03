import httpClient from 'axios';
import AggregationType from '../../../../model/AggregationType'
import DataSourceService from '../../../../model/DataSourceService'


export default class ElasticsearchDataService implements DataSourceService {

    elasticsearchIndex: string;
    elasticsearchForecastIndex: string;
    elasticsearchMergedIndex: string;

    constructor(elasticsearchIndex: string, elasticsearchForecastIndex: string, elasticsearchMergedIndex: string) {
        this.elasticsearchIndex = elasticsearchIndex;
        this.elasticsearchForecastIndex = elasticsearchForecastIndex;
        this.elasticsearchMergedIndex = elasticsearchMergedIndex;
    }

    getHistorical = (from: string, to: string): any => {
        return httpClient.get("http://localhost:5000/indices/" + this.elasticsearchIndex + "/from/" + from + "/to/" + to)
    };

    getForecast = (from: string, to: string): any => {
        return httpClient.get("http://localhost:5000/indices/" + this.elasticsearchForecastIndex + "/from/" + from + "/to/" + to)
    }

    getAllHistorical = () => {
        return httpClient.get("http://localhost:5000/indices/" + this.elasticsearchIndex)
    }
        
    // TODO
    getAggregatedLogData = (from: string, to: string, selectedMeasure: string, aggregationType: AggregationType) => {
        const query = {

        }
        const url = "/query"
        return httpClient.post(url, query);
    }

    getDistinctTimestamps = (core: string): any => {
        
    }

    getAggregatedValueForEachTimestamp = (selectedMeasure: string, aggregationType: AggregationType, solrCore: string): any => {
        return httpClient.get("http://localhost:5000/dummy/data")
    }


    getMaxValueOfTwoCores = (from: string, to: string, selectedMeasure: string): any => {
        //return httpClient.get("http://localhost:5000/dummy/data")

        
        const url = "http://localhost:5000/indices/" + this.elasticsearchIndex + "/from/" + from + "/to/" + to + "/count/max";
        const urlForecast = "http://localhost:5000/indices/" + this.elasticsearchForecastIndex + "/from/" + from + "/to/" + to + "/count/max"

        return new Promise((resolve, reject) => {
            httpClient.get(url)
                .then(data => {
                    return resolve(data)
                }).catch((error: any) => {
                    return reject(error)
                })
        })
        
        /*
        return new Promise((resolve, reject) => {
            httpClient.get(url).then((data: any) => {
                //maxValue = data.hits.hits[0]._source.count
                return resolve(data.hits.hits[0]._source.count) 
            });
        })
        */
    }

    
}
