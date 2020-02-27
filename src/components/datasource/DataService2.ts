import DataSource from '../../model/DataSource'
import AggregationType from '../../model/AggregationType'
import DataSourceService from '../../model/DataSourceService'
import SolrDataService from './service/solr/SolrDataService'
import ElasticsearchDataService from './service/elasticsearch/ElasticsearchDataService'

export default class DataService {

    private dataSourceService: DataSourceService
    private from: string
    private to: string
    private selectedMeasure: string
    private aggregationType: AggregationType

    constructor(dataSource: DataSource, from: string, to: string, elasticsearchIndex: string, elasticsearchForecastIndex: string, elasticsearchMergedIndex: string, selectedMeasure: string, aggregationType: AggregationType) {
        this.from = from
        this.to = to
        this.selectedMeasure = selectedMeasure
        this.aggregationType = aggregationType
        if (dataSource === 'solr') {
            //this.dataSourceService = new SolrDataService(solrBaseUrl, solrCore, solrForecastCore, solrMergedCore)
        } else if (dataSource === 'elasticsearch') {
            this.dataSourceService = new ElasticsearchDataService(elasticsearchIndex, elasticsearchForecastIndex, elasticsearchMergedIndex)
        } else if (dataSource === 'prometheus') {

        } else {

        }
    }

    getHistorical = (from: string, to: string): any => {
        
    };

    getForecast = (from: string, to: string): any => {
        
    };

    getAllHistorical = () => {
       
    }
        

    getMaxValueOfTwoCores = (from: string, to: string, selectedMeasure: string): any => {
        
    }
}
