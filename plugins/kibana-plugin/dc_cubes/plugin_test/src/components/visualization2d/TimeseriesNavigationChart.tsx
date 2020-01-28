import React, { Component } from 'react';
import * as d3 from 'd3';
import './TimeseriesNavigationChart.css';

interface TimeseriesNavigationChartProps {
  timeseriesData: [{ timestamp: string; count: number }];
  updateTimespanData: any;
  resetSliderAndDates: any;
  updateCurrentAvg: any;
}

interface TimeseriesNavigationChartState {
  max: string;
  average: string;
  min: string;
}

interface TimeseriesData {
  timestamp: string;
  count: number;
}

const SVG_WIDTH = window.innerWidth / 1.5;
const SVG_HEIGHT = 100;
const SVG_ID = 'TimeSeriesNavigationChart';

export default class TimeseriesNavigationChart extends Component<TimeseriesNavigationChartProps, TimeseriesNavigationChartState> {
  state = {
    max: null,
    average: null,
    min: null,
  };

  private margin = { top: 0, right: 20, bottom: 5, left: 0 };
  private width = SVG_WIDTH - (this.margin.left + this.margin.right);
  private height = SVG_HEIGHT - (this.margin.top + this.margin.bottom);
  private parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%SZ');

  private xScale = d3.scaleTime().range([0, this.width]);
  private yScale = d3.scaleLinear().range([this.height, 0]);

  private lineGenerator = d3.line<TimeseriesData>().curve(d3.curveMonotoneX);
  private areaGenerator = d3.area<TimeseriesData>().curve(d3.curveMonotoneX);

  private xAxisRef: React.RefObject<SVGGElement>;
  private yAxisRef: React.RefObject<SVGGElement>;
  private brushRef: React.RefObject<SVGGElement>;

  private uniqueTimestamps: string[];
  private dataAvg: TimeseriesData[];
  private currentAvgValue: number;

  constructor(props: any) {
    super(props);
    this.xAxisRef = React.createRef();
    this.yAxisRef = React.createRef();
    this.brushRef = React.createRef();
  }

  componentDidMount() {
    const { timeseriesData } = this.props;
    if (!timeseriesData) {
      return;
    }

    const timeDomain = d3.extent(timeseriesData, d => {
      return this.parseDate(d.timestamp);
    });

    const maxCount = [
      0,
      d3.max(timeseriesData, d => {
        return d.count + 100;
      }),
    ];

    this.xScale.domain(timeDomain);
    this.yScale.domain(maxCount);

    this.uniqueTimestamps = this.filterUniqueTimestamps();

    // generate the max area
    this.areaGenerator.x(d => {
      return this.xScale(this.parseDate(d.timestamp));
    });
    this.areaGenerator.y0(this.yScale(0));
    this.areaGenerator.y1(d => {
      return this.yScale(d.count);
    });
    const max = this.areaGenerator(this.prepareDataForMaxLine());
    this.setState({ max });

    // generate the average line
    this.lineGenerator.x(d => {
      return this.xScale(this.parseDate(d.timestamp));
    });
    this.lineGenerator.y(d => {
      return this.yScale(d.count);
    });
    const average = this.lineGenerator(this.prepareDateForAvgLine());
    this.setState({ average });

    // generate the min area
    this.areaGenerator.x(d => {
      return this.xScale(this.parseDate(d.timestamp));
    });
    this.areaGenerator.y0(this.yScale(0));
    this.areaGenerator.y1(d => {
      return this.yScale(d.count);
    });
    const min = this.areaGenerator(this.prepareDateForMinLine());
    this.setState({ min });
  }

  componentDidUpdate() {
    d3.select(this.yAxisRef.current).call(d3.axisLeft(this.yScale).ticks(5));
    d3.select(this.xAxisRef.current).call(
      d3
        .axisBottom(this.xScale)
        .tickValues([])
        .tickSize(0)
    );
    this.setupTooltip();
    this.setupBrush();
    d3.select('.x-axis').selectAll('.tick text');
  }

  setupTooltip() {
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
  }

  hideTooltip() {
    const tooltipElement: HTMLElement = document.getElementById('tooltip');
    d3.select('#tooltipDate').html('');
    d3.select('#tooltipAvg').html('');
    d3.select('.mouseMove').classed('hidden', true);
    d3.select('#tooltip')
      .style('left', '')
      .style('top', '')
      .style('position', '');

    tooltipElement.style.visibility = 'hidden';
  }

  drawMouseline(xcoord: number) {
    d3.select('#mouseLine').attr('d', () => {
      let d = 'M' + xcoord + ',' + SVG_HEIGHT;
      d += ' ' + xcoord + ',' + 0;
      return d;
    });
    d3.select('.mouseMove').classed('hidden', false);
  }

  calculateOffset(): number {
    const elemAxis = d3.select('.y-axis').node() as Element;
    const bBoxAxis = elemAxis.getBoundingClientRect();
    const elemSvg = d3.select('#' + SVG_ID).node() as Element;
    const bBoxSvg = elemSvg.getBoundingClientRect();

    return bBoxAxis.right - bBoxSvg.left - 8; // ToDo: magic number
  }

