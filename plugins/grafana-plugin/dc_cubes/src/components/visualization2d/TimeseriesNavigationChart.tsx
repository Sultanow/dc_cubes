// @ts-nocheck
import React, { Component } from 'react';
import * as d3 from 'd3';
import './TimeseriesNavigationChart.css';

interface TimeseriesData {
  timestamp: string;
  selectedMeasure?: number;
}

interface TimeseriesNavigationChartProps {
  timeseriesData: [{ timestamp: string; count: number }];
  forecastData: [{ timestamp: string; count: number }];
  updateTimespanTimestamps: any;
  updatePointInTimeTimestamp: any;
  showPrediction: boolean;
  forecastReceived: boolean;
  forecastTemporalAxis: string[];
  temporalAxis: string[];
  combinedTemporalAxis: string[];
  maxH: number;
  preparedAvgData: TimeseriesData[];
  preparedMinData: TimeseriesData[];
  preparedMaxData: TimeseriesData[];
  preparedCombinedAvgData: TimeseriesData[];
  selectedMeasure: string;
  dataSourceError: boolean;
}

interface TimeseriesNavigationChartState {
  max: string;
  average: string;
  min: string;
  combinedMax: string;
  combinedAverage: string;
  combinedMin: string;
  // these are used if prediction is shown
  historicAvg: string;
  historicMax: string;
  historicMin: string;
}

const TRANSLATION_X = 40;
const SVG_WIDTH = window.innerWidth / 1.7;
const SVG_HEIGHT = 100;
const SVG_ID = 'TimeSeriesNavigationChart';

export default class TimeseriesNavigationChart extends Component<TimeseriesNavigationChartProps, TimeseriesNavigationChartState> {
  state = {
    max: null,
    average: null,
    min: null,

    combinedMax: null,
    combinedAverage: null,
    combinedMin: null,
    historicAvg: null,
    historicMin: null,
    historicMax: null,
  };

  private margin = { top: 0, right: 0, bottom: 5, left: 0 };
  private width = SVG_WIDTH - TRANSLATION_X; //- (this.margin.left + this.margin.right);
  private height = SVG_HEIGHT - (this.margin.top + this.margin.bottom);
  private parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%SZ');

  private xScale = d3.scaleTime().range([0, this.width]);
  private yScale = d3.scaleLinear().range([this.height, 0]);
  private combinedXScale = d3.scaleTime().range([0, this.width]);
  private combinedYScale = d3.scaleLinear().range([this.height, 0]);

  private lineGenerator = d3.line<TimeseriesData>().curve(d3.curveMonotoneX);
  private combinedLineGenerator = d3.line<TimeseriesData>().curve(d3.curveMonotoneX);
  private areaGenerator = d3.area<TimeseriesData>().curve(d3.curveMonotoneX);
  private combinedAreaGenerator = d3.area<TimeseriesData>().curve(d3.curveMonotoneX);

  private xAxisRef: React.RefObject<SVGGElement>;
  private yAxisRef: React.RefObject<SVGGElement>;
  private brushRef: React.RefObject<SVGGElement>;

  private uniqueTimestamps: string[];
  private forecastUniqueTimestamps: string[];
  //private combinedUniqueTimestamps: string[];
  private currentAvgValue: number;

  private currentXScale: d3.ScaleTime<number, number>;

  private lastHistoricTimestamp: Date;
  //private combinedData: TimeseriesData[];
  private forecastPreparationDone: boolean;
  private preparedAvgData: TimeseriesData[];
  private timeNowLineIsDrawn: boolean;
  private preparedMinData: TimeseriesData[];
  private preparedMaxData: TimeseriesData[];
  private preparedForecastAvgData: TimeseriesData[];

  private selectedMeasure: string;
  private tc: any;

  constructor(props: any) {
    super(props);
    this.forecastPreparationDone = false;
    this.timeNowLineIsDrawn = false;
    this.xAxisRef = React.createRef();
    this.yAxisRef = React.createRef();
    this.brushRef = React.createRef();

    this.handlePredictionActivated.bind(this);
    this.handlePredictionDeactivated.bind(this);
    this.tc = React.createRef();
  }

