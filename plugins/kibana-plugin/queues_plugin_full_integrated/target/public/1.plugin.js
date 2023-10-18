(window["queuesPlugin_bundle_jsonpfunction"] = window["queuesPlugin_bundle_jsonpfunction"] || []).push([[1],{

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

/***/ "./public/components/Pipeline.tsx":
/*!****************************************!*\
  !*** ./public/components/Pipeline.tsx ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Pipeline = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _Processor = _interopRequireDefault(__webpack_require__(/*! ./Processor */ "./public/components/Processor.tsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Pipeline extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      censhareTimestamps: [],
      picTimestamps: [],
      queueSizeCenshare: 0
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      censhareTimestamps: nextProps.censhareTimestamps,
      picTimestamps: nextProps.picTimestamps
    };
  }

  componentDidUpdate() {}

  componentDidMount() {}

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "pipeline-container",
      style: pipelineContainer
    }, /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: false,
      isFirstProcessor: true,
      processorName: "ERP",
      timeLeft: getTimeLeft(this.state.censhareTimestamps.queue_enter, this.state.censhareTimestamps.queue_left),
      progessStatus: 100,
      isLoadingMetrics: this.props.isLoadingMetrics
    }), /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: false,
      isFirstProcessor: false,
      processorName: "PIM Edit",
      queueName: "censhare",
      queueType: null,
      timestamps: this.props.censhareTimestamps,
      queueSize: this.props.queueSizeCenshare,
      timeLeft: getTimeLeft(this.state.picTimestamps.queue_enter, this.state.picTimestamps.queue_left),
      queueItems: this.props.queueItemsCenshare,
      progessStatus: 100,
      isLoadingMetrics: this.props.isLoadingMetrics
    }), /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: false,
      isFirstProcessor: false,
      processorName: "PIM Browse/ B2B",
      queueName: "pic",
      queueType: null,
      timestamps: this.props.picTimestamps,
      queueSize: this.props.queueSizePic,
      timeLeft: "",
      queueItems: this.props.queueItemsPic,
      progessStatus: 0,
      isLoadingMetrics: this.props.isLoadingMetrics
    }), /*#__PURE__*/_react.default.createElement(_Processor.default, {
      isLastProcessor: true,
      isFirstProcessor: false,
      processorName: "D2C",
      queueName: "undefined",
      queueType: null,
      timestamps: [],
      queueSize: 0,
      timeLeft: "",
      queueItems: [],
      progessStatus: 0,
      isLoadingMetrics: this.props.isLoadingMetrics
    }));
  }

}

exports.Pipeline = Pipeline;
var _default = Pipeline;
exports.default = _default;

function getTimeLeft(enter, left) {
  if (enter && left && typeof enter.hits.hits[0] === "object" && typeof left.hits.hits[0] === "object") {
    var hours = hoursLeft(new Date(enter.hits.hits[0]._source.timestamp).toString(), new Date(left.hits.hits[0]._source.timestamp).toString());
    return hours;
  } else 0;
}

function hoursLeft(enter, left) {
  var enterDate = new Date(enter);
  var leftDate = new Date(left);
  var hours = Math.abs(enterDate.getTime() - leftDate.getTime()) / 36e5;

  if (Math.round(hours) < 1) {
    return hours;
  } else {
    return Math.round(hours);
  }
}

const pipelineContainer = {
  backgroundColor: "#F5F9FC",
  display: "flex",
  padding: "20px",
  paddingTop: "40px",
  justifyContent: "center"
};

/***/ }),

/***/ "./public/components/Processor.tsx":
/*!*****************************************!*\
  !*** ./public/components/Processor.tsx ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Processor = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _TimeBox = _interopRequireDefault(__webpack_require__(/*! ./TimeBox */ "./public/components/TimeBox.tsx"));

var _ProcessorBox = _interopRequireDefault(__webpack_require__(/*! ./ProcessorBox */ "./public/components/ProcessorBox.tsx"));

