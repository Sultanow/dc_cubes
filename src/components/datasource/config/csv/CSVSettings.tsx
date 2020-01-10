import React, { Component } from 'react'

interface CSVSettingsState {
}

export default class CSVSettings extends Component<{}, CSVSettingsState> {

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render() {
    return (
      <div>
        <h2>CSV Einstellungen</h2>
        <p>Upload</p>
      </div>
    )
  }
} 