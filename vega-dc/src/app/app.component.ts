import { Component, OnInit, NgZone, Input, Output, ChangeDetectionStrategy, OnChanges, ChangeDetectorRef } from '@angular/core';
import * as deck from '@deck.gl/core';
import * as layers from '@deck.gl/layers';
import * as luma from 'luma.gl';
import * as vega from 'vega-lib';
import * as SandDance from '@msrvida/sanddance';

import {DataService} from './data.service';
import {Dataparser} from './dataparser';


type Instance = {
    utilization: number;
  }
  
  type Cluster = {
    instances: Map<string, Instance>;
    numInstances: number
  }
  
  type Datacenter = {
    clusters: Map<string, Cluster>;
    numClusters: number,
    numInstances: number
  }
  
  type DCState = {
    datacenters: Map<string, Datacenter>;
    numDCs: number,
    numClusters: number,
    numInstances: number
  }



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

    private temporalAxis = new Array<string>();
    private timeSeries = new Map<string, DCState>();

    private json: any = [];

    constructor(private dataservice: DataService){
        
        this.dataservice.getInitialData()
        .subscribe(logs => {
            console.log(logs);
            this.getData(logs)
        })
                
  }
  title = 'vega-dc';
  
  ngOnInit(): void {

  }

  initCube(cubedata:any): void{

    var cubeTest;
    console.log(cubedata);
    (function (cubeTest) {
      SandDance.use(vega, deck, layers, luma);
        var colors = {
            red: [255, 0, 0],
            green: [0, 255, 0],
            blue: [0, 0, 255],
            gray: [128, 128, 128]
        };
        cubeTest.presenter = new SandDance.VegaDeckGl.Presenter(document.querySelector('#vis'));
        var stage = {
            cubeData: cubedata
            ,
            legend: { rows: {} },
            axes: {
                x: [{
                        domain: {
                            sourcePosition: [0, 0, 0],
                            targetPosition: [400, 0, 0],
                            strokeWidth: 10
                        },
                        ticks: [],
                        tickText: []
                    }],
                y: [{
                        domain: {
                            sourcePosition: [0, 0, 0],
                            targetPosition: [0, 200, 0],
                            strokeWidth: 10
                        },
                        ticks: [],
                        tickText: []
                    }]
            },
            textData: [],
            view: "3d",
            
        };
        cubeTest.presenter.present(stage, 0, 1);
        var orbitViewState = {
            distance: 10,
            fov: 60,
            lookAt: [90, 15, 23, 1],
            rotationOrbit: 0,
            rotationX: 0,
            zoom: 0.01
        };
        cubeTest.presenter.deckgl.setProps({ viewState: orbitViewState });
    })(cubeTest || (cubeTest = {}));
  }

  getData(json){

    let parser = new Dataparser();
    parser.receivedData(json)
    var cubedata = parser.parseToVega(10);
    this.initCube(cubedata)
  }

  
}