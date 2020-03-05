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
        return httpClient.get("http://localhost:5000/" + this.elasticsearchIndex + "/" + from + "/" + to)
    };

    getForecast = (from: string, to: string): any => {
        return httpClient.get("http://localhost:5000/" + this.elasticsearchForecastIndex + "/" + from + "/" + to)
    }

    getAllHistorical = () => {
        return httpClient.get("http://localhost:5000/" + this.elasticsearchIndex)
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

        
        const url = "http://localhost:5000/" + this.elasticsearchIndex + "/" + from + "/" + to + "/" + selectedMeasure;
        const urlForecast = "http://localhost:5000/" + this.elasticsearchForecastIndex + "/" + from + "/" + to + "/" + selectedMeasure;

        let maxValue: number;

        return new Promise((resolve, reject) => {
            httpClient.get(url)
                .then(data => {
                    let maxValue = data.data.message[0]._source.count
                    httpClient.get(urlForecast)
                        .then(forecastData => {
                            const forecastMax: number = forecastData.data.message[0]._source.count
                            if (forecastMax !== undefined && maxValue < forecastMax){
                                maxValue = forecastMax
                            }
                            return resolve(maxValue)
                        }).catch((error: any) => {
                            return resolve(maxValue)
                        });
                }).catch((error: any) => {
                    return reject(error)
                });
        })

        /*
        return new Promise((resolve, reject) => {
            httpClient.get(url)
                .then(data => {
                    return resolve(data)
                }).catch((error: any) => {
                    return reject(error)
                })
        })
        */
        
        
    }

    
}
