import React, { Component } from 'react'
import * as d3 from 'd3';
import './TimeseriesNavigationChart.css';

interface TimeseriesNavigationChartProps {
    // TODO: replace any type with real type
    timeseriesData: any
}

interface TimeNavData {
    day: string,
    count: number
}

interface maxData {
    timestamp: string,
    maxCount: number
}

export default class TimeseriesNavigationChart extends Component<TimeseriesNavigationChartProps>{

    private xAxisRef: React.RefObject<SVGGElement>;
    private yAxisRef: React.RefObject<SVGGElement>;

    constructor(props: any) {
        super(props);
        this.xAxisRef = React.createRef();
        this.yAxisRef = React.createRef();
    }

    componentWillMount() {

    }
    componentDidUpdate() {


    }


    render() {

        var maxData = this.prepareDataForMaxLine();
        var minData = this.prepareDateForMinLine();
        var avgData = this.prepareDateForAvgLine();

        // TODO: Refactor -> extract the generation of D3 chart in an own function
        var margin = { top: 20, right: 20, bottom: 0, left: 0 }
        var width = 900 - (margin.left + margin.right);
        var height = 250 - (margin.top + margin.bottom);

        var parseDate2 = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");


        var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(maxData, function (d) {
                return parseDate2(d.timestamp);
            }))

        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(maxData, function (d) {
                return d.maxCount + 100;
            })])

        var area2 = d3.area<maxData>()
            .curve(d3.curveMonotoneX)
            .x(function (d) { return x(parseDate2(d.timestamp)); })
            .y0(y(0))
            .y1(function (d) { return y(d.maxCount); });

        var line = d3.line<maxData>()
            .curve(d3.curveMonotoneX)
            .x(function (d) { return x(parseDate2(d.timestamp)); })
            .y(function (d) { return y(d.maxCount); });


        var transform = 'translate(0,' + height + ')';
        d3.select(this.yAxisRef.current).call(d3.axisLeft(y));

        d3.select(this.xAxisRef.current).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M:%S")));

        return (
            <div>
                <svg id={"52235"} width={900} height={250}>
                    <path className="area-max" d={area2(maxData)} strokeLinecap="round" />
                    <path className="line-avg" d={line(avgData)} strokeLinecap="round" />
                    <path className="area-min" d={area2(minData)} strokeLinecap="round" />
                    <g className="x-axis" transform={transform} ref={this.xAxisRef}></g>;
                    <g className="y-axis"transform="translate(0,0)" ref={this.yAxisRef}></g>;
                </svg>
            </div>
        );

    }
    prepareDataForMaxLine() {
        var uniqueTimestamps = [];
        for (var i = 0; i < this.props.timeseriesData.length; i++) {
            if (uniqueTimestamps.indexOf(this.props.timeseriesData[i].timestamp) === -1) {
                if (this.props.timeseriesData[i].timestamp !== undefined)
                    uniqueTimestamps.push(this.props.timeseriesData[i].timestamp);
            }
        }
        uniqueTimestamps.sort((x, y) => {
            return Date.parse(x) - Date.parse(y);
        })

        const valuesOnTimestamp = [];
        uniqueTimestamps.forEach(timestamp => {
            const values = []
            this.props.timeseriesData.forEach(element => {
                if (timestamp === element.timestamp) {
                    values.push(element.count);
                }
            });

            valuesOnTimestamp.push({ timestamp: timestamp, maxCount: Math.max.apply(Math, values) })

        });

        return valuesOnTimestamp;
    }

    // TODO: Refactor code
    prepareDateForMinLine() {
        var uniqueTimestamps = [];
        for (var i = 0; i < this.props.timeseriesData.length; i++) {
            if (uniqueTimestamps.indexOf(this.props.timeseriesData[i].timestamp) === -1) {
                if (this.props.timeseriesData[i].timestamp !== undefined)
                    uniqueTimestamps.push(this.props.timeseriesData[i].timestamp);
            }
        }
        uniqueTimestamps.sort((x, y) => {
            return Date.parse(x) - Date.parse(y);
        })

        const valuesOnTimestamp = [];
        uniqueTimestamps.forEach(timestamp => {
            const values = []
            this.props.timeseriesData.forEach(element => {
                if (timestamp === element.timestamp) {
                    values.push(element.count);
                }
            });

            valuesOnTimestamp.push({ timestamp: timestamp, maxCount: Math.min.apply(Math, values) })

        });

        return valuesOnTimestamp;

    }

    // TODO: Refactor code
    prepareDateForAvgLine() {
        var uniqueTimestamps = [];
        for (var i = 0; i < this.props.timeseriesData.length; i++) {
            if (uniqueTimestamps.indexOf(this.props.timeseriesData[i].timestamp) === -1) {
                if (this.props.timeseriesData[i].timestamp !== undefined)
                    uniqueTimestamps.push(this.props.timeseriesData[i].timestamp);
            }
        }
        uniqueTimestamps.sort((x, y) => {
            return Date.parse(x) - Date.parse(y);
        })

        const valuesOnTimestamp = [];
        uniqueTimestamps.forEach(timestamp => {
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

            valuesOnTimestamp.push({ timestamp: timestamp, maxCount: avg })

        });
        return valuesOnTimestamp;

    }

}

