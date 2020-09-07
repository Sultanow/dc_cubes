(window["bshQueueViz_bundle_jsonpfunction"] = window["bshQueueViz_bundle_jsonpfunction"] || []).push([[1],{

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

var _styles = __webpack_require__(/*! @material-ui/core/styles */ "../../node_modules/@material-ui/core/styles/index.js");

var _Box = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/Box */ "../../node_modules/@material-ui/core/Box/index.js"));

var _InputBase = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/InputBase */ "../../node_modules/@material-ui/core/InputBase/index.js"));

var _IconButton = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/IconButton */ "../../node_modules/@material-ui/core/IconButton/index.js"));

var _Search = _interopRequireDefault(__webpack_require__(/*! @material-ui/icons/Search */ "../../node_modules/@material-ui/icons/Search.js"));

var _Snackbar = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/Snackbar */ "../../node_modules/@material-ui/core/Snackbar/index.js"));

var _Alert = _interopRequireDefault(__webpack_require__(/*! @material-ui/lab/Alert */ "../../node_modules/@material-ui/lab/Alert/index.js"));

var _Table = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/Table */ "../../node_modules/@material-ui/core/Table/index.js"));

var _TableBody = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/TableBody */ "../../node_modules/@material-ui/core/TableBody/index.js"));

var _TableCell = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/TableCell */ "../../node_modules/@material-ui/core/TableCell/index.js"));

var _TableContainer = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/TableContainer */ "../../node_modules/@material-ui/core/TableContainer/index.js"));

var _TableHead = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/TableHead */ "../../node_modules/@material-ui/core/TableHead/index.js"));

var _TableRow = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/TableRow */ "../../node_modules/@material-ui/core/TableRow/index.js"));

var _Paper = _interopRequireDefault(__webpack_require__(/*! @material-ui/core/Paper */ "../../node_modules/@material-ui/core/Paper/index.js"));

var _reactRouterDom = __webpack_require__(/*! react-router-dom */ "react-router-dom");

var _eui = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");

var _common = __webpack_require__(/*! ../../common */ "./common/index.ts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const useStyles = (0, _styles.makeStyles)(theme => (0, _styles.createStyles)({
  search: {
    flexGrow: 1,
    padding: '2px 4px',
    display: 'flex',
    width: 400,
    margin: 'auto'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  }
}));

class Row {
  constructor(queueName, queueEnteredTime, queueEnteredSize, queueLeftTime, queueLeftSize) {
    _defineProperty(this, "queueName", void 0);

    _defineProperty(this, "queueEnteredTime", void 0);

    _defineProperty(this, "queueEnteredSize", void 0);

    _defineProperty(this, "queueLeftTime", void 0);

    _defineProperty(this, "queueLeftSize", void 0);

    this.queueName = queueName;
    this.queueEnteredTime = queueEnteredTime;
    this.queueEnteredSize = queueEnteredSize;
    this.queueLeftTime = queueLeftTime;
    this.queueLeftSize = queueLeftSize;
  }

}

const itemTableRows = new Array();

const BshQueueVizApp = ({
  basename,
  http,
  navigation
}) => {
  // Use React hooks to manage state.
  const [itemSearch, setItemSearch] = (0, _react.useState)();
  const [statusText, setStatusText] = (0, _react.useState)();
  const [rows, setTable] = (0, _react.useState)(itemTableRows);

  const [open, setOpen] = _react.default.useState(false);

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
      itemTableRows.splice(0);
      buckets.forEach(function (item, index) {
        let queueEntered = item.queue_enter.hits.hits[0]._source;
        let queueLeft = item.queue_left.hits.hits[0]._source;
        itemTableRows.push(new Row(item.key, queueEntered.timestamp, queueEntered.size, queueLeft.timestamp, queueLeft.size));
        setTable(itemTableRows);
      }); //1400457484

      setStatusText("Searched for " + itemSearch + ", buckets found: " + buckets.length + bucketDetails);
      setOpen(true);
    });
  };

  const handleChange = event => {
    setItemSearch(event.target.value);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const classes = useStyles(); // Render the application DOM.
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
  }, _common.PLUGIN_NAME)))), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContent, {
    style: {
      border: 'none',
      boxShadow: 'none',
      backgroundColor: '#f5f5f5'
    }
  }, /*#__PURE__*/_react.default.createElement(_eui.EuiPageContentBody, null, /*#__PURE__*/_react.default.createElement(_Paper.default, {
    component: "form",
    className: classes.search
  }, /*#__PURE__*/_react.default.createElement(_InputBase.default, {
    id: "bshQueueViz.itemSearchField",
    className: classes.input,
    placeholder: "Search Item",
    onChange: handleChange
  }), /*#__PURE__*/_react.default.createElement(_IconButton.default, {
    className: classes.iconButton,
    onClick: onClickHandler
  }, /*#__PURE__*/_react.default.createElement(_Search.default, null))))), /*#__PURE__*/_react.default.createElement(_Box.default, {
    m: 2
  }), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContent, null, /*#__PURE__*/_react.default.createElement(_eui.EuiPageContentBody, null, /*#__PURE__*/_react.default.createElement(_TableContainer.default, {
    component: _Paper.default
  }, /*#__PURE__*/_react.default.createElement(_Table.default, {
    "aria-label": "simple table"
  }, /*#__PURE__*/_react.default.createElement(_TableHead.default, null, /*#__PURE__*/_react.default.createElement(_TableRow.default, null, /*#__PURE__*/_react.default.createElement(_TableCell.default, null, "Queue"), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, "time entered"), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, "size when entered"), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, "time left"), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, "size when left"))), /*#__PURE__*/_react.default.createElement(_TableBody.default, null, rows.map(row => /*#__PURE__*/_react.default.createElement(_TableRow.default, {
    key: row.queueName
  }, /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    component: "th",
    scope: "row"
  }, row.queueName), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, row.queueEnteredTime), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, row.queueEnteredSize), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, row.queueLeftTime), /*#__PURE__*/_react.default.createElement(_TableCell.default, {
    align: "right"
  }, row.queueLeftSize)))))), /*#__PURE__*/_react.default.createElement(_Box.default, {
    m: 6
  }), /*#__PURE__*/_react.default.createElement(_Snackbar.default, {
    open: open,
    autoHideDuration: 6000,
    onClose: handleClose
  }, /*#__PURE__*/_react.default.createElement(_Alert.default, {
    onClose: handleClose,
    severity: "success"
  }, statusText)))))));
};

exports.BshQueueVizApp = BshQueueVizApp;

/***/ })

}]);
//# sourceMappingURL=1.plugin.js.map