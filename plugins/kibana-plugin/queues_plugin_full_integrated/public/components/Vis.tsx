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
    d2cTimestamps: any,
    iCoreMetaData: any,
    picPredictionTimestamps: any,
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
    cenColor: string,
    picColor: string,
    picPredictionColor: string,
    d2cColor: string,
    includePredictions: Boolean
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
                <Pipeline
                    includePredictions={this.props.includePredictions}
                    item={this.props.item}
                    informationType={this.props.informationType}
                    http={this.props.http}
                    gte={this.props.gte}
                    lte={this.props.lte}
                    picTimestamps={this.props.picTimestamps}
                    censhareTimestamps={this.props.censhareTimestamps}
                    d2cTimestamps={this.props.d2cTimestamps}
                    iCoreMetaData={this.props.iCoreMetaData}
                    picPredictionTimestamps={this.props.picPredictionTimestamps}
                    queueSizeCenshare={this.props.queueSizeCenshare}
                    queueSizePic={this.props.queueSizePic}
                    queueSizeD2C={this.props.queueSizeD2C}
                    queueItemsCenshare={this.props.queueItemsCenshare}
                    queueItemsPic={this.props.queueItemsPic}
                    isLoadingMetrics={this.props.isLoadingMetrics}
                    cenColor={this.props.cenColor}
                    picColor={this.props.picColor}
                    picPredictionColor={this.props.picPredictionColor}
                    d2cColor={this.props.d2cColor} />
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
