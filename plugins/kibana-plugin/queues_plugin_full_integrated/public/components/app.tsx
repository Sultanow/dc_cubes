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

import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import "../src/App.css"
import { Vis } from "../src/Vis"

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiSelect,
  EuiFormRow,
  EuiFieldText,
  EuiBasicTable,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { PLUGIN_ID, PLUGIN_NAME } from '../../common';
import { useSavedQuery } from '../../../../src/plugins/data/public/ui/search_bar/lib/use_saved_query';
import { Table } from 'react-virtualized';

interface QueuesPluginAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export const QueuesPluginApp = ({
  basename,
  notifications,
  http,
  navigation,
}: QueuesPluginAppDeps) => {

  // Use React hooks to manage state.
  const [censhareTimestamps, setCenshareTimestamps] = useState<object | undefined>([]);
  const [picTimestamps, setPicTimestamps] = useState<object | undefined>([]);
  const [queueName, setQueueName] = useState("products");
  const [item, setItem] = useState<string | undefined>();
  const [queueSizeCenshare, setQueueSizeCenshare] = useState<string | undefined>();
  const [queueSizePic, setQueueSizePic] = useState<number | undefined>();
  const [queueItemsCenshare, setQueueItemsCenshare] = useState<object | undefined>([]);
  const [queueItemsPic, setQueueItemsPic] = useState([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean | undefined>();

  const [updatedTimestamp, setUpdatedTimestamp] = useState<string | undefined>();

  const onClickHandler = () => {
    http.get('http://localhost:5000/updatePrediction').then((res) => {
    });
    console.log('update button clicked')
      let now = new Date()
      console.log("now: ", now)
      setUpdatedTimestamp(now.toDateString() + " " + now.toTimeString());
      notifications.toasts.addSuccess(
        i18n.translate('productQueues.dataUpdated', {
          defaultMessage: 'Predicitons Updated!',
        })
      );
  };

  const onClickHandler3 = () => {
    const body = { item: item, name: "products"};
    http.post("/api/censhare/item", { body: JSON.stringify(body) }).then(res => {
      if (res) {
        console.log("DATA res cen: ", res.data.aggregations)
        setCenshareTimestamps(res.data.aggregations);
      }
    });
    http.post("/api/pic/item", { body: JSON.stringify(body) }).then(res2 => {
      if (res2) {
        console.log("DATA res pic: ", res2.data.aggregations)
        setPicTimestamps(res2.data.aggregations);
      }
    });
  };

  function updateCenshareQueueItems() {
    const body = { name: "products" };
    http.post("/api/censhare/throughput/items", { body: JSON.stringify(body) }).then(res => {
      if (res) {
        //console.log("CEN Items DATA: ", res.data.aggregations);
        setQueueItemsCenshare(res.data.aggregations)
        console.log("items cen: ", queueItemsCenshare)
        //clearInterval(updateCenItems)
      }
    });
  }

  function updatePicQueueItems() {
    const body = { name: "products" };
    http.post("/api/pic/throughput/items", { body: JSON.stringify(body) }).then(res => {
      if (res) {
        //console.log("PIC Items DATA: ", res.data.aggregations);
        console.log("items pic: ", queueItemsPic)
        setQueueItemsPic(res.data.aggregations)
        //clearInterval(updatePicItems)
      }
    });
  }

  //TODO
  function updateCenshareQueueSize() {
    const body = { name: "products" };
    http.post("/api/censhare/size", { body: JSON.stringify(body) }).then(res => {
      if (res) {
        console.log("CEN SIZE DATA: ", res.data.hits.hits[0]._source.size);
        setQueueSizeCenshare(res.data.hits.hits[0]._source.size)
        
        clearInterval(updateCenSize)
      }
    });
  }

  //TODO
  function updatePicQueueSize() {
    const body = { name: "products" };
    http.post("/api/pic/size", { body: JSON.stringify(body) }).then(res => {
      if (res) {
        console.log("PIC SIZE DATA: ", res.data.hits.hits[0]._source.size);
        setQueueSizePic(res.data.hits.hits[0]._source.size)
        
        clearInterval(updatePicSize)
        
      }
    });
  }

  // TODO
 
    const updateCenSize = setInterval(updateCenshareQueueSize, 5000)
    const updatePicSize = setInterval(updatePicQueueSize, 5000)

  //const updateCenItems = setInterval(updateCenshareQueueItems, 2000)
  //const updatePicItems = setInterval(updatePicQueueItems, 2000)

  
  const handleChange = (event) => {
    setItem(event.target.value)
  };

  // TODO
  const filterChange = (event) => {

    // only for testing
    if(isAutoRefresh == true){
      clearInterval(updatePicSize)
      clearInterval(updateCenSize)
      setIsAutoRefresh(false)
    }else{
      updateCenshareQueueItems();
      updatePicQueueItems();
      setIsAutoRefresh(true)
    }
    

    //clearInterval(updateCenItems)
    //clearInterval(updatePicItems)
    /*
    async function myStopFunction() {
      clearInterval(updateCenSize)
      clearInterval(updatePicSize)
      return
    }

    async function afterFunction(){
      await myStopFunction();

      setQueueName(event.target.value)
      console.log("current queue name: ",queueName)

      updateCenshareQueueSize();
      updatePicQueueSize();
      console.log("target value filter: ", event.target.value)
      console.log("current queue name: ", queueName)
    };
    */
  }

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu appName={PLUGIN_ID} showSearchBar={true} />
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
                <div style={filterFormContainer}>
                  <EuiFormRow label="">
                    <EuiFieldText placeholder="Search Items..." id="productQueues.itemField" onChange={handleChange} />
                  </EuiFormRow>
                  <EuiSelect onChange={filterChange}
                    options={[
                      { value: 'products', text: 'Products' },
                      { value: 'productrelation', text: 'Product Relation' },
                      { value: 'csproducts', text: 'CS Products' },
                      { value: 'stext', text: 'S Text' },
                      { value: 'featurestories', text: 'Feature Stories' }
                    ]}
                  />
                  <EuiButton type="primary" size="m" onClick={onClickHandler3}>Search</EuiButton>
                  <EuiButton type="primary" color="secondary" onClick={onClickHandler} fill size="m" style={{ marginLeft: "20px" }}>Update Predictions</EuiButton>
                </div>
                <Vis picTimestamps={picTimestamps ? picTimestamps : []}
                  censhareTimestamps={censhareTimestamps ? censhareTimestamps : []}
                  queueSizeCenshare={queueSizeCenshare}
                  queueSizePic={queueSizePic} 
                  queueItemsCenshare={queueItemsCenshare}
                  queueItemsPic={queueItemsPic}
                  updatedTimestamp={updatedTimestamp ? updatedTimestamp : undefined}/>
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
              {/* <ResponseDisplay data={censhareTimestamps ? censhareTimestamps : []} />
              <ResponseDisplay data={picTimestamps ? picTimestamps : []} /> */}
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};

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
  // fontSize: ".8rem",
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
  // fontSize: ".8rem",
  fontWeight: "bold" as "bold",
  border: "none",
  borderBottom: "2px solid #F5F9FC",
  marginLeft: "50px",
  marginTop: "auto",
  marginBottom: "auto",

}