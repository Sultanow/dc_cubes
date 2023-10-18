import React, { Component } from 'react';
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider';
import { SliderRail, Handle, Track } from './SliderParts'; // example render components - source below

const sliderStyle = {
  position: 'relative',
  width: '100%',
};

interface TimespanSliderProps {
  max: number;
  timespanValuesOfSlider: [number, number];
  onChange: any;
}

export default class TimespanSlider extends Component<TimespanSliderProps, any> {
  onUpdate = values => {
    this.props.onChange('selectedTimespan', values);
  };

  onChange = values => {
    this.props.onChange('selectedTimespan', values);
  };

  setDomain = domain => {
    this.setState({ domain });
  };

  toggleReverse = () => {
    this.setState(prev => ({ reversed: !prev.reversed }));
  };

  render() {
    return (
      <div style={{ height: 25, width: '100%' }}>
        <Slider
          mode={2}
          step={1}
          domain={[0, this.props.max]}
          rootStyle={sliderStyle as any}
          onUpdate={this.onUpdate}
          onChange={this.onChange}
          values={this.props.timespanValuesOfSlider}
        >
          <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <Handle key={handle.id} handle={handle} domain={[0, this.props.max]} getHandleProps={getHandleProps} />
                ))}
              </div>
            )}
          </Handles>
          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                ))}
              </div>
            )}
          </Tracks>
        </Slider>
      </div>
    );
  }
}
