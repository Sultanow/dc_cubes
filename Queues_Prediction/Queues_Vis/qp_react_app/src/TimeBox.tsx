import React, { Component } from 'react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faClock} from "@fortawesome/free-solid-svg-icons"

type TimeboxState = {
    timePosition : String
}

interface TimeboxProps {
    timePosition: String, 
    timestamp: String
}

export class TimeBox extends React.Component<TimeboxProps, TimeboxState>{
    constructor(props:any) {
        super(props);
        
        this.state = {
            timePosition: "",
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
                <div style={this.state.timePosition === "start" ? timebox.start : timebox.end}>
                    <div style={this.state.timePosition === "start" ? timeboxTitle.start : timeboxTitle.end}>
                        {this.state.timePosition} historic:
                    </div>
                    <div style={timeboxInnerBottom}>
                        <FontAwesomeIcon icon={faClock} style={this.state.timePosition === "start" ? iconClock.start : iconClock.end} /> 
                        2020-01-20 12:01 UTC
                    </div>
                </div>
            </div>
        )
    }
}

export default TimeBox

const timeboxContainer = {
    width: "70%"
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
        textTransform: "uppercase" as "uppercase"
    },
    end:{
        fontSize: ".6rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "white", 
        textTransform: "uppercase" as "uppercase"
    }
}

const iconClock = {
    start: {
        color: "lightgrey",
        fontSize: ".8rem",
        marginRight: "4px"
    },
    end: {
        color: "white",
        opacity: ".4",
        fontSize: ".8rem",
        marginRight: "4px"
    }
}

 const timebox = {
    start:{
        backgroundColor: "white",    
        color: "black",
        border: "3px solid #dbdbdb",
        borderRadius: "50px",
        fontSize: ".8rem",
        padding: "5px 15px 5px 15px"
    },
    end: {
        backgroundColor: "#D93D4A",    
        color: "white",
        border: "3px solid #D93D4A",
        borderRadius: "50px",
        fontSize: ".8rem",
        padding: "5px 15px 5px 15px"
    }
}