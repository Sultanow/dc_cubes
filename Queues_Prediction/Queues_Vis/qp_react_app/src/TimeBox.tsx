import React, { Component } from 'react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faClock} from "@fortawesome/free-solid-svg-icons"

export class TimeBox extends Component {
    render() {
        return (
            <div style={timeboxContainer}>
                <div style={timebox}>
                    <div style={timeboxTitle}>Start historic:</div>
                    <div style={timeboxInnerBottom}>
                        <FontAwesomeIcon icon={faClock} style={iconClock} /> 
                        2020-01-20 12:01 UTC
                    </div>
                </div>
            </div>
        )
    }
}

export default TimeBox

const timeboxContainer = {
    color: "grey",
    width: "200px"
}

const timeboxInnerBottom = {
    display: "flex",
}

const timeboxTitle = {
    fontSize: ".8rem", 
    fontWeight: "bold" as "bold",
    textAlign: "left" as "left",
    color: "grey"
}

const iconClock = {
    color: "lightgrey",
    fontSize: ".8rem",
    marginRight: "4px"
}

const timebox = {
    backgroundColor: "white",
    height: "35px",    
    color: "black",
    border: "3px solid lightgrey",
    borderRadius: "50px",
    fontSize: ".8rem",
    padding: "5px 15px 5px 15px",
}