import React, { Component } from 'react'
import TimeBox from "./TimeBox"
import ProcessorBox from "./ProcessorBox"

export class Processor extends Component {
    render() {
        return (
            <div>
                <div style={processorContainer}>
                    <TimeBox/>
                    <ProcessorBox/>
                    <TimeBox/>
                </div>
            </div>
        )
    }
}

export default Processor

const processorContainer = {
    padding: "10px"
}