var _QueueMetrics = _interopRequireDefault(__webpack_require__(/*! ./QueueMetrics */ "./public/components/QueueMetrics.tsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Processor extends _react.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "state", {});

    this.state = this.state;
  }

  componentDidMount() {}

  componentDidUpdate() {}

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "processor-outer-container"
    }, !this.props.isFirstProcessor ? /*#__PURE__*/_react.default.createElement(_QueueMetrics.default, {
      isLoadingMetrics: this.props.isLoadingMetrics,
      tierName: this.props.queueName,
      queueSize: this.props.queueSize,
      queueItems: this.props.queueItems
    }) : null, /*#__PURE__*/_react.default.createElement("div", {
      className: "processor-container",
      style: processorContainer
    }, !this.props.isFirstProcessor ? /*#__PURE__*/_react.default.createElement(_TimeBox.default, {
      isEnter: true,
      timestamp: this.props.timestamps.queue_enter
    }) : null, /*#__PURE__*/_react.default.createElement(_ProcessorBox.default, {
      progessStatus: this.props.progessStatus,
      isLastProcessor: this.props.isLastProcessor,
      processorName: this.props.processorName,
      queueName: this.props.queueName,
      queueType: this.props.queueType,
      isFirstProcessor: this.props.isFirstProcessor,
      timeLeft: this.props.timeLeft
    }), !this.props.isFirstProcessor ? /*#__PURE__*/_react.default.createElement(_TimeBox.default, {
      isEnter: false,
      timestamp: this.props.timestamps.queue_left
    }) : null));
  }

}

exports.Processor = Processor;
var _default = Processor;
exports.default = _default;
const processorContainer = {
  width: "250px",
  position: "relative"
};

function calculateQueueThroughput(queueItems) {
  const sizeDocEarly = queueItems.doc_early.hits.hits[0]._source.size;
  const sizeDocLate = queueItems.doc_late.hits.hits[0]._source.size;
  const itemsDocEarly = queueItems.doc_early.hits.hits[0]._source.items;
  const itemsDocLate = queueItems.doc_late.hits.hits[0]._source.items;
  return 0;
}

/***/ }),

/***/ "./public/components/ProcessorBox.tsx":
/*!********************************************!*\
  !*** ./public/components/ProcessorBox.tsx ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ProcessorBox = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _ProgressPipe = _interopRequireDefault(__webpack_require__(/*! ./ProgressPipe */ "./public/components/ProgressPipe.tsx"));

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
      isProcessing: false,
      timeLeft: ""
    });

    this.state = this.state;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      timeLeft: nextProps.timeLeft
    };
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
      className: "processor-box-container",
      style: processorBoxContainer
    }, !this.props.isFirstProcessor ? /*#__PURE__*/_react.default.createElement("div", {
      className: "triangle-rotate",
      style: triangle
    }) : null, !this.props.isFirstProcessor ? /*#__PURE__*/_react.default.createElement("div", {
      style: metricsLine
    }) : null, /*#__PURE__*/_react.default.createElement("div", {
      className: "processor-box-progress-pipe-container",
      style: !this.props.isFirstProcessor ? processorBoxProgressPipeContainer : processorBoxProgressPipeContainerIsFirst
    }, !this.props.isFirstProcessor ? /*#__PURE__*/_react.default.createElement("div", {
      className: "line-dashed",
      style: lineDashed
    }) : null, /*#__PURE__*/_react.default.createElement("div", {
      className: "processor-box",
      style: processorBox.base
    }, this.props.processorName), this.props.isLastProcessor ? null : /*#__PURE__*/_react.default.createElement(_ProgressPipe.default, {
      progessStatus: this.props.progessStatus,
      queueName: this.props.queueName,
      queueType: this.props.queueType,
      timeLeft: this.props.timeLeft
    })), !this.props.isFirstProcessor ? /*#__PURE__*/_react.default.createElement("div", {
      className: "line-dashed-bottom",
      style: lineDashedBottom
    }) : null);
  }

}

