(window["queuesPlugin_bundle_jsonpfunction"] = window["queuesPlugin_bundle_jsonpfunction"] || []).push([[0],{

/***/ "./public/application.tsx":
/*!********************************!*\
  !*** ./public/application.tsx ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderApp = void 0;

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _reactDom = _interopRequireDefault(__webpack_require__(/*! react-dom */ "react-dom"));

var _app = __webpack_require__(/*! ./components/app */ "./public/components/app.tsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const renderApp = ({
  notifications,
  http
}, {
  navigation
}, {
  appBasePath,
  element
}) => {
  _reactDom.default.render( /*#__PURE__*/_react.default.createElement(_app.QueuesPluginApp, {
    basename: appBasePath,
    notifications: notifications,
    http: http,
    navigation: navigation
  }), element);

  return () => _reactDom.default.unmountComponentAtNode(element);
};

exports.renderApp = renderApp;

/***/ }),

/***/ "./public/components/app.tsx":
/*!***********************************!*\
  !*** ./public/components/app.tsx ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueuesPluginApp = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _i18n = __webpack_require__(/*! @kbn/i18n */ "@kbn/i18n");

var _react2 = __webpack_require__(/*! @kbn/i18n/react */ "@kbn/i18n/react");

var _reactRouterDom = __webpack_require__(/*! react-router-dom */ "react-router-dom");

var _Header = _interopRequireDefault(__webpack_require__(/*! ../src/Header */ "./public/src/Header.tsx"));

var _Pipeline = _interopRequireDefault(__webpack_require__(/*! ../src/Pipeline */ "./public/src/Pipeline.tsx"));

var _FilterForm = _interopRequireDefault(__webpack_require__(/*! ../src/FilterForm */ "./public/src/FilterForm.tsx"));

var _eui = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");

var _common = __webpack_require__(/*! ../../common */ "./common/index.ts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
const QueuesPluginApp = ({
  basename,
  notifications,
  http,
  navigation
}) => {
  // Use React hooks to manage state.
  const [timestamp, setTimestamp] = (0, _react.useState)();

  const onClickHandler = () => {
    // Use the core http service to make a response to the server API.
    http.get('/api/queues_plugin/example').then(res => {
      setTimestamp(res.time); // Use the core notifications service to display a success message.

      notifications.toasts.addSuccess(_i18n.i18n.translate('queuesPlugin.dataUpdated', {
        defaultMessage: 'Data updated'
      }));
    });
  }; // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.


  return /*#__PURE__*/_react.default.createElement(_reactRouterDom.BrowserRouter, {
    basename: basename
  }, /*#__PURE__*/_react.default.createElement(_react2.I18nProvider, null, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(navigation.ui.TopNavMenu, {
    appName: _common.PLUGIN_ID,
    showSearchBar: true
  }), /*#__PURE__*/_react.default.createElement(_eui.EuiPage, {
    restrictWidth: "1000px"
  }, /*#__PURE__*/_react.default.createElement(_eui.EuiPageBody, null, /*#__PURE__*/_react.default.createElement(_eui.EuiPageHeader, null, /*#__PURE__*/_react.default.createElement(_eui.EuiTitle, {
    size: "l"
  }, /*#__PURE__*/_react.default.createElement("h1", null, /*#__PURE__*/_react.default.createElement(_react2.FormattedMessage, {
    id: "productQueues.helloWorldText",
    defaultMessage: "{name}",
    values: {
      name: _common.PLUGIN_NAME
    }
  })))), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContent, null, /*#__PURE__*/_react.default.createElement(_eui.EuiPageContentHeader, null, /*#__PURE__*/_react.default.createElement(_eui.EuiTitle, null, /*#__PURE__*/_react.default.createElement("h2", null, /*#__PURE__*/_react.default.createElement(_react2.FormattedMessage, {
    id: "productQueues.congratulationsTitle",
    defaultMessage: "Prediction Control Panel"
  })))), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContentBody, null, /*#__PURE__*/_react.default.createElement(_eui.EuiText, null, /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_react2.FormattedMessage, {
    id: "productQueues.content",
    defaultMessage: "Refresh predictions for queues start and endtime manually."
  })), /*#__PURE__*/_react.default.createElement(_eui.EuiHorizontalRule, null), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_react2.FormattedMessage, {
    id: "productQueues.timestampText",
    defaultMessage: "Last time updated predictions: {time}",
    values: {
      time: timestamp ? timestamp : 'Unknown'
    }
  })), /*#__PURE__*/_react.default.createElement(_eui.EuiButton, {
    type: "primary",
    size: "s",
    onClick: onClickHandler
  }, /*#__PURE__*/_react.default.createElement(_react2.FormattedMessage, {
    id: "productQueues.buttonText",
    defaultMessage: "Refresh Predictions"
  }))))), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContent, null, /*#__PURE__*/_react.default.createElement(_Header.default, null), /*#__PURE__*/_react.default.createElement(_FilterForm.default, null), /*#__PURE__*/_react.default.createElement(_Pipeline.default, null)))))));
};

