import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { Row } from 'react-bootstrap';
import './App.css';
import Sidebar from './components/Sidebar'
import CubesVisualisation from './components/CubesVisualisation';
import Topbar from './components/Topbar';
import DataSources from './components/DataSources';
import SolrDataService from './components/datasource/service/solr/SolrDataService';
import SolrAdapter from './components/datasource/service/solr/SolrAdapter';
import DCState from './model/DCState'

interface AppState {
  statusMessage: string;
  logData: [];
  startDateTime: string;
  endDateTime: string;
  dataSource: string;
  dataSourceSuccess: boolean;
  selectedPointInTime: number;
  temporalAxis: string[],
  timeSeries: Map<string, DCState>
  clusterColors: object;
  grid: Map<string, Array<number>>
  maxH: number;
  baseUrl: string;
}

class App extends React.Component<{}, AppState> {

  constructor(props: object) {
    super(props);
    this.state = {
      statusMessage: null,
      logData: [],
      // Set the default boundaries of the log data to be displayed
      startDateTime: '2018-08-03T00:00:00Z', // TODO: replace with date from 2 week ago or something similiar
      endDateTime: new Date().toISOString().split('.')[0] + 'Z', // today's date e.g. 2019-08-05T12:06:45Z
      dataSource: 'solr',
      dataSourceSuccess: false,
      selectedPointInTime: 0,
      temporalAxis: [],
      timeSeries: new Map(),
      clusterColors: {},
      grid: new Map(),
      maxH: 0,
      baseUrl: 'http://localhost:8983/solr'
    };
  }

  componentDidMount() {
    // get initial log data based on default values
    this.getLogData(this.state.baseUrl, this.state.startDateTime, this.state.endDateTime);
  }

  getLogData = (baseUrl:string, startDateTime: string, endDateTime: string) => {
    // TODO: implement other data sources
    let dataService = new SolrDataService();
    dataService.getLogDataFromSolr(this.state.baseUrl, startDateTime, endDateTime).then((data: any) => {
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
        dataSourceSuccess: true
      });


    }).catch((error: any) => {
      this.setState({ statusMessage: "DataSource is currently not available" })
      console.log(error)
    });
  }

  // child = createRef<CubesVisualisation>();
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Sidebar dataSource={this.state.dataSource} />
          <Topbar />
          <Row>
            <Route exact path="/" render={(props) => <CubesVisualisation {...props} data={this.state.timeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime])}
              clusterColors={this.state.clusterColors}
              grid={this.state.grid}
              maxH={this.state.maxH}
              maxRangeSlider={this.state.temporalAxis.length - 2}
              valueOfSlider={this.state.selectedPointInTime}
              accessChild={this.accessChild}
              timestamp={this.state.temporalAxis[this.state.selectedPointInTime]}
              dataSourceSuccess={this.state.dataSourceSuccess} />} />
            <Route path="/data-sources" render={(props) => <DataSources {...props} dataSource={this.state.dataSource} setDataSource={this.setDataSource} setBaseUrl={this.setBaseUrl}/>} />
            <p>{this.state.statusMessage}</p>
          </Row>
        </div>
      </BrowserRouter>
    );
  };

  accessChild = (event) => {
    this.setState({ selectedPointInTime: event.target.value });
  }

  setDataSource = (dataSource: any) => {
    this.setState({dataSource: dataSource.target.value})
  }

  setBaseUrl = (baseUrl: string) => {
    this.setState({baseUrl: baseUrl})
  }
}


export default App;
