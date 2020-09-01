import React, { Component } from 'react'
import Processor from "./Processor"
import { time } from 'console';

interface PipelineProps {
    censhareTimestamps: object,
    picTimestamps: object,
    queueSizeCenshare: string,
    queueSizePic: number,
    queueItemsCenshare: any,
    queueItemsPic: any
}

interface PipeLineState{
    censhareTimestamps: any,
    picTimestamps: any,
}

export class Pipeline extends Component<PipelineProps, PipeLineState> {
    
    constructor(props){
        super(props);

        this.state = {
            censhareTimestamps: [],
            picTimestamps: []
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            censhareTimestamps: nextProps.censhareTimestamps,
            picTimestamps: nextProps.picTimestamps
        };
    }

    componentDidUpdate(){

    }
    
    render() {
        return (
            <div style={pipelineContainer}>
                <Processor isLastProcessor={false}
                isFirstProcessor={true}
                processorName={"ERP"}
                queueName={"censhare"}
                queueType={"Product Queues"}
                timestamps={[]}
                queueSize={this.props.queueSizeCenshare}
                timeLeft={getTimeLeft(this.state.censhareTimestamps.queue_enter, this.state.censhareTimestamps.queue_left)}
                queueItems={this.props.queueItemsCenshare}
                progessStatus={100}/>
                <Processor isLastProcessor={false}
                isFirstProcessor={false}
                processorName={"PIM Edit"}
                queueName={"pic"}
                queueType={"Product Queues"}
                timestamps={this.props.censhareTimestamps}
                queueSize={this.props.queueSizePic}
                timeLeft={getTimeLeft(this.state.picTimestamps.queue_enter, this.state.picTimestamps.queue_left)}
                queueItems={this.props.queueItemsPic}
                progessStatus={100}/>
                <Processor isLastProcessor={false}
                isFirstProcessor={false}
                processorName={"PIM Browse/ B2B"}
                queueName={"D-E"}
                queueType={"Product Queues"}
                timestamps={this.props.picTimestamps}
                queueSize={this.props.queueSizeCenshare}
                timeLeft={""}
                queueItems={[]}
                progessStatus={70}/>
                <Processor isLastProcessor={true}
                isFirstProcessor={false}
                processorName={"D2C"}
                queueName={"E-F"}
                queueType={"Product Queues"}
                timestamps={[]}
                queueSize={0}
                timeLeft={""}
                queueItems={[]}
                progessStatus={0}/>
            </div>
        )
    }
}

export default Pipeline

function getTimeLeft(enter: any, left: any): any{
    //console.log("enter in pipeline: ", enter)
    //console.log("left in pipeline: ", left)

    if(enter && left && typeof enter.hits.hits[0] === "object" && typeof left.hits.hits[0] === "object"){
        console.log("type enter: ", typeof(enter))
        console.log("type left: ", typeof(left))
        var hours = hoursLeft(new Date(enter.hits.hits[0]._source.timestamp).toString(), new Date(left.hits.hits[0]._source.timestamp).toString())
        return hours
    }
    else
        0
}

function hoursLeft(enter:string, left:string): number{
    //console.log("enter date: ", enter)
    //console.log("left date: ", left)

    var enterDate = new Date(enter)
    var leftDate = new Date(left)

    var hours = Math.abs(enterDate.getTime() - leftDate.getTime()) / 36e5
    console.log("Hours Left: ", hours)
    
    if(Math.round(hours) < 1){
        return hours
    }else{
        return Math.round(hours)
    }
}

const pipelineContainer = {
    backgroundColor: "#F5F9FC",
    display: "flex", 
    padding: "20px",
    paddingTop: "40px",
    justifyContent: "center"
}