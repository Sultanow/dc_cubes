import AggregationType from "./AggregationType";

interface DataSourceService {
    getHistorical: (from: string, to: string) => Promise<object>
    getAllHistorical: () => Promise<object>
    getAggregatedLogData: (from: string, to: string, selectedMeasure: string, aggregationType: AggregationType) => Promise<object>
    getForecast: (from: string, to: string) => Promise<object>
<<<<<<< HEAD
    getMaxValueOfTwoCores: (from: string, to: string, selectedMeasure: string) => Promise<object>
    getDistinctTimestamps: (idex: string) => Promise<number[]>
    getAggregatedValueForEachTimestamp: (selectedMeasure: string, aggregationType: AggregationType, esIndex: string) => Promise<object>
=======
    getMaxValueOfTwoCores: (from: string, to: string, selectedMeasure: string) => Promise<number>
    getDistinctTimestamps: (core: string) => Promise<string[]>
    getAggregatedValueForEachTimestamp: (selectedMeasure: string, aggregationType: AggregationType, solrCore: string) => Promise<object>
>>>>>>> master
}

export default DataSourceService