import React, { Component } from 'react'

interface CsvSettingsState {
}

export default class CsvSettings extends Component<{}, CsvSettingsState> {

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