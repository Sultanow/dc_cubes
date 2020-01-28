import AggregationType from "./AggregationType";

interface DataSourceService {
    getLogData: (from: string, to: string) => Promise<object>
    getForecast: (from: string, to: string) => Promise<object>
    getMaxValueOfTwoCores: (from: string, to: string, selectedMeasure: string) => Promise<number>
    getDistinctTimestamps: (core: string) => Promise<number[]>
    getAggregatedValueForEachTimestamp: (selectedMeasure: string, aggregationType: AggregationType, solrCore: string) => Promise<object>
}

export default DataSourceService