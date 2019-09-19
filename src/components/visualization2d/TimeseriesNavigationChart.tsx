import React, { Component } from 'react'
import * as d3 from 'd3';
import './TimeseriesNavigationChart.css';

interface TimeseriesNavigationChartProps {
    timeseriesData: [{ timestamp: string, count: number }]
    updateTimespanData: any
    resetSliderAndDates: any
}

interface TimeseriesNavigationChartState {
    max: string,
    average: string,
    min: string,
}

interface timeseriesData {
    timestamp: string,
    count: number
}

interface timestampData {
    timestamp: number,
    count: number
}

const SVG_WIDTH = 920;
const SVG_HEIGHT = 150;
const SVG_ID = "TimeSeriesNavigationChart"

export default class TimeseriesNavigationChart extends Component<TimeseriesNavigationChartProps, TimeseriesNavigationChartState>{

    state = {
        max: null,
        average: null,
        min: null,
    }

    private margin = { top: 20, right: 20, bottom: 20, left: 0 };
    private width = SVG_WIDTH - (this.margin.left + this.margin.right);
    private height = SVG_HEIGHT - (this.margin.top + this.margin.bottom);
    private parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");

    private xScale = d3.scaleTime().range([0, this.width]);
    private yScale = d3.scaleLinear().range([this.height, 0]);

    private lineGenerator = d3.line<timeseriesData>().curve(d3.curveMonotoneX);
    private areaGenerator = d3.area<timeseriesData>().curve(d3.curveMonotoneX);

    private xAxisRef: React.RefObject<SVGGElement>;
    private yAxisRef: React.RefObject<SVGGElement>;
    private brushRef: React.RefObject<SVGGElement>;

    private lastShownIndex: number = -1;
    private tooltipDate: string;
    private tooltipAvg: number;

    private uniqueTimestamps: string[];
    private dataMax: timeseriesData[];
    private dataAvg: timeseriesData[];
    private dataMin: timeseriesData[];

    constructor(props: any) {
        super(props);
        this.xAxisRef = React.createRef();
        this.yAxisRef = React.createRef();
        this.brushRef = React.createRef();
    }

    componentDidMount() {
        const { timeseriesData } = this.props;
        if (!timeseriesData) return;

        const timeDomain = d3.extent(timeseriesData, d => {
            return this.parseDate(d.timestamp);
        })

        const maxCount = [0, d3.max(timeseriesData, d => {
            return d.count + 100;
        })]

        this.xScale.domain(timeDomain);
        this.yScale.domain(maxCount);

        this.uniqueTimestamps = this.filterUniqueTimestamps();

        // generate the max area
        this.areaGenerator.x(d => { return this.xScale(this.parseDate(d.timestamp)); })
        this.areaGenerator.y0(this.yScale(0))
        this.areaGenerator.y1(d => { return this.yScale(d.count); });
        const max = this.areaGenerator(this.prepareDataForMaxLine());
        this.setState({ max })

        // generate the average line 
        this.lineGenerator.x(d => { return this.xScale(this.parseDate(d.timestamp)); });
        this.lineGenerator.y(d => { return this.yScale(d.count); })
        const average = this.lineGenerator(this.prepareDateForAvgLine());
        this.setState({ average })

        // generate the min area
        this.areaGenerator.x(d => { return this.xScale(this.parseDate(d.timestamp)); })
        this.areaGenerator.y0(this.yScale(0))
        this.areaGenerator.y1(d => { return this.yScale(d.count); });
        const min = this.areaGenerator(this.prepareDateForMinLine());
        this.setState({ min })

    }

    componentDidUpdate() {
        d3.select(this.yAxisRef.current).call(d3.axisLeft(this.yScale).ticks(5));
        d3.select(this.xAxisRef.current).call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%Y-%m-%d")));
        this.setupTooltip();
        this.setupBrush();
        d3.select(".x-axis").selectAll(".tick text");
    }

