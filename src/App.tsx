import React from 'react'
import { BrowserRouter, Route } from "react-router-dom"
import { Alert, Container } from 'react-bootstrap'
import './App.css'
import httpClient from 'axios';
import SidebarNew from './components/SidebarNew'
import CubesVisualization from './components/visualization3d/CubesVisualization'
import TimeseriesNavigationChart from './components/visualization2d/TimeseriesNavigationChart'
import Topbar from './components/topbar/Topbar'
import SectionRight from "./components/SectionRight"
import DataSources from './components/datasource/config/DataSources'
import DataService from './components/datasource/DataService'
import StandardAdapter from './components/datasource/service/StandardAdapter'
import DCState from './model/DCState'
import DataSource from './model/DataSource'
import AggregationType from './model/AggregationType'

interface TimeseriesData {
  timestamp: string,
  count: number
}

interface AppState {
  elasticsearchIndex: string, 
  logData: []
  backendUrl: string
  dataSource: DataSource
  solrBaseUrl: string
  solrCore: string
  solrForecastCore: string
  solrMergedCore: string
  solrQuery: string
  dataSourceError: boolean

  timeSelectionMode: 'pointInTime' | 'timespan'
  timespanAbsoluteTimestampLowerBound: string
  timespanAbsoluteTimestampUpperBound: string
  timespanTimestampLowerBound: string
  timespanTimestampUpperBound: string
  pointInTimeTimestamp: string

  // the current temporal axis
  temporalAxis: string[]
  // tempAxis including the historic Data
  historicTemporalAxis: string[]
  // tempAxis including the histroic+prediction Data
  combinedTemporalAxis: string[]
  timeSeries: Map<string, DCState>
  combinedTimeSeries: Map<string, DCState>
  clusterColors: object
  grid: Map<string, Array<number>>
  maxH: number

  isRawTimeseriesDataLoaded: boolean
  intervalId: any
  rawTimeseriesData: any
  timespanError: boolean
  isLoading: boolean

  selectedMeasure: string
  customMapping: any
  aggregationType: AggregationType
  aggregatedData: DCState

  predictionActivated: boolean
  forecastDataReceived: boolean
  rawForecastData: any,
  isRawForecastDataLoaded: boolean
  // tempAxis including the forecast Data
  forecastTemporalAxis: string[]
  forecastTimeSeries: Map<string, DCState>
  forecastGrid: Map<string, Array<number>>
  forecastMaxH: number
  preparedAvgData: TimeseriesData[]
  preparedMinData: TimeseriesData[]
  preparedMaxData: TimeseriesData[]
  preparedCombinedAvgData: TimeseriesData[]
}

class App extends React.Component<{}, AppState> {

  private aggregationTypes = { "avg": "Mittelwert", "sum": "Summe", "max": "Maximum", "min": "Minimum" }
  private listOfAllMeasures = {
    "count": "Auslastung",
    "minv": "minv",
    "maxv": "maxv",
    "dev_low": "dev_low",
    "dev_upp": "dev_upp"
  }

  constructor(props: object) {
    super(props)
    // Set initial lower bound of timespan by subtracting days
    const upperBoundDate: Date = new Date(2020, 0, 25);
    const lowerBoundDate: Date = new Date(2020, 0, 21);
    // lowerBoundDate.setDate(upperBoundDate.getDate() - 3);

    this.state = {
      elasticsearchIndex: "dc_cubes_historic",

      logData: [],
      backendUrl: "http://localhost:8080",
      dataSource: 'solr',
      solrBaseUrl: 'http://localhost:8983/solr/',
      solrCore: 'dc_cubes_historic',
      solrForecastCore: 'dc_cubes_forecast',
      solrMergedCore: 'dc_cubes_merged',
      solrQuery: '/query?q=*:*&start=0&rows=100000', // solr contains 4 weeks, roughly 90k entries
      dataSourceError: true,
      timeSelectionMode: 'pointInTime',
      timespanAbsoluteTimestampLowerBound: lowerBoundDate.toISOString().split('.')[0] + "Z",
      timespanAbsoluteTimestampUpperBound: upperBoundDate.toISOString().split('.')[0] + "Z",
      timespanTimestampLowerBound: lowerBoundDate.toISOString().split('.')[0] + "Z",
      timespanTimestampUpperBound: upperBoundDate.toISOString().split('.')[0] + "Z",
      pointInTimeTimestamp: "",
      temporalAxis: [],
      historicTemporalAxis: [],
      combinedTemporalAxis: [],
      timeSeries: new Map(),
      combinedTimeSeries: new Map(),
      clusterColors: {},
      grid: new Map(),
      maxH: 0,
      rawTimeseriesData: null,
      rawForecastData: null,
      isRawTimeseriesDataLoaded: false,
      intervalId: undefined,
      timespanError: false,
      isLoading: true,
      selectedMeasure: "cpuusage_ps",
      aggregationType: "avg",
      aggregatedData: null,
      customMapping: (element: object, selectedMeasure: string) => {
        const strTimeStamp: string = element["timestamp"];
        const strCluster: string = element["cluster"];
        const strDataCenter: string = element["dc"];
        const strInstance: string = element["instanz"];
        const strSelectedMeasure: string = element[selectedMeasure];
        return { strTimeStamp, strCluster, strDataCenter, strInstance, strSelectedMeasure }
      },
      predictionActivated: false,
      forecastDataReceived: false,
      isRawForecastDataLoaded: false,
      forecastTemporalAxis: [],
      forecastTimeSeries: new Map(),
      forecastGrid: new Map(),
      forecastMaxH: 0,
      preparedAvgData: [],
      preparedMinData: [],
      preparedMaxData: [],
      preparedCombinedAvgData: [],
    };
  }

