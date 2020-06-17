import React, { Component } from 'react'
import ProgressPipe from "./ProgressPipe"

type ProcessorBoxState = {
    isLastProcessor: Boolean,
    processorName: String,
    isProcessing: Boolean, 
}

interface ProcessorBoxProps {
    isLastProcessor: Boolean,
    processorName: String,
    queueName: String,
    queueType: String,
}

export class ProcessorBox extends Component<ProcessorBoxProps, ProcessorBoxState> {

    state = {
        isLastProcessor: false,
        processorName: "",
        isProcessing: false,
    }

    constructor(props:any){
        super(props);
        this.state = (
            this.state
        )

    }

    componentDidMount(){
        this.setUpProcessing();
    }

    setUpProcessing(){
        const condition = true
        if(condition){ //Check if processing status is true
            this.setState({
                isProcessing: true
            })
        }else{
            this.setState({
                isProcessing: false
            })
        }
    }

    render() {
        return (
            <div style={processorBoxContainer}>
                <div style={lineDashed}></div>
                    <div style={processorBoxProgressPipeContainer}>
                        <div className="processor-box" style={processorBox.base}>
                            <div className={this.state.isProcessing ? "border-loading-spin" : "hidden"}></div>
                            {this.props.processorName}
                        </div>
                        {this.props.isLastProcessor ? null : <ProgressPipe queName={this.props.queueName} queType={this.props.queueType} />}
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
    base:{
        backgroundColor : "#4bc5de", //55C1CE
        padding: "40px 0px",
        borderRadius: "0px",
        // border: "2px solid rgb(66, 150, 190)",
        color: "white", 
        cursor: "pointer",
        //fontWeight: "bold" as "bold",
        //boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.2)", 
        position: "relative" as "relative",
    }
}

const lineDashed = {
    borderRight: "2px dashed grey",
    width: "100px",
    height: "20px",
}

const processorBoxProgressPipeContainer = {
    display: "grid",
    gridTemplateColumns: "75% 25%", 
}