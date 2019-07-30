import React from 'react';
import './App.css';
import CubesVisualisation from './components/CubesVisualisation';

class App extends React.Component
{
  render()
  {
    return (<div className="App">
      <header className="App-header">
        <p>
           Ansatz für die 3D Cubes mit <span><a
            className="App-link"
            href="https://threejs.org/"
            target="_blank"
            rel="noopener noreferrer"
          > Three.js
      </a> und </span>

          <span>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >React </a> </span>
        </p>
      </header>
      <CubesVisualisation ref="child"></CubesVisualisation>
      <div className="slidecontainer">
        <input type="range" min="1" max="30" className="slider" id="myRange" defaultValue="15" onChange={this.accesChild}/>
        <span>Die Höhe der Balken wird zufällig generiert</span>
      </div>
    </div>
    );
  };
  accesChild=()=>{
    this.refs.child.randomnizeBarHeights();

  }
}

export default App;
