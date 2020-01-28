import React from 'react'
import { BrowserRouter, Route } from "react-router-dom"
import { Alert, Container } from 'react-bootstrap'
import './App.css'
import httpClient from 'axios';
// import SidebarNew from '../components/SidebarNew'
import CubesVisualization from '../components/visualization3d/CubesVisualization'
import TimeseriesNavigationChart from '../components/visualization2d/TimeseriesNavigationChart'
import Topbar from '../components/topbar/Topbar'
import DataSources from '../components/datasource/config/DataSources'
import DataService from '../components/datasource/DataService'
import SolrAdapter from '../components/datasource/service/solr/SolrAdapter'
import DCState from '../model/DCState'
import TimeUnit from '../model/TimeUnit'
import DataSource from '../model/DataSource'
import AggregationType from '../model/AggregationType'
import Datacenter from '../model/Datacenter'
import Instance from '../model/Instance'
import Cluster from '../model/Cluster'

interface timeseriesData {
  timestamp: string,
  count: number
}

interface AppState {
  logData: []
  backendUrl: string
  dataSource: DataSource
  dataSourceUrl: string
  solrBaseUrl: string
  solrCore: string
  solrForecastCore: string
  solrMergedCore: string
  solrQuery: string
  dataSourceError: boolean
  selectedPointInTime: number
  selectedTimespan: [number, number]

  timeSelectionMode: 'pointInTime' | 'timespan'
  timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now'
  timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now'
  timespanAbsoluteTimestampLowerBound: string
  timespanAbsoluteTimestampUpperBound: string
  timespanTimeUnitLowerBound: TimeUnit
  timespanAmountLowerBound: number
  timespanTimeUnitUpperBound: TimeUnit
  timespanAmountUpperBound: number
  pointInTimeTimestamp: string

  sliderMode: 'pointInTime' | 'timespan' | 'hidden'
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

  currentAvgValue: number
  selectedMeasure: string
  customMapping: any
  aggregationType: AggregationType
  
  predictionActivated: boolean
  forecastDataReceived: boolean
  rawForecastData: any,
  isRawForecastDataLoaded: boolean
  // tempAxis including the forecast Data
  forecastTemporalAxis: string[]
  forecastTimeSeries: Map<string, DCState>
  forecastGrid: Map<string, Array<number>>
  forecastMaxH: number
  preparedAvgData: timeseriesData[]
  preparedMinData: timeseriesData[]
  preparedMaxData: timeseriesData[]
  preparedCombinedAvgData: timeseriesData[]
}

class Vis extends React.Component<{}, AppState> {

  constructor(props: object) {
    super(props)
    // Set initial lower bound of timespan by subtracting days
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 1000)

    this.state = {
      logData: [],
      backendUrl: "http://localhost:8080",
      dataSource: 'solr',
      dataSourceUrl: 'http://localhost:8983/solr/dc_cubes/query?q=*:*&start=0&rows=30000',
      solrBaseUrl: 'http://localhost:8983/solr/',
      solrCore: 'dc_cubes',
      solrForecastCore: 'dc_cubes_forecast',
      solrMergedCore: 'dc_cubes_merged',
      solrQuery: '/query?q=*:*&start=0&rows=30000',
      dataSourceError: true,
      selectedPointInTime: 0,
      selectedTimespan: [0, 0],
      timeSelectionMode: 'pointInTime',
      timespanTypeLowerBound: 'now',
      timespanTypeUpperBound: 'now',
      timespanAbsoluteTimestampLowerBound: currentDate.toISOString().split('.')[0] + "Z",
      timespanAbsoluteTimestampUpperBound: new Date().toISOString().split('.')[0] + "Z",
      timespanTimeUnitLowerBound: 'minutes',
      timespanAmountLowerBound: 10,
      timespanTimeUnitUpperBound: 'minutes',
      timespanAmountUpperBound: 10,
      pointInTimeTimestamp: "",
      sliderMode: 'pointInTime',
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
      currentAvgValue: 0,
      selectedMeasure: "count",
      aggregationType: "avg",
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
    // Get initial log data based on default values
    this.getLogData();
  }