exports.ProcessorBox = ProcessorBox;
var _default = ProcessorBox;
exports.default = _default;
const processorBoxContainer = {};
const triangle = {
  width: "0px",
  height: "0px",
  borderLeft: "30px solid transparent",
  borderRight: "30px solid transparent",
  borderBottom: "30px solid #F1D86F",
  position: "absolute",
  zIndex: 10,
  top: "101px",
  left: "-6%"
};
const metricsLine = {
  border: "3px dashed #D3DAE6",
  borderRight: "none",
  borderBottom: "none",
  borderTop: "none",
  height: "126px",
  width: "31px",
  position: "absolute",
  left: "-31px",
  top: "-30px",
  borderTopLeftRadius: "0px"
};
const processorBox = {
  base: {
    backgroundColor: "#006BB4",
    padding: "25px 0px",
    borderRadius: "0px",
    color: "white",
    cursor: "pointer",
    position: "relative",
    textAlign: "center",
    fontSize: ".8rem"
  }
};
const lineDashed = {
  border: "3px dashed grey",
  borderRight: "none",
  borderBottom: "none",
  width: "16px",
  height: "62px",
  position: "absolute",
  top: "35px",
  left: "-16px"
};
const lineDashedBottom = {
  border: "3px dashed grey",
  borderRight: "none",
  borderTop: "none",
  width: "16px",
  height: "62px",
  position: "absolute",
  top: "136px",
  left: "-16px"
};
const processorBoxProgressPipeContainer = {
  display: "grid",
  gridTemplateColumns: "75% 25%"
};
const processorBoxProgressPipeContainerIsFirst = {
  display: "grid",
  gridTemplateColumns: "75% 25%",
  marginTop: "209px"
};

/***/ }),

/***/ "./public/components/ProgressPipe.tsx":
/*!********************************************!*\
  !*** ./public/components/ProgressPipe.tsx ***!
  \********************************************/
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
      progressStatus: this.props.progessStatus,
      timeLeft: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      timeLeft: nextProps.timeLeft
    };
  }

  componentDidMount() {
    this.setUpProgressPipe();
  }

  setUpProgressPipe() {
    this.setState({
      progressStatus: this.props.progessStatus
    });
  }

  calculateProgressStatus() {
    return 70; //add calculation formula for ratio from timerange between start und end processing timestamps
  }
  /* depricated */


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
      className: "progress-bar-status",
      style: this.setUpProgressBarStatus()
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "progress-status-info-box",
      style: progressStatusInfoBox,
      onClick: this.onClickTest
    }, this.state.timeLeft ? /*#__PURE__*/_react.default.createElement("span", null, "T-", this.state.timeLeft, "h") : /*#__PURE__*/_react.default.createElement("span", null, "- - -")));
  }

}

exports.ProgressPipe = ProgressPipe;
var _default = ProgressPipe;
exports.default = _default;
const progressPipeContainer = {
  height: "38px",
  backgroundColor: "white",
  marginTop: "auto",
  marginBottom: "auto",
  borderTop: "5px solid #ddd",
  borderBottom: "5px solid #ddd",
  //boxShadow: "-1px 0px 22px -2px rgba(0,0,0,0.2)",
  position: "relative",
  cursor: "pointer"
};
const progressBar = {
  base: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "0%"
  },
  ten: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "10%"
  },
  twenty: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "20%"
  },
  thirty: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "30%"
  },
  fourty: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "40%"
  },
  fithy: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "50%"
  },
  sixty: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "60%"
  },
  seventy: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "70%"
  },
  eighty: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "80%"
  },
  ninethy: {
    backgroundColor: "#F1D86F",
    height: "100%",
    width: "90%"
  },
  hundred: {
    backgroundColor: "#F1D86F",
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
  top: "16%",
  transform: "translate(-50%, 0)",
  width: "58px",
  padding: "4px 0 4px 0",
  textAlign: "center",
  // fontWeight: "bold" as "bold", 
  fontSize: ".7rem"
};

/***/ }),

/***/ "./public/components/QueueMetrics.tsx":
/*!********************************************!*\
  !*** ./public/components/QueueMetrics.tsx ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.QueueMetrics = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _forkVictorvhnReactLoadingOverlay = _interopRequireDefault(__webpack_require__(/*! fork-victorvhn-react-loading-overlay */ "../../node_modules/fork-victorvhn-react-loading-overlay/lib/LoadingOverlay.js"));

