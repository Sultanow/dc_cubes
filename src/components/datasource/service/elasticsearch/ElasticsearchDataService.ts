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
        httpClient.get("http://localhost:5000/" + this.elasticsearchIndex + "indices/from/" + from + "/to/" + to)
            .then(response => {
                return response
            }).catch((error) => {
                console.log(error);
            })
    };

    getForecast = (from: string, to: string): any => {
        httpClient.get("http://localhost:5000/" + this.elasticsearchForecastIndex + "indices/from/" + from + "/to/" + to)
            .then(response => {
                return response
            }).catch((error) => {
                console.log(error);
            })
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
       
    }


    getMaxValueOfTwoCores = (from: string, to: string, selectedMeasure: string): any => {
       
    }

    
}
