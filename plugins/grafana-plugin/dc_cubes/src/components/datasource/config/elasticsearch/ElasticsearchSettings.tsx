import React, { Component } from 'react';

interface ElasticsearchSettingsState {}

export default class ElasticsearchSettings extends Component<{}, ElasticsearchSettingsState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <h2>Elasticsearch Einstellungen</h2>
      </div>
    );
  }
}
