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
    height: "40px", 
    backgroundColor: "white", 
    marginTop: "auto", 
    marginBottom: "auto",
    borderTop: "4px solid #e3e3e3",
    borderBottom: "4px solid #e3e3e3", 
}

const progressBar = {
    base:{
    backgroundColor: "#F2B544", 
    height: "100%",
    width: "0%" 
    }, 
    ten:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "10%"
    },
    twenty:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "20%"
    },
    thirty:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "30%"
    },
    fourty:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "40%"
    },
    fithy:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "50%"
    },
    sixty:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "60%"
    },
    seventy:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "70%"
    },
    eighty:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "80%"
    },
    ninethy:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "90%"
    },
    hundred:{
        backgroundColor: "#F2B544", 
        height: "100%",
        width: "100%"
    },
}

const progressStatusInfoBox = {
    backgroundColor: "white", 
    color: "grey",
    borderRadius: "50px",
    position: "relative" as "relative", 
    display: "flex", 
    justifyContent: "center", 
    top: "-77%", 
    left: "15%",
    width: "70%",
    padding: "3px 0 3px 0", 
    textAlign: "center" as "center", 
    fontWeight: "bold" as "bold", 
    fontSize: ".9rem"
}