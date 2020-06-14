import React, { Component } from 'react'
import ProgressPipe from "./ProgressPipe"

export class ProcessorBox extends Component {
    render() {
        return (
            <div style={processorBoxContainer}>
                <div style={lineDashed}></div>
                    <div style={processorBoxProgressPipeContainer}>
                        <div style={processorBox}>ProcessorBox</div>
                        <ProgressPipe progressStatus={50}/>
                    </div>
                <div style={lineDashed}></div>
            </div>
        )
    }
}

export default ProcessorBox

const processorBoxContainer = {

}

const processorBox = {
    backgroundColor : "#e3e3e3",
    padding: "30px 0px",
    borderRadius: "0px",
    border: "3px solid black",
}

const lineDashed = {
    borderRight: "2px dashed grey",
    width: "95px",
    height: "20px",
}

const processorBoxProgressPipeContainer = {
    display: "grid",
    gridTemplateColumns: "70% 30%",
}