exports.QueuesPluginApp = QueuesPluginApp;

/***/ }),

/***/ "./public/src/FilterForm.tsx":
/*!***********************************!*\
  !*** ./public/src/FilterForm.tsx ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FilterForm = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class FilterForm extends _react.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: filterFormContainer
    }, /*#__PURE__*/_react.default.createElement("form", {
      style: form
    }, /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
      placeholder: "Input Item Name...",
      style: input,
      type: "text",
      name: "name"
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "select-container"
    }, /*#__PURE__*/_react.default.createElement("select", {
      style: select,
      name: "queue-type",
      id: "queue-type"
    }, /*#__PURE__*/_react.default.createElement("option", {
      value: "Product Queues"
    }, "Product Queues"), /*#__PURE__*/_react.default.createElement("option", {
      value: "Products Relations"
    }, "Products Relations"), /*#__PURE__*/_react.default.createElement("option", {
      value: "Lorem"
    }, "Lorem"), /*#__PURE__*/_react.default.createElement("option", {
      value: "Ipsum"
    }, "Ipsum"))), /*#__PURE__*/_react.default.createElement("button", {
      id: "search-btn",
      style: searchBtn
    }, "Search"), /*#__PURE__*/_react.default.createElement("button", {
      className: "prediction-btn",
      style: predictionBtn
    }, "Create New Predictions")));
  }

}

exports.FilterForm = FilterForm;
var _default = FilterForm;
exports.default = _default;
const filterFormContainer = {
  backgroundColor: "#F5F9FC",
  height: "80px",
  justifyContent: "center",
  display: "flex"
};
const input = {
  height: "40px",
  border: "2px solid #dbdbdb",
  borderRadius: "30px"
};
const select = {
  color: "black",
  lineHeight: "32px",
  height: "46px",
  padding: "5px 50px 5px 20px",
  borderRadius: "30px",
  border: "2px solid #dbdbdb",
  cursor: "pointer"
};
const searchBtn = {
  backgroundColor: "#FE9C6A",
  height: "46px",
  color: "white",
  padding: "5px 20px 5px 20px",
  cursor: "pointer",
  fontSize: ".8rem",
  border: "2px solid #FE9C6A",
  borderRadius: "50px"
};
const form = {
  marginTop: "auto",
  marginBottom: "auto",
  display: "flex"
};
const predictionBtn = {
  backgroundColor: "#F5F9FC",
  height: "30px",
  color: "black",
  cursor: "pointer",
  fontSize: ".8rem",
  fontWeight: "bold",
  border: "none",
  borderBottom: "2px solid #F5F9FC",
  marginLeft: "50px",
  marginTop: "auto",
  marginBottom: "auto"
};

/***/ }),

/***/ "./public/src/Header.tsx":
/*!*******************************!*\
  !*** ./public/src/Header.tsx ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Header = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Header extends _react.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: headerContainer
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: appNameContainer
    }, /*#__PURE__*/_react.default.createElement("div", null, "Queue"), /*#__PURE__*/_react.default.createElement("div", null, "Predictor")));
  }

}

exports.Header = Header;
var _default = Header;
exports.default = _default;
const headerContainer = {
  backgroundColor: "white",
  textAlign: "left",
  padding: "10px",
  fontWeight: "bolder",
  display: "flex"
};
const appNameContainer = {};

/***/ }),

/***/ "./public/src/Pipeline.tsx":
/*!*********************************!*\
  !*** ./public/src/Pipeline.tsx ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Pipeline = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _Processor = _interopRequireDefault(__webpack_require__(/*! ./Processor */ "./public/src/Processor.tsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Pipeline extends _react.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: pipelineContainer
    }, /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: false,
      processorName: "ERP",
      queueName: "A-B",
      queueType: "Product Queues"
    }), /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: false,
      processorName: "PIM Edit",
      queueName: "A-B",
      queueType: "Product Queues"
    }), /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: false,
      processorName: "PIM Browse/ B2B",
      queueName: "A-B",
      queueType: "Product Queues"
    }), /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: true,
      processorName: "D2C",
      queueName: "A-B",
      queueType: "Product Queues"
    }));
  }

}

exports.Pipeline = Pipeline;
var _default = Pipeline;
exports.default = _default;
const pipelineContainer = {
  backgroundColor: "#F5F9FC",
  display: "flex",
  padding: "20px",
  justifyContent: "center"
};

