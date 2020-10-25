import React, { Component } from 'react'
import Processor from "./Processor"

interface PipelineProps {
    censhareTimestamps: object,
    picTimestamps: object,
    queueSizeCenshare: number,
    queueSizePic: number,
    queueItemsCenshare: object,
    queueItemsPic: object, 
    isLoadingMetrics: Boolean
}

interface PipeLineState{
    censhareTimestamps: any,
    picTimestamps: any,
    queueSizeCenshare: number
}

export class Pipeline extends Component<PipelineProps, PipeLineState> {

    constructor(props){
        super(props);

        this.state = {
            censhareTimestamps: [],
            picTimestamps: [],
            queueSizeCenshare: 0
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

    componentDidMount(){

    }
    
    render() {
        return (
            <div className="pipeline-container" style={pipelineContainer}>
                {/* Metrics data of a Processor component in subsequent Processor component. TODO: Refactor Sequence.*/}
                <Processor isLastProcessor={false}
                isFirstProcessor={true}
                processorName={"ERP"}
                timeLeft={getTimeLeft(this.state.censhareTimestamps.queue_enter, this.state.censhareTimestamps.queue_left)}
                progessStatus={100}
                isLoadingMetrics={this.props.isLoadingMetrics}/>
                <Processor isLastProcessor={false}
                isFirstProcessor={false}
                processorName={"PIM Edit"}
                queueName={"censhare"}
                queueType={null}
                timestamps={this.props.censhareTimestamps}
                queueSize={this.props.queueSizeCenshare}
                timeLeft={getTimeLeft(this.state.picTimestamps.queue_enter, this.state.picTimestamps.queue_left)}
                queueItems={this.props.queueItemsCenshare}
                progessStatus={100}
                isLoadingMetrics={this.props.isLoadingMetrics}/>
                <Processor isLastProcessor={false}
                isFirstProcessor={false}
                processorName={"PIM Browse/ B2B"}
                queueName={"pic"}
                queueType={null}
                timestamps={this.props.picTimestamps}
                queueSize={this.props.queueSizePic}
                timeLeft={""}
                queueItems={this.props.queueItemsPic}
                progessStatus={0}
                isLoadingMetrics={this.props.isLoadingMetrics}/>
                <Processor isLastProcessor={true}
                isFirstProcessor={false}
                processorName={"D2C"}
                queueName={"undefined"}
                queueType={null}
                timestamps={[]}
                queueSize={0}
                timeLeft={""}
                queueItems={[]}
                progessStatus={0}
                isLoadingMetrics={this.props.isLoadingMetrics}/>
            </div>
        )
    }
}

export default Pipeline

function getTimeLeft(enter: any, left: any): any{

    if(enter && left && typeof enter.hits.hits[0] === "object" && typeof left.hits.hits[0] === "object"){
        var hours = hoursLeft(new Date(enter.hits.hits[0]._source.timestamp).toString(), new Date(left.hits.hits[0]._source.timestamp).toString())
        return hours
    }
    else
        0
}

function hoursLeft(enter:string, left:string): number{

    var enterDate = new Date(enter)
    var leftDate = new Date(left)

    var hours = Math.abs(enterDate.getTime() - leftDate.getTime()) / 36e5
    
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