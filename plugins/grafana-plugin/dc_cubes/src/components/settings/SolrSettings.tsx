import React, { PureComponent } from 'react';
import httpClient from 'axios';
import SelectOptions from '../../../../../../src/model/SelectOptions';
import { Select } from '@grafana/ui';

interface SolrSettingsProps {
  solrBaseUrl: string;
  solrHistoricalCore: string;
  //solrQuery: string;
  mapping: any;
  onOptionsChange: any;
  options: any;
}

interface SolrSettingsState {
  cores: SelectOptions[];
  selectedCore: string;
}

export class SolrSettings extends PureComponent<SolrSettingsProps, SolrSettingsState> {
  constructor(props: SolrSettingsProps) {
    super(props);
    this.state = {
      cores: [],
      selectedCore: '',
    };
  }

  onMappingChange = mapping => this.props.onOptionsChange({ ...this.props.options, mapping: mapping });
  //onSolrQueryChange = solrQuery => this.props.onOptionsChange({ ...this.props.options, solrQuery: solrQuery });
  onSolrBaseUrlChange = solrBaseUrl => this.props.onOptionsChange({ ...this.props.options, solrBaseUrl: solrBaseUrl });
  onSolrHistoricalCoreChange = solrCore => {
    this.setState({ ...this.state, selectedCore: solrCore });
    this.props.onOptionsChange({ ...this.props.options, solrHistoricalCore: solrCore });
  };

  render() {
    return (
      <div className="section gf-form-group">
        <h5 className="section-heading">Solr Options</h5>
        {/* <div className="gf-form">
          <span>URL Preview</span>
          <a href={this.props.solrBaseUrl + this.props.solrHistoricalCore}>{this.props.solrBaseUrl + this.props.solrHistoricalCore}</a>
        </div> */}
        <div className="gf-form">
          <span className="gf-form-label width-10">Base URL</span>
          <input type="text" className="gf-form-input" value={this.props.solrBaseUrl} onChange={this.onSolrBaseUrlChange} />
        </div>
        <div className="gf-form">
          <span className="gf-form-label width-10">Select Historical Core</span>
          <Select
            options={this.state.cores}
            onChange={this.onSolrHistoricalCoreChange}
            value={this.state.cores.find(option => option.value === this.props.solrHistoricalCore)}
          />
          {/* <input type="text" className="gf-form-input" value={this.props.solrHistoricalCore} onChange={this.onSolrHistoricalCoreChange} /> */}
        </div>
        {/* <div className="gf-form">
          <span className="gf-form-label width-10">Mapping</span>
        </div> */}
      </div>
    );
  }

  componentDidMount() {
    this.getAllSolrCores(this.props.solrBaseUrl + 'admin/cores?action=STATUS&indexInfo=false&wt=json');
  }

  getAllSolrCores = (url: string) => {
    httpClient
      .get(url)
      .then(data => {
        const cores: SelectOptions[] = [];
        const strCores: string[] = Object.keys(data.data.status || {});

        strCores.forEach((strCore, index) => {
          cores.push({ value: strCore, label: strCore });
        });

        this.setState({ cores: cores, selectedCore: cores[0].value });
        //this.props.accessApp('dataSourceError', false)
      })
      .catch(error => {
        //this.props.accessApp('dataSourceError', true)
        console.log(error);
      });
  };
}
