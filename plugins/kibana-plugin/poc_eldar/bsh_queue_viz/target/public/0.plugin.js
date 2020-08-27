(window["bshQueueViz_bundle_jsonpfunction"] = window["bshQueueViz_bundle_jsonpfunction"] || []).push([[0],{

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
  _reactDom.default.render( /*#__PURE__*/_react.default.createElement(_app.BshQueueVizApp, {
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
exports.BshQueueVizApp = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _reactRouterDom = __webpack_require__(/*! react-router-dom */ "react-router-dom");

var _eui = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");

var _common = __webpack_require__(/*! ../../common */ "./common/index.ts");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const BshQueueVizApp = ({
  basename,
  http,
  navigation
}) => {
  // Use React hooks to manage state.
  const [itemSearch, setItemSearch] = (0, _react.useState)();
  const [statusText, setStatusText] = (0, _react.useState)();

  const onClickHandler = () => {
    const body = {
      item: itemSearch
    };
    http.post("/api/bsh_queue_viz/itemsearch", {
      body: JSON.stringify(body)
    }).then(res => {
      //console.log(res.data.aggregations);
      let buckets = res.data.aggregations.group_by_queue.buckets;
      let bucketDetails = "";
      buckets.forEach(function (item, index) {
        let queueEnter = item.queue_enter.hits.hits[0]._source;
        let queueLeft = item.queue_left.hits.hits[0]._source;
        bucketDetails += "queue name: " + item.key + " entered: " + queueEnter.timestamp + "(size was " + queueEnter.size + ")" + " left: " + queueLeft.timestamp + "(size was " + queueLeft.size + ")";
      }); //1400457484

      setStatusText("Searched for " + itemSearch + ", buckets found: " + buckets.length + bucketDetails);
    });
  };

  const handleChange = event => {
    setItemSearch(event.target.value);
  }; // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.


  return /*#__PURE__*/_react.default.createElement(_reactRouterDom.BrowserRouter, {
    basename: basename
  }, /*#__PURE__*/_react.default.createElement(navigation.ui.TopNavMenu, {
    appName: _common.PLUGIN_ID,
    showSearchBar: true
  }), /*#__PURE__*/_react.default.createElement(_eui.EuiPage, {
    restrictWidth: "1000px"
  }, /*#__PURE__*/_react.default.createElement(_eui.EuiPageBody, null, /*#__PURE__*/_react.default.createElement(_eui.EuiPageHeader, null, /*#__PURE__*/_react.default.createElement(_eui.EuiTitle, {
    size: "l"
  }, /*#__PURE__*/_react.default.createElement("h1", null, /*#__PURE__*/_react.default.createElement("div", {
    id: "bshQueueViz.helloWorldText"
  }, _common.PLUGIN_NAME)))), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContent, null, /*#__PURE__*/_react.default.createElement(_eui.EuiPageContentHeader, null), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContentBody, null, /*#__PURE__*/_react.default.createElement(_eui.EuiText, null, /*#__PURE__*/_react.default.createElement("span", {
    id: "bshQueueViz.spanTextarea"
  }, statusText), /*#__PURE__*/_react.default.createElement(_eui.EuiHorizontalRule, null), /*#__PURE__*/_react.default.createElement(_eui.EuiFieldText, {
    id: "bshQueueViz.itemSearchField",
    onChange: handleChange
  }), /*#__PURE__*/_react.default.createElement(_eui.EuiButton, {
    type: "primary",
    size: "s",
    onClick: onClickHandler
  }, "Search")))))));
};

exports.BshQueueVizApp = BshQueueVizApp;

/***/ })

}]);
//# sourceMappingURL=0.plugin.js.map