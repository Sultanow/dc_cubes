import React, { Component } from 'react'
import * as d3 from 'd3';
import './TimeseriesNavigationChart.css';

interface TimeseriesNavigationChartProps {
    timeseriesData: [{ timestamp: string, count: number }]
    forecastData: [{ timestamp: string, count: number }]
    updateTimespanData: any
    resetSliderAndDates: any
    accessChild: any
    showPrediction: boolean
    forecastReceived: boolean
    forecastTemporalAxis: string[]
    temporalAxis: string[]
    combinedTemporalAxis: string[]
    maxH: number
    preparedAvgData: timeseriesData[]
    preparedMinData: timeseriesData[]
    preparedMaxData: timeseriesData[]
    preparedCombinedAvgData: timeseriesData[]
}

interface TimeseriesNavigationChartState {
    max: string,
    average: string,
    min: string,
    combinedMax: string,
    combinedAverage: string,
    combinedMin: string,
    // these are used if prediction is shown
    historicAvg: string,
    historicMax: string,
    historicMin: string,
}

interface timeseriesData {
    timestamp: string,
    count: number
}

interface timestampData {
    timestamp: number,
    count: number
}

const TRANSLATION_X = 40;
const SVG_WIDTH = window.innerWidth / 1.7;
const SVG_HEIGHT = 100;
const SVG_ID = "TimeSeriesNavigationChart"

