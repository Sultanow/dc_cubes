import React, { Component } from 'react'

import { connect } from "react-redux";
import {addProcessor} from "./redux/actions"

type addProcessorState = {
    processorName:String
}

interface addProcessoreProps {
    addProcessor:any
}


export class AddProcessor extends Component<addProcessoreProps,addProcessorState> {

    constructor(props:any){
        super(props);
        this.state = {
            processorName: ""
        }
    }

    updateProcessorName = (processorName:String) => {
        this.setState({
            processorName: processorName
        })
    }

    handleAddProcessor = () => {
        this.props.addProcessor(this.state.processorName);
        this.setState({
            processorName: ""
        })
    }
    
    render() {
        return (
            <div>
                
            </div>
        )
    }
}

export default connect(
    null,
    {addProcessor}
)(AddProcessor);