    setupTooltip() {
        let originalScope = this;

        let tooltipElement: HTMLElement = document.getElementById('tooltip');

        d3.select("#" + SVG_ID).on("mousemove", function () {

            function updateTooltip(dp: timeseriesData) {
                let offsetX = 20;
                let offsetY = 5;
                d3.select("#tooltipDate").html(dp.timestamp);
                d3.select("#tooltipAvg").html(Math.floor(dp.count).toString());
                d3.select("#tooltip").style("top", d3.event.pageY - offsetY + "px")
                    .style("left", d3.event.pageX + offsetX + "px")
            }

            let mousePosition = d3.mouse(document.getElementById(SVG_ID));
            let xcoord: number = mousePosition[0];

            d3.select(".mouseLine").classed("hidden", false)
            d3.select("#mouseLine").attr("d", function () {
                var d = "M" + xcoord + "," + SVG_HEIGHT;
                d += " " + xcoord + "," + 0;
                return d;
            });
            let datapoint = originalScope.getValidDatapointFromMousePosition(xcoord);
            if (datapoint != null) updateTooltip(datapoint);

            tooltipElement.style.visibility = "visible";

        }).on("mouseleave", function () {
            originalScope.lastShownIndex = -1;
            d3.select("#tooltipDate").html("");
            d3.select("#tooltipAvg").html("");
            d3.select(".mouseLine").classed("hidden", true);
            d3.select("#tooltip").style("left", "").style("top", "").style("position", "");

            tooltipElement.style.visibility = "hidden";
        });
    }

    calculateOffset(): number {
        let elemAxis = d3.select(".y-axis").node() as Element;
        let bBoxAxis = elemAxis.getBoundingClientRect();
        let elemSvg = d3.select("#" + SVG_ID).node() as Element;
        let bBoxSvg = elemSvg.getBoundingClientRect();

        return bBoxAxis.right - bBoxSvg.left - 6; // ToDo: magic number
    }

    setupBrush() {
        let originalScope = this;
        let brush = d3.select(this.brushRef.current);
        brush.call(d3.brushX()
            .extent([[this.margin.left + this.margin.right, 0], [SVG_WIDTH - this.margin.left, this.height]])
            // TODO: decide if 'end' or 'end brush'
            .on("end", function () {
                originalScope.brushEnd.call(originalScope);
            }));
    }

    brushEnd() {
        let selectedArea = d3.event.selection || this.xScale.range(); // if selection is null, selectedArea = [0,880]
        let brushMinimum = selectedArea[0];
        let brushMaximum = selectedArea[1];

        function isBrushAreaTooSmall(brushMinimum, brushMaximum) {
            const brushThreshold = 2;
            return (brushMinimum === 0 || brushMaximum - brushMinimum < brushThreshold)
        }

        let startDate = this.convertDateObjectToString(this.xScale.invert(brushMinimum));
        let endDate = this.convertDateObjectToString(this.xScale.invert(brushMaximum));

        if (isBrushAreaTooSmall(brushMinimum, brushMaximum)) {
            let clickedXCoord = d3.mouse(document.getElementById(SVG_ID))[0];
            let date = this.getValidDatapointFromMousePosition(clickedXCoord);
            this.props.resetSliderAndDates(date.timestamp);
            return;
        }

        const newTimespanData = {
            timespanAbsoluteTimestampUpperBound: endDate,
            timespanAbsoluteTimestampLowerBound: startDate,
            timeSelectionMode: 'timespan',
            timespanTypeUpperBound: 'absolute',
            timespanTypeLowerBound: 'absolute',
            sliderMode: 'timespan'
        }
        this.props.updateTimespanData(newTimespanData)
    }

    getValidDatapointFromMousePosition(xCoord) {
        let offset: number = this.calculateOffset();
        let bisectDate = d3.bisector(function (d: timeseriesData) { return d.timestamp; }).left;
        let dateString = this.convertDateObjectToString(this.xScale.invert(xCoord - offset));
        let indexOfDatapoint = bisectDate(this.dataAvg, dateString);

        return this.dataAvg[indexOfDatapoint]
    }

    toggleChartMax() {
        let selection = d3.select(".area-max");
        if (selection.attr("display") === "none") selection.attr("display", "");
        else selection.attr("display", "none");
    }
    toggleChartAvg() {
        let selection = d3.select(".line-avg");
        if (selection.attr("display") === "none") selection.attr("display", "");
        else selection.attr("display", "none");
    }
    toggleChartMin() {
        let selection = d3.select(".area-min");
        if (selection.attr("display") === "none") selection.attr("display", "");
        else selection.attr("display", "none");
    }

