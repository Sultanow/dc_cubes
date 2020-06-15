import React from 'react';
import './App.css';
import Header from "./Header";
import Pipeline from "./Pipeline";
import PredictionDataTable from "./PredictionDataTable";
import FilterForm from "./FilterForm";

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
      </div>
      )
  }
}

export default App


const appContainer = {

}