  componentDidMount() {
    // Get config from server if available
    this.init();
    // Get initial log data based on default values
    this.getLogData();
  }

  init = () => {

  }

  getLogData = () => {
    const dataService = new DataService(this.state.dataSource,
      this.state.timespanAbsoluteTimestampLowerBound,
      this.state.timespanAbsoluteTimestampUpperBound,
      this.state.solrBaseUrl,
      this.state.solrCore,
      this.state.solrForecastCore,
      this.state.solrMergedCore,
      this.state.selectedMeasure,
      this.state.aggregationType)
    // Initially get all data because the placeholder visualization needs the full temporalAxis
    dataService.getHistorical().then((data: any) => {
      // TODO: call dataparser from util folder in order to parse the log data
      const standardAdapter = new StandardAdapter();

      standardAdapter.receivedData(data, this.state.customMapping, this.state.selectedMeasure)

      if (data.data.response.docs.length < 2) {
        this.setState({ dataSourceError: true });
        throw new Error("Data not available");
      }

      this.setState({
        historicTemporalAxis: standardAdapter.temporalAxis,
        temporalAxis: standardAdapter.temporalAxis,
        timeSeries: standardAdapter.timeSeries,
        clusterColors: standardAdapter.clusterColors,
        grid: standardAdapter.grid,
        maxH: standardAdapter.maxh,
        dataSourceError: false,
        isLoading: false, // still need to load forecast data
        // raw timesereis Data for 2d graph 
        rawTimeseriesData: standardAdapter.rawTimeSeriesData,
        isRawTimeseriesDataLoaded: true,
      });

      // Load prediction data on demand
      if (this.state.predictionActivated) {
        dataService.getForecast().then((data: any) => {
          const standardAdapter = new StandardAdapter();
          standardAdapter.receivedData(data, this.state.customMapping, this.state.selectedMeasure);

          if (data.data.response.docs.length < 2) {
            this.setState({ dataSourceError: true });
            throw new Error("Data not available");
          }

          this.setState({
            forecastTemporalAxis: standardAdapter.temporalAxis,
            combinedTemporalAxis: this.state.temporalAxis.concat(standardAdapter.temporalAxis),
            forecastTimeSeries: standardAdapter.timeSeries,
            combinedTimeSeries: new Map([...Array.from(this.state.timeSeries.entries()), ...Array.from(standardAdapter.timeSeries.entries())]),
            forecastGrid: standardAdapter.grid,
            forecastMaxH: standardAdapter.maxh,
            dataSourceError: false,
            isLoading: false,
            // raw timesereis Data for 2d graph 
            rawForecastData: standardAdapter.rawTimeSeriesData,
            isRawForecastDataLoaded: true,
            forecastDataReceived: true
          });
        }).catch((error: any) => {
          this.setState({ dataSourceError: true })
          console.log(error)
        });
      }
    }).catch((error: any) => {
      this.setState({ dataSourceError: true })
      console.log(error)
    });

    dataService.getMaxValueOfTimeseries().then((maxValue: number) => {
      this.setState({ maxH: maxValue })
    }).catch((error: any) => {
      console.log(error)
    });

    this.getAggregatedLogData()
  }

