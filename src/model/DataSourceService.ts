interface DataSourceService {
    getLogData: (from: string, to: string) => Promise<object>
    getForecast: (from: string, to: string) => Promise<object>
    getMaxValueOfTwoCores: (from: string, to: string, selectedMeasure: string) => Promise<number>
    getDistinctTimestamps: (core: string) => Promise<number[]>
}

export default DataSourceService