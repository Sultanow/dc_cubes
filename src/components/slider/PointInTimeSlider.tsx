import React, { Component } from 'react'
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'
import { SliderRail, Handle, Track } from './SliderParts'

const sliderStyle = {
    position: 'relative',
    width: '100%',
    touchAction: 'none',
}

interface PointInTimeSliderProps {
    max: number
    valueOfSlider: number[]
    onChange: any
}

export default class PointInTimeSlider extends Component<PointInTimeSliderProps, any> {

    onChange = value => {
        this.props.onChange("selectedPointInTime", value[0])
    }

    onUpdate = value => {
        this.props.onChange("selectedPointInTime", value[0])
    }

    render() {
        return (
            <div style={{ height: 25, width: '100%' }}>
                <Slider
                    mode={1}
                    step={1}
                    domain={[0, this.props.max]}
                    rootStyle={sliderStyle as any}
                    onChange={this.onChange}
                    onUpdate={this.onUpdate}
                    values={this.props.valueOfSlider}
                >
                    <Rail>
                        {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
                    </Rail>
                    <Handles>
                        {({ handles, getHandleProps }) => (
                            <div className="slider-handles">
                                {handles.map(handle => (
                                    <Handle
                                        key={handle.id}
                                        handle={handle}
                                        domain={[0, this.props.max]}
                                        getHandleProps={getHandleProps}
                                    />
                                ))}
                            </div>
                        )}
                    </Handles>
                    <Tracks right={false}>
                        {({ tracks, getTrackProps }) => (
                            <div className="slider-tracks">
                                {tracks.map(({ id, source, target }) => (
                                    <Track
                                        key={id}
                                        source={source}
                                        target={target}
                                        getTrackProps={getTrackProps}
                                    />
                                ))}
                            </div>
                        )}
                    </Tracks>
                </Slider>
            </div>
        )
    }
}