  getAggregatedLogData = () => {
    const dataService = new DataService(this.state.dataSource,
      this.state.timespanTimestampLowerBound,
      this.state.timespanTimestampUpperBound,
      this.state.solrBaseUrl,
      this.state.solrCore,
      this.state.solrForecastCore,
      this.state.solrMergedCore,
      this.state.selectedMeasure,
      this.state.aggregationType)

    dataService.getAggregatedLogData().then((data: any) => {
      const standardAdapter = new StandardAdapter()
      let strTimeStamp = "timespan"

      data.data.facets.datacenters.buckets.forEach(strDataCenter => {
        strDataCenter.clusters.buckets.forEach(strCluster => {
          strCluster.instances.buckets.forEach(strInstance => {
            standardAdapter.buildTimeSeries(strTimeStamp, strCluster.val, strDataCenter.val, strInstance.val, String(Math.round(strInstance.aggregatedValue)))
          })
        })
      })
      this.setState<never>({ aggregatedData: standardAdapter.timeSeries.get(strTimeStamp), isLoading: false })
    }).catch((error: any) => {
      this.setState({ dataSourceError: true })
      console.log(error)
    })
  }


  updatePredictions = () => {
    console.log("update predicitons called")
    httpClient.get("http://localhost:8080/startscript").then((data: any) => {
      console.log("Update Predictions answer: " + data.data);
    })
  }

  render() {
    let TimeseriesNavigationChartComponent = null;
    if (this.state.isRawTimeseriesDataLoaded) {
      TimeseriesNavigationChartComponent = <TimeseriesNavigationChart
        timeseriesData={this.state.rawTimeseriesData}
        forecastData={this.state.rawForecastData}
        updateTimespanTimestamps={this.updateTimespanTimestamps}
        updatePointInTimeTimestamp={this.updatePointInTimeTimestamp}
        showPrediction={this.state.predictionActivated}
        forecastReceived={this.state.forecastDataReceived}
        forecastTemporalAxis={this.state.forecastTemporalAxis}
        temporalAxis={this.state.temporalAxis}
        combinedTemporalAxis={this.state.combinedTemporalAxis}
        maxH={this.state.maxH}
        preparedAvgData={this.state.preparedAvgData}
        preparedMinData={this.state.preparedMinData}
        preparedMaxData={this.state.preparedMaxData}
        preparedCombinedAvgData={this.state.preparedCombinedAvgData}
        selectedMeasure={this.state.selectedMeasure}
        dataSourceError={this.state.dataSourceError}
      />
    }

    let cubesVisData = this.state.timeSeries.get(this.state.pointInTimeTimestamp);
    let topbarTimeSeries = this.state.timeSeries

    if (this.state.predictionActivated) {
      if (this.state.combinedTimeSeries.get(this.state.pointInTimeTimestamp) !== null) {
        cubesVisData = this.state.combinedTimeSeries.get(this.state.pointInTimeTimestamp);
      }
      topbarTimeSeries = this.state.combinedTimeSeries;
    }

    // Check if timespan or pointInTime mode is selected and select the data for 3D visualization accordingly
    if (this.state.aggregatedData !== undefined && this.state.timeSelectionMode === "timespan") {
      cubesVisData = this.state.aggregatedData
    }
    return (
      <BrowserRouter>
        <div className="App">
          {/* <Sidebar dataSource={this.state.dataSource} /> */}
          <SidebarNew dataSource={this.state.dataSource}>
            <Topbar getLogData={this.getLogData}
              accessApp={this.accessApp}
              temporalAxis={this.state.temporalAxis}
              timeSeries={topbarTimeSeries}
              timeSelectionMode={this.state.timeSelectionMode}
              timespanAbsoluteTimestampLowerBound={this.state.timespanAbsoluteTimestampLowerBound}
              timespanAbsoluteTimestampUpperBound={this.state.timespanAbsoluteTimestampUpperBound}
              pointInTimeTimestamp={this.state.pointInTimeTimestamp}
              updateBoundariesForDataRetrieval={this.updateBoundariesForDataRetrieval}
              clearIntervalOfDataRefresh={this.clearIntervalOfDataRefresh}
              changeIntervalOfDataRefresh={this.changeIntervalOfDataRefresh}
              predictionActivated={this.state.predictionActivated}
              handlePredictionActivated={this.handlePredictionActivated}
              handlePredictionDeactivated={this.handlePredictionDeactivated}
              updatePredictions={this.updatePredictions}
            />

            <Route exact path="/" render={
              (props) =>
                <React.Fragment>
                  <div className="content-row" >
                    <CubesVisualization {...props}
                      data={cubesVisData}
                      aggregatedData={this.state.aggregatedData}
                      clusterColors={this.state.clusterColors}
                      grid={this.state.grid}
                      maxH={this.state.maxH}
                      timeSelectionMode={this.state.timeSelectionMode}
                      accessApp={this.accessApp}
                      temporalAxis={this.state.temporalAxis}
                      dataSourceError={this.state.dataSourceError}
                      isLoading={this.state.isLoading}
                      pointInTimeTimestamp={this.state.pointInTimeTimestamp}
                      timespanTimestampLowerBound={this.state.timespanTimestampLowerBound}
                      timespanTimestampUpperBound={this.state.timespanTimestampUpperBound}
                      lastHistoricDate={new Date(this.state.historicTemporalAxis[this.state.historicTemporalAxis.length - 1])}
                      aggregationType={this.state.aggregationType}
                      updateAggregationType={this.updateAggregationType}
                      selectedMeasure={this.state.selectedMeasure}
                      updateSelectedMeasure={this.updateSelectedMeasure}
                      aggregationTypes={this.aggregationTypes}
                      listOfAllMeasures={this.listOfAllMeasures}
                    >
                      {TimeseriesNavigationChartComponent}
                    </CubesVisualization>
                    <SectionRight />
                  </div>
                </React.Fragment>
            } />

            <Container style={{ display: "contents" }}>
              <Route path="/data-sources" render={(props) => <DataSources {...props}
                elasticsearchIndex={this.state.elasticsearchIndex}
                dataSource={this.state.dataSource}
                dataSourceError={this.state.dataSourceError}
                setDataSource={this.setDataSource}
                setSolrUrlPart={this.setSolrUrlPart}
                solrBaseUrl={this.state.solrBaseUrl}
                solrCore={this.state.solrCore}
                solrQuery={this.state.solrQuery}
                customMapping={this.state.customMapping}
                accessApp={this.accessApp} />} />
              <br />
              {this.state.dataSourceError && <Alert variant="danger">Datenquelle nicht erreichbar</Alert>}
              {this.state.timespanError && <Alert variant="danger">Zeitspanne nicht verfügbar</Alert>}
            </Container>
          </SidebarNew>
        </div>
      </BrowserRouter>
    );
  };

