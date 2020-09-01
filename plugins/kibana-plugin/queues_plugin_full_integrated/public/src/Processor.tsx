import React, { Component } from 'react'
import TimeBox from "./TimeBox"
import ProcessorBox from "./ProcessorBox"
import QueueMetrics from "./QueueMetrics"

interface ProcessorState {
    
}

interface ProcessorProps {
    isLastProcessor: Boolean,
    isFirstProcessor: Boolean, 
    processorName: String,
    queueType: String, 
    queueName: String,
    timestamps: any,
    queueSize: any,
    timeLeft: any,
    queueItems: any,
    progessStatus: number
}

export class Processor extends Component<ProcessorProps,ProcessorState> {

    state = {
    
    }

    constructor(props:any){
        super(props);
        this.state = (
            this.state
        )

    }

    componentDidMount(){

    }

    componentDidUpdate(){

    }

    render() {

        return (
            <div>
                {!this.props.isFirstProcessor ? <QueueMetrics queueSize={this.props.queueSize} queueItems={this.props.queueItems}/> : null}
                <div style={processorContainer}>
                    {!this.props.isFirstProcessor ? <TimeBox isEnter={true} timestamp={this.props.timestamps.queue_enter}/> : null}
                    <ProcessorBox progessStatus={this.props.progessStatus} isLastProcessor={this.props.isLastProcessor}
                    processorName={this.props.processorName}
                    queueName={this.props.queueName}
                    queueType={this.props.queueType}
                    isFirstProcessor={this.props.isFirstProcessor}
                    timeLeft={this.props.timeLeft}/>
                    {!this.props.isFirstProcessor ? <TimeBox isEnter={false} timestamp={this.props.timestamps.queue_left}/> : null}
                </div>
            </div>
        )
    }
}

export default Processor

const processorContainer = {
    width: "330px",
    position: "relative" as "relative"
}