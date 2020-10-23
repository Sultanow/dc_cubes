import React, { Component } from 'react'


import {
    EuiIcon
} from '@elastic/eui';


interface QueueMetricsState {
    queueSize: number,
    queueItems: Array<string>,
    queueUtilization: any,
    queueThroughput: any,
}

interface QueueMetricsProps {
    queueSize: number,
    queueItems: object,
    tierName: String
}

export class QueueMetrics extends Component<QueueMetricsProps, QueueMetricsState> {

    state = {
        queueSize: 0,
        queueItems: [],
        queueUtilization: 0,
        queueThroughput: 0,
    }

    constructor(props: any) {
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
        //console.log("items: ", this.state.queueItems)
    }

    render() {

        return (
            <div>
                <div style={{ textAlign: "left", position: "relative", left: "-125px", fontSize: ".8rem" }}>
                    <span style={{ fontWeight: "bold" }}>Tier: </span><span>{this.props.tierName}</span>
                </div>
                <div >
                    <div className="metrics-container" style={metricsContainer}>
                        <EuiIcon style={{ marginTop: "auto", marginBottom: "auto" }} size="l" type="visGauge" />
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
                                    <td style={td}>{this.state.queueItems["doc_early"] ? calculateQueueThroughput(this.state.queueItems): 0}/h</td>
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
    textAlign: "left" as "left",
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


//Intersection between two Arrays
function intersect(a: Array<string>, b: Array<string>): Array<string> {
    const setB: Set<string> = new Set(b);
    return [...new Set(a)].filter(x => setB.has(x));
}


function calculateQueueThroughput(queueItems: any): number {
    if(queueItems.doc_early.hits.hits[0] != undefined && queueItems.doc_late.hits.hits[0] != undefined){
        const sizeDocEarly: number = queueItems.doc_early.hits.hits[0]._source.size
        const itemsDocEarly: string = queueItems.doc_early.hits.hits[0]._source.items
        const itemsDocLate: string = queueItems.doc_late.hits.hits[0]._source.items
        const itemsArrayEarly: Array<string> = itemsDocEarly.split(' '); // split string on space
        const itemsArrayLate: Array<string> = itemsDocLate.split(' '); 
        const intersectItemsArray: Array<string> = intersect(itemsArrayEarly, itemsArrayLate)
        const lenghIntersection: number = intersectItemsArray.length;
        const diff: number = sizeDocEarly - lenghIntersection
        console.log("throughput: ", diff)
        return diff
    }
    else{
        console.log("throughput: ", 0)
        return 0
        
    }
}