var _eui = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class QueueMetrics extends _react.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "state", {
      queueSize: 0,
      queueItems: [],
      queueUtilization: 0,
      queueThroughput: 0
    });

    this.state = this.state;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      queueSize: nextProps.queueSize,
      queueItems: nextProps.queueItems,
      isLoadingMetrics: nextProps.isLoadingMetrics
    };
  }

  componentDidMount() {}

  componentDidUpdate() {}

  render() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      style: {
        textAlign: "left",
        position: "relative",
        left: "-125px",
        fontSize: ".8rem"
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      style: {
        fontWeight: "bold"
      }
    }, "Tier: "), /*#__PURE__*/_react.default.createElement("span", null, this.props.tierName)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "metrics-container",
      style: metricsContainer
    }, /*#__PURE__*/_react.default.createElement(_eui.EuiIcon, {
      style: {
        marginTop: "auto",
        marginBottom: "auto"
      },
      size: "l",
      type: "visGauge"
    }), /*#__PURE__*/_react.default.createElement(_forkVictorvhnReactLoadingOverlay.default, {
      active: this.props.isLoadingMetrics,
      spinner: true,
      text: "Loading your content..."
    }, /*#__PURE__*/_react.default.createElement("table", {
      className: "metrics-table",
      style: this.props.isLoadingMetrics ? table.isLoading : table
    }, /*#__PURE__*/_react.default.createElement("thead", {
      style: thead
    }, /*#__PURE__*/_react.default.createElement("tr", {
      style: tr
    }, /*#__PURE__*/_react.default.createElement("th", {
      style: th
    }, "Queue Size:"), /*#__PURE__*/_react.default.createElement("th", {
      style: th
    }, "Throughput:"), /*#__PURE__*/_react.default.createElement("th", {
      style: th
    }, "Utilization:"))), /*#__PURE__*/_react.default.createElement("tbody", {
      style: tbody
    }, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", {
      style: td
    }, this.state.queueSize ? this.state.queueSize : 0), /*#__PURE__*/_react.default.createElement("td", {
      style: td
    }, this.state.queueItems["doc_early"] ? calculateQueueThroughput(this.state.queueItems) : 0, "/h"), /*#__PURE__*/_react.default.createElement("td", {
      style: td
    }, this.state.queueItems["doc_early"] ? calculateQueueUtilization(this.state.queueItems) : 0, "%"))))))));
  }

}

exports.QueueMetrics = QueueMetrics;
var _default = QueueMetrics;
exports.default = _default;
const table = {
  marginLeft: "8px",
  isLoading: {
    opacity: "0%",
    marginLeft: "8px"
  }
};
const tr = {};
const thead = {
  display: "block",
  float: "left"
};
const tbody = {
  display: "block",
  float: "right"
};
const th = {
  display: "block",
  textAlign: "left",
  padding: "1px"
};
const td = {
  display: "block",
  padding: "1px"
};
const metricsContainer = {
  backgroundColor: "#D3DAE6",
  padding: "15px 10px",
  borderRadius: "10px",
  color: "black",
  cursor: "pointer",
  textAlign: "center",
  width: "75%",
  marginBottom: "30px",
  border: "3px solid white",
  display: "flex",
  fontSize: ".8rem",
  position: "relative",
  left: "-125px"
}; //Intersection between two Arrays

function intersect(a, b) {
  const setB = new Set(b);
  return [...new Set(a)].filter(x => setB.has(x));
} //Differnce of two Array


function arr_diff(a1, a2) {
  const a = [],
        diff = [];

  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }

  for (var k in a) {
    diff.push(k);
  }

  return diff;
}

