import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { Row, Alert, Container } from 'react-bootstrap';
import './App.css';
import Sidebar from './components/Sidebar'
import CubesVisualisation from './components/visualization3d/CubesVisualisation';
import TimeseriesNavigationChart from './components/visualization2d/TimeseriesNavigationChart';
import Topbar from './components/Topbar';
import DataSources from './components/datasource/config/DataSources';
import SolrDataService from './components/datasource/service/solr/SolrDataService';
import SolrAdapter from './components/datasource/service/solr/SolrAdapter';
import DCState from './model/DCState'

interface AppState {
  logData: []
  startDateTime: string
  endDateTime: string
  dataSource: string
  dataSourceUrl: string
  solrBaseUrl: string
  solrCore: any
  solrQuery: string
  dataSourceSuccess: boolean
  selectedPointInTime: number
  selectedTimespan: [number, number]
  sliderMode: 'pointInTime' | 'timespan' | 'hidden'
  temporalAxis: string[]
  timeSeries: Map<string, DCState>
  clusterColors: object
  grid: Map<string, Array<number>>
  maxH: number
}

class App extends React.Component<{}, AppState> {

  constructor(props: object) {
    super(props);
    this.state = {
      logData: [],
      // Set the default boundaries of the log data to be displayed
      startDateTime: '2018-08-03T00:00:00Z', // TODO: replace with date from 2 week ago or something similiar
      endDateTime: new Date().toISOString().split('.')[0] + 'Z', // today's date e.g. 2019-08-05T12:06:45Z
      dataSource: 'solr',
      dataSourceUrl: 'http://localhost:8983/solr/dc_cubes/query?q=*:*&start=0&rows=30000',
      solrBaseUrl: 'http://localhost:8983/solr/',
      solrCore: 'dc_cubes',
      solrQuery: '/query?q=*:*&start=0&rows=30000',
      dataSourceSuccess: false,
      selectedPointInTime: 0,
      selectedTimespan: [0, 0],
      sliderMode: 'pointInTime',
      temporalAxis: [],
      timeSeries: new Map(),
      clusterColors: {},
      grid: new Map(),
      maxH: 0,
    };
  }

  componentDidMount() {
    // get initial log data based on default values
    this.getLogData(this.state.dataSourceUrl);
  }

  getLogData = (dataSourceUrl: string) => {
    const startDateTime = this.state.startDateTime;
    const endDateTime = this.state.endDateTime;
    // TODO: implement other data sources
    let dataService = new SolrDataService();
    dataService.getLogDataFromSolr(dataSourceUrl, startDateTime, endDateTime).then((data: any) => {
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
    return (
      <BrowserRouter>
        <div className="App">
          <Sidebar dataSource={this.state.dataSource} />
          <Topbar dataSourceUrl={this.state.dataSourceUrl} getLogData={this.getLogData} />
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
                    <TimeseriesNavigationChart />
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
          </Container>
        </div>
      </BrowserRouter>
    );
  };

  accessChild = (stateElement, value) => {
    this.setState<never>({ [stateElement]: value });
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
    }, function () {
      const dataSourceUrl = this.state.solrBaseUrl.concat(this.state.solrCore, this.state.solrQuery)
      this.getLogData(dataSourceUrl)
    })
  }
}


export default App;
