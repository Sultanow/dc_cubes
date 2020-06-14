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
        console.log("degub progress status: ")
        console.log(this.state.progressStatus)
        console.log("props: ")
        console.log(this.props.progressStatus)
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
            <div style={progressPipe}>
                <div style={this.setUpProgressBarStatus()}></div>
            </div>
        )
    }
}

export default ProgressPipe

const progressPipe = {
    height: "40px", 
    backgroundColor: "white", 
    marginTop: "auto", 
    marginBottom: "auto",
    borderTop: "4px solid #e3e3e3",
    borderBottom: "4px solid #e3e3e3", 
}

const progressBar = {
    base:{
    backgroundColor: "yellow", 
    height: "100%",
    width: "0%" 
    }, 
    ten:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "10%"
    },
    twenty:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "20%"
    },
    thirty:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "30%"
    },
    fourty:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "40%"
    },
    fithy:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "50%"
    },
    sixty:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "60%"
    },
    seventy:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "70%"
    },
    eighty:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "80%"
    },
    ninethy:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "90%"
    },
    hundred:{
        backgroundColor: "yellow", 
        height: "100%",
        width: "100%"
    },
}