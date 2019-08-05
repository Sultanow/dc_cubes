import React, { createRef } from 'react';
import { Row } from 'react-bootstrap';
import './App.css';
import Sidebar from './components/Sidebar'
import CubesVisualisation from './components/CubesVisualisation';
import Topbar from './components/Topbar';
import SolrDataService from './util/SolrDataService';
import SolrAdapter from './util/SolrAdapter';
class App extends React.Component<{},any> {

  constructor(props: object) {
    super(props);
    this.state = {
      logData: [],
      // Set the default boundaries of the log data to be displayed
      startDateTime: '2018-08-03T00:00:00Z', // TODO: replace with date from 2 week ago or something similiar
      endDateTime: new Date().toISOString().split('.')[0]+'Z', // today's date e.g. 2019-08-05T12:06:45Z
      dataSource: 'solr'
    };
  }

  componentDidMount() {
    // get initial log data based on default values
    this.getLogData(this.state.startDateTime, this.state.endDateTime);

  }

  getLogData = (startDateTime: string, endDateTime: string) => {
    // TODO: implement other data sources
    let dataService = new SolrDataService();
    dataService.getLogDataFromSolr(startDateTime, endDateTime).then((data:any) => {
      // TODO: call dataparser from util folder in order to parse the log data
      const solrAdapter= new SolrAdapter();
      solrAdapter.receivedData(data);
      console.log(data);
    }).catch((error:any) => console.log(error));
  }

  child = createRef<CubesVisualisation>();
  render() {
    return (<div className="App">
      <Sidebar />
      <Topbar />
      <Row>
        <div className="cubes-visualisation">
          <CubesVisualisation ref={this.child}></CubesVisualisation>
          <div className="slidercontainer">
            <input type="range" min="1" max="30" className="slider" id="myRange" defaultValue="15" onChange={this.accesChild} />
          </div>
        </div>
      </Row>

    </div>




    );
  };
  accesChild = () => {
    if (this.child.current) {
      this.child.current.randomnizeBarHeights();
    }
  }
}

export default App;
