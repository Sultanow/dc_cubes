import React, { Component } from 'react'

export class Header extends Component {
    render() {
        return (
            <div style={headerContainer}>
                <div>Queue</div> 
                <div>Predictor</div>
            </div>
        )
    }
}

export default Header

const headerContainer = {
    backgroundColor: "white",
    textAlign: "left" as "left", 
    padding: "10px", 
    fontWeight: "bolder" as "bolder"
}