/***/ }),

/***/ "./public/src/Processor.tsx":
/*!**********************************!*\
  !*** ./public/src/Processor.tsx ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Processor = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _TimeBox = _interopRequireDefault(__webpack_require__(/*! ./TimeBox */ "./public/src/TimeBox.tsx"));

var _ProcessorBox = _interopRequireDefault(__webpack_require__(/*! ./ProcessorBox */ "./public/src/ProcessorBox.tsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Processor extends _react.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      style: processorContainer
    }, /*#__PURE__*/_react.default.createElement(_TimeBox.default, {
      isStart: true,
      timestamp: "2020-01-20 12:01 UTC",
      isHistoric: true
    }), /*#__PURE__*/_react.default.createElement(_ProcessorBox.default, {
      isLastProcessor: this.props.isLastProcessor,
      processorName: this.props.processorName,
      queueName: this.props.queueName,
      queueType: this.props.queueType
    }), /*#__PURE__*/_react.default.createElement(_TimeBox.default, {
      isStart: false,
      timestamp: "2020-01-23 08:20 UTC",
      isHistoric: false
    })));
  }

}

exports.Processor = Processor;
var _default = Processor;
exports.default = _default;
const processorContainer = {
  width: "270px"
};

/***/ }),

/***/ "./public/src/ProcessorBox.tsx":
/*!*************************************!*\
  !*** ./public/src/ProcessorBox.tsx ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ProcessorBox = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _ProgressPipe = _interopRequireDefault(__webpack_require__(/*! ./ProgressPipe */ "./public/src/ProgressPipe.tsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ProcessorBox extends _react.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "state", {
      isLastProcessor: false,
      processorName: "",
      isProcessing: false
    });

    this.state = this.state;
  }

  componentDidMount() {
    this.setUpProcessing();
  }

  setUpProcessing() {
    const condition = true;

    if (condition) {
      //Check if processing status is true
      this.setState({
        isProcessing: true
      });
    } else {
      this.setState({
        isProcessing: false
      });
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: processorBoxContainer
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: lineDashed
    }), /*#__PURE__*/_react.default.createElement("div", {
      style: processorBoxProgressPipeContainer
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "processor-box",
      style: processorBox.base
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: this.state.isProcessing ? "border-loading-spin" : "hidden"
    }), this.props.processorName), this.props.isLastProcessor ? null : /*#__PURE__*/_react.default.createElement(_ProgressPipe.default, {
      queName: this.props.queueName,
      queType: this.props.queueType
    })), /*#__PURE__*/_react.default.createElement("div", {
      style: lineDashed
    }));
  }

}

exports.ProcessorBox = ProcessorBox;
var _default = ProcessorBox;
exports.default = _default;
const processorBoxContainer = {};
const processorBox = {
  base: {
    backgroundColor: "#4bc5de",
    //55C1CE
    padding: "40px 0px",
    borderRadius: "0px",
    // border: "2px solid rgb(66, 150, 190)",
    color: "white",
    cursor: "pointer",
    //fontWeight: "bold" as "bold",
    //boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.2)", 
    position: "relative"
  }
};
const lineDashed = {
  borderRight: "2px dashed grey",
  width: "100px",
  height: "20px"
};
const processorBoxProgressPipeContainer = {
  display: "grid",
  gridTemplateColumns: "75% 25%"
};

/***/ }),

/***/ "./public/src/ProgressPipe.tsx":
/*!*************************************!*\
  !*** ./public/src/ProgressPipe.tsx ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ProgressPipe = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ProgressPipe extends _react.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "onClickTest", () => {
      console.log("progress pipe clicked");
    });

    this.state = {
      queueName: "Name undefined",
      queueType: "Type undefined",
      progressStatus: 0
    };
  }

  componentDidMount() {
    this.setUpProgressPipe();
  }

  setUpProgressPipe() {
    this.setState({
      progressStatus: this.calculateProgressStatus()
    });
  }

  calculateProgressStatus() {
    return 70; //add calculation formula for ratio from timerange between start und end processing timestamps
  }

  setUpProgressBarStatus() {
    switch (this.state.progressStatus) {
      case 0:
        return progressBar.base;
        break;

      case 10:
        return progressBar.ten;
        break;

      case 20:
        return progressBar.twenty;
        break;

      case 30:
        return progressBar.thirty;
        break;

      case 40:
        return progressBar.fourty;
        break;

      case 50:
        return progressBar.fithy;
        break;

      case 60:
        return progressBar.sixty;
        break;

      case 70:
        return progressBar.seventy;
        break;

      case 80:
        return progressBar.eighty;
        break;

      case 90:
        return progressBar.ninethy;
        break;

      case 100:
        return progressBar.hundred;
        break;

      default:
        return progressBar.hundred;
        break;
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "progress-pipe-container",
      style: progressPipeContainer
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: this.setUpProgressBarStatus()
    }), /*#__PURE__*/_react.default.createElement("div", {
      style: progressStatusInfoBox,
      onClick: this.onClickTest
    }, this.state.progressStatus, "%"));
  }

}

