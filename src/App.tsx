import React, { createRef } from 'react';
import { Row } from 'react-bootstrap';
import './App.css';
import Sidebar from './components/Sidebar'
import CubesVisualisation from './components/CubesVisualisation';
import Topbar from './components/Topbar';
import SolrDataService from './util/SolrDataService';
import SolrAdapter from './util/SolrAdapter';
import DCState from './model/DCState'

interface AppState {
  logData: [];
  startDateTime: string;
  endDateTime: string;
  dataSource: string;
  selectedPointInTime: number;
  temporalAxis: string[],
  timeSeries: Map<string, DCState>
  grid: Map<string, Array<number>>
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
      selectedPointInTime: 0,
      temporalAxis: [],
      timeSeries: new Map(),
      grid: new Map()
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
        grid: solrAdapter.grid
      });

      console.log("getLogData function in App Component");
      console.log(this.state.timeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime]));

    }).catch((error: any) => console.log(error));
  }

  child = createRef<CubesVisualisation>();
  render() {
    return (
      <div className="App">
        <Sidebar />
        <Topbar />
        <Row>
          <div className="cubes-visualisation">
            <CubesVisualisation ref={this.child} data={this.state.timeSeries.get(this.state.temporalAxis[this.state.selectedPointInTime])} grid={this.state.grid}></CubesVisualisation>
            <div className="slidercontainer">
              <input type="range" min="0" max={this.state.temporalAxis.length-2} className="slider" id="myRange" value={this.state.selectedPointInTime} onChange={this.accesChild} />
              <p>{this.state.temporalAxis[this.state.selectedPointInTime]}</p>
            </div>
          </div>
        </Row>
      </div>
    );
  };

  accesChild = (event) => {
    this.setState({ selectedPointInTime: event.target.value });
    // if (this.child.current) {
    //   this.child.current.randomnizeBarHeights();
    // }
  }

}


export default App;
