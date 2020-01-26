import React, { PureComponent } from 'react';
import httpClient from 'axios';
import { PanelEditorProps } from '@grafana/data';
import { Select, PanelOptionsGroup, FormLabel, Switch } from '@grafana/ui';
import { EditorPanelOptions } from '../../App';
import DataSource from '../../../../../../src/model/DataSource';

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

interface DataSourceObjects {
  value: DataSource;
  label: string;
}

const dataSources: DataSourceObjects[] = [
  { value: 'solr', label: 'Solr' },
  { value: 'elasticsearch', label: 'Elasticsearch' },
  { value: 'prometheus', label: 'Prometheus' },
  { value: 'csv', label: 'CSV' },
];

interface EditorPanelState {
  changeDataSource: boolean;
}

export class EditorPanel extends PureComponent<PanelEditorProps<EditorPanelOptions>, EditorPanelState> {
  constructor(props) {
    super(props);
    this.state = {
      changeDataSource: false,
    };
  }

  onAggregationTypeChange = aggregationType => this.props.onOptionsChange({ ...this.props.options, aggregationType: aggregationType.value });
  onSelectedMeasureChange = selectedMeasure => this.props.onOptionsChange({ ...this.props.options, selectedMeasure: selectedMeasure.value });
  onDataSourceChange = dataSource => this.props.onOptionsChange({ ...this.props.options, dataSource: dataSource.value });

  updatePredictions = () => {
    console.log('update predicitons called');
    httpClient.get('http://localhost:8080/startscript').then((data: any) => {
      console.log('Update Predictions answer: ' + data.data);
    });
  };

  render() {
    const { selectedMeasure, aggregationType, dataSource, predictionActivated } = this.props.options;

    let dataSourceOptionsPage: JSX.Element;
    if (dataSource === 'solr') {
      dataSourceOptionsPage = (
        <div className="section gf-form-group">
          <h5 className="section-heading">Solr Options</h5>
          <div className="gf-form">
            <span className="gf-form-label width-8">Alert name</span>
            <input type="text" className="gf-form-input max-width-15" placeholder="Alert name query" />
          </div>
          <div className="gf-form">
            <span className="gf-form-label width-8">Dashboard title</span>
            <input type="text" className="gf-form-input" placeholder="Dashboard title query" />
          </div>
          <div className="gf-form">
            <span className="gf-form-label width-8">Dashboard tags</span>
          </div>
        </div>
      );
    } else if (dataSource === 'elasticsearch') {
      dataSourceOptionsPage = (
        <div className="section gf-form-group">
          <h5 className="section-heading">Elasticsearch Options</h5>
        </div>
      );
    } else if (dataSource === 'prometheus') {
      dataSourceOptionsPage = (
        <div className="section gf-form-group">
          <h5 className="section-heading">Prometheus Options</h5>
        </div>
      );
    } else {
      dataSourceOptionsPage = (
        <div className="section gf-form-group">
          <h5 className="section-heading">CSV Options</h5>
        </div>
      );
    }
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
          <Switch
            className="gf-form"
            checked={predictionActivated}
            label="Activate Prediction"
            label-class="width-9"
            onChange={this.onDataSourceChange}
          />
          <div className="gf-form-button-row">
            <button className="btn btn-inverse" onClick={this.updatePredictions}>
              <i className="fa fa-redo-alt"></i>
              Update Predictions
            </button>
          </div>
        </PanelOptionsGroup>
        <PanelOptionsGroup title="Settings for Data Sources">
          <div>
            <div className="section gf-form-group">
              <div className="gf-form">
                <FormLabel width={9}>Data Source</FormLabel>
                <Select
                  width={12}
                  onChange={this.onDataSourceChange}
                  defaultValue={dataSources[0]}
                  options={dataSources}
                  value={selectedMeasureOptions.find(option => option.value === dataSource)}
                />
              </div>
            </div>
            {dataSourceOptionsPage}
          </div>
        </PanelOptionsGroup>
      </div>
    );
  }
}
