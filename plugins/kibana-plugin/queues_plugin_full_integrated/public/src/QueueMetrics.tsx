import React, { Component } from 'react'


import {
    EuiIcon
  } from '@elastic/eui';


interface QueueMetricsState {
    queueSize: any,
    queueItems: any,
    queueUtilization: any,
    queueThroughput: any,
    isMouseInside: Boolean
}

interface QueueMetricsProps {
    queueSize: any,
    queueItems: any, 
    tierName: String
}

export class QueueMetrics extends Component<QueueMetricsProps, QueueMetricsState> {

    state = {
        queueSize: 0,
        queueItems: [],
        queueUtilization: 0,
        queueThroughput: 0,
        isMouseInside: false
    }

    constructor(props:any){
        super(props);
        this.state = (
            this.state
        )

    }

    mouseEnter = () => {
        this.setState({ isMouseInside: true });
    }

    mouseLeave = () => {
    this.setState({ isMouseInside: false });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            queueSize: nextProps.queueSize,
            queueItems: nextProps.queueItems,
        };
    }

    componentDidMount() {
        
    }

    componentDidUpdate() {

    }

    

    render() {

        return (
            <div>
                <div style={{textAlign: "left", position: "relative", left: "-125px", fontSize: ".8rem"}}>
                    <span style={{fontWeight:"bold"}}>Tier: </span><span>{this.props.tierName}</span>
                </div>
                <div >
                    <div className="metrics-container" style={metricsContainer}>
                    <EuiIcon style={{marginTop: "auto", marginBottom: "auto"}} size="l" type="visGauge" />
                            <table className="metrics-table" style={table}>
                                <thead style={thead}>
                                    <tr style={tr}>
                                        <th style={th}>Queue Size:</th>
                                        <th style={th}>Throughput:</th>
                                        <th style={th}>Utilization:</th>
                                    </tr>
                                </thead>
                                <tbody style={tbody}>
                                    <tr>
                                        <td style={td}>{this.state.queueSize ? this.state.queueSize : 0}</td>
                                        <td style={td}>{this.state.queueThroughput}/h</td>
                                        <td style={td}>{this.state.queueUtilization}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                </div>
            </div>
        )
    }
}

export default QueueMetrics

const table = {
    // justifyContent:"center" as "center",
    // marginRight: "auto", 
    marginLeft: "8px"
}

const tr = {

}

const thead = {
    display: "block", 
    float: "left" as "left"
}

const tbody = {
    display: "block", 
    float: "right" as "right"
}

const th = {
    display: "block", 
    textAlign:"left" as "left", 
    padding: "1px"
} 

const td = {
    display: "block", 
    padding: "1px"
}

const metricsContainer = {
    backgroundColor: "#D3DAE6",
    padding: "15px 10px",
    borderRadius: "10px",
    color: "black",
    cursor: "pointer",
    textAlign: "center" as "center",
    width: "75%",
    marginBottom: "30px",
    border: "3px solid white", 
    display: "flex",
    fontSize: ".8rem",
    position: "relative" as "relative",  
    left: "-125px",
}
