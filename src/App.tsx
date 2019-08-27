import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { Row, Alert, Container } from 'react-bootstrap';
import './App.css';
import Sidebar from './components/Sidebar'
import CubesVisualisation from './components/visualization3d/CubesVisualisation';
import TimeseriesNavigationChart from './components/visualization2d/TimeseriesNavigationChart';
import Topbar from './components/topbar/Topbar';
import DataSources from './components/datasource/config/DataSources';
import SolrDataService from './components/datasource/service/solr/SolrDataService';
import SolrAdapter from './components/datasource/service/solr/SolrAdapter';
import DCState from './model/DCState'

interface AppState {
  logData: []
  dataSource: string
  dataSourceUrl: string
  solrBaseUrl: string
  solrCore: any
  solrQuery: string
  dataSourceSuccess: boolean
  selectedPointInTime: number
  selectedTimespan: [number, number]
  
  timeSelectionMode: 'pointInTime' | 'timespan'
  timespanTypeLowerBound: 'absolute' | 'last' | 'next' | 'now'
  timespanTypeUpperBound: 'absolute' | 'last' | 'next' | 'now'
  timespanAbsoluteTimestampLowerBound: string
  timespanAbsoluteTimestampUpperBound: string
  timespanTimeUnitLowerBound: string
  timespanAmountLowerBound: number
  timespanTimeUnitUpperBound: string
  timespanAmountUpperBound: number
  pointInTimeTimestamp: string
  
  sliderMode: 'pointInTime' | 'timespan' | 'hidden'
  temporalAxis: string[]
  timeSeries: Map<string, DCState>
  clusterColors: object
  grid: Map<string, Array<number>>
  maxH: number

  isRawTimeseriesDataLoaded:boolean
  intervalId: any
  rawTimeseriesData: any
  timespanError: boolean
}

class App extends React.Component<{}, AppState> {

  constructor(props: object) {
    super(props);
    this.state = {
      logData: [],
      dataSource: 'solr',
      dataSourceUrl: 'http://localhost:8983/solr/dc_cubes/query?q=*:*&start=0&rows=30000',
      solrBaseUrl: 'http://localhost:8983/solr/',
      solrCore: 'dc_cubes',
      solrQuery: '/query?q=*:*&start=0&rows=30000',
      dataSourceSuccess: false,
      selectedPointInTime: 0,
      selectedTimespan: [0, 0],  
      timeSelectionMode: 'pointInTime',
      timespanTypeLowerBound: 'now',
      timespanTypeUpperBound: 'now',
      timespanAbsoluteTimestampLowerBound: new Date().toISOString().split('.')[0]+"Z",
      timespanAbsoluteTimestampUpperBound: new Date().toISOString().split('.')[0]+"Z",
      timespanTimeUnitLowerBound: 'minutes',
      timespanAmountLowerBound: 10,
      timespanTimeUnitUpperBound: 'minutes',
      timespanAmountUpperBound: 10,
      pointInTimeTimestamp: '',
      sliderMode: 'pointInTime',
      temporalAxis: [],
      timeSeries: new Map(),
      clusterColors: {},
      grid: new Map(),
      maxH: 0,
      rawTimeseriesData:null,
      isRawTimeseriesDataLoaded:false,
      intervalId: undefined,
      timespanError: false
    };
  }

  componentDidMount() {
    // Get initial log data based on default values
    this.getLogData(this.state.dataSourceUrl);

    // Set the initial data refresh interval, default interval is 10 minutes
    let intervalId = setInterval(() => {
      this.getLogData(this.state.dataSourceUrl);
    }, 600000);
    this.setState<never>({intervalId: intervalId});
  }

  getLogData = (dataSourceUrl: string) => {
    // TODO: implement other data sources
    let dataService = new SolrDataService();
    dataService.getLogDataFromSolr(dataSourceUrl).then((data: any) => {
      // TODO: call dataparser from util folder in order to parse the log data
      const solrAdapter = new SolrAdapter();
      // console.log(data.data);
      solrAdapter.receivedData(data.data);
      this.setState({
        // there is a bug, the last element is allways undefined
        temporalAxis: solrAdapter.temporalAxis,
        timeSeries: solrAdapter.timeSeries,
        clusterColors: solrAdapter.clusterColors,
        grid: solrAdapter.grid,
        maxH: solrAdapter.maxh,
        dataSourceSuccess: true,
        // raw timesereis Data for 2d graph 
        rawTimeseriesData: data.data.response.docs,
        isRawTimeseriesDataLoaded: true,
        selectedPointInTime: solrAdapter.temporalAxis.length-1
      });


    }).catch((error: any) => {
      this.setState({
        dataSourceSuccess: false
      })
      console.log(error)
    });
  }

