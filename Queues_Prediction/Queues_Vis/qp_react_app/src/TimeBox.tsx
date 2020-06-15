import React, { Component } from 'react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faClock} from "@fortawesome/free-solid-svg-icons"

type TimeboxState = {
    timePosition : String, 
    timeType : String
}

interface TimeboxProps {
    timePosition: String, 
    timestamp: String, 
    timeType: String
}

export class TimeBox extends React.Component<TimeboxProps, TimeboxState>{
    constructor(props:any) {
        super(props);
        
        this.state = {
            timePosition: "",
            timeType: ""
        }
    }
    componentDidMount(){
        this.setState({
            timePosition : this.props.timePosition,
        });
    }

    render() {
        return (
            <div style={timeboxContainer}>
                <div className="time-box" style={this.state.timePosition === "start" ? timebox.start: timebox.end}>
                    <div style={this.state.timePosition === "start" ? timeboxTitle.start : timeboxTitle.end}>
                        {this.state.timePosition} {this.props.timeType}:
                    </div>
                    <div style={timeboxInnerBottom}>
                        <FontAwesomeIcon icon={faClock} style={this.state.timePosition === "start" ? iconClock.start : iconClock.end} /> 
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
    start:{
        fontSize: ".6rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "grey",
        textTransform: "uppercase" as "uppercase", 
        opacity: ".7"
    },
    end:{
        fontSize: ".6rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "grey", 
        textTransform: "uppercase" as "uppercase",
        opacity: ".7"
    }
}

const iconClock = {
    start: {
        color: "lightgrey",
        fontSize: "1rem",
        marginRight: "4px"
    },
    end: {
        color: "black",
        opacity: ".3",
        fontSize: "1rem",
        marginRight: "4px"
    }
}

 const timebox = {
    start:{
        backgroundColor: "white",    
        color: "black",
        border: "2px solid #dbdbdb",
        //borderRadius: "50px",
        fontSize: ".8rem",
        padding: "10px 15px 10px 15px",
        cursor: "pointer",
    },
    end: {
        backgroundColor: "#ebe6ff",    
        color: "black",
        border: "2px solid #ebe6ff",
        //borderRadius: "50px",
        fontSize: ".8rem",
        padding: "10px 15px 10px 15px",
        cursor: "pointer",
    }
}