  componentDidMount = () => {
    if (this.props.dataSourceError !== true) {
      // Save selectedMeasure to check on updates if change to it happened
      this.selectedMeasure = this.props.selectedMeasure;

      /*  console.log("hallo")
        console.log(this.tc.current.offsetWidth)
        SVG_WIDTH = this.tc.current.offsetWidth
        SVG_HEIGHT = 100
        //TRANSLATION_X = SVG_WIDTH * 0.04;

        this.width = SVG_WIDTH - 100//(SVG_WIDTH *0.1)^2;
this.height = SVG_HEIGHT - (this.margin.top + this.margin.bottom);
    this.parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");

    this.xScale = d3.scaleTime().range([0, this.width]);
    this.yScale = d3.scaleLinear().range([this.height, 0]);
    this.combinedXScale = d3.scaleTime().range([0, this.width]);
    this.combinedYScale = d3.scaleLinear().range([this.height, 0]); */

      const { timeseriesData, maxH, selectedMeasure } = this.props;
      if (!timeseriesData) {
        return;
      }

      this.lastHistoricTimestamp = this.parseDate(timeseriesData[timeseriesData.length - 1].timestamp);

      const minHistoricTs = this.parseDate(this.props.timeseriesData[0].timestamp);
      const maxHistoricTs = this.parseDate(this.props.timeseriesData[this.props.timeseriesData.length - 1].timestamp);
      const timeDomain = [minHistoricTs, maxHistoricTs];
      const maxCount = [0, maxH + 100];

      this.xScale.domain(timeDomain); //.style("fill", "#ffffff");;
      this.yScale.domain(maxCount);

      this.uniqueTimestamps = this.props.temporalAxis;

      // generate the max area
      this.areaGenerator.x(d => {
        return this.xScale(this.parseDate(d.timestamp));
      });
      this.areaGenerator.y0(this.yScale(0));
      this.areaGenerator.y1(d => {
        return this.yScale(d[selectedMeasure]);
      });

      this.preparedMaxData = this.prepareDataForMaxLine(this.uniqueTimestamps, this.props.timeseriesData);
      const max = this.areaGenerator(this.preparedMaxData);
      this.setState({ max });

      // generate the average line
      this.lineGenerator.x(d => {
        return this.xScale(this.parseDate(d.timestamp));
      });
      this.lineGenerator.y(d => {
        return this.yScale(d[selectedMeasure]);
      });
      this.preparedAvgData = this.prepareDataForAvgLine(this.uniqueTimestamps, this.props.timeseriesData);
      const average = this.lineGenerator(this.preparedAvgData);
      this.setState({ average });

      // generate the min area
      this.areaGenerator.x(d => {
        return this.xScale(this.parseDate(d.timestamp));
      });
      this.areaGenerator.y0(this.yScale(0));
      this.areaGenerator.y1(d => {
        return this.yScale(d[selectedMeasure]);
      });
      this.preparedMinData = this.prepareDataForMinLine(this.uniqueTimestamps, this.props.timeseriesData);
      const min = this.areaGenerator(this.preparedMinData);
      this.setState({ min });
    }
  };

  componentWillReceiveProps = () => {
    // this.removeChart();
    //console.log("2d Component will receive Props");
    // todo: use this?
  };

