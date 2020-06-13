import React, { Component } from 'react'

export class ProcessorBox extends Component {
    render() {
        return (
            <div style={processorBoxContainer}>
                <div style={lineDashed}></div>
                <div style={processorBox}>ProcessorBox</div>
                <div style={lineDashed}></div>
            </div>
        )
    }
}

export default ProcessorBox

const processorBoxContainer = {
    width: "200px"
}

const processorBox = {
    backgroundColor : "white",
    padding: "30px 0px",
    borderRadius: "0px",
    border: "3px solid lightgrey"
}

const lineDashed = {
    borderRight: "2px dashed lightgrey",
    width: "95px",
    height: "20px",
}