import React, { Component } from 'react'
import * as d3 from 'd3';
import './TimeseriesNavigationChart.css';

interface TimeseriesNavigationChartProps {
    timeseriesData: [{ timestamp: string, count: number }]
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

export default class TimeseriesNavigationChart extends Component<TimeseriesNavigationChartProps, TimeseriesNavigationChartState>{

    state = {
        max: null,
        average: null,
        min: null,
    }

    private margin = { top: 20, right: 20, bottom: 0, left: 0 };
    private width = 900 - (this.margin.left + this.margin.right);
    private height = 250 - (this.margin.top + this.margin.bottom);
    private parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");

    private xScale = d3.scaleTime().range([0, this.width]);
    private yScale = d3.scaleLinear().range([this.height, 0]);

    private lineGenerator = d3.line<timeseriesData>().curve(d3.curveMonotoneX);
    private areaGenerator = d3.area<timeseriesData>().curve(d3.curveMonotoneX);

    private xAxisRef: React.RefObject<SVGGElement>;
    private yAxisRef: React.RefObject<SVGGElement>;

    constructor(props: any) {
        super(props);
        this.xAxisRef = React.createRef();
        this.yAxisRef = React.createRef();
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
        d3.select(this.yAxisRef.current).call(d3.axisLeft(this.yScale));
        d3.select(this.xAxisRef.current).call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%H:%M:%S")));
    }

    render() {
        var maxArea = null;
        if (this.state.max != null) {
            maxArea = <path className="area-max" d={this.state.max} strokeLinecap="round" />
        }

        var avgline = null;
        if (this.state.average != null) {
            avgline = <path className="line-avg" d={this.state.average} strokeLinecap="round" />
        }

        var minArea = null;
        if (this.state.min != null) {
            minArea = <path className="area-min" d={this.state.min} strokeLinecap="round" />
        }

        return (
            <div>
                <svg id={"52235"} width={900} height={250}>
                    {maxArea}
                    {avgline}
                    {minArea}
                    <g className="x-axis" transform={'translate(0,' + this.height + ')'} ref={this.xAxisRef}></g>;
                    <g className="y-axis" transform="translate(0,0)" ref={this.yAxisRef}></g>;
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

            valuesOnTimestamp.push({ timestamp: timestamp, count: Math.max.apply(Math, values) })

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

            valuesOnTimestamp.push({ timestamp: timestamp, count: Math.min.apply(Math, values) })

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

            valuesOnTimestamp.push({ timestamp: timestamp, count: avg })

        });
        return valuesOnTimestamp;

    }

}