  getLogData = () => {
    // TODO: implement other data sources
    const dataService = new DataService(this.state.dataSource, this.state.timespanAbsoluteTimestampLowerBound, this.state.timespanAbsoluteTimestampUpperBound, this.state.solrBaseUrl, this.state.solrCore, this.state.solrForecastCore, this.state.selectedMeasure, this.state.aggregationType)

    dataService.getLogData().then((data: any) => {
      // TODO: call dataparser from util folder in order to parse the log data
      const solrAdapter = new SolrAdapter();

      solrAdapter.receivedData(data.data, this.state.customMapping, this.state.selectedMeasure)

      this.setState({
        historicTemporalAxis: solrAdapter.temporalAxis,
        temporalAxis: solrAdapter.temporalAxis,
        timeSeries: solrAdapter.timeSeries,
        clusterColors: solrAdapter.clusterColors,
        grid: solrAdapter.grid,
        maxH: solrAdapter.maxh,
        dataSourceError: false,
        isLoading: true, // still need to load forecast data
        // raw timesereis Data for 2d graph 
        rawTimeseriesData: data.data.response.docs,
        isRawTimeseriesDataLoaded: true,
        selectedPointInTime: solrAdapter.temporalAxis.length - 1
      }, () => {
        // Recalculate the slider positions
        this.calculateAndSetPositionOfPointInTimeSlider()
        this.calculateAndSetBoundariesOfTimespanSlider()
      });

      dataService.getForecast().then((data: any) => {
        const solrAdapter = new SolrAdapter();
        solrAdapter.receivedData(data.data, this.state.customMapping, this.state.selectedMeasure);
  
        this.setState({
          forecastTemporalAxis: solrAdapter.temporalAxis,
          combinedTemporalAxis: this.state.temporalAxis.concat(solrAdapter.temporalAxis),
          forecastTimeSeries: solrAdapter.timeSeries,
          combinedTimeSeries: new Map([...Array.from(this.state.timeSeries.entries()), ...Array.from(solrAdapter.timeSeries.entries())]),
          forecastGrid: solrAdapter.grid,
          forecastMaxH: solrAdapter.maxh,
          dataSourceError: false,
          isLoading: false,
          // raw timesereis Data for 2d graph 
          rawForecastData: data.data.response.docs,
          isRawForecastDataLoaded: true,
          forecastDataReceived: true
        });
      }).catch((error: any) => {
        this.setState({ dataSourceError: true })
        console.log(error)
      });

    }).catch((error: any) => {
      this.setState({ dataSourceError: true })
      console.log(error)
    });

    dataService.getMaxValueOfTimeseries().then((maxValue: number) => {
      this.setState({ maxH: maxValue })
    }).catch((error: any) => {
      console.log(error)
    });
  }

  updatePredictions = () => {
    console.log("update predicitons called")
    httpClient.get("http://localhost:8080/startscript").then((data: any) => {
      console.log("Update Predictions answer: " + data.data);
    })
  }

