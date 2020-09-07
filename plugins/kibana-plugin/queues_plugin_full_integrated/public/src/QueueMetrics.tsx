import React, { Component } from 'react'

import {
    EuiIcon
  } from '@elastic/eui';
import { EuiTableHeader } from '@elastic/eui';
import { EuiTable } from '@elastic/eui';
import { EuiTableBody } from '@elastic/eui';

interface QueueMetricsState {
    queueSize: any,
    queueItems: any,
    queueUtilization: any,
    queueThroughput: any
}

interface QueueMetricsProps {
    queueSize: any,
    queueItems: any
}

export class QueueMetrics extends Component<QueueMetricsProps, QueueMetricsState> {

    state = {
        queueSize: 0,
        queueItems: [],
        queueUtilization: 0,
        queueThroughput: 0
    }

    constructor(props:any){
        super(props);
        this.state = (
            this.state
        )

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
                <div style={metricsContainer}>
                    <EuiIcon style={{marginTop: "auto", marginBottom: "auto"}} size="l" type="visGauge" />
                            <table style={table}>
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
