import { Component, OnInit } from '@angular/core';
import * as deck from '@deck.gl/core';
import * as layers from '@deck.gl/layers';
import * as luma from 'luma.gl';
import * as vega from 'vega-lib';
import * as SandDance from '@msrvida/sanddance';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title = 'vega-dc';
  
  ngOnInit(): void {
    this.initCube();
  }

  initCube(): void{
    var cubeTest;
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
            cubeData: [
                {
                    color: colors.red,
                    position: [0, 0, 0],
                    size: [100, 100, 100]
                },
                {
                    color: colors.green,
                    position: [110, 0, 0],
                    size: [100, 100, 150]
                },
                {
                    color: colors.blue,
                    position: [220, 0, 0],
                    size: [100, 100, 300]
                }
            ],
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
        cubeTest.presenter.present(stage, 200, 400);
        var orbitViewState = {
            distance: 10,
            fov: 60,
            lookAt: [90, 15, 23, 1],
            rotationOrbit: -45,
            rotationX: 67,
            zoom: 0.01
        };
        cubeTest.presenter.deckgl.setProps({ viewState: orbitViewState });
    })(cubeTest || (cubeTest = {}));
  }

}