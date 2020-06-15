import React, { Component } from 'react'
import ProgressPipe from "./ProgressPipe"

type ProcessorBoxState = {
    isLastProcessor: Boolean,
    processorName: String,
    isProcessing: Boolean
}

interface ProcessorBoxProps {
    isLastProcessor: Boolean,
    processorName: String
}

export class ProcessorBox extends Component<ProcessorBoxProps, ProcessorBoxState> {

    state = {
        isLastProcessor: false,
        processorName: "",
        isProcessing: false,
    }

    constructor(props:any){
        super(props);
    }

    componentDidMount(){
        this.setUpProcessing();
    }

    setUpProgressPipe(){
        return this.props.isLastProcessor ? null : <ProgressPipe progressStatus={this.calculateProgressStatus()}/>
    }

    calculateProgressStatus(){
        return 50 //add calculation formula for ratio from timerange between start und end processing timestamps
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
                        <div style={processorBox.base}>
                            <div className={this.state.isProcessing ? "border-loading-spin" : "hidden"}></div>
                            {this.props.processorName}
                        </div>
                        {this.setUpProgressPipe()}
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
        backgroundColor : "#55C1CE",
        padding: "30px 0px",
        borderRadius: "px",
        //border: "3px solid #1D3159",
        color: "white", 
        cursor: "pointer",
        //fontWeight: "bold" as "bold",
        boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.2)", 
        position: "relative" as "relative"
    }
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