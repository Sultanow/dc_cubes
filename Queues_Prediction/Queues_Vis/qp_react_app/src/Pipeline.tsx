import React, { Component } from 'react'
import Processor from "./Processor"

export class Pipeline extends Component {
    render() {
        return (
            <div style={pipelineContainer}>
                <Processor isLastProcessor={false}
                processorName={"ERP"}/>
                <Processor isLastProcessor={false}
                processorName={"PIM Edit"}/>
                <Processor isLastProcessor={false}
                processorName={"PIM Browse/ B2B"}/>
                <Processor isLastProcessor={true}
                processorName={"D2C"}/>
            </div>
        )
    }
}

export default Pipeline

const pipelineContainer = {
    backgroundColor: "#F5F9FC",
    display: "flex", 
    padding: "20px",
    justifyContent: "center"
}