import React, { Component, ObjectHTMLAttributes, useLayoutEffect, useState } from 'react';
import Header from "./Header";
import Pipeline from "./Pipeline";
import FilterForm from "./FilterForm";
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { EuiToast } from '@elastic/eui';
import { CoreStart, HttpStart, HttpSetup } from '../../../../src/core/public';

type VisState = {
    updatedTimestamp: string,
}

interface VisProps {
    censhareTimestamps: any,
    picTimestamps: any,
    d2cTimestamp: any,
    queueSizeCenshare: number,
    queueSizePic: number,
    queueSizeD2C: number,
    queueItemsCenshare: object,
    queueItemsPic: object,
    updatedTimestamp: string,
    isLoadingMetrics: Boolean,
    item: string,
    informationType: string,
    gte: string,
    lte: string,
    http: CoreStart['http'],
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
                <Pipeline item={this.props.item}
                    informationType={this.props.informationType}
                    http={this.props.http}
                    gte={this.props.gte}
                    lte={this.props.lte}
                    picTimestamps={this.props.picTimestamps}
                    censhareTimestamps={this.props.censhareTimestamps}
                    d2cTimestamp={this.props.d2cTimestamp}
                    queueSizeCenshare={this.props.queueSizeCenshare}
                    queueSizePic={this.props.queueSizePic}
                    queueSizeD2C={this.props.queueSizeD2C}
                    queueItemsCenshare={this.props.queueItemsCenshare}
                    queueItemsPic={this.props.queueItemsPic}
                    isLoadingMetrics={this.props.isLoadingMetrics} />
                <EuiToast
                    iconType="">
                    <p><span style={{ fontWeight: "bold" }}>Last Prediction Update:</span><span> {this.state.updatedTimestamp != "unknown" && this.state.updatedTimestamp != undefined ? this.state.updatedTimestamp : 'Unknown'}</span></p>
                </EuiToast>
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
