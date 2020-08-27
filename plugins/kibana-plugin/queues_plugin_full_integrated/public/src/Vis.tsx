import React, { Component } from 'react'
import Header from "../src/Header";
import Pipeline from "../src/Pipeline";
import FilterForm from "../src/FilterForm";
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';

type VisState = {
    updatedTimestamp: string
}

interface VisProps {
    censhareTimestamps: any,
    picTimestamps: any,
    queueSizeCenshare: string,
    queueSizePic: number,
    queueItemsCenshare: any,
    queueItemsPic: any,
    updatedTimestamp: string
}

export class Vis extends React.Component<VisProps,VisState> {

    constructor(props){
        super(props);

        this.state = {
            updatedTimestamp: undefined
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            updatedTimestamp: nextProps.updatedTimestamp,
        };
    }

    componentDidMount(){
 
    };

    componentDidUpdate(){

    }

    render() {
        return (
            <div>
                {/* <Header/> */}
                {/* <FilterForm/> */}
                <Pipeline picTimestamps={this.props.picTimestamps} 
                censhareTimestamps={this.props.censhareTimestamps} 
                queueSizeCenshare={this.props.queueSizeCenshare} 
                queueSizePic={this.props.queueSizePic}
                queueItemsCenshare={this.props.queueItemsCenshare}
                queueItemsPic={this.props.queueItemsPic}/>
                <FormattedMessage
                    id="productQueues.timestampText"
                    defaultMessage="Last time updated predictions: {time}"
                    values={{ time: this.state.updatedTimestamp != "unknown" ? this.state.updatedTimestamp : 'Unknown' }}
                />
            </div>
        )
    }
}

export default Vis