function calculateQueueThroughput(queueItems) {
  if (queueItems.doc_early.hits.hits[0] != undefined && queueItems.doc_late.hits.hits[0] != undefined) {
    let itemsArrayEarly;
    let itemsArrayLate;
    const sizeDocEarly = queueItems.doc_early.hits.hits[0]._source.size;
    const sizeDocLate = queueItems.doc_late.hits.hits[0]._source.size;

    const itemsDocEarly = queueItems.doc_early.hits.hits[0]._source.items.toString();

    const itemsDocLate = queueItems.doc_late.hits.hits[0]._source.items.toString();

    if (itemsDocEarly.indexOf(' ') > 0 && itemsDocEarly !== "") {
      itemsArrayEarly = itemsDocEarly.split(' '); // split string on space

      itemsArrayLate = itemsDocLate.split(' ');
    } else {
      itemsArrayEarly = [];
      itemsArrayLate = [];
    }

    const intersectItemsArray = intersect(itemsArrayEarly, itemsArrayLate);
    const lenghIntersection = intersectItemsArray.length;
    const diff = sizeDocEarly - lenghIntersection;
    return diff;
  } else {
    return 0;
  }
}

function calculateQueueUtilization(queueItems) {
  if (queueItems.doc_early.hits.hits[0] != undefined && queueItems.doc_late.hits.hits[0] != undefined) {
    let itemsArrayEarly;
    let itemsArrayLate;
    const sizeDocLate = queueItems.doc_late.hits.hits[0]._source.size;
    const sizeDocEarly = queueItems.doc_late.hits.hits[0]._source.size;

    const itemsDocEarly = queueItems.doc_early.hits.hits[0]._source.items.toString();

    const itemsDocLate = queueItems.doc_late.hits.hits[0]._source.items.toString();

    if (itemsDocEarly.indexOf(' ') > 0 && itemsDocEarly !== "") {
      itemsArrayEarly = itemsDocEarly.split(' '); // split string on space

      itemsArrayLate = itemsDocLate.split(' ');
    } else {
      itemsArrayEarly = [];
      itemsArrayLate = [];
    }

    const intersectItemsArray = intersect(itemsArrayEarly, itemsArrayLate);
    const lenghIntersection = intersectItemsArray.length;
    const diff = sizeDocEarly - lenghIntersection;
    const newItemsLength = arr_diff(itemsArrayEarly, itemsArrayLate).length;
    const utilization = sizeDocEarly / diff;

    if (!Object.is(NaN, utilization)) {
      return Math.round(utilization);
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

/***/ }),

/***/ "./public/components/TimeBox.tsx":
/*!***************************************!*\
  !*** ./public/components/TimeBox.tsx ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TimeBox = void 0;

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _eui = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
// import {faClock} from "@fortawesome/free-solid-svg-icons"
class TimeBox extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      timePosition: "",
      timestamp: this.props.timestamp,
      isEnter: true,
      isHistoric: true
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      timestamp: nextProps.timestamp
    };
  }

  componentDidMount() {}

  componentDidUpdate() {//console.log("did update in Timebox props: ", this.props.timestamps)
    //console.log("did update in Timebox state: ", this.state.timestamps)
    //checkDates(this.state.timestamp);
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "timebox-container",
      style: timeboxContainer
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "time-box",
      style: this.state.isHistoric ? timebox.historic : timebox.forecast
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "timebox-title",
      style: this.state.isHistoric ? timeboxTitle.historic : timeboxTitle.forecast
    }, /*#__PURE__*/_react.default.createElement(_eui.EuiIcon, {
      type: "clock"
    }), "  ", this.state.isHistoric ? "Historic" : "Forecast", " ", this.props.isEnter ? "Entered" : "Left", ":"), /*#__PURE__*/_react.default.createElement("div", {
      className: "timebox-inner-bottom",
      style: timeboxInnerBottom
    }, /*#__PURE__*/_react.default.createElement(TimestampDisplay, {
      timestamp: this.state.timestamp
    }))));
  }

}

exports.TimeBox = TimeBox;
var _default = TimeBox;
exports.default = _default;

function checkDates(timestamp) {
  var CurrentDate = new Date();

  if (timestamp && timestamp != undefined && new Date(timestamp.hits.hits[0]._source.timestamp) > CurrentDate) {} else {}
} // .toLocaleDateString('de-DE', {timeZoneName:'short'}).toString()


