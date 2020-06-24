import React, { Component } from 'react'

type ProgressPipeState = {
    progressStatus : Number,
    queueName: String,
    queueType: String,
}

interface ProgressPipeProps {
    queType: String, 
    queName: String
}

export class ProgressPipe extends Component<ProgressPipeProps, ProgressPipeState>{

    constructor(props: any){
        super(props)
        this.state = {
            queueName: "Name undefined",
            queueType: "Type undefined",
            progressStatus: 0, 
        }
    }

    componentDidMount(){
        this.setUpProgressPipe();
    }

    setUpProgressPipe(){
        this.setState({
            progressStatus: this.calculateProgressStatus()
        })
    }

    calculateProgressStatus(){
        return 70 //add calculation formula for ratio from timerange between start und end processing timestamps
    }

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
                <div style={this.setUpProgressBarStatus()}></div>
                <div style={progressStatusInfoBox} onClick={this.onClickTest}>
                    {this.state.progressStatus}%
                </div>
            </div>
        )
    }
}

export default ProgressPipe

const progressPipeContainer = {
    height: "40px",
    backgroundColor: "white", 
    marginTop: "auto", 
    marginBottom: "auto",
    borderTop: "6px solid #ddd",
    borderBottom: "6px solid #ddd", 
    //boxShadow: "-1px 0px 22px -2px rgba(0,0,0,0.2)",
    position: "relative" as "relative",
    cursor: "pointer"
}

const progressBar = {
    base:{
    backgroundColor: "#3729A2",
    height: "100%",
    width: "0%" 
    }, 
    ten:{
        backgroundColor: "#FEE67F", 
        height: "100%",
        width: "10%"
    },
    twenty:{
        backgroundColor: "#FEE67F", 
        height: "100%",
        width: "20%"
    },
    thirty:{
        backgroundColor: "#FEE67F", 
        height: "100%",
        width: "30%"
    },
    fourty:{
        backgroundColor: "#FEE67F", 
        height: "100%",
        width: "40%"
    },
    fithy:{
        backgroundColor: "#FEE67F", 
        height: "100%",
        width: "50%"
    },
    sixty:{
        backgroundColor: "#FEE67F", 
        height: "100%",
        width: "60%"
    },
    seventy:{
        backgroundColor: "#FEE67F", 
        height: "100%",
        width: "70%"
    },
    eighty:{
        backgroundColor: "#FE9C6A", 
        height: "100%",
        width: "80%"
    },
    ninethy:{
        backgroundColor: "#FE9C6A", 
        height: "100%",
        width: "90%"
    },
    hundred:{
        backgroundColor: "#FE9C6A", 
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
    top: "25%",
    transform: "translate(-50%, 0)",
    width: "47px",
    padding: "2px 0 2px 0", 
    textAlign: "center" as "center", 
    // fontWeight: "bold" as "bold", 
    fontSize: ".8rem",
}