  changeIntervalOfDataRefresh = (refreshInterval: number, refreshTimeUnit: string) => {
    // Delete previous data refresh interval
    clearInterval(this.state.intervalId);

    // Convert refresh interval from provided time unit to ms
    if (refreshTimeUnit === 'seconds') {
      refreshInterval = refreshInterval * 1000
    } else if (refreshTimeUnit === 'minutes') {
      refreshInterval = refreshInterval * 60000
    } else if (refreshTimeUnit === 'hours') {
      refreshInterval = refreshInterval * 3600000
    } else {
      return
    }

    // Set new data refresh interval
    const intervalId = setInterval(() => {
      this.getLogData();
    }, refreshInterval);
    this.setState<never>({ intervalId: intervalId });
  }

  handlePredictionActivated = () => {
    this.setState({ predictionActivated: true, isRawForecastDataLoaded: false, isRawTimeseriesDataLoaded: false }, () => {
      this.getLogData()
    });
    this.setState({ temporalAxis: this.state.combinedTemporalAxis });
  }

  handlePredictionDeactivated = () => {
    this.setState({ predictionActivated: false });
    this.setState({ temporalAxis: this.state.historicTemporalAxis })
  }

  clearIntervalOfDataRefresh = () => {
    // Deactivates automatic data refresh
    clearInterval(this.state.intervalId);
  }

  accessApp = (stateElement, value) => {
    this.setState<never>({ [stateElement]: value }, () => {
    })
  }

  updateAggregationType = (aggregationType: AggregationType) => {
    this.setState({ aggregationType: aggregationType }, () => {
      this.getAggregatedLogData()
    })
  }

  updateSelectedMeasure = (selectedMeasure: string) => {
    this.setState({ selectedMeasure: selectedMeasure, isLoading: true }, () => {
      this.getLogData()
    })
  }

  updateTimespanTimestamps = (newTimespanData: object) => {
    this.setState<never>(newTimespanData, () => {
      this.getAggregatedLogData()
      //this.getLogData()
    })
  }

  updateBoundariesForDataRetrieval = (newTimespanData: object) => {
    this.setState<never>(newTimespanData, () => {
      this.getLogData()

    })
  }

  updatePointInTimeTimestamp = (newTimestamp: string) => {
    this.setState({ timeSelectionMode: "pointInTime", pointInTimeTimestamp: newTimestamp });
  }

  setDataSource = (dataSource: any) => {
    this.setState({ dataSource: dataSource.target.value })
  }

  setSolrUrlPart = (solrUrlPartName: string, solrUrlPart: string) => {
    this.setState<never>({
      [solrUrlPartName]: solrUrlPart
    }, () => {
      this.getLogData()
    })
  }
}

export default App;