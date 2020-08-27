import React, { Component } from 'react'

import {
    EuiIcon
  } from '@elastic/eui';

interface QueueMetricsState {
    queueSize: any,
    queueItems: any,
    queueWorkload: any,
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
        queueWorkload: 0,
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
                    <EuiIcon size="xl" type="visGauge" />
                    <div>
                        <span>Queue Size: </span>
                        <span>{this.state.queueSize}</span></div>
                    <div>
                        <span>Throughput: </span>
                        <span>{this.state.queueThroughput}</span>
                    </div>
                    <div>
                        <span>Workload: </span>
                        <span>{this.state.queueWorkload}</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default QueueMetrics

const metricsContainer = {
    backgroundColor: "#D3DAE6",
    padding: "15px 0px",
    borderRadius: "0px",
    color: "black",
    cursor: "pointer",
    textAlign: "center" as "center",
    width: "80%",
    marginBottom: "20px",
}
