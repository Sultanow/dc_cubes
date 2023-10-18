import React, { Component } from 'react'
import TimeBox from "./TimeBox"
import ProcessorBox from "./ProcessorBox"
import QueueMetrics from "./QueueMetrics"
import { CoreStart, HttpStart, HttpSetup } from '../../../../src/core/public';
import { iCoreDataURL, fetchWithTimeout } from "./Utils";
import { Timestamp } from 'rxjs/internal/operators/timestamp';

type ProcessorState = {
    errorMessage: string
}

interface ProcessorProps {
    isLastProcessor: Boolean,
    isFirstProcessor: Boolean,
    processorName: String,
    queueType?: String,
    queueName?: String,
    item?: string,
    informationType?: string,
    gte: string,
    lte: string,
    timestamps?: any,
    predictionsTimestamps?: any,
    queueSize?: any,
    timeLeft: any,
    queueItems?: any,
    progressStatus: number,
    isLoadingMetrics: Boolean,
    http: CoreStart['http'],
    color?: any,
    predictionColor?: any,
    includePredictions?: Boolean
}

export class Processor extends Component<ProcessorProps, ProcessorState> {

    constructor(props: any) {
        super(props);

        this.state = {
            errorMessage: ""
        }
    }

    componentDidMount() {

    }

    componentDidUpdate() {

    }

    iCoreBlocksRenderer() {
        var iCoreBlocksArray = []
        var regions = ["MCW", "SGP", "MOK", "SHA"]

        if (this.props.timestamps != undefined) {
            for (var i = 0; i < regions.length; i++) {
                let timeStamp = "";
                let color = "";
                let regionData = this.props.timestamps.filter(element => element["region"] == regions[i])[0];
                if (regionData != undefined) {
                    timeStamp = regionData.queue_enter;
                    color = regionData.color;
                }

                var timeBlock = <TimeBox isEnter={true}
                    iCoreLocal={regions[i]}
                    http={this.props.http}
                    item={this.props.item}
                    informationType={this.props.informationType}
                    gte={this.props.gte}
                    lte={this.props.lte}
                    queueName={this.props.queueName}
                    timestamp={timeStamp}
                    color={color} />

                iCoreBlocksArray.push(timeBlock);
            }

        }
        return iCoreBlocksArray;
    }

    timestampFormatSetter(isEnter) {
        switch (this.props.queueName) {
            case "D2C":
                if (!isEnter && this.props.timestamps[0] != undefined) {
                    return this.props.timestamps[0].queue_left;
                } else {
                    return "";
                }
            default:
                if (isEnter && this.props.timestamps[0] != undefined) {
                    return this.props.timestamps[0].queue_enter;
                } else if (!isEnter && this.props.timestamps[0] != undefined) {
                    return this.props.timestamps[0].queue_left;
                }
        }
    }

    render() {
      
        return (
            <div className="processor-outer-container">
                {!this.props.isFirstProcessor ? <QueueMetrics isLoadingMetrics={this.props.isLoadingMetrics} tierName={this.props.queueName} queueSize={this.props.queueSize} queueItems={this.props.queueItems} /> : null}

                {this.props.queueName != "iCore" ?

                    <div className="processor-container" style={processorContainer}>
                        {!this.props.isFirstProcessor ?
                            <TimeBox isEnter={true}
                                http={this.props.http}
                                item={this.props.item}
                                informationType={this.props.informationType}
                                gte={this.props.gte}
                                lte={this.props.lte}
                                queueName={this.props.queueName}
                                timestamp={this.timestampFormatSetter(true)} />
                            : null}
                        <ProcessorBox progressStatus={this.props.progressStatus} isLastProcessor={this.props.isLastProcessor}
                            processorName={this.props.processorName}
                            queueName={this.props.queueName}
                            queueType={this.props.queueType}
                            isFirstProcessor={this.props.isFirstProcessor}
                            timeLeft={this.props.timeLeft} />
                        {!this.props.isFirstProcessor ?
                            <TimeBox isEnter={false}
                                item={this.props.item}
                                informationType={this.props.informationType}
                                http={this.props.http}
                                gte={this.props.gte}
                                lte={this.props.lte}
                                queueName={this.props.queueName}
                                timestamp={this.timestampFormatSetter(false)}
                                color={this.props.color} />
                            : null
                        }

                        {!this.props.includePredictions ? null :
                            this.props.queueName == "PICenter" ?
                                <TimeBox isEnter={false}
                                    item={this.props.item}
                                    informationType={this.props.informationType}
                                    http={this.props.http}
                                    gte={this.props.gte}
                                    lte={this.props.lte}
                                    queueName={"PI predictions"}
                                    timestamp={this.timestampFormatSetter(false)}
                                    color={this.props.predictionColor} />
                                : null
                        }
                    </div>

                    :

                    <div className="processor-container" style={iCoreProcessorContainer}>
                        <div style={metricsLine}></div>
                        <div className="line-dashed" style={lineDashed}></div>
                        {this.iCoreBlocksRenderer()}
                        <div className="line-dashed-bottom" style={lineDashedBottom}></div>
                        <div className="line-dashed-bottom-bottom" style={lineDashedBottomBottom}></div>
                    </div>
                }
            </div>
        )
    }
}

export default Processor

const processorContainer = {
    width: "250px",
    position: "relative" as "relative"
}

const iCoreProcessorContainer = {
    top: "-5px",
    width: "250px",
    position: "relative" as "relative"
}

/* TODO: move css to separate file, all the lines are copied now from processorbox
temporary solution, because processrobox for iCore will be not rendered
*/
const metricsLine = {
    border: "3px dashed #D3DAE6",
    borderRight: "none",
    borderBottom: "none",
    borderTop: "none",
    height: "126px",
    width: "31px",
    position: "absolute" as "absolute",
    left: "-31px",
    top: "-30px",
    borderTopLeftRadius: "0px"
}
const lineDashed = {
    border: "3px dashed grey",
    borderRight: "none",
    borderBottom: "none",
    width: "16px",
    height: "62px",
    position: "absolute" as "absolute",
    top: "35px",
    left: "-16px"
}


const lineDashedBottom = {
    border: "3px dashed grey",
    borderRight: "none",
    borderTop: "none",
    width: "16px",
    height: "62px",
    position: "absolute" as "absolute",
    top: "136px",
    left: "-16px"
}
const lineDashedBottomBottom = {
    border: "3px dashed grey",
    borderRight: "none",
    borderTop: "none",
    width: "16px",
    height: "80px",
    position: "absolute" as "absolute",
    top: "200px",
    left: "-16px"
}

function calculateQueueThroughput(queueItems: any): number {
    const sizeDocEarly: number = queueItems.doc_early.hits.hits[0]._source.size
    const sizeDocLate: number = queueItems.doc_late.hits.hits[0]._source.size
    const itemsDocEarly: string = queueItems.doc_early.hits.hits[0]._source.items
    const itemsDocLate: string = queueItems.doc_late.hits.hits[0]._source.items

    return 0
}