  componentDidUpdate = () => {
    if (this.props.dataSourceError !== true) {
      // Check if selectedMeasure changed, if yes rerender visualization with new data
      if (this.props.selectedMeasure !== this.selectedMeasure) {
        this.componentDidMount();
      }
      // Check if maxH has been updated
      if (this.yScale.domain()[1] !== this.props.maxH + 100) {
        this.componentDidMount();
      }
      if (!this.forecastPreparationDone && this.props.forecastReceived) {
        const minHistoricTs = this.xScale.domain()[0]!;
        const maxHistoricTs = this.xScale.domain()[1]!;

        // array is sorted already
        const minPredictionTs = this.parseDate(this.props.forecastData[0].timestamp)!;
        const maxPredictionTs = this.parseDate(this.props.forecastData[this.props.forecastData.length - 1].timestamp)!;
        const combinedTimeDomain = [minHistoricTs, maxPredictionTs];

        if (minHistoricTs > minPredictionTs || maxHistoricTs > maxPredictionTs) {
          console.error('Prediction Timestamps are incorrect. They should be after the historic dates.');
        }

        const combinedMaxCount = [0, this.props.maxH];

        this.combinedXScale.domain(combinedTimeDomain);
        this.combinedYScale.domain(combinedMaxCount);
        // generate the average line
        this.combinedLineGenerator.x(d => {
          return this.combinedXScale(this.parseDate(d.timestamp));
        });
        this.combinedLineGenerator.y(d => {
          return this.combinedYScale(d[this.props.selectedMeasure]);
        });
        //area generator
        this.combinedAreaGenerator.x(d => {
          return this.combinedXScale(this.parseDate(d.timestamp));
        });
        this.combinedAreaGenerator.y0(this.combinedYScale(0));
        this.combinedAreaGenerator.y1(d => {
          return this.combinedYScale(d[this.props.selectedMeasure]);
        });

        if (this.forecastUniqueTimestamps == null) {
          this.forecastUniqueTimestamps = this.props.forecastTemporalAxis;
          //this.combinedUniqueTimestamps = this.props.forecastTemporalAxis;
        }
        if (!this.state.combinedAverage) {
          this.preparedForecastAvgData = this.prepareDataForAvgLine(this.forecastUniqueTimestamps, this.props.forecastData);
          const combinedAverage = this.combinedLineGenerator(this.preparedForecastAvgData);
          this.setState({ combinedAverage });
          const historicAvg = this.combinedLineGenerator(this.preparedAvgData);
          this.setState({ historicAvg });
          const historicMin = this.combinedAreaGenerator(this.preparedMinData);
          this.setState({ historicMin });
          const historicMax = this.combinedAreaGenerator(this.preparedMaxData);
          this.setState({ historicMax });

          this.forecastPreparationDone = true;
        }
        if (!this.timeNowLineIsDrawn) {
          this.drawTimeNowLine();
          this.timeNowLineIsDrawn = true;
        }
      } else {
        d3.select(this.yAxisRef.current).call(d3.axisLeft(this.yScale).ticks(5));
        d3.select(this.xAxisRef.current).call(d3.axisBottom(this.xScale)); //.tickValues([]).tickSize(0));
      }
      this.setupTooltip();
      this.setupBrush();
    }
  };

  setupTooltip = () => {
    const originalScope = this;

    const tooltipElement: HTMLElement = document.getElementById('tooltip');

    d3.select('#' + SVG_ID)
      .on('mousemove', () => {
        const mousePosition = d3.mouse(document.getElementById(SVG_ID));
        const xcoord: number = mousePosition[0];
        const yAxis = d3
          .select('#' + SVG_ID)
          .select('.y-axis')
          .node() as Element;
        const bboxYaxis = yAxis.getBoundingClientRect();
        const bboxSvg = document.getElementById(SVG_ID).getBoundingClientRect();
        const xPositionOfYAxis = bboxYaxis.right - bboxSvg.left;

        if (xcoord < xPositionOfYAxis) {
          originalScope.hideTooltip();
          return;
        }

        originalScope.drawMouseline(xcoord);
        const datapoint = originalScope.getValidDatapointFromMousePosition(xcoord);
        if (datapoint != null) {
          originalScope.updateTooltip(datapoint);
        }

        tooltipElement.style.visibility = 'visible';
      })
      .on('mouseleave', () => {
        originalScope.hideTooltip();
      });
  };

  hideTooltip = () => {
    const tooltipElement: HTMLElement = document.getElementById('tooltip');
    d3.select('#tooltipDate').html('');
    d3.select('#tooltipAvg').html('');
    d3.select('.mouseMove').classed('hidden', true);
    d3.select('#tooltip')
      .style('left', '')
      .style('top', '')
      .style('position', '');

    tooltipElement.style.visibility = 'hidden';
  };