export default class TimeseriesNavigationChart extends Component<TimeseriesNavigationChartProps, TimeseriesNavigationChartState>{

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
    }

    private margin = { top: 0, right: 0, bottom: 5, left: 0 };
    private width = SVG_WIDTH - TRANSLATION_X//- (this.margin.left + this.margin.right);
    private height = SVG_HEIGHT - (this.margin.top + this.margin.bottom);
    private parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");

    private xScale = d3.scaleTime().range([0, this.width]);
    private yScale = d3.scaleLinear().range([this.height, 0]);
    private combinedXScale = d3.scaleTime().range([0, this.width]);
    private combinedYScale = d3.scaleLinear().range([this.height, 0]);

    private lineGenerator = d3.line<timeseriesData>().curve(d3.curveMonotoneX);
    private combinedLineGenerator = d3.line<timeseriesData>().curve(d3.curveMonotoneX);
    private areaGenerator = d3.area<timeseriesData>().curve(d3.curveMonotoneX);
    private combinedAreaGenerator = d3.area<timeseriesData>().curve(d3.curveMonotoneX);

    private xAxisRef: React.RefObject<SVGGElement>;
    private yAxisRef: React.RefObject<SVGGElement>;
    private brushRef: React.RefObject<SVGGElement>;

    private uniqueTimestamps: string[];
    private forecastUniqueTimestamps: string[];
    private combinedUniqueTimestamps: string[];
    private currentAvgValue: number;

    private currentAvgData: timeseriesData[];
    private currentXScale: d3.ScaleTime<Number, Number>;

    private lastHistoricTimestamp: Date;
    private combinedData: timeseriesData[];
    private forecastPreparationDone: boolean;
    private preparedAvgData: timeseriesData[];
    private timeNowLineIsDrawn: boolean;
    private preparedMinData: timeseriesData[];
    private preparedMaxData: timeseriesData[];
    private preparedForecastAvgData: timeseriesData[];

    constructor(props: any) {
        super(props);
        this.forecastPreparationDone = false;
        this.timeNowLineIsDrawn = false;
        this.xAxisRef = React.createRef();
        this.yAxisRef = React.createRef();
        this.brushRef = React.createRef();

        this.handlePredictionActivated.bind(this);
        this.handlePredictionDeactivated.bind(this);
    }

    componentDidMount() {

        const { timeseriesData, maxH } = this.props;
        if (!timeseriesData) return;

        this.lastHistoricTimestamp = this.parseDate(timeseriesData[timeseriesData.length - 1].timestamp);

        let minHistoricTs = this.parseDate(this.props.timeseriesData[0].timestamp);
        let maxHistoricTs = this.parseDate(this.props.timeseriesData[this.props.timeseriesData.length - 1].timestamp);
        const timeDomain = [minHistoricTs, maxHistoricTs];
        const maxCount = [0, maxH + 100];

        this.xScale.domain(timeDomain);
        this.yScale.domain(maxCount);

        this.uniqueTimestamps = this.props.temporalAxis;

        // generate the max area
        this.areaGenerator.x(d => { return this.xScale(this.parseDate(d.timestamp)); })
        this.areaGenerator.y0(this.yScale(0))
        this.areaGenerator.y1(d => { return this.yScale(d.count); });

        this.preparedMaxData = this.prepareDataForMaxLine(this.uniqueTimestamps, this.props.timeseriesData);
        const max = this.areaGenerator(this.preparedMaxData);
        this.setState({ max })

        // generate the average line 
        this.lineGenerator.x(d => { return this.xScale(this.parseDate(d.timestamp)); });
        this.lineGenerator.y(d => { return this.yScale(d.count); })
        this.preparedAvgData = this.prepareDataForAvgLine(this.uniqueTimestamps, this.props.timeseriesData);
        const average = this.lineGenerator(this.preparedAvgData);
        this.setState({ average })

        // generate the min area
        this.areaGenerator.x(d => { return this.xScale(this.parseDate(d.timestamp)); })
        this.areaGenerator.y0(this.yScale(0))
        this.areaGenerator.y1(d => { return this.yScale(d.count); });
        this.preparedMinData = this.prepareDataForMinLine(this.uniqueTimestamps, this.props.timeseriesData);
        const min = this.areaGenerator(this.preparedMinData);
        this.setState({ min })

    }


    componentWillReceiveProps(newProps) {
        // this.removeChart();
        console.log("2d Component will receive Props");
        // todo: use this?
    }

    componentDidUpdate() {
        // Check if maxH has been updated
        if (this.yScale.domain()[1] !== this.props.maxH + 100) {
            this.componentDidMount();
        }
        if (!this.forecastPreparationDone && this.props.forecastReceived) {

            let minHistoricTs = this.xScale.domain()[0];
            let maxHistoricTs = this.xScale.domain()[1];

            // array is sorted already
            let minPredictionTs = this.parseDate(this.props.forecastData[0].timestamp);
            let maxPredictionTs = this.parseDate(this.props.forecastData[this.props.forecastData.length - 1].timestamp);
            const combinedTimeDomain = [minHistoricTs, maxPredictionTs];

            if (minHistoricTs > minPredictionTs || maxHistoricTs > maxPredictionTs) {
                console.error("Prediction Timestamps are incorrect. They should be after the historic dates.")
            }

            let combinedMaxCount = [0, this.props.maxH];

            this.combinedXScale.domain(combinedTimeDomain);
            this.combinedYScale.domain(combinedMaxCount);
            // generate the average line 
            this.combinedLineGenerator.x(d => { return this.combinedXScale(this.parseDate(d.timestamp)); });
            this.combinedLineGenerator.y(d => { return this.combinedYScale(d.count); });
            //area generator
            this.combinedAreaGenerator.x(d => { return this.combinedXScale(this.parseDate(d.timestamp)); })
            this.combinedAreaGenerator.y0(this.combinedYScale(0))
            this.combinedAreaGenerator.y1(d => { return this.combinedYScale(d.count); });

            if (this.forecastUniqueTimestamps == null) {
                this.forecastUniqueTimestamps = this.props.forecastTemporalAxis;
                this.combinedUniqueTimestamps = this.props.forecastTemporalAxis;
            }
            if (!this.state.combinedAverage) {
                this.preparedForecastAvgData = this.prepareDataForAvgLine(this.forecastUniqueTimestamps, this.props.forecastData);
                const combinedAverage = this.combinedLineGenerator(this.preparedForecastAvgData);
                this.setState({ combinedAverage });
                const historicAvg = this.combinedLineGenerator(this.preparedAvgData);
                this.setState({ historicAvg })
                const historicMin = this.combinedAreaGenerator(this.preparedMinData);
                this.setState({ historicMin })
                const historicMax = this.combinedAreaGenerator(this.preparedMaxData);
                this.setState({ historicMax })

                this.forecastPreparationDone = true;
            }
            if (!this.timeNowLineIsDrawn) {
                this.drawTimeNowLine()
                this.timeNowLineIsDrawn = true;
            }
        }
        else {
            d3.select(this.yAxisRef.current).call(d3.axisLeft(this.yScale).ticks(5));
            d3.select(this.xAxisRef.current).call(d3.axisBottom(this.xScale));//.tickValues([]).tickSize(0));
        }
        this.setupTooltip();
        this.setupBrush();
    }

    setupTooltip() {
        let originalScope = this;

        let tooltipElement: HTMLElement = document.getElementById('tooltip');

        d3.select("#" + SVG_ID).on("mousemove", function () {

            let mousePosition = d3.mouse(document.getElementById(SVG_ID));
            let xcoord: number = mousePosition[0];
            let yAxis = d3.select("#" + SVG_ID).select(".y-axis").node() as Element
            let bboxYaxis = yAxis.getBoundingClientRect();
            let bboxSvg = document.getElementById(SVG_ID).getBoundingClientRect();
            let xPositionOfYAxis = bboxYaxis.right - bboxSvg.left;

            if (xcoord < xPositionOfYAxis) {
                originalScope.hideTooltip();
                return;
            }

            originalScope.drawMouseline(xcoord);
            let datapoint = originalScope.getValidDatapointFromMousePosition(xcoord);
            if (datapoint != null) originalScope.updateTooltip(datapoint);

            tooltipElement.style.visibility = "visible";

        }).on("mouseleave", function () {
            originalScope.hideTooltip();
        });

    }

    hideTooltip() {

        let tooltipElement: HTMLElement = document.getElementById('tooltip');
        d3.select("#tooltipDate").html("");
        d3.select("#tooltipAvg").html("");
        d3.select(".mouseMove").classed("hidden", true);
        d3.select("#tooltip").style("left", "").style("top", "").style("position", "");

        tooltipElement.style.visibility = "hidden";
    }

    drawMouseline(xcoord: number) {
        d3.select("#mouseLine").attr("d", function () {
            var d = "M" + xcoord + "," + SVG_HEIGHT;
            d += " " + xcoord + "," + 0;
            return d;
        });
        d3.select(".mouseMove").classed("hidden", false);
    }

    calculateOffset(): number {
        let offset = TRANSLATION_X;
        offset -= 2;
        return offset;
    }

    setupBrush() {
        let originalScope = this;
        let brush = d3.select(this.brushRef.current);
        brush.call(d3.brushX()
            .extent([[this.margin.left + this.margin.right, 0], [SVG_WIDTH - this.margin.left, this.height]])
            .on("brush", function () {
                let mousePosition = d3.mouse(document.getElementById(SVG_ID));
                let xcoord: number = mousePosition[0];
                let datapoint = originalScope.getValidDatapointFromMousePosition(xcoord);
                if (datapoint != null) originalScope.updateTooltip(datapoint);
            })
            .on("end", function () {
                originalScope.brushEnd.call(originalScope);
            }));
    }

    updateTooltip(dp: timeseriesData) {
        let mousePosition = d3.mouse(document.getElementById(SVG_ID));
        let bbox = document.getElementById(SVG_ID).getBoundingClientRect();
        let xcoord: number = d3.event.pageX || mousePosition[0] + bbox.left;
        let ycoord: number = d3.event.pageY || mousePosition[1] + bbox.top;
        let offsetX = -70;
        let offsetY = 90;

        d3.select("#tooltipDate").html(dp.timestamp);
        d3.select("#tooltipAvg").html(Math.floor(dp.count).toString());
        this.currentAvgValue = Math.floor(dp.count);

        d3.select("#tooltip").style("top", ycoord - offsetY + "px")
            .style("left", xcoord + offsetX + "px")
    }

    brushEnd() {
        let selectedArea = d3.event.selection || this.currentXScale.range(); // if selection is null, selectedArea = rannge
        let brushMinimum = selectedArea[0];
        let brushMaximum = selectedArea[1];

        function isBrushAreaTooSmall(brushMinimum, brushMaximum) {
            const brushThreshold = 2;
            return (brushMinimum <= 0 || brushMaximum - brushMinimum < brushThreshold)
        }

        if (isBrushAreaTooSmall(brushMinimum, brushMaximum)) {
            let clickedXCoord = d3.mouse(document.getElementById(SVG_ID))[0];
            d3.select("#selectedDatapointLine").attr("d", function () {
                var d = "M" + clickedXCoord + "," + SVG_HEIGHT;
                d += " " + clickedXCoord + "," + 0;
                return d;
            });
            d3.select(".mouseClick").classed("hidden", false);
            let date = this.getValidDatapointFromMousePosition(clickedXCoord);
            if (date == null) return;
            this.props.resetSliderAndDates(date.timestamp);
            this.props.accessChild("currentAvgValue", this.currentAvgValue);
            return;
        }

        let startDate = this.getValidDatapointFromMousePosition(brushMinimum).timestamp;
        let endDate = this.getValidDatapointFromMousePosition(brushMaximum).timestamp;

        d3.select(".mouseClick").classed("hidden", true);
        const newTimespanData = {
            timespanAbsoluteTimestampUpperBound: endDate,
            timespanAbsoluteTimestampLowerBound: startDate,
            timeSelectionMode: 'timespan',
            timespanTypeUpperBound: 'absolute',
            timespanTypeLowerBound: 'absolute',
            sliderMode: 'timespan'
        }
        console.log(startDate, endDate);
        this.props.updateTimespanData(newTimespanData);
        this.props.accessChild("currentAvgValue", this.currentAvgValue);
    }

    getValidDatapointFromMousePosition(xCoord) {
        let offset: number = this.calculateOffset();

        let newDate: Date = this.currentXScale.invert(xCoord - offset);
        newDate = this.roundDateToNearest15Min(newDate);
        let newDateString = this.convertDateObjectToString(newDate);
        let found1 = this.preparedAvgData.find(x => x.timestamp === newDateString);
        let found2 = this.preparedForecastAvgData.find(x => x.timestamp === newDateString);

        if (found1) {
            return found1
        }
        return found2
    }

    roundDateToNearest15Min(date: Date): Date {
        let minutes = 15;
        let ms = 1000 * 60 * minutes;
        return new Date(Math.round(date.getTime() / ms) * ms);
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
        const translation = "translate(" + TRANSLATION_X + ",0)";
        var maxArea = null;
        if (!this.props.showPrediction && this.state.max != null) {
            maxArea = <path className="area-max" d={this.state.max} strokeLinecap="round" transform={translation} />
        }

        var avgline = null;
        if (!this.props.showPrediction && this.state.average != null) {
            avgline = <path className="line-avg" d={this.state.average} strokeLinecap="round" transform={translation} />
        }
        var minArea = null;
        if (!this.props.showPrediction && this.state.min != null) {
            minArea = <path className="area-min" d={this.state.min} strokeLinecap="round" transform={translation} />
        }


        var forecastLine = null;
        var histroicAvgLine = null;
        var historicMinLine = null;
        var historicMaxLine = null;
        if (this.props.showPrediction) {
            if (this.state.combinedAverage != null) {
                forecastLine = <path className="line-avg prediction" d={this.state.combinedAverage} strokeLinecap="round" transform={translation} />
            }

            if (this.state.historicAvg != null) {
                histroicAvgLine = <path className="line-avg" d={this.state.historicAvg} strokeLinecap="round" transform={translation} />
            }

            if (this.state.historicMax != null) {
                historicMaxLine = <path className="area-max prediction" d={this.state.historicMax} strokeLinecap="round" transform={translation} />
            }

            if (this.state.historicMin != null) {
                historicMinLine = <path className="area-min prediction" d={this.state.historicMin} strokeLinecap="round" transform={translation} />
            }
        }

        if (this.props.showPrediction && this.props.forecastData) {
            this.handlePredictionActivated()
        }
        else {
            this.handlePredictionDeactivated();

        }

        return (
            <div className="container2d d-flex justify-content-center">
                <svg id={SVG_ID} width={SVG_WIDTH} height={SVG_HEIGHT} transform={translation}>
                    {maxArea}
                    {historicMaxLine}
                    {avgline}
                    {histroicAvgLine}
                    {minArea}
                    {historicMinLine}
                    {forecastLine}
                    <g className="x-axis" transform={'translate(' + TRANSLATION_X + "," + this.height + ')'} ref={this.xAxisRef}></g>;
                    <g className="y-axis" transform={translation} ref={this.yAxisRef}></g>;
                    <g className="brush" ref={this.brushRef}></g>
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
                        <div>Datum: <span id="tooltipDate"></span></div>
                        <div>Durchs.: <span id="tooltipAvg">{this.currentAvgValue}</span></div>
                    </div>
                </div>
            </div>
        );
    }

    convertDateObjectToString(str: Date) {
        return str.toISOString().split('.')[0] + "Z";
    }

    // TODO: Remove because data is already available in temporalAxis or via dataSource Service
    filterUniqueTimestamps(timeseriesData: timeseriesData[]): string[] {
        var uniqueTimestamps: string[] = []
        for (var i = 0; i < timeseriesData.length; i++) {
            if (Array.isArray(timeseriesData[i].timestamp)) {
                // in the forecast core, the timestamps are in an array of length 1 at position[0]
                timeseriesData[i].timestamp = timeseriesData[i].timestamp[0];
            }
            if (uniqueTimestamps.indexOf(timeseriesData[i].timestamp) === -1) {
                if (timeseriesData[i].timestamp !== undefined)
                    uniqueTimestamps.push(timeseriesData[i].timestamp);
            }
        }
        return uniqueTimestamps;
    }
    prepareDataForMaxLine(timestamps: string[], timeseries: timeseriesData[]) {
        const valuesOnTimestamp: timeseriesData[] = [];
        timestamps.forEach(timestamp => {
            const values = []
            timeseries.forEach(element => {
                if (timestamp === element.timestamp) {
                    values.push(element.count);
                }
            });
            valuesOnTimestamp.push({ timestamp: timestamp, count: Math.max.apply(Math, values) })
        });

        return valuesOnTimestamp;
    }

    prepareDataForMinLine(timestamps: string[], timeseries: timeseriesData[]) {
        const valuesOnTimestamp: timeseriesData[] = [];
        timestamps.forEach(timestamp => {
            const values = []
            timeseries.forEach(element => {
                if (timestamp === element.timestamp) {
                    values.push(element.count);
                }
            });
            valuesOnTimestamp.push({ timestamp: timestamp, count: Math.min.apply(Math, values) })
        });

        return valuesOnTimestamp;
    }

    prepareDataForAvgLine(timestamps: string[], timeseries: timeseriesData[]) {
        const valuesOnTimestamp: timeseriesData[] = [];
        timestamps.forEach(timestamp => {
            let counter = 0
            let sum = 0;
            timeseries.forEach(element => {
                if (timestamp === element.timestamp) {
                    counter++;
                    sum += element.count
                }
            });

            let avg = 0;
            if (counter !== 0) {
                avg = sum / counter;
            }
            valuesOnTimestamp.push({ timestamp: timestamp, count: avg })
        });
        // todo combinedAvg for tooltip/mouseevents
        this.currentAvgData = valuesOnTimestamp;
        return valuesOnTimestamp;
    }

    handlePredictionActivated() {
        this.showTimeNowLine()
        this.currentAvgData = this.preparedForecastAvgData;
        this.currentXScale = this.combinedXScale;
    }

    handlePredictionDeactivated() {
        this.hideTimeNowLine();
        this.currentAvgData = this.preparedAvgData;
        this.currentXScale = this.xScale;
    }

    drawTimeNowLine() {
        let xcoord = this.combinedXScale(this.lastHistoricTimestamp);
        xcoord += this.calculateOffset();
        d3.select("#timeNowLine").attr("d", function () {
            var d = "M" + xcoord + "," + SVG_HEIGHT;
            d += " " + xcoord + "," + 0;
            return d;
        });
        this.hideTimeNowLine();
    }
    showTimeNowLine() {
        d3.select(".timeNowLine").classed("hidden", false);
    }

    hideTimeNowLine() {
        d3.select(".timeNowLine").classed("hidden", true);
    }

}

