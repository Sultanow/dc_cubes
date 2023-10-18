import React, { Component } from 'react'
import Processor from "./Processor"
import { CoreStart, HttpStart, HttpSetup } from '../../../../src/core/public';

interface PipelineProps {
    censhareTimestamps: object,
    picTimestamps: object,
    d2cTimestamps: object,
    iCoreMetaData: object,
    picPredictionTimestamps: object,
    queueSizeCenshare: number,
    queueSizePic: number,
    queueSizeD2C: number,
    queueItemsCenshare: object,
    queueItemsPic: object, 
    isLoadingMetrics: Boolean,
    item: string,
    informationType: string,
    gte: string,
    lte: string,
    http: CoreStart['http'],
    cenColor: string,
    picColor: string,
    d2cColor: string,
    picPredictionColor: string,
    includePredictions: Boolean
}

interface PipeLineState{
    censhareTimestamps: any,
    picTimestamps: any,
    d2cTimestamps: any,
    iCoreMetaData: any,
    picPredictionTimestamps: any,
    queueSizeCenshare: number
}

export class Pipeline extends Component<PipelineProps, PipeLineState> {

    constructor(props){
        super(props);

        this.state = {
            censhareTimestamps: [],
            picTimestamps: [],
            d2cTimestamps: [],
            iCoreMetaData: [],
            picPredictionTimestamps: [],
            queueSizeCenshare: 0
        }

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            censhareTimestamps: nextProps.censhareTimestamps,
            picTimestamps: nextProps.picTimestamps,
            d2cTimestamps: nextProps.d2cTimestamp,
            iCoreMetaData: nextProps.iCoreMetaData,
            picPredictionTimestamps: nextProps.picPredictionTimestamps
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
                http={this.props.http}
                item={this.props.item}
                gte={this.props.gte}
                lte={this.props.lte}
                isFirstProcessor={true}
                processorName={"SAP CMD"}
                timeLeft={getTimeLeft(this.state.censhareTimestamps.queue_enter, this.state.censhareTimestamps.queue_left)}
                progressStatus={100}
                isLoadingMetrics={this.props.isLoadingMetrics}/>
                <Processor isLastProcessor={false}
                http={this.props.http}
                item={this.props.item}
                informationType={this.props.informationType}
                gte={this.props.gte}
                lte={this.props.lte}
                isFirstProcessor={false}
                processorName={"censhare"}
                queueName={"censhare"}
                queueType={null}
                timestamps={this.props.censhareTimestamps}
                queueSize={this.props.queueSizeCenshare}
                timeLeft={getTimeLeft(this.state.picTimestamps.queue_enter, this.state.picTimestamps.queue_left)}
                queueItems={this.props.queueItemsCenshare}
                progressStatus={100}
                isLoadingMetrics={this.props.isLoadingMetrics}
                color={this.props.cenColor}/>
                <Processor isLastProcessor={false}
                http={this.props.http}
                gte={this.props.gte}
                lte={this.props.lte}
                item={this.props.item}
                informationType={this.props.informationType}
                isFirstProcessor={false}
                processorName={"PICenter"}
                queueName={"PICenter"}
                queueType={null}
                timestamps={this.props.picTimestamps}
                predictionsTimestamps={this.props.picPredictionTimestamps}
                predictionColor={this.props.picPredictionColor}
                queueSize={this.props.queueSizePic}
                timeLeft={""}
                queueItems={this.props.queueItemsPic}
                progressStatus={100}
                isLoadingMetrics={this.props.isLoadingMetrics}
                color={this.props.picColor}
                includePredictions={this.props.includePredictions}/>
                <Processor isLastProcessor={false}
                http={this.props.http}
                gte={this.props.gte}
                lte={this.props.lte}
                item={this.props.item}
                informationType={this.props.informationType}
                isFirstProcessor={false}
                processorName={"Mule D2C"}
                queueName={"D2C"}
                queueType={null}
                timestamps={this.props.d2cTimestamps}
                queueSize={this.props.queueSizeD2C}
                timeLeft={""}
                queueItems={[]}
                progressStatus={100}
                isLoadingMetrics={this.props.isLoadingMetrics}
                color={this.props.d2cColor}/>
                <Processor isLastProcessor={true}
                http={this.props.http}
                gte={this.props.gte}
                lte={this.props.lte}
                item={this.props.item}
                informationType={this.props.informationType}
                isFirstProcessor={false}
                processorName={"iCore"}
                queueName={"iCore"}
                queueType={null}
                timestamps={this.props.iCoreMetaData}
                queueSize={0}
                timeLeft={""}
                queueItems={[]}
                progressStatus={0}
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
    overflowX: "scroll",
    backgroundColor: "#F5F9FC",
    display: "flex", 
    padding: "20px",
    paddingTop: "40px",
    justifyContent: "center"
}
