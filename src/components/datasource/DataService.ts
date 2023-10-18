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

    constructor(dataSource: DataSource, from: string, to: string, solrBaseUrl: string, solrCore: string, solrForecastCore: string, solrMergedCore: string, selectedMeasure: string, aggregationType: AggregationType) {
        this.from = from
        this.to = to
        this.selectedMeasure = selectedMeasure
        this.aggregationType = aggregationType
        if (dataSource === 'solr') {
            this.dataSourceService = new SolrDataService(solrBaseUrl, solrCore, solrForecastCore, solrMergedCore)
        } else if (dataSource === 'elasticsearch') {
            this.dataSourceService = new ElasticsearchDataService(solrBaseUrl, solrCore, solrForecastCore)
        } else if (dataSource === 'prometheus') {

        } else {

        }
    }

    // Get log data for specific time interval
    getHistorical = () => {
        return this.dataSourceService.getHistorical(this.from, this.to);
    }

    // Get all available log data
    getAllHistorical = () => {
        return this.dataSourceService.getAllHistorical()
    }
        
    getAggregatedLogData = () => {
        return this.dataSourceService.getAggregatedLogData(this.from, this.to, this.selectedMeasure, this.aggregationType)
    }

    getForecast = () => {
        return this.dataSourceService.getForecast(this.from, this.to);
    }

    getMaxValueOfTimeseries = () => {
        return this.dataSourceService.getMaxValueOfTwoCores(this.from, this.to, this.selectedMeasure)
    }

    getAggregatedValueForEachTimestamp = (aggregationType: AggregationType, core: string) => {
        return this.dataSourceService.getAggregatedValueForEachTimestamp(this.selectedMeasure, aggregationType, core)
    }

    getDistinctTimestamps = (core: string) => {
        return this.dataSourceService.getDistinctTimestamps(core)
    }
}