import React, { Component } from 'react'

type ProgressPipeState = {
    progressStatus : Number
}

interface ProgressPipeProps {
    progressStatus: Number
}

export class ProgressPipe extends Component<ProgressPipeProps, ProgressPipeState>{
    constructor(props:any) {
        super(props);
        
        this.state = {
            progressStatus: 0
        }
    }
    componentDidMount(){
        this.setState({
            progressStatus : this.props.progressStatus,
        });
    }

    setUpProgressBarStatus() {
        switch (this.props.progressStatus) {
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

    render() {
        return (
            <div style={progressPipeContainer}>
                <div style={this.setUpProgressBarStatus()}></div>
                <div style={progressStatusInfoBox}>
                    {this.props.progressStatus}%
                </div>
            </div>
        )
    }
}

export default ProgressPipe

const progressPipeContainer = {
    height: "30px",
    backgroundColor: "white", 
    marginTop: "auto", 
    marginBottom: "auto",
    borderTop: "4px solid rgb(66, 150, 190)",
    borderBottom: "4px solid rgb(66, 150, 190)", 
    //boxShadow: "-1px 0px 22px -2px rgba(0,0,0,0.2)",
    position: "relative" as "relative",
    cursor: "pointer"
}

const progressBar = {
    base:{
    backgroundColor: "rgb(66, 150, 190)",
    height: "100%",
    width: "0%" 
    }, 
    ten:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "10%"
    },
    twenty:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "20%"
    },
    thirty:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "30%"
    },
    fourty:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "40%"
    },
    fithy:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "50%"
    },
    sixty:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "60%"
    },
    seventy:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "70%"
    },
    eighty:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "80%"
    },
    ninethy:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "90%"
    },
    hundred:{
        backgroundColor: "rgb(66, 150, 190)", 
        height: "100%",
        width: "100%"
    },
}

const progressStatusInfoBox = {
    backgroundColor: "white", 
    color: "rgb(66, 150, 190)",
    borderRadius: "50px",
    position: "absolute" as "absolute", 
    left: "50%",
    top: "20%",
    transform: "translate(-50%, 0)",
    width: "40px",
    padding: "2px 0 2px 0", 
    textAlign: "center" as "center", 
    fontWeight: "bold" as "bold", 
    fontSize: ".7rem",
}