  render() {
    let TimeseriesNavigationChartComponent;
    if (this.state.isRawTimeseriesDataLoaded) {
      TimeseriesNavigationChartComponent = <TimeseriesNavigationChart timeseriesData={this.state.rawTimeseriesData}
        forecastData={this.state.rawForecastData}
        updateTimespanData={this.updateTimespanData}
        resetSliderAndDates={this.updateSliderAndDates}
        accessChild={this.accessChild}
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
      />
    }
    else {
      TimeseriesNavigationChartComponent = null;
    }
    let cubesVisData = this.state.timeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime]);
    let topbarTimeSeries = this.state.timeSeries
    if (this.state.predictionActivated) {
      if (this.state.combinedTimeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime]) !== null) {
        cubesVisData = this.state.combinedTimeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime]);
      }
      topbarTimeSeries = this.state.combinedTimeSeries;
    }
    return (
      <BrowserRouter>
        <div className="App">
          {/* <Sidebar dataSource={this.state.dataSource} /> */}
          
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
    this.setState({ predictionActivated: true });
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

  accessChild = (stateElement, value) => {
    this.setState<never>({ [stateElement]: value }, () => {
    })
  }

  updateTimespanData = (newTimespanData: object) => {
    this.setState<never>(newTimespanData, () => {
      this.calculateAndSetBoundariesOfTimespanSlider()
      this.getLogData()
    })
  }

  updateSliderAndDates = (DateToReset: string) => {
    this.setState({ timeSelectionMode: "pointInTime", pointInTimeTimestamp: DateToReset, sliderMode: "pointInTime" });
    this.calculateAndSetPositionOfPointInTimeSlider();
  }

  calculateAndSetPositionOfPointInTimeSlider = () => {
    if (this.state.pointInTimeTimestamp) {
      const newPosition = this.state.temporalAxis.indexOf(this.state.pointInTimeTimestamp)
      if (newPosition !== -1) {
        this.setState({ selectedPointInTime: newPosition })
      } else {
        this.setState({ selectedPointInTime: this.state.temporalAxis.length - 1 })
      }
    }
  }

  calculateAndSetBoundariesOfTimespanSlider = () => {
    this.setState({ timespanError: false })
    console.log("predictoinActivatedState", this.state.predictionActivated);
    const typeLowerBound = this.state.timespanTypeLowerBound
    const typeUpperBound = this.state.timespanTypeUpperBound
    let lowerBoundDatetime = this.state.timespanAbsoluteTimestampLowerBound
    let upperBoundDatetime = this.state.timespanAbsoluteTimestampUpperBound

    if (typeLowerBound === 'absolute' && typeUpperBound === 'absolute') {
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'last') {
      upperBoundDatetime = this.calculateRelativeDatetime('last', 'upper')
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'next') {
      this.setState({ timespanError: true })

    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'now') {
      upperBoundDatetime = new Date().toISOString().split('.')[0] + "Z"
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'last' && typeUpperBound === 'absolute') {
      lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower')
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'last' && typeUpperBound === 'last') {
      lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower')
      upperBoundDatetime = this.calculateRelativeDatetime('last', 'upper')
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'last' && typeUpperBound === 'next') {
      this.setState({ timespanError: true })

    } else if (typeLowerBound === 'last' && typeUpperBound === 'now') {
      upperBoundDatetime = new Date().toISOString().split('.')[0] + "Z"
      lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower')
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'next' && typeUpperBound === 'absolute') {
      this.setState({ timespanError: true })

    } else if (typeLowerBound === 'next' && typeUpperBound === 'next') {
      this.setState({ timespanError: true })

    } else if (typeLowerBound === 'now' && typeUpperBound === 'absolute') {
      this.setState({ timespanError: true })

    } else if (typeLowerBound === 'now' && typeUpperBound === 'next') {
      this.setState({ timespanError: true })

    } else if (typeLowerBound === 'now' && typeUpperBound === 'now') {
      this.setState({ selectedTimespan: [this.state.temporalAxis.length - 1, this.state.temporalAxis.length - 1] })

    } else {
      this.setState({ timespanError: true })
    }
  }

  getSliderPositions = (lowerBoundDatetime: string, upperBoundDatetime: string) => {
    // Check if lower bound datetime is earlier than upper bound datetime
    if (Date.parse(lowerBoundDatetime) < Date.parse(upperBoundDatetime)) {
      // TODO: remove fix bug -2 in solrAdapter
      let upperBoundSliderPosition = this.state.temporalAxis[this.state.temporalAxis.length - 1]
      let lowerBoundSliderPosition = this.state.temporalAxis[0]

      // Check if selected dates lies within the range of the log data set
      if (Date.parse(lowerBoundDatetime) <= Date.parse(upperBoundSliderPosition) && Date.parse(upperBoundDatetime) >= Date.parse(lowerBoundSliderPosition)) {
        let i = 0
        this.state.temporalAxis.forEach(date => {
          if (Date.parse(date) <= Date.parse(upperBoundDatetime)) {
            upperBoundSliderPosition = date
          }
          if (Date.parse(date) >= Date.parse(lowerBoundDatetime)) {
            if (i < 1) {
              i++
              lowerBoundSliderPosition = date
            }
          }
        });
        const lowerBound = this.state.temporalAxis.indexOf(lowerBoundSliderPosition)
        const upperBound = this.state.temporalAxis.indexOf(upperBoundSliderPosition)
        this.setState({ selectedTimespan: [lowerBound, upperBound] })
      } else {
        this.setState({ timespanError: true })
      }
    } else {
      this.setState({ timespanError: true })
    }
  }

  calculateRelativeDatetime = (timespanType, bound: 'lower' | 'upper') => {
    let timespanAmount = bound === 'upper' ? this.state.timespanAmountUpperBound : this.state.timespanAmountLowerBound
    let timespanTimeUnit = bound === 'upper' ? this.state.timespanTimeUnitUpperBound : this.state.timespanTimeUnitLowerBound
    let now = new Date()

    if (timespanType === 'last') {
      if (timespanTimeUnit === 'seconds') {
        now.setSeconds(now.getSeconds() - timespanAmount)
        now.setUTCMilliseconds(0)
      } else if (timespanTimeUnit === 'minutes') {
        now.setMinutes(now.getMinutes() - timespanAmount)
        now.setUTCSeconds(0, 0)
      } else if (timespanTimeUnit === 'hours') {
        now.setHours(now.getHours() - timespanAmount)
        now.setUTCMinutes(0, 0, 0)
      } else if (timespanTimeUnit === 'days') {
        now.setDate(now.getDate() - timespanAmount)
        now.setUTCHours(0, 0, 0, 0)
      } else {
        this.setState({ timespanError: true })
        return undefined
      }
      return now.toISOString().split('.')[0] + "Z"

    } else if (timespanType === 'next') {
      if (timespanTimeUnit === 'seconds') {
        now.setSeconds(now.getSeconds() + timespanAmount)
        now.setUTCMilliseconds(0)
      } else if (timespanTimeUnit === 'minutes') {
        now.setMinutes(now.getMinutes() + timespanAmount)
        now.setUTCSeconds(0, 0)
      } else if (timespanTimeUnit === 'hours') {
        now.setHours(now.getHours() + timespanAmount)
        now.setUTCMinutes(0, 0, 0)
      } else if (timespanTimeUnit === 'days') {
        now.setDate(now.getDate() + timespanAmount)
        now.setUTCHours(0, 0, 0, 0)
      } else {
        this.setState({ timespanError: true })
        return undefined
      }
      return now.toISOString().split('.')[0] + "Z"

    } else {
      this.setState({ timespanError: true })
      return undefined
    }
  }

  setDataSource = (dataSource: any) => {
    this.setState({ dataSource: dataSource.target.value })
  }

  setDataSourceUrl = (dataSourceUrl: string) => {
    this.setState({ dataSourceUrl: dataSourceUrl }, () => {
      this.getLogData()
    })
  }

  setSolrUrlPart = (solrUrlPartName: string, solrUrlPart: string) => {
    this.setState<never>({
      [solrUrlPartName]: solrUrlPart
    }, () => {
      const dataSourceUrl = this.state.solrBaseUrl.concat(this.state.solrCore, this.state.solrQuery)
      this.setDataSourceUrl(dataSourceUrl)
    })
  }
}


export default Vis;
