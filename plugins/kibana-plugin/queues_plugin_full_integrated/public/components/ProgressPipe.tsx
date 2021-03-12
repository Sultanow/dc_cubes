import React, { Component } from 'react'

import {
    EuiToolTip,
    EuiLink
} from '@elastic/eui';

type ProgressPipeState = {
    progressStatus: Number,
    queueName: String,
    queueType: String,
    timeLeft: any
}

interface ProgressPipeProps {
    queueType: String,
    queueName: String,
    timeLeft: any,
    progressStatus: number
}

export class ProgressPipe extends Component<ProgressPipeProps, ProgressPipeState>{

    constructor(props: any) {
        super(props)
        this.state = {
            queueName: "Name undefined",
            queueType: "Type undefined",
            progressStatus: this.props.progressStatus,
            timeLeft: null
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            timeLeft: nextProps.timeLeft
        };
    }

    componentDidMount() {
        this.setUpProgressPipe();
    }

    setUpProgressPipe() {
        this.setState({
            progressStatus: this.props.progressStatus
        })
    }

    calculateProgressStatus() {
        return 70 //add calculation formula for ratio from timerange between start und end processing timestamps
    }

    /* depricated */
    setUpProgressBarStatus() {
        switch (this.state.progressStatus) {
            case 0:
                return progressBar.base
                break;

            case 10:
                return progressBar.ten
                break;

            case 20:
                return progressBar.twenty
                break;

            case 30:
                return progressBar.thirty
                break;

            case 40:
                return progressBar.fourty
                break;

            case 50:
                return progressBar.fithy
                break;

            case 60:
                return progressBar.sixty
                break;

            case 70:
                return progressBar.seventy
                break;

            case 80:
                return progressBar.eighty
                break;

            case 90:
                return progressBar.ninethy
                break;

            case 100:
                return progressBar.hundred
                break;

            default:
                return progressBar.hundred
                break;
        }
    }
    
    onClickTest = () => {
        console.log("progress pipe clicked")
    }

    render() {
        return (
            <div className="progress-pipe-container" style={progressPipeContainer}>
                <div className="progress-bar-status" style={this.setUpProgressBarStatus()}></div>
                <div className="progress-status-info-box" style={progressStatusInfoBox} onClick={this.onClickTest}>
                    {/* this.state.timeLeft ? <span>T-{this.state.timeLeft}h</span>:  */<span>- - -</span>}
                </div>

            </div>
        )
    }
}

export default ProgressPipe

const progressPipeContainer = {
    height: "38px",
    backgroundColor: "white",
    marginTop: "auto",
    marginBottom: "auto",
    borderTop: "5px solid #ddd",
    borderBottom: "5px solid #ddd",
    //boxShadow: "-1px 0px 22px -2px rgba(0,0,0,0.2)",
    position: "relative" as "relative",
    cursor: "pointer"
}

const progressBar = {
    base: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "0%"
    },
    ten: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "10%"
    },
    twenty: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "20%"
    },
    thirty: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "30%"
    },
    fourty: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "40%"
    },
    fithy: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "50%"
    },
    sixty: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "60%"
    },
    seventy: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "70%"
    },
    eighty: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "80%"
    },
    ninethy: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "90%"
    },
    hundred: {
        backgroundColor: "#F1D86F",
        height: "100%",
        width: "100%"
    },
}

const progressStatusInfoBox = {
    backgroundColor: "white",
    color: "black",
    borderRadius: "50px",
    position: "absolute" as "absolute",
    left: "50%",
    top: "16%",
    transform: "translate(-50%, 0)",
    width: "58px",
    padding: "4px 0 4px 0",
    textAlign: "center" as "center",
    // fontWeight: "bold" as "bold", 
    fontSize: ".7rem",
}