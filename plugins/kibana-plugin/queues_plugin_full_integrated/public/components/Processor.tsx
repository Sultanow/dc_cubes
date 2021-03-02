import React, { Component } from 'react'
import TimeBox from "./TimeBox"
import ProcessorBox from "./ProcessorBox"
import QueueMetrics from "./QueueMetrics"
import { CoreStart, HttpStart, HttpSetup } from '../../../../src/core/public';

interface ProcessorState {

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
    queueSize?: any,
    timeLeft: any,
    queueItems?: any,
    progressStatus: number,
    isLoadingMetrics: Boolean,
    http: CoreStart['http'],
}

export class Processor extends Component<ProcessorProps, ProcessorState> {

    state = {

    }

    constructor(props: any) {
        super(props);
        this.state = (
            this.state
        )

    }

    componentDidMount() {

    }

    componentDidUpdate() {

    }

    render() {
        return (
            <div className="processor-outer-container">
                {!this.props.isFirstProcessor ? <QueueMetrics isLoadingMetrics={this.props.isLoadingMetrics} tierName={this.props.queueName} queueSize={this.props.queueSize} queueItems={this.props.queueItems} /> : null}
                <div className="processor-container" style={processorContainer}>
                    {!this.props.isFirstProcessor ?
                        <TimeBox isEnter={true}
                            http={this.props.http}
                            item={this.props.item}
                            informationType={this.props.informationType}
                            gte={this.props.gte}
                            lte={this.props.lte}
                            queueName={this.props.queueName}
                            timestamp={this.props.timestamps.queue_enter} />
                        : null}
                    <ProcessorBox progressStatus={this.props.progressStatus} isLastProcessor={this.props.isLastProcessor}
                        processorName={this.props.processorName}
                        queueName={this.props.queueName}
                        queueType={this.props.queueType}
                        isFirstProcessor={this.props.isFirstProcessor}
                        timeLeft={this.props.timeLeft} />
                    {!this.props.isFirstProcessor ?
                        <TimeBox isEnter={false} item={this.props.item} http={this.props.http} gte={this.props.gte} lte={this.props.lte} queueName={this.props.queueName} timestamp={this.props.timestamps.queue_left} /> : null}
                </div>
            </div>
        )
    }
}

export default Processor

const processorContainer = {
    width: "250px",
    position: "relative" as "relative"
}

function calculateQueueThroughput(queueItems: any): number {
    const sizeDocEarly: number = queueItems.doc_early.hits.hits[0]._source.size
    const sizeDocLate: number = queueItems.doc_late.hits.hits[0]._source.size
    const itemsDocEarly: string = queueItems.doc_early.hits.hits[0]._source.items
    const itemsDocLate: string = queueItems.doc_late.hits.hits[0]._source.items

    return 0
}