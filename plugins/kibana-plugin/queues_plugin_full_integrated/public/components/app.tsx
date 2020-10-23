/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, Component, useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import "../src/App.css"
import { Vis } from "./Vis"

import {
  EuiButton,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageHeader,
  EuiTitle,
  EuiSelect,
  EuiFormRow,
  EuiFieldText,
} from '@elastic/eui';

import { CoreStart, HttpStart, HttpSetup } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { PLUGIN_ID, PLUGIN_NAME } from '../../common';


type QueuesPluginAppState = {
  censhareTimestamps: Array<string>,
  picTimestamps: Array<string>,
  queueSizeCenshare: number,
  queueSizePic: number,
  queueItemsCenshare: Array<string>,
  queueItemsPic: Array<string>,
  updatedTimestamp: string,
  item: string, 
  intervalId: any, 
  queueName: string
}

interface QueuesPluginAppProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export class QueuesPluginApp extends Component<QueuesPluginAppProps, QueuesPluginAppState>{

  state = {
    censhareTimestamps: [],
    picTimestamps: [],
    queueSizeCenshare: 0,
    queueSizePic: 0,
    queueItemsCenshare: [],
    queueItemsPic: [],
    updatedTimestamp: "undefined",
    item: "undefined",
    intervalId: null, 
    queueName: "undefined"
  }

  constructor(props: any) {
    super(props);
    this.state = (
      this.state
    )

  }

  componentDidMount() {
    var intervalId = setInterval(this.updateMetrics, 5000);
    this.setState({intervalId: intervalId});
  }

  componentWillUnmount(){
    clearInterval(this.state.intervalId);
  }

  updateMetrics = () => {
    this.updateCenshareQueueSize();
    this.updatePicQueueSize();
    this.updatePicQueueItems();
    this.updateCenshareQueueItems();
  }

  predictionHandler = () => {

    this.props.http.get('http://localhost:5000/updatePrediction').then((res) => {
    });

    console.log('update button clicked')
    let now = new Date()
    console.log("now: ", now)

    this.setState({ updatedTimestamp: now.toDateString() + " " + now.toTimeString() });

    this.props.notifications.toasts.addSuccess(
      i18n.translate('productQueues.dataUpdated', {
        defaultMessage: 'Predicitons Updated!',
      })
    );
  };

  onClickHandler3 = () => {
    const body = { item: this.state.item, name: "products" };
    this.props.http.post("/api/censhare/item", { body: JSON.stringify(body) }).then(res => {
      if (res) {
        //console.log("DATA res cen: ", res.data.aggregations)
        this.setState({ censhareTimestamps: res.data.aggregations });
      }
    });
    this.props.http.post("/api/pic/item", { body: JSON.stringify(body) }).then(res2 => {
      if (res2) {
        //console.log("DATA res pic: ", res2.data.aggregations)
        this.setState({ picTimestamps: res2.data.aggregations })
      }
    });
  };

  updateCenshareQueueItems  = () => {
    const body = { name: "products" };
    this.props.http.post("/api/censhare/throughput/items", { body: JSON.stringify(body) }).then(res => {
      //console.log("censhare items obj: ", res);
      this.setState({ queueItemsCenshare: res.data.aggregations });
    });
  }

  updatePicQueueItems = () => {
    const body = { name: "products" };
    this.props.http.post("/api/pic/throughput/items", { body: JSON.stringify(body) }).then(res => {
      //console.log("pic items obj: ", res);
      this.setState({ queueItemsPic: res.data.aggregations })
    });
  }

  updateCenshareQueueSize() {
    const body = { name: "products" };
    this.props.http.post("/api/censhare/size", { body: JSON.stringify(body) }).then(res => {
      this.setState({ queueSizeCenshare: res.data.hits.hits[0]._source.size })
      console.log("cen queue size: ", res.data.hits.hits[0]._source.size);
    });
  }

  updatePicQueueSize  = () => {
    const body = { name: "products" };
    this.props.http.post("/api/pic/size", { body: JSON.stringify(body) }).then(res => {
      this.setState({ queueSizePic: res.data.hits.hits[0]._source.size })
      console.log("pic queue size: ", res.data.hits.hits[0]._source.size);
    });
  }

  handleChange = (event) => {
    this.setState({ item: event.target.value })
  };

