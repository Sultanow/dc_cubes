import React, { Component } from 'react'
import LoadingOverlay from 'fork-victorvhn-react-loading-overlay'
import { timeWindow } from "./Utils";

import {
    EuiIcon
} from '@elastic/eui';


interface QueueMetricsState {
    queueSize: number,
    queueItems: Array<string>,
    queueUtilization: number,
    queueThroughput: number
}

interface QueueMetricsProps {
    queueSize: number,
    queueItems: object,
    tierName: String,
    isLoadingMetrics: Boolean
}

export class QueueMetrics extends Component<QueueMetricsProps, QueueMetricsState> {

    state = {
        queueSize: 0,
        queueItems: [],
        queueUtilization: 0,
        queueThroughput: 0
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
            isLoadingMetrics: nextProps.isLoadingMetrics
        };
    }

    componentDidMount() {

    }

    componentDidUpdate() {

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
                        <LoadingOverlay
                            active={this.props.isLoadingMetrics}
                            spinner
                            text='Loading your content...'>

                            {this.props.tierName != "iCore" ?
                                <table className="metrics-table" style={this.props.isLoadingMetrics ? table.isLoading : table}>
                                    <tbody style={tbody}>
                                        <tr>
                                            <th style={th}>Queue Size:</th>
                                            <td style={td}>{this.state.queueSize ? "~" + (valueFormatter(this.state.queueSize * 1)) : 0}</td>
                                        </tr>

                                        {this.props.tierName == "D2C" ?
                                            <tr>
                                                <th style={th}> </th>
                                            </tr>
                                            :
                                            <tr>
                                                <th style={th}>Throughput:</th>
                                                <td style={td}>
                                                    {this.state.queueItems["doc_early"] ? "~" + (valueFormatter(calculateQueueThroughput(this.state.queueItems) * Math.round(60 / timeWindow))) : 0}/1h
                                            </td>
                                            </tr>
                                        }
                                        <tr>
                                            {/*   <th style={th}>Utilization:</th> */}
                                            {/*  <td style={td}>{this.state.queueItems["doc_early"] ? calculateQueueUtilization(this.state.queueItems) : 0}%</td> */}
                                        </tr>
                                    </tbody>
                                </table>
                                :
                                <span style={header}>iCore</span>}
                        </LoadingOverlay>
                    </div>

                </div>
            </div>
        )
    }
}

export default QueueMetrics

const table = {

    marginLeft: "8px",

    isLoading: {
        opacity: "0%",
        marginLeft: "8px",
    }
}

const header = {
    fontSize: "15px",
    verticalAlign: "middle",
    paddingTop: "10%",
    paddingLeft: "30%"
}

const thead = {
    display: "block",
    float: "left" as "left"
}

const tbody = {
    display: "block-inline",
    float: "right" as "right"
}

const th = {
    display: "block-inline",
    textAlign: "left" as "left",
    padding: "1px"
}

const td = {
    overflow: "visible",
    display: "flex",
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

//Differnce of two Array
function arr_diff(a1: Array<string>, a2: Array<string>): Array<string> {
    const a: Array<string> = [], diff: Array<string> = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}

function valueFormatter(value: any): string {
    var suffixes = ["", "k", "m", "b", "t"];
    var suffixNum = Math.floor(("" + value).length / 3);
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
    var result = shortValue.toString();
    if (shortValue % 1 != 0) {
        result = shortValue.toFixed(1);
    }
    return result + suffixes[suffixNum];
}

function calculateQueueThroughput(queueItems: any): number {
    if (queueItems.doc_early.hits.hits[0] != undefined && queueItems.doc_late.hits.hits[0] != undefined) {
        let itemsArrayEarly: Array<string>
        let itemsArrayLate: Array<string>

        const sizeDocEarly: number = queueItems.doc_early.hits.hits[0]._source.size
        const sizeDocLate: number = queueItems.doc_late.hits.hits[0]._source.size
        const itemsDocEarly: string = queueItems.doc_early.hits.hits[0]._source.items.toString()
        const itemsDocLate: string = queueItems.doc_late.hits.hits[0]._source.items.toString()

        if (itemsDocEarly.indexOf(' ') > 0 && itemsDocEarly !== "") {
            itemsArrayEarly = itemsDocEarly.split(' '); // split string on space
            itemsArrayLate = itemsDocLate.split(' ');
        }
        else {
            itemsArrayEarly = []
            itemsArrayLate = []
        }

        const intersectItemsArray: Array<string> = intersect(itemsArrayEarly, itemsArrayLate)
        const lenghIntersection: number = intersectItemsArray.length;
        const diff: number = sizeDocEarly - lenghIntersection

        return diff
    }
    else {
        return 0

    }
}

function calculateQueueUtilization(queueItems: any): number {
    if (queueItems.doc_early.hits.hits[0] != undefined && queueItems.doc_late.hits.hits[0] != undefined) {
        let itemsArrayEarly: Array<string>
        let itemsArrayLate: Array<string>

        const sizeDocLate: number = queueItems.doc_late.hits.hits[0]._source.size
        const sizeDocEarly: number = queueItems.doc_late.hits.hits[0]._source.size
        const itemsDocEarly: string = queueItems.doc_early.hits.hits[0]._source.items.toString()
        const itemsDocLate: string = queueItems.doc_late.hits.hits[0]._source.items.toString()

        if (itemsDocEarly.indexOf(' ') > 0 && itemsDocEarly !== "") {
            itemsArrayEarly = itemsDocEarly.split(' '); // split string on space
            itemsArrayLate = itemsDocLate.split(' ');
        }
        else {
            itemsArrayEarly = []
            itemsArrayLate = []
        }

        const intersectItemsArray: Array<string> = intersect(itemsArrayEarly, itemsArrayLate)
        const lenghIntersection: number = intersectItemsArray.length;

        const diff: number = sizeDocEarly - lenghIntersection

        const newItemsLength = arr_diff(itemsArrayEarly, itemsArrayLate).length

        const utilization: number = sizeDocEarly / diff

        if (!Object.is(NaN, utilization)) {
            return Math.round(utilization)
        }
        else {
            return 0
        }

    }
    else {
        return 0

    }
}
