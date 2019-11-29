interface DataSourceService {
    getLogData: (from: string, to: string) => Promise<object>
    getForecast: (from: string, to: string) => Promise<object>
}

export default DataSourceService