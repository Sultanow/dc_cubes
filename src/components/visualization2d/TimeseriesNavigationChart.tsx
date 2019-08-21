import React, { Component } from 'react'
import * as d3 from 'd3';
import './TimeseriesNavigationChart.css';

interface TimeseriesNavigationChartProps {
    // TODO: replace any type with real type
    timeseriesData: any
}



export default class TimeseriesNavigationChart extends Component<TimeseriesNavigationChartProps>{

    componentDidUpdate() {
        // method is executet on every rerender, not optimal for performance
        console.log("TODO: Warum wird diese Methode jedes mal aufgerufen, wenn man den slider bewegt?");
        this.prepareDataForMaxLine();
    }

    render() {

        // Todo: Consider using type date instead of string, so we dont have to parse?
        var data = [
            { day: '02-11-2016', count: 180 },
            { day: '02-12-2016', count: 250 },
            { day: '02-13-2016', count: 150 },
            { day: '02-14-2016', count: 496 },
            { day: '02-15-2016', count: 140 },
            { day: '02-16-2016', count: 380 },
            { day: '02-17-2016', count: 100 },
            { day: '02-18-2016', count: 150 },
            { day: '02-19-2016', count: 180 },
            { day: '02-20-2016', count: 250 },
            { day: '02-21-2016', count: 150 },
            { day: '02-22-2016', count: 496 },
            { day: '02-23-2016', count: 140 },
            { day: '02-24-2016', count: 380 },
            { day: '02-25-2016', count: 100 },
            { day: '02-26-2016', count: 150 },

        ];
        var data2 = [
            { day: '02-11-2016', count: 250 },
            { day: '02-12-2016', count: 150 },
            { day: '02-13-2016', count: 300 },
            { day: '02-14-2016', count: 170 },
            { day: '02-15-2016', count: 300 },
            { day: '02-16-2016', count: 34 },
            { day: '02-17-2016', count: 260 },
            { day: '02-18-2016', count: 80 },
        ];


        // TODO: Refactor -> extract the generation of D3 chart in an own function
        var margin = { top: 20, right: 20, bottom: 0, left: 0 }
        var width = 900 - (margin.left + margin.right);
        var height = 250 - (margin.top + margin.bottom);

        var parseDate = d3.timeParse("%m-%d-%Y");


        var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, function (d) {
                return parseDate(d.day);
            }))

        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, function (d) {
                return d.count + 100;
            })]).nice()

        var area = d3.area<TimeNavData>()
            .curve(d3.curveMonotoneX)
            .x(function (d) { return x(parseDate(d.day)); })
            .y0(y(0))
            .y1(function (d) { return y(d.count); });

        var area2 = d3.area<TimeNavData>()
            .curve(d3.curveMonotoneX)
            .x(function (d) { return x(parseDate(d.day)); })
            .y0(y(0))
            .y1(function (d) { return y(d.count); });


        var transform = 'translate(' + margin.left + ',' + margin.top + ')';

        return (
            <div>
                <svg id={"52235"} width={900} height={250}>
                    <g transform={transform}>
                        <path className="area-max" d={area(data)} strokeLinecap="round" />
                        <path className="area-avg" d={area2(data2)} strokeLinecap="round" />
                    </g>
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
        uniqueTimestamps.sort((x, y)=>{
            return  Date.parse(x)-Date.parse(y);
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

        console.log(valuesOnTimestamp);
        return valuesOnTimestamp;


    }
}



// Todo: Outsource this in the future?
interface TimeNavData {
    day: string,
    count: number
} 