  // child = createRef<CubesVisualisation>();
  render() {

    var TimeseriesNavigationChartComponent;
    if(this.state.isRawTimeseriesDataLoaded){
      TimeseriesNavigationChartComponent= <TimeseriesNavigationChart timeseriesData={this.state.rawTimeseriesData} />
    }
    else {
      TimeseriesNavigationChartComponent=null;
    }
    return (
      <BrowserRouter>
        <div className="App">
          <Sidebar dataSource={this.state.dataSource} />
          <Topbar dataSourceUrl={this.state.dataSourceUrl} 
                  getLogData={this.getLogData} 
                  accessChild={this.accessChild}
                  sliderMode={this.state.sliderMode}
                  temporalAxis={this.state.temporalAxis}
                  timeSeries={this.state.timeSeries}
                  timeSelectionMode={this.state.timeSelectionMode}
                  timespanTypeLowerBound={this.state.timespanTypeLowerBound}
                  timespanTypeUpperBound={this.state.timespanTypeUpperBound}
                  timespanAbsoluteTimestampLowerBound={this.state.timespanAbsoluteTimestampLowerBound}
                  timespanAbsoluteTimestampUpperBound={this.state.timespanAbsoluteTimestampUpperBound}
                  timespanTimeUnitLowerBound={this.state.timespanTimeUnitLowerBound}
                  timespanAmountLowerBound={this.state.timespanAmountLowerBound}
                  timespanTimeUnitUpperBound={this.state.timespanTimeUnitUpperBound}
                  timespanAmountUpperBound={this.state.timespanAmountUpperBound}
                  pointInTimeTimestamp={this.state.pointInTimeTimestamp}
                  calculateAndSetBoundariesOfTimespanSlider={this.calculateAndSetBoundariesOfTimespanSlider}
                  updateTimespanData={this.updateTimespanData}
                  clearIntervalOfDataRefresh={this.clearIntervalOfDataRefresh}
                  changeIntervalOfDataRefresh={this.changeIntervalOfDataRefresh} />
          <Container>
            <Row>
              <Route exact path="/" render={
                (props) =>
                  <div>
                    <CubesVisualisation {...props}
                      data={this.state.timeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime])}
                      clusterColors={this.state.clusterColors}
                      grid={this.state.grid}
                      maxH={this.state.maxH}
                      sliderMode={this.state.sliderMode}
                      maxRangeSlider={((this.state.temporalAxis.length - 2) > 0) ? (this.state.temporalAxis.length - 2) : 1} // Ensure that max of slider is larger than min
                      timespanValuesOfSlider={this.state.selectedTimespan}
                      valueOfSlider={this.state.selectedPointInTime}
                      accessChild={this.accessChild}
                      selectedPointInTimeTimestamp={this.state.temporalAxis[this.state.selectedPointInTime]}
                      selectedTimespanTimestamp={[this.state.temporalAxis[this.state.selectedTimespan[0]], this.state.temporalAxis[this.state.selectedTimespan[1]]]}
                      dataSourceSuccess={this.state.dataSourceSuccess} />
                      {TimeseriesNavigationChartComponent}
                  </div>
              } />
              <Route path="/data-sources" render={(props) => <DataSources {...props}
                dataSource={this.state.dataSource}
                setDataSource={this.setDataSource}
                setDataSourceUrl={this.setDataSourceUrl}
                setSolrUrlPart={this.setSolrUrlPart}
                dataSourceUrl={this.state.dataSourceUrl}
                solrBaseUrl={this.state.solrBaseUrl}
                solrCore={this.state.solrCore}
                solrQuery={this.state.solrQuery} />} />
            </Row>
            {!this.state.dataSourceSuccess && <Alert variant="danger">Datenquelle nicht erreichbar</Alert>}
            {this.state.timespanError && <Alert variant="danger">Zeitspanne nicht verfügbar</Alert>}
          </Container>
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
    var intervalId = setInterval(() => {
      this.getLogData(this.state.dataSourceUrl);
    }, refreshInterval);
    this.setState<never>({intervalId: intervalId});
  }

  clearIntervalOfDataRefresh = () => {
    // Deactivates automatic data refresh
    clearInterval(this.state.intervalId);
  }

  accessChild = (stateElement, value) => {
    this.setState<never>({ [stateElement]: value })
  }

  updateTimespanData = (newTimespanData) => {
    this.setState<never>(newTimespanData, () => {
      this.calculateAndSetBoundariesOfTimespanSlider()
    })
  }

  calculateAndSetBoundariesOfTimespanSlider = () => {
    this.setState({timespanError: false})
    const typeLowerBound = this.state.timespanTypeLowerBound
    const typeUpperBound = this.state.timespanTypeUpperBound
    let lowerBoundDatetime = this.state.timespanAbsoluteTimestampLowerBound
    let upperBoundDatetime = this.state.timespanAbsoluteTimestampUpperBound

    if (typeLowerBound === 'absolute' && typeUpperBound === 'absolute') {
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'last') {
      upperBoundDatetime = this.calculateRelativeDatetime('last', 'upper')
      if (upperBoundDatetime) {
        this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
      } else {
        this.setState({timespanError: true})
      }

    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'next') {

    } else if (typeLowerBound === 'absolute' && typeUpperBound === 'now') {
      upperBoundDatetime = new Date().toISOString().split('.')[0]+"Z"
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)

    } else if (typeLowerBound === 'last' && typeUpperBound === 'absolute') {

    } else if (typeLowerBound === 'last' && typeUpperBound === 'last') {

    } else if (typeLowerBound === 'last' && typeUpperBound === 'next') {

    } else if (typeLowerBound === 'last' && typeUpperBound === 'now') {
      upperBoundDatetime = new Date().toISOString().split('.')[0]+"Z"
      lowerBoundDatetime = this.calculateRelativeDatetime('last', 'lower')
      this.getSliderPositions(lowerBoundDatetime, upperBoundDatetime)
    } else if (typeLowerBound === 'next' && typeUpperBound === 'absolute') {

    } else if (typeLowerBound === 'next' && typeUpperBound === 'last') {
      this.setState({timespanError: true})
    } else if (typeLowerBound === 'next' && typeUpperBound === 'next') {

    } else if (typeLowerBound === 'next' && typeUpperBound === 'now') {
      this.setState({timespanError: true})
    } else if (typeLowerBound === 'now' && typeUpperBound === 'absolute') {

    } else if (typeLowerBound === 'now' && typeUpperBound === 'last') {
      this.setState({timespanError: true})
    } else if (typeLowerBound === 'now' && typeUpperBound === 'next') {

    } else if (typeLowerBound === 'now' && typeUpperBound === 'now') {
      this.setState({selectedTimespan: [0, 0]})
    } else {
      this.setState({timespanError: true})
    }
  }

  getSliderPositions = (lowerBoundDatetime: string, upperBoundDatetime: string) => {
    // Check if lower bound datetime is earlier than upper bound datetime
    if (Date.parse(lowerBoundDatetime) < Date.parse(upperBoundDatetime)) {
      let dates = Array.from(this.state.timeSeries.keys()).sort()
      let upperBoundSliderPosition = dates[dates.length-2]
      let lowerBoundSliderPosition = dates[0]

      // Check if selected dates lies within the range of the log data set
      if (Date.parse(lowerBoundDatetime) <= Date.parse(upperBoundSliderPosition) && Date.parse(upperBoundDatetime) >= Date.parse(lowerBoundSliderPosition)) {
        let i = 0
        dates.forEach(date => {
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
        this.setState({selectedTimespan: [lowerBound, upperBound]})
      } else {
        this.setState({timespanError: true})
      }
    } else {
      this.setState({timespanError: true})
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
        return undefined
      }
      return now.toISOString().split('.')[0]+"Z"

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
        return undefined
      }
      return now.toISOString().split('.')[0]+"Z"

    } else {
      return undefined
    }
  }

  setDataSource = (dataSource: any) => {
    this.setState({ dataSource: dataSource.target.value })
  }

  setDataSourceUrl = (dataSourceUrl: string) => {
    this.getLogData(dataSourceUrl)
    this.setState({ dataSourceUrl: dataSourceUrl })
  }

  setSolrUrlPart = (solrUrlPartName: string, solrUrlPart: string) => {
    this.setState<never>({
      [solrUrlPartName]: solrUrlPart
    }, () => {
      const dataSourceUrl = this.state.solrBaseUrl.concat(this.state.solrCore, this.state.solrQuery)
      this.getLogData(dataSourceUrl)
    })
  }
}


export default App;
