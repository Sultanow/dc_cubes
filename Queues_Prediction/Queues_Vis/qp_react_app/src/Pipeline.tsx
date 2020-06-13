import React, { Component } from 'react'
import Processor from "./Processor"

export class Pipeline extends Component {
    render() {
        return (
            <div style={pipelineContainer}>
                <Processor/>
            </div>
        )
    }
}

export default Pipeline

const pipelineContainer = {
    backgroundColor: "white",
}