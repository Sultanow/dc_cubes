import { Component, NgZone, OnInit, Input, Output, ChangeDetectionStrategy, OnChanges, ChangeDetectorRef,  } from '@angular/core';
import * as d3 from 'd3';
import * as d3_3d from 'd3-3d';
import { _getComponentHostLElementNode, detectChangesInternal } from '@angular/core/src/render3/instructions';
import {DataStatusService} from './data-status.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

/*___________________*/
//json parse


type Knoten = {
    parent: string;
    value: any;
    path: string;
}
type JsonTree = {
    pathtoset : string;
    root : Object ;
    nodes : Knoten[] ;
    collection : any[];
}


/*_____________________*/


type Point = {
    x: number;
    y: number;
    z: number
}

type Cube = {
    fill: string;
    stroke: string;
    points: Point[];
}

type Square = {
    fill: string;
    stroke: string;
    points: Point[];
}

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
    styleUrls: ['./app.component.css'],

    //4 serve conn
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent implements OnInit, OnChanges {
    //visual vars
    private viewdc:number = 0;
    private viewinstances:number = 0;
    private viewclusters:number = 0;
    private viewmaxValue:number = 0;

    //visual arrays
        //for cookies
    headers = ["Datasources","Data","Visualisierung","Info"]
    panels = ["controll","view"]

    relevantData = ["TimeStamp","Cluster","DataCenter","Instance","Utilization"]
    datasources = ["Solr","CSV","ElasticSearch"]


    //progressbar bool
    private inProgress : boolean = false;
    //json struct
    private jsonTree : JsonTree;
    //live function
    private isLive : boolean;
    
    public context: any;
    public title: string;
    static origin = [512, 300];
    static scale = 20;
    private shapeColors = ["#0080ff", "#8000ff", "#ff0080", "#ff8000", "#c5b1ff", "#00b150", "#ffb1a2", "#ffb1ff", "#99baab"];

    private alpha: number = 0;
    private beta: number = 0;
    private startAngle: number = Math.PI / 6;
    private transitionSpeed: number = 200;

    private svg: any;

    private cubesGroup: any;
    private squaresGroup: any;

    private mx: number;
    private my: number;
    private mouseX: number;
    private mouseY: number;

    private file: any;
    private filestring = "Datei auswählen"

    private maxZ: number = 3;
    private maxX: number;
    private margin: number = 4;

    private instancesAddColor = [];
    // max h for log scaling
    private adjustfactor:number = 0;
    private maxh: number = 0;
    private scaledh: number = 0;
    // json obj from server
    private json: any = [];

    public pointInTime: number;
    private pointInTimeCount: number = 100;
    private timeSeries = new Map<string, DCState>();
    private temporalAxis = new Array<string>();
    private grid = new Map<string, Array<number>>();
    private clusterColorIndices = new Map<string, number>();

    private cubesData: Cube[];
    private cubes3D = d3_3d._3d()
        .shape('CUBE')
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .z(function (d) { return d.z; })
        .rotateY(this.startAngle)
        .rotateX(-this.startAngle)
        .origin(AppComponent.origin)
        .scale(AppComponent.scale);

    private squaresData: Square[];
    private squares3D = d3_3d._3d()
        .shape('PLANE')
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .z(function (d) { return d.z; })
        .rotateY(this.startAngle)
        .rotateX(-this.startAngle)
        .origin(AppComponent.origin)
        .scale(AppComponent.scale);


    
    constructor(private zone: NgZone, private dataservice: DataStatusService, private cdr: ChangeDetectorRef) {
        //add class for width correction
        window.addEventListener('load',function(){
            let run = document.getElementsByClassName("diagram")[0]
            run.parentElement.parentElement.classList.add("viewer")
        })
            
        let buffer=this.getCookie("config")
        let buffheaders=buffer.split(",")
        //reading cookie for panel and config setup

        //panel
        if (this.getCookie("panel")=="" || buffheaders.length <= 1 ){
            this.setCookie("panel",this.panels)
        }

        else{
            
            let buffer=this.getCookie("panel")
            this.panels=buffer.split(",")
        }

        //config
        if (this.getCookie("config")=="" || buffheaders.length <= 3 ){
            this.setCookie("config",this.headers)
        }

        else{
            
            let buffer=this.getCookie("config")
            this.headers=buffer.split(",")
        }

    }

    //cookies
    setCookie(cname, cvalue) {
        var d = new Date()
        //cookies 3 jahre gültig 
        var nd = new Date(d.getFullYear()+3,d.getDay(),d.getHours()) 
        var expires = "expires="+ nd;
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }

    getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }



    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.headers, event.previousIndex, event.currentIndex);
        this.setCookie("config",this.headers);
        console.log(this.headers)
      }

    droppanels(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.panels, event.previousIndex, event.currentIndex);
        this.setCookie("panel",this.panels);
        console.log(this.panels)
    }


    // set up live function

    goLive(){
        
        this.inProgress = true
        this.cdr.detectChanges()

        if (this.isLive==true){
            this.isLive = false
            this.svg.selectAll("g.squares").remove()
            this.svg.selectAll("g.cubes").remove()
            this.timeSeries = new Map<string, DCState>();
            this.ngOnInit();
            this.inProgress = false
            this.cdr.detectChanges()
            return
        }
        
        this.dataservice.getInitialData()
        .subscribe(logs => {
            this.json = logs
 
            //get all Keys for data set up
            this.jsonTree = {pathtoset:"",root:this.json,nodes:[],collection:[[]]}

            //parse the received JSON and select the relevant fields
            this.detectAllNodes(this.json,"")

            this.receivedData(this.json)
            this.inProgress = false
            this.isLive = true
            this.cdr.detectChanges()
    });  

        
    }

    submitConfig(){
        console.log(this.jsonTree.nodes)
        let pathto = this.jsonTree.pathtoset.split(".")
        let data = this.json
        //hier 
        pathto.forEach(element => {
            data=data[element]
        });



        
        

        /*
        let strTimeStamp: string = datajson[i]["timestamp"];
            let strCluster: string = datajson[i]["cluster"];
            let strDataCenter: string = datajson[i]["dc"];
            let strInstance: string = datajson[i]["instanz"];
            let strUtilization: string = datajson[i]["count"];
        */
    }
    // get nodes from any JSON 
    detectAllNodes(json: any,pathTo: string) {
        if (Array.isArray(json)){
            json = json[0]
            pathTo = pathTo.concat("_for each_")
            this.jsonTree.pathtoset=pathTo
        }
        let allKeys = (Object.keys(json))
        if (allKeys.length <= 0 || typeof(json)!= "object"){
            return
        }    
        for (let i = 0;i < allKeys.length ;i++){
            let node : Knoten
            let pathnow = pathTo.concat(".".concat(allKeys[i]))
            node = {parent:allKeys[i], value:(json[allKeys[i]]), path:pathnow}
            if(this.jsonTree.collection.includes(allKeys[i])){
                continue
            }
            this.jsonTree.collection.push(allKeys[i])
            this.jsonTree.nodes.push(node)
            this.detectAllNodes(json[allKeys[i]],pathnow)    
        }     
    }


    // data changes
    ngOnChanges() {
       
    }

    ngOnInit() {
        this.title = "Visualize Resource Utilization"

        this.svg = d3.select("svg#diagram")
        .attr("preserveAspectRatio", "xMinYMin meet")   
        //.attr("viewBox", "-320 -100 1700 600");
        .attr("viewBox", "-120 -100 1250 600");
        this.svg.call(d3.drag().on('drag', this.dragged.bind(this)).on('start', this.dragStart.bind(this)).on('end', this.dragEnd.bind(this))).append('g');
        
        this.squaresGroup = this.svg.append('g').attr('class', 'squares');
        this.cubesGroup = this.svg.append('g').attr('class', 'cubes');

        this.init();
        //this.startCubism();

        // this.zone.run(() => {         });
    }

    fileChanged(e) {
        console.log(e)
        this.file = e.target.files[0];
        this.filestring = this.file.name;
        this.uploadDocument(this.file)
    }

    //build main structure from the data
    buildTimeSeries(strTimeStamp:string ,strCluster: string, strDataCenter: string, strInstance: string, strUtilization: string){

        
        let dcState: DCState;
                  
                    if (this.timeSeries.has(strTimeStamp)) {
                        
                        dcState = this.timeSeries.get(strTimeStamp);

                    } else {
                        dcState = { datacenters: new Map<string, Datacenter>(), numDCs: 0, numClusters: 0, numInstances: 0 };
                        this.timeSeries.set(strTimeStamp, dcState);
                        
                        this.temporalAxis.push(strTimeStamp);
                    }

                    let datacenter: Datacenter;
                    if (dcState.datacenters.has(strDataCenter)) {
                        datacenter = dcState.datacenters.get(strDataCenter);
                    } else {
                        datacenter = { clusters: new Map<string, Cluster>(), numClusters: 0, numInstances: 0 };
                        dcState.datacenters.set(strDataCenter, datacenter);
                        dcState.numDCs++;
                    }

                    let cluster: Cluster;
                    if (datacenter.clusters.has(strCluster)) {
                        cluster = datacenter.clusters.get(strCluster);
                    } else {
                        cluster = { instances: new Map<string, Instance>(), numInstances: 0 };
                        datacenter.clusters.set(strCluster, cluster);
                        dcState.numClusters++;
                        datacenter.numClusters++;
                    }

                    let instance: Instance;
                    if (cluster.instances.has(strInstance)) {
                        instance = cluster.instances.get(strInstance);
                    } else {
                        instance = { utilization: Number(strUtilization) };
                        cluster.instances.set(strInstance, instance);
                        dcState.numInstances++;
                        datacenter.numInstances++;
                        cluster.numInstances++;
                    }
    }

    //generate data from socket json format
    receivedData(json : any){
        let datajson = json["response"]["docs"]  
        let l = datajson.length
        this.timeSeries = new Map<string, DCState>();
        this.temporalAxis = [];

        for (let i = 0; i < l; i++ ){

            

            let strTimeStamp: string = datajson[i]["timestamp"];
            let strCluster: string = datajson[i]["cluster"];
            let strDataCenter: string = datajson[i]["dc"];
            let strInstance: string = datajson[i]["instanz"];
            let strUtilization: string = datajson[i]["count"];
            
            if (this.maxh <= Number(strUtilization)){
                this.maxh = Number(strUtilization);
            }
            
            this.buildTimeSeries(strTimeStamp,strCluster,strDataCenter,strInstance,strUtilization)
        }


        /*_______________________*/
        //Do this separately, since it only happeans upon document upload 
        //Todo outsourcec --> write once
        let instancesToClusterToDCMap = new Map<string, Map<string, Set<string>>>();
        let timestampValues: Array<DCState> = Array.from(this.timeSeries.values());
        timestampValues.forEach((dcState: DCState) => {
            dcState.datacenters.forEach((datacenter: Datacenter, key_dc: string) => {
                let instancesToClusterMap: Map<string, Set<string>>;
                if (instancesToClusterToDCMap.has(key_dc)) {
                    instancesToClusterMap = instancesToClusterToDCMap.get(key_dc);
                } else {
                    instancesToClusterMap = new Map<string, Set<string>>();
                    instancesToClusterToDCMap.set(key_dc, instancesToClusterMap);
                }
                
                let clusters = datacenter.clusters;
                clusters.forEach((value_cluster: Cluster, key_cluster: string) => {
                    let instances: Set<string>;
                    if (instancesToClusterMap.has(key_cluster)) {
                        instances = instancesToClusterMap.get(key_cluster);
                    } else {
                        instances = new Set<string>();
                        instancesToClusterMap.set(key_cluster, instances);
                    }
                    Array.from(value_cluster.instances.keys()).forEach((s) => instances.add(s));
                });
            });
        });
        
        var dc = 0;
        this.maxX = 0;
        var colorIndex = 0;
        instancesToClusterToDCMap.forEach((instancesToClusterMap: Map<string, Set<string>>, key_dc: string) => {
            var x = 0;
            var z = dc * this.maxZ;
            instancesToClusterMap.forEach((instances: Set<string>, key_cluster: string) => {
                let clusterKey: string = key_dc + "_" + key_cluster;

                this.instancesAddColor.push(clusterKey)

                instances.forEach((key_instance) => {
                    let gridKey: string = clusterKey + "_" + key_instance;
                    if (!this.grid.has(gridKey)) {
                        this.grid.set(gridKey, [x, z]);
                        z = z + 1;
                        if (z == (dc + 1) * this.maxZ) {
                            z = dc * this.maxZ;
                            x++;
                        }
                    }
                });
                x++;
                                    
                if (!this.clusterColorIndices.has(clusterKey)) {
                    this.clusterColorIndices.set(clusterKey, colorIndex++);
                }
            });

            this.maxX = Math.max(this.maxX, x);
            dc++;
            z += this.maxZ;
        });

        

        this.temporalAxis.sort();
        this.pointInTime = this.temporalAxis.length-1;
        this.pointInTimeCount = this.temporalAxis.length;
        this.init();
    }

    //generate data from csv
    uploadDocument(file) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            let csv = reader.result;
            let allTextLines = String(csv).split(/\r|\n|\r/);
            let headers = allTextLines[0].split(',');

            this.timeSeries = new Map<string, DCState>();
            this.temporalAxis = [];
            //this.grid = new Map<string, Array<number>>();
            
            //skip header and start with i = 1
            for (let i = 1; i < allTextLines.length; i++) {
                
                // split content based on comma
                let data = allTextLines[i].split(',');
                if (data.length === headers.length) {
                    let tarr = [];
                    for (let j = 0; j < headers.length; j++) {
                        tarr.push(data[j]);
                    }
                    
                    let strTimeStamp: string = tarr[1];
                    let strCluster: string = tarr[3];
                    let strDataCenter: string = tarr[4];
                    let strInstance: string = tarr[6];
                    let strUtilization: string = tarr[10];
                    //save max utilization for scaling
                    if (this.maxh <= Number(strUtilization)){
                        this.maxh = Number(strUtilization);
                    }
                    
                    this.buildTimeSeries(strTimeStamp,strCluster,strDataCenter,strInstance,strUtilization)
                    
                }
            }

            //Do this separately, since it only happeans upon document upload
            //Todo outsourcec --> write once

            let instancesToClusterToDCMap = new Map<string, Map<string, Set<string>>>();
            let timestampValues: Array<DCState> = Array.from(this.timeSeries.values());
            timestampValues.forEach((dcState: DCState) => {
                dcState.datacenters.forEach((datacenter: Datacenter, key_dc: string) => {
                    let instancesToClusterMap: Map<string, Set<string>>;
                    if (instancesToClusterToDCMap.has(key_dc)) {
                        instancesToClusterMap = instancesToClusterToDCMap.get(key_dc);
                    } else {
                        instancesToClusterMap = new Map<string, Set<string>>();
                        instancesToClusterToDCMap.set(key_dc, instancesToClusterMap);
                    }
                    
                    let clusters = datacenter.clusters;
                    clusters.forEach((value_cluster: Cluster, key_cluster: string) => {
                        let instances: Set<string>;
                        if (instancesToClusterMap.has(key_cluster)) {
                            instances = instancesToClusterMap.get(key_cluster);
                        } else {
                            instances = new Set<string>();
                            instancesToClusterMap.set(key_cluster, instances);
                        }
                        Array.from(value_cluster.instances.keys()).forEach((s) => instances.add(s));
                    });
                });
            });
            
            var dc = 0;
            this.maxX = 0;
            var colorIndex = 0;
            instancesToClusterToDCMap.forEach((instancesToClusterMap: Map<string, Set<string>>, key_dc: string) => {
                var x = 0;
                var z = dc * this.maxZ;
                instancesToClusterMap.forEach((instances: Set<string>, key_cluster: string) => {
                    let clusterKey: string = key_dc + "_" + key_cluster;

                    this.instancesAddColor.push(clusterKey)

                    instances.forEach((key_instance) => {
                        let gridKey: string = clusterKey + "_" + key_instance;
                        if (!this.grid.has(gridKey)) {
                            this.grid.set(gridKey, [x, z]);
                            z = z + 1;
                            if (z == (dc + 1) * this.maxZ) {
                                z = dc * this.maxZ;
                                x++;
                            }
                        }
                    });
                    x++;
                                        
                    if (!this.clusterColorIndices.has(clusterKey)) {
                        this.clusterColorIndices.set(clusterKey, colorIndex++);
                    }
                });

                this.maxX = Math.max(this.maxX, x);
                dc++;
                z += this.maxZ;
            });

            

            this.temporalAxis.sort();
            this.pointInTime = 0;
            this.pointInTimeCount = this.temporalAxis.length;

            this.init();
        }

    }

    //controlpanel

    changeData(){
        console.log("in changeData now")
        this.isLive = false
        this.goLive()
    }

    changemaxZ(event: any){
        this.maxZ = event.value;
        this.svg.selectAll("g").remove()
        this.svg.selectAll("g").remove()
        this.ngOnInit()

    }
    changecolorofinstance(colorindex){
        var index = colorindex["e"];
        var color = colorindex["i"];

        document.getElementById(String(index)).style.backgroundColor=color;
        this.shapeColors[index]=color;
        this.svg.selectAll("g").remove()
        this.svg.selectAll("g").remove()
        this.ngOnInit();
    }

    changePointInTime(value) {
        //bugged PointInTime : 2018-08-25 21:15:00 2351
        this.pointInTime = value;
        this.svg.selectAll("g").remove()
        this.svg.selectAll("g").remove()
        this.ngOnInit();
    }

    formatDate(date){
        
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        return [year, month, day].join('-');
        
    }
    datechanged(event: any){
        let date = String(this.formatDate(new Date(event.value)));
        var value = this.temporalAxis.indexOf(date+" 00:00:00");
        this.changePointInTime(value);
    }

    dragStart() {
        this.mx = d3.event.x;
        this.my = d3.event.y;
    }

    dragged() {
        this.mouseX = this.mouseX || 0;
        this.mouseY = this.mouseY || 0;
        this.beta = (d3.event.x - this.mx + this.mouseX) * Math.PI / 230;
        this.alpha = (d3.event.y - this.my + this.mouseY) * Math.PI / 230 * (-1);
        this.processData(
            this.cubes3D.rotateY(this.beta + this.startAngle).rotateX(this.alpha - this.startAngle)(this.cubesData),
            this.squares3D.rotateY(this.beta + this.startAngle).rotateX(this.alpha - this.startAngle)(this.squaresData),
            0);
    }

    dragEnd() {
        this.mouseX = d3.event.x - this.mx + this.mouseX;
        this.mouseY = d3.event.y - this.my + this.mouseY;
    }


    
    processData = function (cubesData, squaresData, transitionSpeed) {
        /* --------- SQUARES ---------*/
        var squares = this.squaresGroup.selectAll('g.square').data(squaresData, function (d) { return d.id });
        var se = squares
            .enter()
            .append('g')
            .attr('class', 'square')
            .attr('fill-opacity', 0)
            .attr('fill', function (d) { return d.fill; })
            .attr('stroke', function (d) { return d.stroke; })
        squares.exit().remove();
        
        se.append('path')
            .attr('class', 'face_sq')
            .classed('_3d', true);
        
       var faces_sq = squares.merge(se).selectAll('path.face_sq');
        faces_sq.enter()
            .merge(faces_sq)
            .transition().duration(transitionSpeed)
            .attr('d', this.squares3D.draw);
        faces_sq.exit().remove();


        /* --------- CUBES ---------*/
        var cubes = this.cubesGroup.selectAll('g.cube').data(cubesData, function (d) { return d.id });
        var ce = cubes
            .enter()
            .append('g')
            .attr('class', 'cube')
            .attr('fill',function (d) { return d.fill; } )
            .attr('stroke', function (d) { return d.stroke; })
            .merge(cubes)
            .sort(this.cubes3D.sort);
        cubes.exit().remove();

        var faces = cubes.merge(ce).selectAll('path.face').data(function (d) { return d.faces; }, function (d) { return d.face; });

        faces.enter()
            .append('path')
            .attr('class', 'face')
            .attr('fill-opacity', 0.95)
            .classed('_3d', true)
            .merge(faces)
            .transition().duration(transitionSpeed)
            .attr('d', this.cubes3D.draw);
        faces.exit().remove();

        /* --------- TEXT ---------*/

        var texts = cubes.merge(ce).selectAll('text.text').data(function (d) {
            var _t = d.faces.filter(function (d) {
                return d.face === 'top';
            });
            return [{ height: d.height, centroid: _t[0].centroid }];
        });
        texts
            .enter()
            .append('text')
            .attr('class', 'text')
            .attr('dy', '-.7em')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-weight', 'bolder')
            .attr('x', function (d) { return AppComponent.origin[0] + AppComponent.scale * d.centroid.x })
            .attr('y', function (d) { return AppComponent.origin[1] + AppComponent.scale * d.centroid.y })
            .classed('_3d', true)
            .merge(texts)
            .transition().duration(transitionSpeed)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', function (d) { return AppComponent.origin[0] + AppComponent.scale * d.centroid.x })
            .attr('y', function (d) { return AppComponent.origin[1] + AppComponent.scale * d.centroid.y })
            .tween('text', function (d) {
                var that = d3.select(this);
                var i = d3.interpolateNumber(+that.text(), Math.abs(d.height));
                return function (t) {
                    that.text(i(t).toFixed(1));
                };
            });
        texts.exit().remove();


        /* --------- SORT TEXT & FACES ---------*/
        ce.selectAll('._3d').sort(d3_3d._3d().sort);
    }


    scaleLog = function(hvalue,hmax,maximumheight) {
        let maxh = Math.log(hmax);
        this.adjustfactor = (maximumheight/maxh).toFixed(4)

        //log zwischen +0.1 - +1 problem (negativ bzw 0)
        if (hvalue <= 1 && hvalue >= 0.1){
            return (Math.log(2-(1-hvalue))*this.adjustfactor)/2
        }
        return Math.log(hvalue)*this.adjustfactor

      }


    makeCube(h, x, z) {
        return [
            { x: x - 1, y: h, z: z + 1 }, // FRONT TOP LEFT
            { x: x - 1, y: 0, z: z + 1 }, // FRONT BOTTOM LEFT
            { x: x + 1, y: 0, z: z + 1 }, // FRONT BOTTOM RIGHT
            { x: x + 1, y: h, z: z + 1 }, // FRONT TOP RIGHT
            { x: x - 1, y: h, z: z - 1 }, // BACK  TOP LEFT
            { x: x - 1, y: 0, z: z - 1 }, // BACK  BOTTOM LEFT
            { x: x + 1, y: 0, z: z - 1 }, // BACK  BOTTOM RIGHT
            { x: x + 1, y: h, z: z - 1 }, // BACK  TOP RIGHT
        ];
    }
    
    //del h ?
    makeSquare(h, x, z) {
        return [
            { x: x - 1, y: 0, z: z + 1 }, // FRONT TOP LEFT
            { x: x - 1, y: 0, z: z - 1 }, // FRONT BOTTOM LEFT
            { x: x + 1, y: 0, z: z - 1 }, // FRONT BOTTOM RIGHT
            { x: x + 1, y: 0, z: z + 1 }, // FRONT TOP RIGHT
        ];
    }

    init = function () {
        var timestamp = this.temporalAxis[this.pointInTime];
        this.cubesData = [];
        this.squaresData = [];
        
        //get data from file
        if (this.timeSeries.get(timestamp) != null) {
            let dcState = this.timeSeries.get(timestamp);
            for(var m = 1; m <= 2; m++){
                this.grid.forEach((set)=>{

                    let x = set[0]
                    let z = set[1]

                    var _square = this.makeSquare(42, x * this.margin - (this.maxX * this.margin) / 2, z * this.margin - (dcState.numDCs * this.maxZ * this.margin) / 2);
                    _square.id = 'square_' + cnt++;
                    _square.fill = "white";
                    _square.stroke = "#ff0000";
                    this.squaresData.push(_square);
                })
            }
            
            //set all view elements to zero
            this.viewdc = 0;
            this.viewinstances = 0;
            this.viewclusters = 0;
            this.viewmaxValue = 0;
            
            
            dcState.datacenters.forEach((datacenter: Datacenter, key_dc: string) => {
                //set up view data
                this.viewclusters+=datacenter.clusters.size
                this.viewinstances+=datacenter.numInstances
                this.viewdc+=1


                console.log(datacenter)
                let clusters = datacenter.clusters;              
                clusters.forEach((value_cluster: Cluster, key_cluster: string) => {
                    let instances = value_cluster.instances;
                    var fill = this.shapeColors[this.clusterColorIndices.get(key_dc + "_" + key_cluster)];
                    var stroke = "black";
                    instances.forEach((value_instance: Instance, key_instance: string) => {
                        var h = value_instance.utilization;

                        //set up viewmaxValue
                        if(this.viewmaxValue<h){
                            this.viewmaxValue=h
                        }
                        
                        //insert log scaling function on h
                        this.scaledh = this.scaleLog(h,this.maxh,12)

                        let gridKey: string = key_dc + "_" + key_cluster + "_" + key_instance;
                        
                        let gridValue: Array<number> = this.grid.get(gridKey);
                        
                        var x = gridValue[0];
                        
                        var z = gridValue[1];
                       
                        var _cube = this.makeCube(-this.scaledh, x * this.margin - (this.maxX * this.margin) / 2, z * this.margin - (dcState.numDCs * this.maxZ * this.margin) / 2);
                                               
                        _cube.id = 'cube_' + gridKey;
                        _cube.height = h;
                        _cube.fill = fill;
                        _cube.stroke = stroke;
                        this.cubesData.push(_cube);
                        

                    });
                });
            });
        //random int values
        } else {
            var j = 10;
            this.cubesData = [];
            var cnt = 0;
            for (var z = -j / 2; z <= j / 2; z = z + 5) {
                for (var x = -j; x <= j; x = x + 5) {
                    var h = d3.randomUniform(-2, -7)();
                    var _cube = this.makeCube(h, x, z);
                    _cube.id = 'cube_' + cnt++;
                    _cube.height = h;
                    _cube.fill = "green";
                    _cube.stroke = "#000000";
                    this.cubesData.push(_cube);
                }
            }
            
            j=10;  
            this.squaresData = [];
            cnt = 0;
            for (var z = -j / 2; z <= j / 2; z = z + 5) {
                for (var x = -j; x <= j; x = x + 5) {
                    var _square = this.makeSquare(2, x, z);
                    _square.id = 'square_' + cnt++;
                    _square.fill = "white";
                    _square.stroke = "#ff0000";
                    this.squaresData.push(_square);
                }
            }
        }

        this.processData(this.cubes3D(this.cubesData), this.squares3D(this.squaresData), this.transitionSpeed);
    
    
        
    }

}
