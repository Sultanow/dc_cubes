import React from 'react';
import './App.css';
import Header from "./Header";
import Pipeline from "./Pipeline";
import PredictionDataTable from "./PredictionDataTable";

function App() {
  return (
    <div className="App" style={appContainer}> 
      <Header/>
      <Pipeline/>
      <PredictionDataTable/>
    </div>
  );
}

export default App;

const appContainer = {
  backgroundColor: "red"
}