const TimestampDisplay = ({
  timestamp
}) => {
  var offset = new Date().getTimezoneOffset();

  if (timestamp != null && typeof timestamp.hits.hits[0] === "object") {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        padding: "5px"
      }
    }, new Date(timestamp.hits.hits[0]._source.timestamp).toDateString() + " " + new Date(timestamp.hits.hits[0]._source.timestamp).toLocaleTimeString('de-DE', {
      timeZoneName: 'short'
    }).toString());
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      textAlign: "center",
      paddingTop: "8px"
    }
  }, "- - - - - - -");
};

function hoursLeft(enter, left) {
  //console.log("enter date: ", enter)
  //console.log("left date: ", left)
  var enterDate = new Date(enter);
  var leftDate = new Date(left);
  var hours = Math.abs(enterDate.getTime() - leftDate.getTime()) / 36e5;
  console.log("Hours Left: ", hours);
  return Math.round(hours);
}

const timeboxContainer = {
  width: "75%",
  marginBottom: "15px",
  marginTop: "15px",
  fontSize: ".7rem"
};
const timeboxInnerBottom = {// display: "flex",
};
const timeboxTitle = {
  historic: {
    // fontSize: ".8rem", 
    fontWeight: "bold",
    textAlign: "left",
    color: "#2e2e2e",
    textTransform: "uppercase",
    opacity: ".7"
  },
  forecast: {
    // fontSize: ".8rem", 
    fontWeight: "bold",
    textAlign: "left",
    color: "#2e2e2e",
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
    borderRadius: "10px",
    // fontSize: ".8rem",
    padding: "10px",
    cursor: "pointer",
    height: "70px"
  },
  forecast: {
    backgroundColor: "#e9dcf7",
    color: "black",
    border: "2px solid #e9dcf7",
    borderRadius: "10px",
    // fontSize: ".8rem",
    padding: "10px",
    cursor: "pointer",
    height: "70px"
  }
};

/***/ }),

/***/ "./public/components/Vis.tsx":
/*!***********************************!*\
  !*** ./public/components/Vis.tsx ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Vis = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _Pipeline = _interopRequireDefault(__webpack_require__(/*! ./Pipeline */ "./public/components/Pipeline.tsx"));

var _eui = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Vis extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      updatedTimestamp: undefined
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      updatedTimestamp: nextProps.updatedTimestamp
    };
  }

  componentDidUpdate() {}

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "visualization-container",
      style: vis
    }, /*#__PURE__*/_react.default.createElement(_Pipeline.default, {
      picTimestamps: this.props.picTimestamps,
      censhareTimestamps: this.props.censhareTimestamps,
      queueSizeCenshare: this.props.queueSizeCenshare,
      queueSizePic: this.props.queueSizePic,
      queueItemsCenshare: this.props.queueItemsCenshare,
      queueItemsPic: this.props.queueItemsPic,
      isLoadingMetrics: this.props.isLoadingMetrics
    }), /*#__PURE__*/_react.default.createElement(_eui.EuiToast, {
      iconType: ""
    }, /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement("span", {
      style: {
        fontWeight: "bold"
      }
    }, "Last Prediction Update:"), /*#__PURE__*/_react.default.createElement("span", null, " ", this.state.updatedTimestamp != "unknown" && this.state.updatedTimestamp != undefined ? this.state.updatedTimestamp : 'Unknown'))));
  }

}

exports.Vis = Vis;
var _default = Vis;
exports.default = _default;
const vis = {};

const DisplayWindowDimensions = () => {
  const [width, height] = useWindowSize();
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", null, "Window size: ", width, " x ", height));
};

function getWindowWidth() {
  const [width] = useWindowSize();
  return width;
}

function getWindowHeight() {
  const [height] = useWindowSize();
  return height;
}