  setupBrush = () => {
    const originalScope = this;
    const brush = d3.select(this.brushRef.current);
    brush.call(
      d3
        .brushX()
        .extent([[this.margin.left + this.margin.right, 0], [SVG_WIDTH - this.margin.left, this.height]])
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
    d3.select('#tooltipAvg').html(Math.floor(dp.count).toString());
    this.currentAvgValue = Math.floor(dp.count);

    d3.select('#tooltip')
      .style('top', ycoord - offsetY + 'px')
      .style('left', xcoord + offsetX + 'px');
  };

  brushEnd = () => {
    const selectedArea = d3.event.selection || this.xScale.range(); // if selection is null, selectedArea = [0,880]
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
      this.props.resetSliderAndDates(date.timestamp);
      this.props.updateCurrentAvg(this.currentAvgValue);
      return;
    }
    const startDate = this.getValidDatapointFromMousePosition(brushMinimum).timestamp;
    const endDate = this.getValidDatapointFromMousePosition(brushMaximum).timestamp;

    d3.select('.mouseClick').classed('hidden', true);
    const newTimespanData = {
      timespanAbsoluteTimestampUpperBound: endDate,
      timespanAbsoluteTimestampLowerBound: startDate,
      timeSelectionMode: 'timespan',
      timespanTypeUpperBound: 'absolute',
      timespanTypeLowerBound: 'absolute',
      sliderMode: 'timespan',
    };

    this.props.updateTimespanData(newTimespanData);
    this.props.updateCurrentAvg(this.currentAvgValue);
  };

  getValidDatapointFromMousePosition = xCoord => {
    const offset: number = this.calculateOffset();
    const bisectDate = d3.bisector((d: TimeseriesData) => {
      return d.timestamp;
    }).left;
    const dateString = this.convertDateObjectToString(this.xScale.invert(xCoord - offset));
    const indexOfDatapoint = bisectDate(this.dataAvg, dateString);

    return this.dataAvg[indexOfDatapoint];
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
    let maxArea = null;
    if (this.state.max != null) {
      maxArea = <path className="area-max" d={this.state.max} strokeLinecap="round" transform="translate(40,0)" />;
    }

    let avgline = null;
    if (this.state.average != null) {
      avgline = <path className="line-avg" d={this.state.average} strokeLinecap="round" transform="translate(40,0)" />;
    }

    let minArea = null;
    if (this.state.min != null) {
      minArea = <path className="area-min" d={this.state.min} strokeLinecap="round" transform="translate(40,0)" />;
    }

    return (
      <div className="container2d d-flex justify-content-center">
        <svg id={SVG_ID} width={SVG_WIDTH} height={SVG_HEIGHT}>
          {maxArea}
          {avgline}
          {minArea}
          <g className="x-axis" transform={'translate(39,' + this.height + ')'} ref={this.xAxisRef}></g>;
          <g className="y-axis" transform="translate(39,0)" ref={this.yAxisRef}></g>;<g className="brush" ref={this.brushRef}></g>
          <g className="mouseLine mouseClick">
            <path id="selectedDatapointLine"></path>
          </g>
          <g className="mouseLine mouseMove">
            <path id="mouseLine"></path>
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

  filterUniqueTimestamps = (): string[] => {
    const uniqueTimestamps: string[] = [];
    const timeseriesData = this.props.timeseriesData;
    for (let i = 0; i < timeseriesData.length; i++) {
      if (uniqueTimestamps.indexOf(timeseriesData[i].timestamp) === -1) {
        if (timeseriesData[i].timestamp !== undefined) {
          uniqueTimestamps.push(timeseriesData[i].timestamp);
        }
      }
    }
    uniqueTimestamps.sort((x, y) => {
      return Date.parse(x) - Date.parse(y);
    });
    return uniqueTimestamps;
  };
  prepareDataForMaxLine = () => {
    const valuesOnTimestamp: TimeseriesData[] = [];
    this.uniqueTimestamps.forEach(timestamp => {
      const values = [];
      this.props.timeseriesData.forEach(element => {
        if (timestamp === element.timestamp) {
          values.push(element.count);
        }
      });
      valuesOnTimestamp.push({ timestamp: timestamp, count: Math.max.apply(Math, values) });
    });

    return valuesOnTimestamp;
  };

  prepareDateForMinLine = () => {
    const valuesOnTimestamp: TimeseriesData[] = [];
    this.uniqueTimestamps.forEach(timestamp => {
      const values = [];
      this.props.timeseriesData.forEach(element => {
        if (timestamp === element.timestamp) {
          values.push(element.count);
        }
      });
      valuesOnTimestamp.push({ timestamp: timestamp, count: Math.min.apply(Math, values) });
    });

    return valuesOnTimestamp;
  };

  prepareDateForAvgLine = () => {
    const valuesOnTimestamp: TimeseriesData[] = [];
    this.uniqueTimestamps.forEach(timestamp => {
      const values = [];
      this.props.timeseriesData.forEach(element => {
        if (timestamp === element.timestamp) {
          values.push(element.count);
        }
      });

      let sum,
        avg = 0;
      if (values.length) {
        sum = values.reduce((a, b) => {
          return a + b;
        });
        avg = sum / values.length;
      }
      valuesOnTimestamp.push({ timestamp: timestamp, count: avg });
    });
    this.dataAvg = valuesOnTimestamp;
    return valuesOnTimestamp;
  };
}
