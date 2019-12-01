import AggregationType from "./AggregationType"

interface DataSourceService {
    getLogData: (from: string, to: string) => Promise<object>
    getAllLogData: () => Promise<object>
    getAggregatedLogData: (from: string, to: string, selectedMeasure: string, aggregationType: AggregationType) => Promise<object>
}

export default DataSourceService