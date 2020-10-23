import React, { Component } from 'react'
import FilterForm from "./FilterForm";

import {
    EuiText
  } from '@elastic/eui';

export class Header extends Component {
    render() {
        return (
            <div style={headerContainer}>
                <div style={appNameContainer}>
                <EuiText>
                    <div>Queue</div> 
                    <div>Predictor</div>
                </EuiText>
                </div>
            </div>
        )
    }
}

export default Header

const headerContainer = {
    backgroundColor: "white",
    textAlign: "left" as "left", 
    padding: "10px", 
    fontWeight: "bolder" as "bolder",
    display: "flex",
    fontSize: "20px"
}

const appNameContainer = {
    
}