  // TODO
  filterChange = (event) => {
    console.log("Filter queue: ", event.target.value)
    this.setState({ queueName: event.target.value })
  }

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  render() {
    return (
      <Router basename={this.props.basename}>
        <I18nProvider>
          <>
            <this.props.navigation.ui.TopNavMenu appName={PLUGIN_ID} showSearchBar={true} />
            <EuiPage restrictWidth="1500px">
              <EuiPageBody>
                <EuiPageHeader>
                  <EuiTitle size="l">
                    <h1>
                      <FormattedMessage
                        id="productQueues.helloWorldText"
                        defaultMessage="{name}"
                        values={{ name: PLUGIN_NAME }}
                      />
                    </h1>
                  </EuiTitle>
                </EuiPageHeader>
                <EuiPageContent>
                  <div className="filter-form-conatiner" style={filterFormContainer}>
                    <EuiFormRow label="">
                      <EuiFieldText placeholder="Search Items..." id="productQueues.itemField" onChange={this.handleChange} />
                    </EuiFormRow>
                    <EuiSelect onChange={this.filterChange}
                      options={[
                        { value: 'products', text: 'Products' },
                        { value: 'productrelation', text: 'Product Relation' },
                        { value: 'csproducts', text: 'CS Products' },
                        { value: 'stext', text: 'S Text' },
                        { value: 'featurestories', text: 'Feature Stories' }
                      ]}
                    />
                    <EuiButton type="primary" size="m" onClick={this.onClickHandler3}>Search</EuiButton>
                    <EuiButton type="primary" color="secondary" onClick={this.predictionHandler} fill size="m" style={{ marginLeft: "20px" }}>Update Predictions</EuiButton>
                  </div>
                  <Vis picTimestamps={this.state.picTimestamps ? this.state.picTimestamps : []}
                    censhareTimestamps={this.state.censhareTimestamps ? this.state.censhareTimestamps : []}
                    queueSizeCenshare={this.state.queueSizeCenshare}
                    queueSizePic={this.state.queueSizePic}
                    queueItemsCenshare={this.state.queueItemsCenshare ? this.state.queueItemsCenshare : null}
                    queueItemsPic={this.state.queueItemsPic ? this.state.queueItemsPic : null}
                    updatedTimestamp={this.state.updatedTimestamp ? this.state.updatedTimestamp : undefined}
                  />
                </EuiPageContent>
                <EuiPageContent>
                  <table>
                    <thead>
                      <tr>
                        <th>Tier</th>
                        <th>Item</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Censhare</td>
                        <td>4288291908</td>
                      </tr>
                      <tr>
                        <td>Censhare</td>
                        <td>3506464042</td>
                      </tr>
                      <tr>
                        <td>Censhare</td>
                        <td>3810442950</td>
                      </tr>
                      <tr>
                        <td>Censhare</td>
                        <td>2741829033</td>
                      </tr>
                      <tr>
                        <td>Pic</td>
                        <td>1400457484</td>
                      </tr>
                      <tr>
                        <td>Pic</td>
                        <td>3547747429</td>
                      </tr>
                      <tr>
                        <td>Pic</td>
                        <td>322537720</td>
                      </tr>
                      <tr>
                        <td>Pic</td>
                        <td>4181184071</td>
                      </tr>
                    </tbody>
                  </table>
                </EuiPageContent>
              </EuiPageBody>
            </EuiPage>
          </>
        </I18nProvider>
      </Router>
    )
  }
}
export default QueuesPluginApp

const ResponseDisplay = ({ data }) => {
  if (data) {
    return <EuiPageContent><div><pre>{JSON.stringify(data, null, 2)}</pre></div></EuiPageContent>
  }
  return <div></div>;
};

const filterFormContainer = {
  backgroundColor: "#F5F9FC",
  height: "80px",
  justifyContent: "center",
  display: "flex",
  paddingTop: "30px"
}

const input = {
  height: "40px",
  border: "2px solid #dbdbdb",
  borderRadius: "30px"
}

const select = {
  color: "black",
  lineHeight: "32px",
  height: "46px",
  padding: "5px 50px 5px 20px",
  borderRadius: "30px",
  border: "2px solid #dbdbdb",
  cursor: "pointer"
}

const searchBtn = {
  backgroundColor: "#FE9C6A",
  height: "46px",
  color: "white",
  padding: "5px 20px 5px 20px",
  cursor: "pointer",
  border: "2px solid #FE9C6A",
  borderRadius: "50px"
}

const form = {
  marginTop: "auto",
  marginBottom: "auto",
  display: "flex"
}

const predictionBtn = {
  backgroundColor: "#F5F9FC",
  height: "30px",
  color: "black",
  cursor: "pointer",
  fontWeight: "bold" as "bold",
  border: "none",
  borderBottom: "2px solid #F5F9FC",
  marginLeft: "50px",
  marginTop: "auto",
  marginBottom: "auto",

}