    render() {
        var maxArea = null;
        if (this.state.max != null) {
            maxArea = <path className="area-max" d={this.state.max} strokeLinecap="round" transform="translate(40,0)" />
        }

        var avgline = null;
        if (this.state.average != null) {
            avgline = <path className="line-avg" d={this.state.average} strokeLinecap="round" transform="translate(40,0)" />
        }

        var minArea = null;
        if (this.state.min != null) {
            minArea = <path className="area-min" d={this.state.min} strokeLinecap="round" transform="translate(40,0)" />
        }

        return (
            <div className="container2d d-inline">
                <div className="verticalContainer">
                    <div className="checkboxContainer">
                        <div className='custom-control custom-switch'>
                            <input
                                type='checkbox'
                                className='custom-control-input timeseriesCheckbox'
                                id='max-switch'
                                defaultChecked={true}
                                onChange={this.toggleChartMax}
                                readOnly
                            />
                            <label className='custom-control-label' htmlFor='max-switch'>
                                Maximum
                            </label>
                        </div>
                        <div className='custom-control custom-switch'>
                            <input
                                type='checkbox'
                                className='custom-control-input timeseriesCheckbox'
                                id='min-switch'
                                defaultChecked={true}
                                onChange={this.toggleChartMin}
                                readOnly
                            />
                            <label className='custom-control-label' htmlFor='min-switch'>
                                Minimum
                            </label>
                        </div>
                        <div className='custom-control custom-switch'>
                            <input
                                type='checkbox'
                                className='custom-control-input timeseriesCheckbox'
                                id='avg-switch'
                                defaultChecked={true}
                                onChange={this.toggleChartAvg}
                                readOnly
                            />
                            <label className='custom-control-label' htmlFor='avg-switch'>
                                Mittelwert
                            </label>
                        </div>
                    </div>
                    <div id="tooltip">
                        <div>Date: <span id="tooltipDate"></span></div>
                        <div>Average: <span id="tooltipAvg"></span></div>
                    </div>
                </div>
                <svg id={SVG_ID} width={SVG_WIDTH} height={SVG_HEIGHT}>
                    {maxArea}
                    {avgline}
                    {minArea}
                    <g className="x-axis" transform={'translate(39,' + this.height + ')'} ref={this.xAxisRef}></g>;
                    <g className="y-axis" transform="translate(39,0)" ref={this.yAxisRef}></g>;
                    <g className="brush" ref={this.brushRef}></g>
                    <g className="mouseLine">
                        <path id="mouseLine"></path>
                    </g>
                </svg>
            </div>
        );

    }

    convertDateObjectToString(str: Date) {
        return str.toISOString().split('.')[0] + "Z";
    }

    filterUniqueTimestamps(): string[] {
        var uniqueTimestamps: string[] = []
        var timeseriesData = this.props.timeseriesData;
        for (var i = 0; i < timeseriesData.length; i++) {
            if (uniqueTimestamps.indexOf(timeseriesData[i].timestamp) === -1) {
                if (timeseriesData[i].timestamp !== undefined)
                    uniqueTimestamps.push(timeseriesData[i].timestamp);
            }
        }
        uniqueTimestamps.sort((x, y) => {
            return Date.parse(x) - Date.parse(y);
        })
        return uniqueTimestamps;
    }
    prepareDataForMaxLine() {
        const valuesOnTimestamp: timeseriesData[] = [];
        this.uniqueTimestamps.forEach(timestamp => {
            const values = []
            this.props.timeseriesData.forEach(element => {
                if (timestamp === element.timestamp) {
                    values.push(element.count);
                }
            });
            valuesOnTimestamp.push({ timestamp: timestamp, count: Math.max.apply(Math, values) })
        });

        this.dataMax = valuesOnTimestamp;
        return valuesOnTimestamp;
    }

    prepareDateForMinLine() {
        const valuesOnTimestamp: timeseriesData[] = [];
        this.uniqueTimestamps.forEach(timestamp => {
            const values = []
            this.props.timeseriesData.forEach(element => {
                if (timestamp === element.timestamp) {
                    values.push(element.count);
                }
            });
            valuesOnTimestamp.push({ timestamp: timestamp, count: Math.min.apply(Math, values) })
        });
        this.dataMin = valuesOnTimestamp;
        return valuesOnTimestamp;
    }

    prepareDateForAvgLine() {
        const valuesOnTimestamp: timeseriesData[] = [];
        this.uniqueTimestamps.forEach(timestamp => {
            const values = []
            this.props.timeseriesData.forEach(element => {
                if (timestamp === element.timestamp) {
                    values.push(element.count);
                }
            });

            var sum, avg = 0;
            if (values.length) {
                sum = values.reduce(function (a, b) { return a + b; });
                avg = sum / values.length;
            }
            valuesOnTimestamp.push({ timestamp: timestamp, count: avg })
        });
        this.dataAvg = valuesOnTimestamp;
        return valuesOnTimestamp;
    }

}

