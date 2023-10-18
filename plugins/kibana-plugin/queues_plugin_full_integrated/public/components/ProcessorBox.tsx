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
    timeLeft: any,
    progressStatus: number
}

export class ProcessorBox extends Component<ProcessorBoxProps, ProcessorBoxState> {

    state = {
        isLastProcessor: false,
        processorName: "",
        isProcessing: false,
        timeLeft: ""
    }

    constructor(props: any) {
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

    componentDidMount() {
        this.setUpProcessing();
    }

    setUpProcessing() {
        const condition = true
        if (condition) { //Check if processing status is true
            this.setState({
                isProcessing: true
            })
        } else {
            this.setState({
                isProcessing: false
            })
        }
    }

    render() {
        return (
            <div>
                {this.props.queueName != "iCore" ?
                    /* renderer for every block except iCore */
                    <div className="processor-box-container" style={processorBoxContainer}>
                        {!this.props.isFirstProcessor ? <div className="triangle-rotate" style={triangle}></div> : null}
                        {!this.props.isFirstProcessor ? <div style={metricsLine}></div> : null}
                        <div className="processor-box-progress-pipe-container" style={!this.props.isFirstProcessor ? processorBoxProgressPipeContainer : processorBoxProgressPipeContainerIsFirst}>
                            {!this.props.isFirstProcessor ? <div className="line-dashed" style={lineDashed}></div> : null}
                            <div className="processor-box" style={processorBox.base}>
                                {/* <div className={this.state.isProcessing ? "border-loading-spin" : "hidden"}></div> */}
                                {this.props.processorName}
                            </div>
                            {this.props.isLastProcessor ? null : <ProgressPipe progressStatus={this.props.progressStatus} queueName={this.props.queueName} queueType={this.props.queueType} timeLeft={this.props.timeLeft} />}
                        </div>
                        {!this.props.isFirstProcessor ? <div className="line-dashed-bottom" style={lineDashedBottom}></div> : null}
                    </div>
                    :
                    /* iCore renderer blue box - not visible, only timeboxes are rendered*/
                    <div className="processor-box-container" style={processorBoxContainer}>
                       {/* <div className="triangle-rotate" style={triangle}></div> */}
                       <div style={metricsLine}></div>
                        <div className="processor-box-progress-pipe-container" style={!this.props.isFirstProcessor ? processorBoxProgressPipeContainer : processorBoxProgressPipeContainerIsFirst}>
                          <div className="line-dashed" style={lineDashed}></div>
                            <div className="processor-box" style={processorBox.base}>
                                {/* <div className={this.state.isProcessing ? "border-loading-spin" : "hidden"}></div> */}
                                {this.props.processorName}
                            </div>
                        </div>
                        <div className="line-dashed-bottom" style={lineDashedBottom}></div>
                    </div>
                }
            </div>

        )
    }
}

export default ProcessorBox

const processorBoxContainer = {

}

const triangle = {
    width: "0px",
    height: "0px",
    borderLeft: "30px solid transparent",
    borderRight: "30px solid transparent",
    borderBottom: "30px solid #F1D86F",
    position: "absolute" as "absolute",
    zIndex: 10 as 10,
    top: "101px",
    left: "-6%"
}

const metricsLine = {
    border: "3px dashed #D3DAE6",
    borderRight: "none",
    borderBottom: "none",
    borderTop: "none",
    height: "126px",
    width: "31px",
    position: "absolute" as "absolute",
    left: "-31px",
    top: "-30px",
    borderTopLeftRadius: "0px"
}

const processorBox = {
    base: {
        backgroundColor: "#006BB4",
        padding: "25px 0px",
        borderRadius: "0px",
        color: "white",
        cursor: "pointer",
        position: "relative" as "relative",
        textAlign: "center" as "center",
        fontSize: ".8rem"
    }
}

const lineDashed = {
    border: "3px dashed grey",
    borderRight: "none",
    borderBottom: "none",
    width: "16px",
    height: "62px",
    position: "absolute" as "absolute",
    top: "35px",
    left: "-16px"
}


const lineDashedBottom = {
    border: "3px dashed grey",
    borderRight: "none",
    borderTop: "none",
    width: "16px",
    height: "62px",
    position: "absolute" as "absolute",
    top: "136px",
    left: "-16px"
}

const processorBoxProgressPipeContainer = {
    display: "grid",
    gridTemplateColumns: "75% 25%",
}

const processorBoxProgressPipeContainerIsFirst = {
    display: "grid",
    gridTemplateColumns: "75% 25%",
    marginTop: "191px"
}
