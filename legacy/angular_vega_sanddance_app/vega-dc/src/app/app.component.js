"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var deck = require("@deck.gl/core");
var layers = require("@deck.gl/layers");
var luma = require("luma.gl");
var vega = require("vega-lib");
var SandDance = require("@msrvida/sanddance");
var dataparser_1 = require("./dataparser");
var AppComponent = /** @class */ (function () {
    function AppComponent(dataservice) {
        var _this = this;
        this.dataservice = dataservice;
        this.temporalAxis = new Array();
        this.timeSeries = new Map();
        this.json = [];
        this.title = 'vega-dc';
        this.dataservice.getInitialData()
            .subscribe(function (logs) {
            console.log(logs);
            _this.getData(logs);
        });
    }
    AppComponent.prototype.ngOnInit = function () {
    };
    AppComponent.prototype.initCube = function (cubedata) {
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
                cubeData: cubedata,
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
                view: "3d"
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
    };
    AppComponent.prototype.getData = function (json) {
        var parser = new dataparser_1.Dataparser();
        parser.receivedData(json);
        var cubedata = parser.parseToVega(10);
        this.initCube(cubedata);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            templateUrl: './app.component.html',
            styleUrls: ['./app.component.css']
        })
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