function useWindowSize() {
  const [size, setSize] = (0, _react.useState)([0, 0]);
  (0, _react.useLayoutEffect)(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

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
exports.default = exports.QueuesPluginApp = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _i18n = __webpack_require__(/*! @kbn/i18n */ "@kbn/i18n");

var _react2 = __webpack_require__(/*! @kbn/i18n/react */ "@kbn/i18n/react");

var _reactRouterDom = __webpack_require__(/*! react-router-dom */ "react-router-dom");

__webpack_require__(/*! ../src/App.css */ "./public/src/App.css");

var _Vis = __webpack_require__(/*! ./Vis */ "./public/components/Vis.tsx");

var _eui = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");

var _common = __webpack_require__(/*! ../../common */ "./common/index.ts");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class QueuesPluginApp extends _react.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "state", {
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
      isLoadingMetrics: true
    });

    _defineProperty(this, "updateMetrics", () => {
      this.setState({
        isLoadingMetrics: false
      });
      this.updateCenshareQueueSize();
      this.updatePicQueueSize();
      this.updatePicQueueItems();
      this.updateCenshareQueueItems();
      console.log(".");
      console.log("Queue metrics updated.");
    });

    _defineProperty(this, "predictionHandler", () => {
      this.props.http.get('http://localhost:5000/updatePrediction').then(res => {});
      console.log('update button clicked');
      let now = new Date(); //console.log("now: ", now)

      this.setState({
        updatedTimestamp: now.toDateString() + " " + now.toTimeString()
      });
      this.props.notifications.toasts.addSuccess(_i18n.i18n.translate('productQueues.dataUpdated', {
        defaultMessage: 'Predicitons Updated!'
      }));
    });

    _defineProperty(this, "onClickSearchHandler", () => {
      const body = {
        item: this.state.item,
        name: this.state.queueName
      };
      this.props.http.post("/api/censhare/item", {
        body: JSON.stringify(body)
      }).then(res => {
        if (res) {
          //console.log("DATA res cen: ", res.data.aggregations)
          this.setState({
            censhareTimestamps: res.data.aggregations
          });
        }
      });
      this.props.http.post("/api/pic/item", {
        body: JSON.stringify(body)
      }).then(res => {
        if (res) {
          //console.log("DATA res pic: ", res2.data.aggregations)
          this.setState({
            picTimestamps: res.data.aggregations
          });
        }
      });
    });

    _defineProperty(this, "updateCenshareQueueItems", () => {
      const body = {
        name: this.state.queueName
      };
      this.props.http.post("/api/censhare/throughput/items", {
        body: JSON.stringify(body)
      }).then(res => {
        console.log("censhare items obj: ", res);
        this.setState({
          queueItemsCenshare: res.data.aggregations
        });
      });
    });

    _defineProperty(this, "updatePicQueueItems", () => {
      const body = {
        name: this.state.queueName
      };
      this.props.http.post("/api/pic/throughput/items", {
        body: JSON.stringify(body)
      }).then(res => {
        console.log("pic items obj: ", res);
        this.setState({
          queueItemsPic: res.data.aggregations
        });
      });
    });

    _defineProperty(this, "updatePicQueueSize", () => {
      const body = {
        name: this.state.queueName
      };
      this.props.http.post("/api/pic/size", {
        body: JSON.stringify(body)
      }).then(res => {
        if (typeof res.data.hits.hits !== 'undefined' && res.data.hits.hits.length > 0) {
          this.setState({
            queueSizePic: res.data.hits.hits[0]._source.size
          });
        }
      });
    });

    _defineProperty(this, "onChangeItemNameHandler", event => {
      this.setState({
        item: event.target.value
      });
    });

    _defineProperty(this, "filterChange", event => {
      console.log("Filter queue: ", event.target.value);
      this.setState({
        queueName: event.target.value
      }, this.onfilterChangedCallback); //this.updateMetrics();
    });

    this.state = this.state;
  } //item in pic & censhare 3547747429


  componentDidMount() {
    var intervalId = setInterval(this.updateMetrics, 2000);
    this.setState({
      intervalId: intervalId
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  updateCenshareQueueSize() {
    const body = {
      name: this.state.queueName
    };
    this.props.http.post("/api/censhare/size", {
      body: JSON.stringify(body)
    }).then(res => {
      console.log("test cen queue size: ", res.data);

      if (typeof res.data.hits.hits !== 'undefined' && res.data.hits.hits.length > 0) {
        this.setState({
          queueSizeCenshare: res.data.hits.hits[0]._source.size
        });
      }
    });
  }

  onfilterChangedCallback() {
    this.onClickSearchHandler();
    this.updateMetrics();
  }

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  render() {
    return /*#__PURE__*/_react.default.createElement(_reactRouterDom.BrowserRouter, {
      basename: this.props.basename
    }, /*#__PURE__*/_react.default.createElement(_react2.I18nProvider, null, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(this.props.navigation.ui.TopNavMenu, {
      appName: _common.PLUGIN_ID,
      showSearchBar: true
    }), /*#__PURE__*/_react.default.createElement(_eui.EuiPage, {
      restrictWidth: "1500px"
    }, /*#__PURE__*/_react.default.createElement(_eui.EuiPageBody, null, /*#__PURE__*/_react.default.createElement(_eui.EuiPageHeader, null, /*#__PURE__*/_react.default.createElement(_eui.EuiTitle, {
      size: "l"
    }, /*#__PURE__*/_react.default.createElement("h1", null, /*#__PURE__*/_react.default.createElement(_react2.FormattedMessage, {
      id: "productQueues.helloWorldText",
      defaultMessage: "{name}",
      values: {
        name: _common.PLUGIN_NAME
      }
    })))), /*#__PURE__*/_react.default.createElement(_eui.EuiPageContent, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "filter-form-conatiner",
      style: filterFormContainer
    }, /*#__PURE__*/_react.default.createElement(_eui.EuiFormRow, {
      label: ""
    }, /*#__PURE__*/_react.default.createElement(_eui.EuiFieldText, {
      placeholder: "Search Items...",
      id: "productQueues.itemField",
      onChange: this.onChangeItemNameHandler
    })), /*#__PURE__*/_react.default.createElement(_eui.EuiSelect, {
      onChange: this.filterChange,
      options: [{
        value: 'products',
        text: 'Products'
      }, {
        value: 'productrelations',
        text: 'Product Relation'
      }, {
        value: 'csproducts',
        text: 'CS Products'
      }, {
        value: 'stext',
        text: 'S Text'
      }, {
        value: 'featurestories',
        text: 'Feature Stories'
      }]
    }), /*#__PURE__*/_react.default.createElement(_eui.EuiButton, {
      type: "primary",
      size: "m",
      onClick: this.onClickSearchHandler
    }, "Search"), /*#__PURE__*/_react.default.createElement(_eui.EuiButton, {
      type: "primary",
      color: "secondary",
      onClick: this.predictionHandler,
      fill: true,
      size: "m",
      style: {
        marginLeft: "20px"
      }
    }, "Update Predictions")), /*#__PURE__*/_react.default.createElement(_Vis.Vis, {
      picTimestamps: this.state.picTimestamps ? this.state.picTimestamps : [],
      censhareTimestamps: this.state.censhareTimestamps ? this.state.censhareTimestamps : [],
      queueSizeCenshare: this.state.queueSizeCenshare,
      queueSizePic: this.state.queueSizePic,
      queueItemsCenshare: this.state.queueItemsCenshare ? this.state.queueItemsCenshare : null,
      queueItemsPic: this.state.queueItemsPic ? this.state.queueItemsPic : null,
      updatedTimestamp: this.state.updatedTimestamp ? this.state.updatedTimestamp : undefined,
      isLoadingMetrics: this.state.isLoadingMetrics
    })))))));
  }

}

exports.QueuesPluginApp = QueuesPluginApp;
var _default = QueuesPluginApp;
exports.default = _default;

const ResponseDisplay = ({
  data
}) => {
  if (data) {
    return /*#__PURE__*/_react.default.createElement(_eui.EuiPageContent, null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("pre", null, JSON.stringify(data, null, 2))));
  }

  return /*#__PURE__*/_react.default.createElement("div", null);
};

const filterFormContainer = {
  backgroundColor: "#F5F9FC",
  height: "80px",
  justifyContent: "center",
  display: "flex",
  paddingTop: "30px"
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
  fontWeight: "bold",
  border: "none",
  borderBottom: "2px solid #F5F9FC",
  marginLeft: "50px",
  marginTop: "auto",
  marginBottom: "auto"
};

/***/ }),

/***/ "./public/src/App.css":
/*!****************************!*\
  !*** ./public/src/App.css ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ })

}]);
//# sourceMappingURL=1.plugin.js.map