exports.ProgressPipe = ProgressPipe;
var _default = ProgressPipe;
exports.default = _default;
const progressPipeContainer = {
  height: "40px",
  backgroundColor: "white",
  marginTop: "auto",
  marginBottom: "auto",
  borderTop: "6px solid #ddd",
  borderBottom: "6px solid #ddd",
  //boxShadow: "-1px 0px 22px -2px rgba(0,0,0,0.2)",
  position: "relative",
  cursor: "pointer"
};
const progressBar = {
  base: {
    backgroundColor: "#3729A2",
    height: "100%",
    width: "0%"
  },
  ten: {
    backgroundColor: "#FEE67F",
    height: "100%",
    width: "10%"
  },
  twenty: {
    backgroundColor: "#FEE67F",
    height: "100%",
    width: "20%"
  },
  thirty: {
    backgroundColor: "#FEE67F",
    height: "100%",
    width: "30%"
  },
  fourty: {
    backgroundColor: "#FEE67F",
    height: "100%",
    width: "40%"
  },
  fithy: {
    backgroundColor: "#FEE67F",
    height: "100%",
    width: "50%"
  },
  sixty: {
    backgroundColor: "#FEE67F",
    height: "100%",
    width: "60%"
  },
  seventy: {
    backgroundColor: "#FEE67F",
    height: "100%",
    width: "70%"
  },
  eighty: {
    backgroundColor: "#FE9C6A",
    height: "100%",
    width: "80%"
  },
  ninethy: {
    backgroundColor: "#FE9C6A",
    height: "100%",
    width: "90%"
  },
  hundred: {
    backgroundColor: "#FE9C6A",
    height: "100%",
    width: "100%"
  }
};
const progressStatusInfoBox = {
  backgroundColor: "white",
  color: "black",
  borderRadius: "50px",
  position: "absolute",
  left: "50%",
  top: "25%",
  transform: "translate(-50%, 0)",
  width: "47px",
  padding: "2px 0 2px 0",
  textAlign: "center",
  // fontWeight: "bold" as "bold", 
  fontSize: ".8rem"
};

/***/ }),

/***/ "./public/src/TimeBox.tsx":
/*!********************************!*\
  !*** ./public/src/TimeBox.tsx ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TimeBox = void 0;

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TimeBox extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      timePosition: "",
      isHistoric: false
    };
  }

  componentDidMount() {
    this.setState({});
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: timeboxContainer
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "time-box",
      style: this.props.isHistoric ? timebox.historic : timebox.forecast
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: this.state.isHistoric ? timeboxTitle.historic : timeboxTitle.forecast
    }, this.state.isHistoric ? "Historic" : "Forecast", " ", this.props.isStart ? "Start" : "End", ":"), /*#__PURE__*/_react.default.createElement("div", {
      style: timeboxInnerBottom
    }, this.props.timestamp)));
  }

}

exports.TimeBox = TimeBox;
var _default = TimeBox;
exports.default = _default;
const timeboxContainer = {
  width: "75%"
};
const timeboxInnerBottom = {
  display: "flex"
};
const timeboxTitle = {
  historic: {
    fontSize: ".6rem",
    fontWeight: "bold",
    textAlign: "left",
    color: "grey",
    textTransform: "uppercase",
    opacity: ".7"
  },
  forecast: {
    fontSize: ".6rem",
    fontWeight: "bold",
    textAlign: "left",
    color: "grey",
    textTransform: "uppercase",
    opacity: ".7"
  }
};
const iconClock = {
  historic: {
    color: "lightgrey",
    fontSize: "1rem",
    marginRight: "4px"
  },
  forecast: {
    color: "black",
    opacity: ".3",
    fontSize: "1rem",
    marginRight: "4px"
  }
};
const timebox = {
  historic: {
    backgroundColor: "white",
    color: "black",
    border: "2px solid #dbdbdb",
    //borderRadius: "50px",
    fontSize: ".8rem",
    padding: "10px 15px 10px 15px",
    cursor: "pointer"
  },
  forecast: {
    backgroundColor: "#ebe6ff",
    color: "black",
    border: "2px solid #ebe6ff",
    //borderRadius: "50px",
    fontSize: ".8rem",
    padding: "10px 15px 10px 15px",
    cursor: "pointer"
  }
};

/***/ })

}]);
//# sourceMappingURL=0.plugin.js.map