import React, { PureComponent } from 'react';
import { PanelEditorProps } from '@grafana/data';
import { Select, PanelOptionsGroup, FormLabel } from '@grafana/ui';
import { EditorPanelOptions } from '../../App';

const aggregationTypeOptions = [
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'avg', label: 'Average' },
  { value: 'sum', label: 'Sum' },
];

const selectedMeasureOptions = [
  { value: 'count', label: 'Auslastung' },
  { value: 'minv', label: 'minv' },
  { value: 'maxv', label: 'maxv' },
  { value: 'dev_low', label: 'dev_low' },
  { value: 'dev_upp', label: 'dev_upp' },
];

export class EditorPanel extends PureComponent<PanelEditorProps<EditorPanelOptions>> {
  onAggregationTypeChange = aggregationType => this.props.onOptionsChange({ ...this.props.options, aggregationType: aggregationType.value });
  onSelectedMeasureChange = selectedMEasure => this.props.onOptionsChange({ ...this.props.options, selectedMeasure: selectedMEasure.value });

  render() {
    const { selectedMeasure, aggregationType } = this.props.options;
    return (
      <div>
        <PanelOptionsGroup title="Settings for 3D Visualization">
          <div className="gf-form">
            <FormLabel width={9}>Aggregation Type</FormLabel>
            <Select
              width={8}
              options={aggregationTypeOptions}
              onChange={this.onAggregationTypeChange}
              value={aggregationTypeOptions.find(option => option.value === aggregationType)}
            />
          </div>
          <div className="gf-form">
            <FormLabel width={9}>Measure</FormLabel>
            <Select
              width={8}
              options={selectedMeasureOptions}
              onChange={this.onSelectedMeasureChange}
              value={selectedMeasureOptions.find(option => option.value === selectedMeasure)}
            />
          </div>
        </PanelOptionsGroup>
      </div>
    );
  }
}
