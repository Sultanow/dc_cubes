import React, { Component, useLayoutEffect, useState } from 'react';
import Header from "../src/Header";
import Pipeline from "../src/Pipeline";
import FilterForm from "../src/FilterForm";
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { EuiToast } from '@elastic/eui';

type VisState = {
    updatedTimestamp: string, 
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

export class Vis extends React.Component<VisProps, VisState> {

    constructor(props) {
        super(props);

        this.state = {
            updatedTimestamp: undefined, 
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            updatedTimestamp: nextProps.updatedTimestamp,
        };
    }

    componentDidUpdate() {

    }


    render() {
        return (
            <div className="visualization-container" style={vis}>
                {/* <DisplayWindowDimensions /> */}
                {/* <Header/> */}
                {/* <FilterForm/> */}
                <Pipeline picTimestamps={this.props.picTimestamps}
                    censhareTimestamps={this.props.censhareTimestamps}
                    queueSizeCenshare={this.props.queueSizeCenshare}
                    queueSizePic={this.props.queueSizePic}
                    queueItemsCenshare={this.props.queueItemsCenshare}
                    queueItemsPic={this.props.queueItemsPic} />
                <EuiToast 
                    // title=""
                    // color="success"
                    iconType="">
                    <p><span style={{fontWeight:"bold"}}>Last Prediction Update:</span><span> {this.state.updatedTimestamp != "unknown" && this.state.updatedTimestamp != undefined ? this.state.updatedTimestamp : 'Unknown' }</span></p>
                </EuiToast>
                {/* <FormattedMessage
                    id="productQueues.timestampText"
                    defaultMessage="Last time updated predictions: {time}"
                    values={{ time: this.state.updatedTimestamp != "unknown" ? this.state.updatedTimestamp : 'Unknown' }}
                /> */}
            </div>
        )
    }
}

export default Vis

const vis = {
    
}


const DisplayWindowDimensions = () => {
    const [width, height] = useWindowSize();
    return <div><span>Window size: {width} x {height}</span></div>;
};

function getWindowWidth() {
    const [width] = useWindowSize();
    return width
}

function getWindowHeight() {
    const [height] = useWindowSize();
    return height
}

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}
