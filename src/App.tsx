import React, { createRef } from 'react';
import { Row } from 'react-bootstrap';
import './App.css';
import Sidebar from './components/Sidebar'
import CubesVisualisation from './components/CubesVisualisation';
import Topbar from './components/Topbar';

class App extends React.Component {
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