  drawMouseline = (xcoord: number) => {
    d3.select('#mouseLine').attr('d', () => {
      let d = 'M' + xcoord + ',' + SVG_HEIGHT;
      d += ' ' + xcoord + ',' + 0;
      return d;
    });
    d3.select('.mouseMove').classed('hidden', false);
  };

  calculateOffset = (): number => {
    let offset = TRANSLATION_X;
    offset -= 2;
    return offset;
  };

  setupBrush = () => {
    const originalScope = this;
    const brush = d3.select(this.brushRef.current);
    brush.call(
      d3
        .brushX()
        .extent([
          [this.margin.left + this.margin.right, 0],
          [SVG_WIDTH - this.margin.left, this.height],
        ])
        .on('brush', () => {
          const mousePosition = d3.mouse(document.getElementById(SVG_ID));
          const xcoord: number = mousePosition[0];
          const datapoint = originalScope.getValidDatapointFromMousePosition(xcoord);
          if (datapoint != null) {
            originalScope.updateTooltip(datapoint);
          }
        })
        .on('end', () => {
          originalScope.brushEnd.call(originalScope);
        })
    );
  };

  updateTooltip = (dp: TimeseriesData) => {
    const mousePosition = d3.mouse(document.getElementById(SVG_ID));
    const bbox = document.getElementById(SVG_ID).getBoundingClientRect();
    const xcoord: number = d3.event.pageX || mousePosition[0] + bbox.left;
    const ycoord: number = d3.event.pageY || mousePosition[1] + bbox.top;
    const offsetX = -70;
    const offsetY = 90;

    d3.select('#tooltipDate').html(dp.timestamp);
    d3.select('#tooltipAvg').html(Math.floor(dp[this.props.selectedMeasure]).toString());
    this.currentAvgValue = Math.floor(dp[this.props.selectedMeasure]);

    d3.select('#tooltip')
      .style('top', ycoord - offsetY + 'px')
      .style('left', xcoord + offsetX + 'px');
  };

  brushEnd = () => {
    const selectedArea = d3.event.selection || this.currentXScale.range(); // if selection is null, selectedArea = rannge
    const brushMinimum = selectedArea[0];
    const brushMaximum = selectedArea[1];

    function isBrushAreaTooSmall(brushMinimum, brushMaximum) {
      const brushThreshold = 2;
      return brushMinimum <= 0 || brushMaximum - brushMinimum < brushThreshold;
    }

    if (isBrushAreaTooSmall(brushMinimum, brushMaximum)) {
      const clickedXCoord = d3.mouse(document.getElementById(SVG_ID))[0];
      d3.select('#selectedDatapointLine').attr('d', () => {
        let d = 'M' + clickedXCoord + ',' + SVG_HEIGHT;
        d += ' ' + clickedXCoord + ',' + 0;
        return d;
      });
      d3.select('.mouseClick').classed('hidden', false);
      const date = this.getValidDatapointFromMousePosition(clickedXCoord);
      if (date == null) {
        return;
      }
      this.props.updatePointInTimeTimestamp(date.timestamp);
      return;
    }

    const startDate = this.getValidDatapointFromMousePosition(brushMinimum).timestamp!;
    const endDate = this.getValidDatapointFromMousePosition(brushMaximum).timestamp!;

    d3.select('.mouseClick').classed('hidden', true);
    const newTimespanData = {
      timespanTimestampUpperBound: endDate,
      timespanTimestampLowerBound: startDate,
      timeSelectionMode: 'timespan',
      isLoading: true,
    };
    console.log(startDate, endDate);
    this.props.updateTimespanTimestamps(newTimespanData);
  };

