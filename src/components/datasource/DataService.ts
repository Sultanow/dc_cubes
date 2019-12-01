import DataSource from '../../model/DataSource'
import AggregationType  from '../../model/AggregationType'
import DataSourceService from '../../model/DataSourceService'
import SolrDataService from './service/solr/SolrDataService'

export default class DataService {

    private dataSourceService: DataSourceService
    private from: string
    private to: string
    private selectedMeasure: string
    private aggregationType: AggregationType

    constructor(dataSource: DataSource, from: string, to: string, selectedMeasure: string, aggregationType: AggregationType, solrBaseUrl: string, solrCore: string) {
        this.from = from
        this.to = to
        this.selectedMeasure = selectedMeasure
        this.aggregationType = aggregationType
        
        if (dataSource === 'solr') {
            this.dataSourceService = new SolrDataService(solrBaseUrl, solrCore)
        } else if (dataSource === 'elasticsearch') {

        } else if (dataSource === 'prometheus') {
        
        } else {

        }
    }

    getLogData = () => {
        return this.dataSourceService.getLogData(this.from, this.to)
    }

    getAllLogData = () => {
        return this.dataSourceService.getAllLogData()
    }
        
    getAggregatedLogData = () => {
        return this.dataSourceService.getAggregatedLogData(this.from, this.to, this.selectedMeasure, this.aggregationType)
    }
}