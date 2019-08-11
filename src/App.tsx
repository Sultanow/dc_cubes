import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { Row } from 'react-bootstrap';
import './App.css';
import Sidebar from './components/Sidebar'
import CubesVisualisation from './components/CubesVisualisation';
import Topbar from './components/Topbar';
import DataSources from './components/DataSources';
import SolrDataService from './util/SolrDataService';
import SolrAdapter from './util/SolrAdapter';
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
  grid: Map<string, Array<number>>
  maxH: number;
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
      selectedPointInTime: 0,
      temporalAxis: [],
      timeSeries: new Map(),
      grid: new Map(),
      maxH: 0,
      dataSourceSuccess: false
    };
  }

  componentDidMount() {
    // get initial log data based on default values
    this.getLogData(this.state.startDateTime, this.state.endDateTime);
  }

  getLogData = (startDateTime: string, endDateTime: string) => {
    // TODO: implement other data sources
    let dataService = new SolrDataService();
    dataService.getLogDataFromSolr(startDateTime, endDateTime).then((data: any) => {
      // TODO: call dataparser from util folder in order to parse the log data
      const solrAdapter = new SolrAdapter();
      // console.log(data.data);
      solrAdapter.receivedData(data.data);
      this.setState({
        // there is a bug, the last element ist undefined
        temporalAxis: solrAdapter.temporalAxis,
        timeSeries: solrAdapter.timeSeries,
        grid: solrAdapter.grid,
        maxH: solrAdapter.maxh,
        dataSourceSuccess: true
      });


    }).catch((error: any) => {
      this.setState({statusMessage: "DataSource is currently not available"})
      console.log(error)
    });
  }

  // child = createRef<CubesVisualisation>();
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Sidebar />
          <Topbar />
          <Row>
            <Route exact path="/" render={(props) => <CubesVisualisation {...props} data={this.state.timeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime])} 
                                grid={this.state.grid} 
                                maxH={this.state.maxH}
                                maxRangeSlider={this.state.temporalAxis.length - 2}
                                valueOfSlider={this.state.selectedPointInTime}
                                accessChild={this.accessChild}
                                timestamp={this.state.temporalAxis[this.state.selectedPointInTime]}
                                dataSourceSuccess={this.state.dataSourceSuccess} />}/>
            <Route path="/data-sources" render={(props) => <DataSources {...props} dataSource={this.state.dataSource} />}/>
            <p>{ this.state.statusMessage }</p>
          </Row>
        </div>
      </BrowserRouter>
    );
  };

  accessChild = (event) => {
    this.setState({ selectedPointInTime: event.target.value });
    // if (this.child.current) {
    //   this.child.current.randomnizeBarHeights();
    // }
  }

}


export default App;
