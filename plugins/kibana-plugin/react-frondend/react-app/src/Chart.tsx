import React, { Component } from 'react'

type ChartState = {
    queueName : String,
    queueType : String,
}

interface ChartProps {
    queueName : String,
    queueType : String,
}

export class Chart extends Component<ChartProps, ChartState> {

    updateQueueParams(queueParams: object){
        this.setState(queueParams)
    }

    render() {
        return (
            <div style={chartContainer}>
                <div style={chart} className="chart">
                    <p>Chart for QueueName x Queue Type</p>
                    {this.props.queueName}
                </div>
            </div>
        )
    }
}

export default Chart

const chartContainer = {
    display: "flex",
    justifyContent: "center"
}

const chart = {
    backgroundColor: "#ddd", 
    height: "300px", 
    width: "600px", 
}