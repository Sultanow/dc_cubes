import DataSource from '../../model/DataSource'
import AggregationType from '../../model/AggregationType'
import DataSourceService from '../../model/DataSourceService'
import SolrDataService from './service/solr/SolrDataService'

export default class DataService {

    private dataSourceService: DataSourceService
    private from: string
    private to: string
    private selectedMeasure: string
    private aggregationType: AggregationType

    constructor(dataSource: DataSource, from: string, to: string, solrBaseUrl: string, solrCore: string, solrForecastCore: string, selectedMeasure: string, aggregationType: AggregationType) {
        this.from = from
        this.to = to
        this.selectedMeasure = selectedMeasure
        this.aggregationType = aggregationType
        if (dataSource === 'solr') {
            this.dataSourceService = new SolrDataService(solrBaseUrl, solrCore, solrForecastCore)
        } else if (dataSource === 'elasticsearch') {

        } else if (dataSource === 'prometheus') {

        } else {

        }
    }

    getLogData = () => {
        return this.dataSourceService.getLogData(this.from, this.to);
    };

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

    getAggregatedLogDataFromSolr = (startDate: string, endDate: string, aggregationType: AggregationType) => {
        // TODO: implement aggregation queries
    };

    getAllSolrCores = () => {

    };
}