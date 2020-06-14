import React from 'react';
import './App.css';
import Header from "./Header";
import Pipeline from "./Pipeline";
import PredictionDataTable from "./PredictionDataTable";

interface AppState {

}

export class App extends React.Component<{}, AppState> {
  render() {
      return (
        <div className="App" style={appContainer}> 
          <Header/>
          <Pipeline/>
          <PredictionDataTable/>
      </div>
      )
  }
}

export default App


const appContainer = {
  backgroundColor: "red"
}