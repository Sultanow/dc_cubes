import DataSource from '../../model/DataSource'
import AggregationType from '../../model/AggregationType'
import DataSourceService from '../../model/DataSourceService'
import SolrDataService from './service/solr/SolrDataService'

export default class DataService {

    private dataSourceService: DataSourceService
    private from: string
    private to: string

    constructor(dataSource: DataSource, from: string, to: string, solrBaseUrl: string, solrCore: string, solrForecastCore: string) {
        this.from = from
        this.to = to

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

    getAggregatedLogDataFromSolr = (startDate: string, endDate: string, aggregationType: AggregationType) => {
        // TODO: implement aggregation queries
    };

    getAllSolrCores = () => {

    };
}