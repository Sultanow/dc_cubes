import React, { Component } from 'react'
import { timeStamp } from 'console';
import { object } from 'lodash';
// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
// import {faClock} from "@fortawesome/free-solid-svg-icons"

import {
    EuiIcon
  } from '@elastic/eui';

type TimeboxState = {
    timePosition : String, 
    timestamp: any,
    isEnter: Boolean, 
    isHistoric: Boolean
}

interface TimeboxProps { 
    isEnter: Boolean,
    timestamp: any,
}

export class TimeBox extends React.Component<TimeboxProps, TimeboxState>{
    constructor(props:any) {
        super(props);
        
        this.state = {
            timePosition: "",
            timestamp: this.props.timestamp,
            isEnter: true, 
            isHistoric: true
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            timestamp: nextProps.timestamp,
        };
    }

    componentDidMount(){

    }

    componentDidUpdate(){
        //console.log("did update in Timebox props: ", this.props.timestamps)
        //console.log("did update in Timebox state: ", this.state.timestamps)

        //checkDates(this.state.timestamp);
    }

    render() {
        return (
            <div style={timeboxContainer}>
                <div className="time-box" style={this.state.isHistoric ? timebox.historic: timebox.forecast}>
                    <div style={this.state.isHistoric ? timeboxTitle.historic : timeboxTitle.forecast}>
                        <EuiIcon type="clock" />  {this.state.isHistoric ? "Historic" : "Forecast"} {this.props.isEnter ? "Entered" : "Left"}:
                    </div>
                    <div style={timeboxInnerBottom}>
                        <TimestampDisplay timestamp = {this.state.timestamp}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default TimeBox

function checkDates(timestamp){
    var CurrentDate = new Date();
    if(timestamp && timestamp != undefined && new Date(timestamp.hits.hits[0]._source.timestamp) > CurrentDate){
        
    }
    else{
        
    }
}

// .toLocaleDateString('de-DE', {timeZoneName:'short'}).toString()

const TimestampDisplay = ({timestamp}) => {
    var offset = new Date().getTimezoneOffset();
    if (timestamp != null && typeof timestamp.hits.hits[0] === "object") { 
    return <div style={{padding:"5px"}}>{ new Date(timestamp.hits.hits[0]._source.timestamp).toDateString() + " " + new Date(timestamp.hits.hits[0]._source.timestamp).toLocaleTimeString('de-DE', {timeZoneName:'short'}).toString()}</div>; 
    }
    return <div style={{textAlign: "center", paddingTop:"8px"}}>- - - - - - -</div>;
};

function hoursLeft(enter:string, left:string): number{
    console.log("enter date: ", enter)
    console.log("left date: ", left)

    var enterDate = new Date(enter)
    var leftDate = new Date(left)

    var hours = Math.abs(enterDate.getTime() - leftDate.getTime()) / 36e5
    console.log("Hours Left: ", hours)
    return Math.round(hours)
}

const timeboxContainer = {
    width: "75%",
    marginBottom: "15px",
    marginTop: "15px", 
    fontSize: ".7rem"
}

const timeboxInnerBottom = {
    // display: "flex",
}

const timeboxTitle = {
    historic:{
        // fontSize: ".8rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "#2e2e2e",
        textTransform: "uppercase" as "uppercase", 
        opacity: ".7"
    },
    forecast:{
        // fontSize: ".8rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "#2e2e2e", 
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
        borderRadius: "10px",
        // fontSize: ".8rem",
        padding: "10px",
        cursor: "pointer",
        height: "70px"
    },
    forecast: {
        backgroundColor: "#e9dcf7",    
        color: "black",
        border: "2px solid #e9dcf7",
        borderRadius: "10px",
        // fontSize: ".8rem",
        padding: "10px",
        cursor: "pointer",
        height: "70px"
    }
}