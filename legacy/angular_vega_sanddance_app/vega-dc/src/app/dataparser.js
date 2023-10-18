"use strict";
exports.__esModule = true;
var Dataparser = /** @class */ (function () {
    function Dataparser() {
        this.temporalAxis = new Array();
        this.timeSeries = new Map();
        this.cubethickness = 100;
        this.spacer = 10;
        this.clusterspacer = 200;
        //should be calculated dynamicly
        this.mostInstancesperCluster = 8;
        this.maxh = 0;
        this.maxZ = 3;
        this.maxX = 0;
        this.maximumheight = 400;
        this.grid = new Map();
        this.scaleLog = function (hvalue) {
            var maxh = Math.log(this.maxh);
            this.adjustfactor = (this.maximumheight / maxh).toFixed(4);
            //log zwischen +0.1 - +1 problem (negativ bzw 0)
            if (hvalue <= 1 && hvalue >= 0.1) {
                return (Math.log(2 - (1 - hvalue)) * this.adjustfactor) / 2;
            }
            return Math.log(hvalue) * this.adjustfactor;
        };
    }
    Dataparser.prototype.receivedData = function (json) {
        var _this = this;
        var datajson = json["response"]["docs"];
        var l = datajson.length;
        this.timeSeries = new Map();
        this.temporalAxis = [];
        for (var i = 0; i < l; i++) {
            var strTimeStamp = datajson[i]["timestamp"];
            var strCluster = datajson[i]["cluster"];
            var strDataCenter = datajson[i]["dc"];
            var strInstance = datajson[i]["instanz"];
            var strUtilization = datajson[i]["count"];
            if (this.maxh <= Number(strUtilization)) {
                this.maxh = Number(strUtilization);
            }
            this.buildTimeSeries(strTimeStamp, strCluster, strDataCenter, strInstance, strUtilization);
        }
        console.log(this.timeSeries);
        var instancesToClusterToDCMap = new Map();
        var timestampValues = Array.from(this.timeSeries.values());
        timestampValues.forEach(function (dcState) {
            dcState.datacenters.forEach(function (datacenter, key_dc) {
                var instancesToClusterMap;
                if (instancesToClusterToDCMap.has(key_dc)) {
                    instancesToClusterMap = instancesToClusterToDCMap.get(key_dc);
                }
                else {
                    instancesToClusterMap = new Map();
                    instancesToClusterToDCMap.set(key_dc, instancesToClusterMap);
                }
                var clusters = datacenter.clusters;
                clusters.forEach(function (value_cluster, key_cluster) {
                    var instances;
                    if (instancesToClusterMap.has(key_cluster)) {
                        instances = instancesToClusterMap.get(key_cluster);
                    }
                    else {
                        instances = new Set();
                        instancesToClusterMap.set(key_cluster, instances);
                    }
                    Array.from(value_cluster.instances.keys()).forEach(function (s) { return instances.add(s); });
                });
            });
        });
        var dc = 0;
        this.maxX = 0;
        var colorIndex = 0;
        instancesToClusterToDCMap.forEach(function (instancesToClusterMap, key_dc) {
            var x = 0;
            var z = dc * _this.maxZ;
            instancesToClusterMap.forEach(function (instances, key_cluster) {
                var clusterKey = key_dc + "_" + key_cluster;
                instances.forEach(function (key_instance) {
                    var gridKey = clusterKey + "_" + key_instance;
                    if (!_this.grid.has(gridKey)) {
                        _this.grid.set(gridKey, [x, z]);
                        z = z + 1;
                        if (z == (dc + 1) * _this.maxZ) {
                            z = dc * _this.maxZ;
                            x++;
                        }
                    }
                });
                x++;
            });
            _this.maxX = Math.max(_this.maxX, x);
            dc++;
            z += _this.maxZ;
        });
        this.temporalAxis.sort();
        console.log(this.grid);
    };
    Dataparser.prototype.buildTimeSeries = function (strTimeStamp, strCluster, strDataCenter, strInstance, strUtilization) {
        var dcState;
        if (this.timeSeries.has(strTimeStamp)) {
            dcState = this.timeSeries.get(strTimeStamp);
        }
        else {
            dcState = { datacenters: new Map(), numDCs: 0, numClusters: 0, numInstances: 0 };
            this.timeSeries.set(strTimeStamp, dcState);
            this.temporalAxis.push(strTimeStamp);
        }
        var datacenter;
        if (dcState.datacenters.has(strDataCenter)) {
            datacenter = dcState.datacenters.get(strDataCenter);
        }
        else {
            datacenter = { clusters: new Map(), numClusters: 0, numInstances: 0 };
            dcState.datacenters.set(strDataCenter, datacenter);
            dcState.numDCs++;
        }
        var cluster;
        if (datacenter.clusters.has(strCluster)) {
            cluster = datacenter.clusters.get(strCluster);
        }
        else {
            cluster = { instances: new Map(), numInstances: 0 };
            datacenter.clusters.set(strCluster, cluster);
            dcState.numClusters++;
            datacenter.numClusters++;
        }
        var instance;
        if (cluster.instances.has(strInstance)) {
            instance = cluster.instances.get(strInstance);
        }
        else {
            instance = { utilization: Number(strUtilization) };
            cluster.instances.set(strInstance, instance);
            dcState.numInstances++;
            datacenter.numInstances++;
            cluster.numInstances++;
        }
    };
    Dataparser.prototype.parseToVega = function (pointInTime) {
        var _this = this;
        var data = this.timeSeries.get(this.temporalAxis[pointInTime]);
        var maxDC = data.numDCs;
        var maxCluster = data.numClusters;
        var maxInstances = data.numInstances;
        var datacenter = data.datacenters;
        var startx = 0 - (((maxInstances * (this.spacer + this.cubethickness)) + (maxCluster * this.clusterspacer)) / 2);
        var starty = 0 - ((maxDC / 2) * ((this.maxZ % this.mostInstancesperCluster) * (this.spacer + this.cubethickness)));
        console.log(data);
        var result = [];
        var x = startx;
        var y = starty;
        console.log(x, y);
        this.grid.forEach(function (set) {
            var x = set[0] * 100;
            var y = set[1] * 100;
        });
        datacenter.forEach(function (dc) {
            console.log(datacenter);
            var run = 0;
            dc.clusters.forEach(function (cluster) {
                if (run != 0) {
                    x += _this.clusterspacer;
                    y += _this.clusterspacer;
                }
                var clusterx = x;
                var clusterrun = 1;
                cluster.instances.forEach(function (cube) {
                    var vegaCube;
                    if (clusterrun == 4) {
                        clusterrun = 0;
                        y += _this.cubethickness + _this.spacer;
                    }
                    //let coordinates = this.grid.get()
                    //vegaCube = {color: [255, 0, 0], position: [, 0], size: [this.cubethickness,this.cubethickness,this.scaleLog(cube.utilization)]}
                    vegaCube = { color: [255, 0, 0], position: [clusterx + (clusterrun * (_this.cubethickness + _this.spacer)), y, 0], size: [_this.cubethickness, _this.cubethickness, _this.scaleLog(cube.utilization)] };
                    result.push(vegaCube);
                    clusterrun += 1;
                });
                run += 1;
            });
        });
        return result;
    };
    Dataparser.prototype.buildNet = function () {
    };
    return Dataparser;
}());
exports.Dataparser = Dataparser;
