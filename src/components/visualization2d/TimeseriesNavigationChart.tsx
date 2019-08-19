import React, { Component } from 'react'
import * as d3 from 'd3';

export default class TimeseriesNavigationChart extends Component {
    
    render() {

        // Todo: Consider using type date instead of string, so we dont have to parse?
        var data=[
            {day:'02-11-2016',count:180},
            {day:'02-12-2016',count:250},
            {day:'02-13-2016',count:150},
            {day:'02-14-2016',count:496},
            {day:'02-15-2016',count:140},
            {day:'02-16-2016',count:380},
            {day:'02-17-2016',count:100},
            {day:'02-18-2016',count:150}
        ];
 
        var margin = {top: 5, right: 50, bottom: 20, left: 50},
            w = 1024 - (margin.left + margin.right),
            h = 40 - (margin.top + margin.bottom);
 
        var parseDate = d3.timeParse("%m-%d-%Y");
 
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return parseDate(d.day);
            }))
            .rangeRound([0, w]);
 
        var y = d3.scaleLinear()
            .domain([0,d3.max(data,function(d){
                return d.count+100;
            })])
            .range([h, 0]);
 
        // d3 line needs an interface or it will assume number, number
        var line = d3.line<TimeNavData>()
            .x(function (d) {
                return x(parseDate(d.day));
            })
            .y(function (d) {
                return y(d.count);
            }).curve(d3.curveCardinal);
  
 
        var transform='translate(' + margin.left + ',' + margin.top + ')';
 
        return (
            <div>
                <svg id={"52235"} width={1024} height={40}>
 
                    <g transform={transform}>
                        <path className="line shadow" d={line(data)} strokeLinecap="round"/>
                    </g>
                </svg>
            </div>
        );

    }
}

// Todo: Outsource this in the future?
interface TimeNavData {
    day: string,
    count: number
} 