import React, { Component } from 'react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faClock} from "@fortawesome/free-solid-svg-icons"

type TimeboxState = {
    timePosition : String, 
    isHistoric: Boolean, 
}

interface TimeboxProps { 
    timestamp: String, 
    isHistoric: Boolean, 
    isStart: Boolean
}

export class TimeBox extends React.Component<TimeboxProps, TimeboxState>{
    constructor(props:any) {
        super(props);
        
        this.state = {
            timePosition: "",
            isHistoric: true
        }
    }
    componentDidMount(){
        this.setState({

        });
    }

    render() {
        return (
            <div style={timeboxContainer}>
                <div className="time-box" style={this.props.isHistoric ? timebox.historic: timebox.forecast}>
                    <div style={this.state.isHistoric ? timeboxTitle.historic : timeboxTitle.forecast}>
                        {this.state.isHistoric ? "Historic" : "Forecast"} {this.props.isStart ? "Start" : "End"}:
                    </div>
                    <div style={timeboxInnerBottom}>
                        <FontAwesomeIcon icon={faClock} style={this.props.isHistoric ? iconClock.historic : iconClock.forecast} /> 
                        {this.props.timestamp}
                    </div>
                </div>
            </div>
        )
    }
}

export default TimeBox

const timeboxContainer = {
    width: "75%"
}

const timeboxInnerBottom = {
    display: "flex",
}

const timeboxTitle = {
    historic:{
        fontSize: ".6rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "grey",
        textTransform: "uppercase" as "uppercase", 
        opacity: ".7"
    },
    forecast:{
        fontSize: ".6rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "grey", 
        textTransform: "uppercase" as "uppercase",
        opacity: ".7"
    }
}

const iconClock = {
    historic: {
        color: "lightgrey",
        fontSize: "1rem",
        marginRight: "4px"
    },
    forecast: {
        color: "black",
        opacity: ".3",
        fontSize: "1rem",
        marginRight: "4px"
    }
}

 const timebox = {
    historic:{
        backgroundColor: "white",    
        color: "black",
        border: "2px solid #dbdbdb",
        //borderRadius: "50px",
        fontSize: ".8rem",
        padding: "10px 15px 10px 15px",
        cursor: "pointer",
    },
    forecast: {
        backgroundColor: "#ebe6ff",    
        color: "black",
        border: "2px solid #ebe6ff",
        //borderRadius: "50px",
        fontSize: ".8rem",
        padding: "10px 15px 10px 15px",
        cursor: "pointer",
    }
}