  getValidDatapointFromMousePosition = xCoord => {
    const offset: number = this.calculateOffset();

    let newDate: Date = this.currentXScale.invert(xCoord - offset);
    newDate = this.roundDateToNearest15Min(newDate);
    const newDateString = this.convertDateObjectToString(newDate);
    const found1 = this.preparedAvgData.find(x => x.timestamp === newDateString);
    let found2;
    if (this.props.showPrediction) {
      found2 = this.preparedForecastAvgData.find(x => x.timestamp === newDateString);
    }

    if (found1) {
      return found1;
    }
    return found2;
  };

  roundDateToNearest15Min = (date: Date): Date => {
    const minutes = 15;
    const ms = 1000 * 60 * minutes;
    return new Date(Math.round(date.getTime() / ms) * ms);
  };

  toggleChartMax = () => {
    const selection = d3.select('.area-max');
    if (selection.attr('display') === 'none') {
      selection.attr('display', '');
    } else {
      selection.attr('display', 'none');
    }
  };
  toggleChartAvg = () => {
    const selection = d3.select('.line-avg');
    if (selection.attr('display') === 'none') {
      selection.attr('display', '');
    } else {
      selection.attr('display', 'none');
    }
  };
  toggleChartMin = () => {
    const selection = d3.select('.area-min');
    if (selection.attr('display') === 'none') {
      selection.attr('display', '');
    } else {
      selection.attr('display', 'none');
    }
  };

