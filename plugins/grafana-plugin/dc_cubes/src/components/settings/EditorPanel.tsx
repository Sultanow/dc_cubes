import React, { PureComponent } from 'react';
import httpClient from 'axios';
import { PanelEditorProps } from '@grafana/data';
import { Select, PanelOptionsGroup, FormLabel, Switch } from '@grafana/ui';
import { EditorPanelOptions } from '../../App';
import DataSourceOptions from '../../../../../../src/model/DataSourceOptions';
import SelectOptions from '../../../../../../src/model/SelectOptions';
import { SolrSettings } from './SolrSettings';

const aggregationTypeOptions: SelectOptions[] = [
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'avg', label: 'Average' },
  { value: 'sum', label: 'Sum' },
];

const selectedMeasureOptions: SelectOptions[] = [
  { value: 'count', label: 'Auslastung' },
  { value: 'minv', label: 'minv' },
  { value: 'maxv', label: 'maxv' },
  { value: 'dev_low', label: 'dev_low' },
  { value: 'dev_upp', label: 'dev_upp' },
];

const dataSources: DataSourceOptions[] = [
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
  onPredictionChange = () => this.props.onOptionsChange({ ...this.props.options, predictionActivated: !this.props.options.predictionActivated });

  updatePredictions = () => {
    httpClient.get('http://localhost:8080/startscript').then((data: any) => {
      console.log('Update Predictions answer: ' + data.data);
    });
  };

  render() {
    const {
      selectedMeasure,
      aggregationType,
      dataSource,
      predictionActivated,
      solrBaseUrl,
      solrHistoricalCore,
      //solrQuery,
    } = this.props.options;

    let dataSourceOptionsPage: JSX.Element;
    if (dataSource === 'solr') {
      dataSourceOptionsPage = (
        <SolrSettings
          solrBaseUrl={solrBaseUrl}
          solrHistoricalCore={solrHistoricalCore}
          //solrQuery={solrQuery}
          onOptionsChange={this.props.onOptionsChange}
          options={this.props.options}
        />
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
            label-class="width-12"
            onChange={this.onPredictionChange}
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
                  defaultValue={dataSource}
                  options={dataSources}
                  value={dataSources.find(option => option.value === dataSource)}
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
