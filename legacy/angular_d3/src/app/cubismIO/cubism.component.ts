import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as cubism from "cubism";

@Component({
    selector: "my-cubismio",
    templateUrl: './cubism.html',
    styleUrls: ['./cubism.css']
})

export class CubismIO {


    startCubism = function(){

        console.log("hi")
        var context = cubism
            .context()
            .step(1e4)
            .size(+d3.select("#demo")
            .style("width")
            .slice(0,-2));
        
        context
            .on("change", function(start, stop) {
                d3.select("#update-time")
                .text("Last updated at " + stop + ".");
            });
        
        d3.select("#demo")
            .selectAll(".axis")
            .data(["top","bottom"])
            .enter()
          .append("div")
             .attr("class",function(d){return d+" axis"})
             .each(function(d) {
                 d3.select(this)
                   .call(context.axis().ticks(12).orient(d))});
        
        d3.select("#demo")
          .append("div")
            .attr("class","rule")
          .call(context.rule());
        
        //this is where the metrics are created     
        var Data = d3.range(1,6).map(random);
        var primary = Data[4];
        var secondary = primary.shift(-30*60*1000); //why is this metric identical to the primary metric?
        Data[5] = secondary;
        
        d3.select("#demo")
            .selectAll(".horizon")
            .data(Data)
            .enter()
          .insert("div",".bottom")
            .attr("class","horizon")
            .call(context.horizon()
            .extent([-10, 10]))
        
        context.on("focus",function(i) {
                d3.selectAll(".value")
                   .style("right",i == null?null:context.size()-i+"px")});
        
        function random(x) {
        var value = 0, values = [],i = 0, last;
          return context.metric(function(start,stop,step,callback) {
            start = +start, stop = +stop; last = isNaN(last)?start:last;
            while (last < stop) {last += step;
              value = Math.max(-10,Math.min(10,value+.8*Math.random()-.4+.2*Math.cos(i+=x*.02)))
              values.push(value); values = values.slice((start-stop)/stop)}
            callback(null,values)
        },x)}
};
}
