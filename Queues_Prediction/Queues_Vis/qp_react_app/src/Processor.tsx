import React, { Component } from 'react'
import TimeBox from "./TimeBox"
import ProcessorBox from "./ProcessorBox"

type ProcessorState = {
    isLastProcessor: Boolean,
    processorName: String
}

interface ProcessorProps {
    isLastProcessor: Boolean, 
    processorName: String,
    queueType: String, 
    queueName: String
}

export class Processor extends Component<ProcessorProps, ProcessorState> {
    render() {
        return (
            <div>
                <div style={processorContainer}>
                    <TimeBox isStart={true}
                    timestamp={"2020-01-20 12:01 UTC"}
                    isHistoric={true}/>
                    <ProcessorBox isLastProcessor={this.props.isLastProcessor}
                    processorName={this.props.processorName}
                    queueName={this.props.queueName}
                    queueType={this.props.queueType}/>
                    <TimeBox isStart={false}
                    timestamp={"2020-01-23 08:20 UTC"}
                    isHistoric={false}/>
                </div>
            </div>
        )
    }
}

export default Processor

const processorContainer = {
    width: "270px",
}