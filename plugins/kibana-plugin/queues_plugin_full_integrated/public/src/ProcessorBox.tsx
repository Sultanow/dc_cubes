import React, { Component } from 'react'
import ProgressPipe from "./ProgressPipe"

type ProcessorBoxState = {
    isLastProcessor: Boolean,
    processorName: String,
    isProcessing: Boolean,
    timeLeft: any
}

interface ProcessorBoxProps {
    isLastProcessor: Boolean,
    isFirstProcessor: Boolean,
    processorName: String,
    queueName: String,
    queueType: String,
    timeLeft: any
}

export class ProcessorBox extends Component<ProcessorBoxProps, ProcessorBoxState> {

    state = {
        isLastProcessor: false,
        processorName: "",
        isProcessing: false,
        timeLeft: ""
    }

    constructor(props:any){
        super(props);
        this.state = (
            this.state
        )

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            timeLeft: nextProps.timeLeft
        };
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
                {!this.props.isFirstProcessor ? <div style={metricsLine}></div> : null}
                    <div style={!this.props.isFirstProcessor ? processorBoxProgressPipeContainer : processorBoxProgressPipeContainerIsFirst}>
                    {!this.props.isFirstProcessor ? <div style={lineDashed}></div> : null}
                        <div className="processor-box" style={processorBox.base}>
                            {/* <div className={this.state.isProcessing ? "border-loading-spin" : "hidden"}></div> */}
                            {this.props.processorName}
                        </div>
                        {this.props.isLastProcessor ? null : <ProgressPipe queName={this.props.queueName} queType={this.props.queueType} timeLeft={this.props.timeLeft}/>}
                    </div>
                    {!this.props.isFirstProcessor ? <div style={lineDashedBottom}></div> : null}
            </div>
        )
    }
}

export default ProcessorBox

const processorBoxContainer = {

}


const metricsLine = {
    border: "4px dashed #D3DAE6",
    borderRight: "none",
    borderBottom: "none",
    height: "215px",
    width: "33px",
    position: "absolute" as "absolute",
    left: "-33px",
    top: "-69px"
}

const processorBox = {
    base:{
        backgroundColor : "#006BB4", //55C1CE
        padding: "40px 0px",
        borderRadius: "0px",
        // border: "2px solid rgb(66, 150, 190)",
        color: "white", 
        cursor: "pointer",
        //fontWeight: "bold" as "bold",
        //boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.2)", 
        position: "relative" as "relative",
        textAlign: "center" as "center"
    }
}

const lineDashed = {
    border: "3px dashed grey",
    borderRight: "none",
    borderBottom: "none",
    width: "18px",
    height: "99px",
    position: "absolute" as "absolute",
    top: "47px",
    left: "-17px"
}


const lineDashedBottom = {
    border: "3px dashed grey",
    borderRight: "none",
    borderTop: "none",
    width: "18px",
    height: "99px",
    position: "absolute" as "absolute",
    top: "191px",
    left: "-17px"
}

const processorBoxProgressPipeContainer = {
    display: "grid",
    gridTemplateColumns: "75% 25%",
}

const processorBoxProgressPipeContainerIsFirst = {
    display: "grid",
    gridTemplateColumns: "80% 20%",
    marginTop: "261px"
}