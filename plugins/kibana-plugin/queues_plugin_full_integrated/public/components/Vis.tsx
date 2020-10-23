import React, { Component, ObjectHTMLAttributes, useLayoutEffect, useState } from 'react';
import Header from "./Header";
import Pipeline from "./Pipeline";
import FilterForm from "./FilterForm";
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { EuiToast } from '@elastic/eui';

type VisState = {
    updatedTimestamp: string, 
}

interface VisProps {
    censhareTimestamps: any,
    picTimestamps: any,
    queueSizeCenshare: number,
    queueSizePic: number,
    queueItemsCenshare: object,
    queueItemsPic: object,
    updatedTimestamp: string, 

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
                <Pipeline picTimestamps={this.props.picTimestamps}
                    censhareTimestamps={this.props.censhareTimestamps}
                    queueSizeCenshare={this.props.queueSizeCenshare}
                    queueSizePic={this.props.queueSizePic}
                    queueItemsCenshare={this.props.queueItemsCenshare}
                    queueItemsPic={this.props.queueItemsPic} />
                <EuiToast 
                    iconType="">
                    <p><span style={{fontWeight:"bold"}}>Last Prediction Update:</span><span> {this.state.updatedTimestamp != "unknown" && this.state.updatedTimestamp != undefined ? this.state.updatedTimestamp : 'Unknown' }</span></p>
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
