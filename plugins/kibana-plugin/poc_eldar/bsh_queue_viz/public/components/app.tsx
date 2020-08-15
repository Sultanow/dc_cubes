import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiButton,
  EuiFieldText,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
} from '@elastic/eui';

import { CoreStart } from '..\..\../../src/core/public';
import { NavigationPublicPluginStart } from '..\..\../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

interface BshQueueVizAppDeps {
  basename: string;
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export const BshQueueVizApp = ({ basename, http, navigation }: BshQueueVizAppDeps) => {
  // Use React hooks to manage state.
  const [itemSearch, setItemSearch] = useState<string | string>(); 
  const [statusText, setStatusText] = useState<string | string>();

  const onClickHandler = () => {
    const body = {item:itemSearch};
    http.post("/api/bsh_queue_viz/itemsearch", {body: JSON.stringify(body)}).then(res => {
      //console.log(res.data.aggregations);
      let buckets = res.data.aggregations.group_by_queue.buckets;
      let bucketDetails = "";
      buckets.forEach(function (item, index) {
        let queueEnter = item.queue_enter.hits.hits[0]._source;
        let queueLeft = item.queue_left.hits.hits[0]._source;
        bucketDetails += "queue name: " + item.key
          + " entered: " + queueEnter.timestamp + "(size was " + queueEnter.size + ")"
          + " left: " + queueLeft.timestamp + "(size was " + queueLeft.size + ")";
      });
      //1400457484
      setStatusText("Searched for " + itemSearch + ", buckets found: " + buckets.length + bucketDetails)
    });
  };

  const handleChange = (event) => {
    setItemSearch(event.target.value)
  };

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <navigation.ui.TopNavMenu appName={ PLUGIN_ID } showSearchBar={true} />
      <EuiPage restrictWidth="1000px">
        <EuiPageBody>
          <EuiPageHeader>
            <EuiTitle size="l">
              <h1>
                <div id="bshQueueViz.helloWorldText">
                {PLUGIN_NAME}
                </div>
              </h1>
            </EuiTitle>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentHeader></EuiPageContentHeader>
            <EuiPageContentBody>
              <EuiText>
                <span id="bshQueueViz.spanTextarea">
                  {statusText}
                </span>
                <EuiHorizontalRule/>
                <EuiFieldText id="bshQueueViz.itemSearchField" onChange={handleChange} ></EuiFieldText>
                <EuiButton type="primary" size="s" onClick={onClickHandler}>Search</EuiButton>
              </EuiText>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </Router>
  );
};
