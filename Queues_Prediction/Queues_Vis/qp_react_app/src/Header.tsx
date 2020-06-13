import React, { Component } from 'react'

export class Header extends Component {
    render() {
        return (
            <div style={headerContainer}>
                <span>Queue</span> 
                <span>Predictor</span>
            </div>
        )
    }
}

export default Header

const headerContainer = {
    backgroundColor: "lightgrey"
}