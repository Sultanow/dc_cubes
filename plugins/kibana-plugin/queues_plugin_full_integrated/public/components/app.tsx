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
import { DataPublicPluginStart } from '../../../../src/plugins/data/public';
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
  queueName: string,
  informationType: string,
  informationTypeOptions: Array<string>,
  isLoadingMetrics: Boolean
}

interface QueuesPluginAppProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
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
    queueName: "products",
    informationType: "CORE",
    informationTypeOptions: [],
    isLoadingMetrics: true,
  }

  constructor(props: any) {
    super(props);
    this.state = (
      this.state
    )

  }

  //item in pic & censhare 3547747429

  componentDidMount() {
    var intervalId = setInterval(this.updateMetrics, 2000);
    this.props.data.query.timefilter.timefilter.setTime(this.props.data.query.timefilter.timefilter.timeDefaults);
    this.setState({ intervalId: intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  updateMetrics = () => {
    this.setState({ isLoadingMetrics: false })
    this.updateCenshareQueueSize();
    this.updatePicQueueSize();
    this.updatePicQueueItems();
    this.updateCenshareQueueItems();
    console.log(".")
    console.log("Queue metrics updated.")
  }

  predictionHandler = () => {
    this.props.http.get('http://localhost:5000/updatePrediction').then((res) => {
    });

    console.log('update button clicked')
    let now = new Date()
    //console.log("now: ", now)

    this.setState({ updatedTimestamp: now.toDateString() + " " + now.toTimeString() });

    this.props.notifications.toasts.addSuccess(
      i18n.translate('productQueues.dataUpdated', {
        defaultMessage: 'Predicitons Updated!',
      })
    );
  };

  onClickSearchHandler = () => {

    let data = this.props.data;
    let gte = data.query.timefilter.history.history.items[0].from;
    let lte = data.query.timefilter.history.history.items[0].to;

    const bodyCenshare = { item: this.state.item, name: this.state.queueName, gte: gte, lte: lte };
    this.props.http.post("/api/censhare/item", { body: JSON.stringify(bodyCenshare) }).then(res => {
      if (res) {
        //console.log("DATA res cen: ", res.data.aggregations)
        this.setState({ censhareTimestamps: res.data.aggregations });
      }
    });

    const bodyPic = { item: this.state.item, name: this.state.queueName, contenttype: this.state.informationType, gte: gte, lte: lte };
    this.props.http.post("/api/pic/item", { body: JSON.stringify(bodyPic) }).then(res => {
      if (res) {
        //console.log("DATA res pic: ", res.data.aggregations)
        this.setState({ picTimestamps: res.data.aggregations })
      }
    });
  };

  updateCenshareQueueItems = () => {
    const body = { name: this.state.queueName };
    this.props.http.post("/api/censhare/throughput/items", { body: JSON.stringify(body) }).then(res => {
      //console.log("censhare items obj: ", res);
      this.setState({ queueItemsCenshare: res.data.aggregations });
    });
  }

  updatePicQueueItems = () => {
    const body = { name: this.state.queueName };
    this.props.http.post("/api/pic/throughput/items", { body: JSON.stringify(body) }).then(res => {
      //console.log("pic items obj: ", res);
      this.setState({ queueItemsPic: res.data.aggregations })
    });
  }

  updateCenshareQueueSize() {
    const body = { name: this.state.queueName };
    this.props.http.post("/api/censhare/size", { body: JSON.stringify(body) }).then(res => {
      //console.log("test cen queue size: ", res.data);
      if (typeof res.data.hits.hits !== 'undefined' && res.data.hits.hits.length > 0) {
        this.setState({ queueSizeCenshare: res.data.hits.hits[0]._source.size })
      }

    });
  }

  updatePicQueueSize = () => {
    const body = { name: this.state.queueName };
    this.props.http.post("/api/pic/size", { body: JSON.stringify(body) }).then(res => {
      //console.log("test pic queue size: ", res.data);
      if (typeof res.data.hits.hits !== 'undefined' && res.data.hits.hits.length > 0) {
        this.setState({ queueSizePic: res.data.hits.hits[0]._source.size })
      }
    });
  }

  onChangeItemNameHandler = (event) => {
    this.setState({ item: event.target.value })
  };

  onBlurItemNameHandler = (event) => {
    if (event.target.value != "" /* && this.state.queueName == "products" */) {
      const body = { item: event.target.value };
      this.props.http.post("/api/contenttypes", { body: JSON.stringify(body) }).then(res => {
        if (res) {
          let contentTypes = res.data.aggregations["media types"].buckets.map(item => {
            return item.key
          });

          this.setState({ informationType: contentTypes[0] });
          this.setState({ informationTypeOptions: contentTypes }, this.onfilterChangedCallback);
        }
      });
    } else {
      this.setState({ informationTypeOptions: [] }, this.onfilterChangedCallback)
    }
  };

  onfilterChangedCallback() {
    console.log("INFOTYPE:" + this.state.informationType);
    console.log("TIMEFILTER:");
    console.log(this.props.data);
    this.onClickSearchHandler();
    this.updateMetrics();
  }

  filterChange = (event) => {
    console.log("Filter queue: ", event.target.value)
    this.setState({ queueName: event.target.value }, this.onfilterChangedCallback)

    //this.updateMetrics();
  }

  onChangeInformationType = (event) => {
    this.setState({ informationType: event.target.value }, this.onfilterChangedCallback)
    console.log("selected information type" + this.state.informationType);
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
                      <EuiFieldText placeholder="Search Items..." id="productQueues.itemField" onChange={this.onChangeItemNameHandler} onBlur={this.onBlurItemNameHandler} />
                    </EuiFormRow>
                    <EuiSelect onChange={this.filterChange}
                      options={[
                        { value: 'products', text: 'Products' },
                        { value: 'productrelations', text: 'Product Relation' },
                        { value: 'csproducts', text: 'CS Products' },
                        { value: 'stext', text: 'S Text' },
                        { value: 'featurestories', text: 'Feature Stories' }
                      ]}
                    />
                    <div style={{ display: this.state.queueName == "products" ? 'block' : 'none' }}>
                      <EuiSelect value={this.state.informationType} disabled={this.state.informationTypeOptions.length == 0 ? true : false} onChange={this.onChangeInformationType}
                        options={
                          this.state.informationTypeOptions.map(option => {
                            return { value: option, text: option }
                          })
                        }
                      />
                    </div>
                    <EuiButton type="primary" size="m" onClick={this.onClickSearchHandler}>Search</EuiButton>
                    <EuiButton type="primary" color="secondary" onClick={this.predictionHandler} fill size="m" style={{ marginLeft: "20px" }}>Update Predictions</EuiButton>
                  </div>
                  <Vis picTimestamps={this.state.picTimestamps ? this.state.picTimestamps : []}
                    censhareTimestamps={this.state.censhareTimestamps ? this.state.censhareTimestamps : []}
                    queueSizeCenshare={this.state.queueSizeCenshare}
                    queueSizePic={this.state.queueSizePic}
                    queueItemsCenshare={this.state.queueItemsCenshare ? this.state.queueItemsCenshare : null}
                    queueItemsPic={this.state.queueItemsPic ? this.state.queueItemsPic : null}
                    updatedTimestamp={this.state.updatedTimestamp ? this.state.updatedTimestamp : undefined}
                    isLoadingMetrics={this.state.isLoadingMetrics}
                  />
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
