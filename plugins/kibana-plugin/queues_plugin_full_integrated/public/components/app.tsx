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
import { d2cQueueSizeURL, d2cDataUrl, iCoreDataURL, fetchWithTimeout, predictionURL, censhareDataUrl, timeZonesBrackets } from "./Utils";

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
  EuiCheckbox
} from '@elastic/eui';

import { CoreStart, HttpStart, HttpSetup } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '../../../../src/plugins/data/public';
import { PLUGIN_ID, PLUGIN_NAME } from '../../common';
import { convertIsoToMillis } from '../../../../src/plugins/discover/public/application/angular/context/api/utils/date_conversion';

type QueuesPluginAppState = {
  predictionsUpdateDisabled: Boolean,
  censhareTimestamps: Array<string>,
  picTimestamps: Array<string>,
  d2cTimestamps: Array<string>,
  iCoreMetaData: Array<string>,
  picPredictionTimestamps: Array<string>,
  queueSizeCenshare: number,
  queueSizePic: number,
  queueSizeD2C: number,
  queueItemsCenshare: Array<string>,
  queueItemsPic: Array<string>,
  updatedTimestamp: string,
  item: string,
  intervalId: any,
  queueName: string,
  informationType: string,
  informationTypeOptions: Array<string>,
  isLoadingMetrics: Boolean,
  gte: string,
  lte: string,
  cenColor: string,
  picColor: string,
  d2cColor: string,
  picPredictionColor: string,
  includePredictions: Boolean
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
    predictionsUpdateDisabled: false,
    censhareTimestamps: [],
    picTimestamps: [],
    d2cTimestamps: [],
    iCoreMetaData: [],
    picPredictionTimestamps: [],
    queueSizeCenshare: 0,
    queueSizePic: 0,
    queueSizeD2C: 0,
    queueItemsCenshare: [],
    queueItemsPic: [],
    updatedTimestamp: "undefined",
    item: "undefined",
    intervalId: null,
    queueName: "products",
    informationType: "CORE",
    informationTypeOptions: [],
    isLoadingMetrics: true,
    gte: "",
    lte: "",
    cenColor: "",
    picColor: "",
    d2cColor: "",
    iCoreColors: [],
    picPredictionColor: "",
    includePredictions: false
  }

  constructor(props: any) {
    super(props);
    this.state = (
      this.state
    )

  }

  //item in pic & censhare 3547747429

  componentDidMount() {
    this.setState({ gte: this.props.data.query.timefilter.timefilter.getTime().from });
    this.setState({ lte: this.props.data.query.timefilter.timefilter.getTime().to });
    var intervalId = setInterval(this.updateMetrics, 2000);
    this.setState({ intervalId: intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  updateMetrics = () => {
    this.setState({ isLoadingMetrics: false })
    this.updateCenshareQueueSize();
    this.updatePicQueueSize();
    this.updateD2CQueueSize();
    this.updatePicQueueItems();
    this.updateCenshareQueueItems();
    console.log(".")
    console.log("Queue metrics updated.")
  }

  predictionHandler = () => {
    this.setState({ predictionsUpdateDisabled: true });
    fetchWithTimeout(predictionURL, 10000)
      .then(res => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
      })
      .then(() => {
        this.setState({ predictionsUpdateDisabled: false });

        let now = new Date()
        this.setState({ updatedTimestamp: now.toDateString() + " " + now.toTimeString() });
        this.props.notifications.toasts.addSuccess(
          i18n.translate('productQueues.dataUpdated', {
            defaultMessage: 'Predicitons Updated!',
          })
        );
      })
      .catch((error) => {
        this.setState({ predictionsUpdateDisabled: false });
        this.props.notifications.toasts.addWarning(
          i18n.translate('productQueues.dataUpdated', {
            defaultMessage: 'Predicitons Update failed!',
          })
        );
        throw new Error("Error in Prediction Calculation handler: " + error.message);
      })
    console.log('update button clicked');
  };

  onClickSearchHandler = () => {

    this.setState({ censhareTimestamps: [] });
    this.setState({ picTimestamps: [] });
    this.setState({ d2cTimestamps: [] });
    this.setState({ iCoreMetaData: [] });
    this.setState({ cenColor: "" });
    this.setState({ picColor: "" });
    this.setState({ d2cColor: "" });

    if (this.state.item != "" && this.state.item != undefined && this.state.item != "undefined") {

      //censhare timestamps from ElasticSearch
      /*  const bodyCenshare = { item: this.state.item, name: this.state.queueName, gte: this.state.gte, lte: this.state.lte };
       this.props.http.post("/api/censhare/item", { body: JSON.stringify(bodyCenshare) }).then(res => {
         if (res) {
           this.unifyTimeStamps(res.data.aggregations, "censhare");
         }
       }); */

      //censhare timestamps from XML URL
      const censahreMetaDataURL = censhareDataUrl.replace("#{vib}", this.state.item);
      fetchWithTimeout(censahreMetaDataURL)
        .then(res => {
          if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }
          return (res.text());
        })
        .then(result => {
          let parser = new DOMParser();
          let xmlDoc = parser.parseFromString(result, "text/xml");
          if (xmlDoc.evaluate) {
            var inboxEnter = xmlDoc.evaluate('string(//asset/@creation_date)', xmlDoc, null, XPathResult.ANY_TYPE, null).stringValue;
            var inboxLeft = xmlDoc.evaluate('string(//asset/@modified_date)', xmlDoc, null, XPathResult.ANY_TYPE, null).stringValue;
            var timestamps = { queue_enter: inboxEnter, queue_left: inboxLeft };
            this.unifyTimeStamps(timestamps, "censhare");
          }
        })
        .catch((error) => {
          return ("Error in censahre XML fetch: " + error.message);
        })


      //pic timestamps
      const bodyPic = { item: this.state.item, name: this.state.queueName, contenttype: this.state.informationType, gte: this.state.gte, lte: this.state.lte };
      this.props.http.post("/api/pic/item", { body: JSON.stringify(bodyPic) }).then(res => {
        if (res) {
          this.unifyTimeStamps(res.data.aggregations, "PICenter");
        }
      });

      //d2c timestamps
      if (this.state.item != "" && this.state.item != "undefined") {
        let dataUrl = d2cDataUrl.replace("#{vib}", this.state.item);
        dataUrl = dataUrl.replace("#{brand}", "A01");
        dataUrl = dataUrl.replace("#{locale}", this.state.informationType);
        fetchWithTimeout(dataUrl)
          .then(res => {
            if (!res.ok) {
              throw res;
            }
            return res.json()
          })
          .then(
            (result) => {
              let timestamp = [];
              timestamp.push({ "queue_left": result["last-modified-date"] });
              this.unifyTimeStamps(timestamp, "D2C");
            },
            (error) => {
              console.log(error);
              return error
            }
          )
      }

      //iCore timestamps
      if (this.state.item != "" && this.state.item != "undefined") {
        let dataUrl = iCoreDataURL.replace("#{vib}", this.state.item);
        dataUrl = dataUrl.replace("#{brand}", "A01");
        dataUrl = dataUrl.replace("#{locale}", this.state.informationType);
        fetchWithTimeout(dataUrl)
          .then(res => {
            if (!res.ok) {
              throw res;
            }
            return res.json()
          })
          .then(
            (result) => {
              let iCoreMetaData = [];
              result["icore-info"].forEach(element => {
                iCoreMetaData.push(element);
              });
              this.unifyTimeStamps(iCoreMetaData, "iCore");
            },
            (error) => {
              console.log(error);
              return error
            }
          )
      }

      if (this.state.includePredictions) {
        //predictions timestamp, from gte to 7 days in the future
        const bodyPicPredictions = { item: this.state.item, name: this.state.queueName, contenttype: this.state.informationType, gte: this.state.gte, lte: "now+7d" };
        this.props.http.post("/api/pic/predictions", { body: JSON.stringify(bodyPicPredictions) }).then(res => {
          if (res) {
            this.unifyTimeStamps(res.data.aggregations, "picPredictions");
          }
        });
      }
    }
  };

  //converts all timestamps from diefferent sources into unix timestamps for comparison in setTimeBoxColors
  unifyTimeStamps = (data: any, queueName: string) => {
    let timeStamps = []
    timeStamps.push({ queue_enter: "", queue_left: "" });

    //if timestamps come from elastic
    if (queueName == "PICenter" || queueName == "picPredictions" /* || queueName == "censhare" */) {

      if (data.queue_enter.hits.hits[0] != undefined) {
        timeStamps[0].queue_enter = Date.parse(data.queue_enter.hits.hits[0]._source.timestamp);
      }
      if (data.queue_left.hits.hits[0] != undefined) {
        timeStamps[0].queue_left = Date.parse(data.queue_left.hits.hits[0]._source.timestamp);
      }

      switch (queueName) {
        /*        case "censhare":
                 this.setState({ censhareTimestamps: timeStamps });
                 break; */
        case "PICenter":
          this.setState({ picTimestamps: timeStamps });
          break;
        case "picPredictions":
          this.setState({ picPredictionTimestamps: timeStamps });
          break;
        default:
          console.log("Error: time formatting went wrong");
      }
    }

    //if timestamps come from API
    else if (queueName == "censhare" || queueName == "D2C" || queueName == "iCore") {

      switch (queueName) {
        case "censhare":
          //if censhare timestamps come from XML
          if (data.queue_enter != undefined) {
            timeStamps[0].queue_enter = Date.parse(timeZonesBrackets(data.queue_enter));
          }
          if (data.queue_left != undefined) {
            timeStamps[0].queue_left = Date.parse(timeZonesBrackets(data.queue_left));
          }
          this.setState({ censhareTimestamps: timeStamps });
          break;

        case "D2C":
          //D2C doesnt have data about CORE and MEDIA
          if (this.state.informationType != "CORE" && this.state.informationType != "MEDIA") {
            if (data[0].queue_enter != undefined) {
              timeStamps[0].queue_enter = Date.parse(timeZonesBrackets(data[0].queue_enter));
            }
            if (data[0].queue_left != undefined) {
              timeStamps[0].queue_left = Date.parse(timeZonesBrackets(data[0].queue_left));
            }
            this.setState({ d2cTimestamps: timeStamps });
          }
          break;
        case "iCore":
          //iCore doesnt have data about CORE and MEDIA
          if (this.state.informationType != "CORE" && this.state.informationType != "MEDIA") {
            let iCoreData = []
            data.forEach(function (regionData, i) {
              if (regionData["imported-date"] != undefined) {
                let timeStamp = Date.parse(timeZonesBrackets(regionData["imported-date"]));
                let region = data[i]["region"];
                iCoreData.push({ queue_enter: timeStamp, region: region, color: "" });
              }
            });
            this.setState({ iCoreMetaData: iCoreData });
          }
          break;
        default:
          console.log("Error: time formatting went wrong");
      }
    }
    this.setTimeBoxColors();
  }

  setTimeBoxColors = () => {
    if (this.state.censhareTimestamps[0] != undefined) {
      if (!isNaN(this.state.censhareTimestamps[0].queue_left)) {
        this.setState({ cenColor: "#C6EFCE" })
      }
    }

    //PICenter color check
    if (this.state.censhareTimestamps[0] != undefined && this.state.picTimestamps[0] != undefined) {
      if (!isNaN(this.state.censhareTimestamps[0].queue_left) && !isNaN(this.state.picTimestamps[0].queue_left)) {
        if (this.state.picTimestamps[0].queue_left >= this.state.censhareTimestamps[0].queue_left) {
          this.setState({ picColor: "#C6EFCE" })
        } else {
          this.setState({ picColor: "#FFEB9C" })
        }
      }
    }

    //PICenter PREDICTION color check
    if (this.state.censhareTimestamps[0] != undefined && this.state.picPredictionTimestamps[0] != undefined) {
      if (!isNaN(this.state.censhareTimestamps[0].queue_left) && !isNaN(this.state.picPredictionTimestamps[0].queue_left)) {
        if (this.state.picPredictionTimestamps[0].queue_left >= this.state.censhareTimestamps[0].queue_left) {
          this.setState({ picPredictionColor: "#C6EFCE" })
        } else {
          this.setState({ picPredictionColor: "#FFEB9C" })
        }
      }
    }

    //D2C Color check
    if (this.state.picTimestamps[0] != undefined && this.state.d2cTimestamps[0] != undefined) {
      if (!isNaN(this.state.picTimestamps[0].queue_left) && !isNaN(this.state.d2cTimestamps[0].queue_left)) {
        if (this.state.d2cTimestamps[0].queue_left >= this.state.picTimestamps[0].queue_left) {
          this.setState({ d2cColor: "#C6EFCE" })
        } else {
          this.setState({ d2cColor: "#FFEB9C" })
        }
      }
    }

    //iCore Color check
    if (!isNaN(this.state.d2cTimestamps[0].queue_left) && this.state.iCoreMetaData.length != 0) {
      let data = [];
      this.state.iCoreMetaData.forEach(element => {
        if (element.queue_enter >= this.state.d2cTimestamps[0].queue_left) {
          data.push({ queue_enter: element.queue_enter, region: element.region, color: "#C6EFCE" })
        } else {
          data.push({ queue_enter: element.queue_enter, region: element.region, color: "#FFEB9C" })
        }
      });
      this.setState({ iCoreMetaData: data });
    }
  }

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

  updateD2CQueueSize = async () => {

    if (this.state.item != "" && this.state.item != "undefined") {

      this.setState({
        queueSizeD2C: await fetch(d2cQueueSizeURL)
          .then(res => {
            if (!res.ok) {
              throw res;
            }
            return res.json()
          })
          .then(
            (result) => {
              return result["event-count"];
            },
            (error) => {
              console.log(error);
              return error
            }
          )
      })
    }
    else {
      this.setState({ queueSizeD2C: 0 });
    }
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

  onChangeCheckbox = (event) => {
    this.setState({ includePredictions: event.target.checked }, this.onfilterChangedCallback);
  }
  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  render() {
    return (
      <Router basename={this.props.basename}>
        <I18nProvider>
          <>
            <this.props.navigation.ui.TopNavMenu appName={PLUGIN_ID} showSearchBar={true} useDefaultBehaviors={true}
              onQuerySubmit={() =>
                this.setState({
                  gte: this.props.data.query.timefilter.timefilter.getTime().from,
                  lte: this.props.data.query.timefilter.timefilter.getTime().to
                },
                  this.onfilterChangedCallback)} />
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
                    <div style={{ margin: "10px" }}>
                      <EuiCheckbox
                        id={"predictionsCheckbox"}
                        checked={this.state.includePredictions}
                        onChange={(e) => this.onChangeCheckbox(e)}
                      />
                    </div>
                    <p style={{ marginTop: "5px" }}>Include <br /> predictions</p>
                    <EuiButton isDisabled={this.state.predictionsUpdateDisabled} type="primary" color="secondary" onClick={this.predictionHandler} fill size="m" style={{ marginLeft: "20px" }}>Update Predictions</EuiButton>
                  </div>
                  <Vis
                    includePredictions={this.state.includePredictions}
                    item={this.state.item}
                    informationType={this.state.informationType}
                    gte={this.state.gte}
                    lte={this.state.lte}
                    http={this.props.http}
                    picTimestamps={this.state.picTimestamps ? this.state.picTimestamps : []}
                    censhareTimestamps={this.state.censhareTimestamps ? this.state.censhareTimestamps : []}
                    d2cTimestamps={this.state.d2cTimestamps ? this.state.d2cTimestamps : []}
                    iCoreMetaData={this.state.iCoreMetaData ? this.state.iCoreMetaData : []}
                    picPredictionTimestamps={this.state.picPredictionTimestamps ? this.state.picPredictionTimestamps : []}
                    queueSizeCenshare={this.state.queueSizeCenshare}
                    queueSizePic={this.state.queueSizePic}
                    queueSizeD2C={this.state.queueSizeD2C}
                    queueItemsCenshare={this.state.queueItemsCenshare ? this.state.queueItemsCenshare : null}
                    queueItemsPic={this.state.queueItemsPic ? this.state.queueItemsPic : null}
                    updatedTimestamp={this.state.updatedTimestamp ? this.state.updatedTimestamp : undefined}
                    isLoadingMetrics={this.state.isLoadingMetrics}
                    cenColor={this.state.cenColor}
                    picColor={this.state.picColor}
                    picPredictionColor={this.state.picColor}
                    d2cColor={this.state.d2cColor}

                  />
                </EuiPageContent>
              </EuiPageBody>
            </EuiPage>
          </>
        </I18nProvider>
      </Router >
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

const br = {
  marginTop: "10px"
}

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