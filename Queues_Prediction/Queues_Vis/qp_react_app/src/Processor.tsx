import React, { Component } from 'react'
import TimeBox from "./TimeBox"
import ProcessorBox from "./ProcessorBox"

export class Processor extends Component {
    render() {
        return (
            <div>
                <div style={processorContainer}>
                    <TimeBox timePosition={"start"}
                    timestamp={"2020-01-20 12:01 UTC"}
                    timeType={"Historic"}/>
                    <ProcessorBox/>
                    <TimeBox timePosition={"end"}
                    timestamp={"2020-01-23 08:20 UTC"}
                    timeType={"Forecast"}/>
                </div>
            </div>
        )
    }
}

export default Processor

const processorContainer = {
    padding: "10px",
    width: "300px"
}