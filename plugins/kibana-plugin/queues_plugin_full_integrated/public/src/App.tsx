import React from 'react';
import './App.css';
import Header from "./Header";
import Pipeline from "./Pipeline";
import PredictionDataTable from "./PredictionDataTable";
import FilterForm from "./FilterForm";
import DragDropApp from "./DragDrop";
import Chart from "./Chart"

interface AppState {

}

export class App extends React.Component<{}, AppState> {
  render() {
      return (
        <div className="App" style={appContainer}> 
          <Header/>
          <FilterForm/>
          <Pipeline/>
          <PredictionDataTable/>
          <Chart queueName={"someting"}
          queueType={"something"}/>
          <DragDropApp/>
      </div>
      )
  }
}

export default App;


const appContainer = {

}