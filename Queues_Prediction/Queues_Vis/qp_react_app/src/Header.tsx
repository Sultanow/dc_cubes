import React, { Component } from 'react'
import FilterForm from "./FilterForm";

export class Header extends Component {
    render() {
        return (
            <div style={headerContainer}>
                <div style={appNameContainer}>
                    <div>Queue</div> 
                    <div>Predictor</div>
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
}

const appNameContainer = {
    
}