  render = () => {
    const translation = 'translate(' + TRANSLATION_X + ',0)';
    let maxArea: any = null;
    if (!this.props.showPrediction && this.state.max != null) {
      maxArea = <path className="area-max" d={this.state.max} strokeLinecap="round" transform={translation} />;
    }

    let avgline: any = null;
    if (!this.props.showPrediction && this.state.average != null) {
      avgline = <path className="line-avg" d={this.state.average} strokeLinecap="round" transform={translation} />;
    }
    let minArea: any = null;
    if (!this.props.showPrediction && this.state.min != null) {
      minArea = <path className="area-min" d={this.state.min} strokeLinecap="round" transform={translation} />;
    }

    let forecastLine: JSX.Element = <div></div>;
    let histroicAvgLine: JSX.Element = <div></div>;
    let historicMinLine: JSX.Element = <div></div>;
    let historicMaxLine: JSX.Element = <div></div>;
    if (this.props.showPrediction) {
      if (this.state.combinedAverage != null) {
        forecastLine = <path className="line-avg prediction" d={this.state.combinedAverage} strokeLinecap="round" transform={translation} />;
      }

      if (this.state.historicAvg != null) {
        histroicAvgLine = <path className="line-avg" d={this.state.historicAvg} strokeLinecap="round" transform={translation} />;
      }

      if (this.state.historicMax != null) {
        historicMaxLine = <path className="area-max prediction" d={this.state.historicMax} strokeLinecap="round" transform={translation} />;
      }

      if (this.state.historicMin != null) {
        historicMinLine = <path className="area-min prediction" d={this.state.historicMin} strokeLinecap="round" transform={translation} />;
      }
    }

    if (this.props.showPrediction && this.props.forecastData) {
      this.handlePredictionActivated();
    } else {
      this.handlePredictionDeactivated();
    }

    return (
      <div ref={this.tc} className="container2d d-flex justify-content-center">
        <svg id={SVG_ID} width={SVG_WIDTH} height={SVG_HEIGHT} transform={translation}>
          {maxArea}
          {historicMaxLine}
          {avgline}
          {histroicAvgLine}
          {minArea}
          {historicMinLine}
          {forecastLine}
          <g className="x-axis" transform={'translate(' + TRANSLATION_X + ',' + this.height + ')'} ref={this.xAxisRef}></g>;
          <g className="y-axis" transform={translation} ref={this.yAxisRef}></g>;<g className="brush" ref={this.brushRef}></g>
          <g className="mouseLine mouseClick">
            <path id="selectedDatapointLine"></path>
          </g>
          <g className="mouseLine mouseMove">
            <path id="mouseLine"></path>
          </g>
          <g className="timeNowLine">
            <path id="timeNowLine"></path>
          </g>
        </svg>
        <div className="verticalContainer">
          <div className="checkboxContainer">
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input timeseriesCheckbox"
                id="max-switch"
                defaultChecked={true}
                onChange={this.toggleChartMax}
                readOnly
              />
              <label className="custom-control-label" htmlFor="max-switch">
                Maximum
              </label>
            </div>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input timeseriesCheckbox"
                id="min-switch"
                defaultChecked={true}
                onChange={this.toggleChartMin}
                readOnly
              />
              <label className="custom-control-label" htmlFor="min-switch">
                Minimum
              </label>
            </div>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input timeseriesCheckbox"
                id="avg-switch"
                defaultChecked={true}
                onChange={this.toggleChartAvg}
                readOnly
              />
              <label className="custom-control-label" htmlFor="avg-switch">
                Mittelwert
              </label>
            </div>
          </div>
          <div id="tooltip">
            <div>
              Datum: <span id="tooltipDate"></span>
            </div>
            <div>
              Durchs.: <span id="tooltipAvg">{this.currentAvgValue}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  convertDateObjectToString = (str: Date) => {
    return str.toISOString().split('.')[0] + 'Z';
  };

  prepareDataForMaxLine = (timestamps: string[], timeseries: TimeseriesData[]) => {
    const valuesOnTimestamp: TimeseriesData[] = [];
    timestamps.forEach(timestamp => {
      const values: any[] = [];
      timeseries.forEach(element => {
        if (timestamp === element.timestamp) {
          values.push(element[this.props.selectedMeasure]);
        }
      });

      const obj = { timestamp: timestamp };
      obj[this.props.selectedMeasure] = Math.max.apply(Math, values);
      valuesOnTimestamp.push(obj);
    });

    return valuesOnTimestamp;
  };

  prepareDataForMinLine = (timestamps: string[], timeseries: TimeseriesData[]) => {
    const valuesOnTimestamp: TimeseriesData[] = [];
    timestamps.forEach(timestamp => {
      const values: any[] = [];
      timeseries.forEach(element => {
        if (timestamp === element.timestamp) {
          values.push(element[this.props.selectedMeasure]);
        }
      });

      const obj = { timestamp: timestamp };
      obj[this.props.selectedMeasure] = Math.min.apply(Math, values);
      valuesOnTimestamp.push(obj);
    });

    return valuesOnTimestamp;
  };

  prepareDataForAvgLine = (timestamps: string[], timeseries: TimeseriesData[]) => {
    const valuesOnTimestamp: TimeseriesData[] = [];
    timestamps.forEach(timestamp => {
      let counter = 0;
      let sum = 0;
      timeseries.forEach(element => {
        if (timestamp === element.timestamp) {
          counter++;
          sum += element[this.props.selectedMeasure];
        }
      });

      let avg = 0;
      if (counter !== 0) {
        avg = sum / counter;
      }

      const obj = { timestamp: timestamp };
      obj[this.props.selectedMeasure] = avg;
      valuesOnTimestamp.push(obj);
    });
    // todo combinedAvg for tooltip/mouseevents
    //this.currentAvgData = valuesOnTimestamp;
    return valuesOnTimestamp;
  };

  handlePredictionActivated = () => {
    this.showTimeNowLine();
    //this.currentAvgData = this.preparedForecastAvgData;
    this.currentXScale = this.combinedXScale;
  };

  handlePredictionDeactivated = () => {
    this.hideTimeNowLine();
    //this.currentAvgData = this.preparedAvgData;
    this.currentXScale = this.xScale;
  };

  drawTimeNowLine = () => {
    let xcoord = this.combinedXScale(this.lastHistoricTimestamp);
    xcoord += this.calculateOffset();
    d3.select('#timeNowLine').attr('d', () => {
      let d = 'M' + xcoord + ',' + SVG_HEIGHT;
      d += ' ' + xcoord + ',' + 0;
      return d;
    });
    this.hideTimeNowLine();
  };

  showTimeNowLine = () => {
    d3.select('.timeNowLine').classed('hidden', false);
  };

  hideTimeNowLine = () => {
    d3.select('.timeNowLine').classed('hidden', true);
  };
}
