import React, { PureComponent } from 'react';
import { PanelProps, PanelPlugin } from '@grafana/ui';
import './index.css';
import App from './App';

export class MyPanel extends PureComponent<PanelProps> {
  render() {
    return <App />;
  }
}

export const plugin = new PanelPlugin(MyPanel);
