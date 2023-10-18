import React, { Component } from 'react';

interface PrometheusSettingsState {}

export default class PrometheusSettings extends Component<{}, PrometheusSettingsState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <h2>Prometheus Einstellungen</h2>
      </div>
    );
  }
}
