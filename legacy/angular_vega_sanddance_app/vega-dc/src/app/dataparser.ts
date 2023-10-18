
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

type VegaStruct = {

    color: [number, number, number],
    position: [number, number, number],
    size: [number, number, number]
}

export class Dataparser {
    
    
    private temporalAxis = new Array<string>();
    private timeSeries = new Map<string, DCState>();

    cubethickness = 100;
    spacer = 10;
    clusterspacer = 200;

    //should be calculated dynamicly
    mostInstancesperCluster = 8;
    maxh = 0;
    maxZ = 3;
    maxX = 0;
    maximumheight = 400;
    
    private grid = new Map<string, Array<number>>();

    constructor(){}

    scaleLog = function(hvalue) {
        let maxh = Math.log(this.maxh);
        this.adjustfactor = (this.maximumheight/maxh).toFixed(4)

        //log zwischen +0.1 - +1 problem (negativ bzw 0)
        if (hvalue <= 1 && hvalue >= 0.1){
            return (Math.log(2-(1-hvalue))*this.adjustfactor)/2
        }
        return Math.log(hvalue)*this.adjustfactor

      }

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
        
        console.log(this.timeSeries);

        
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
                                    
            });

            this.maxX = Math.max(this.maxX, x);
            dc++;
            z += this.maxZ;
        });

        this.temporalAxis.sort();
        console.log(this.grid)
    }

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


    parseToVega(pointInTime:number) {
        
        let data = this.timeSeries.get(this.temporalAxis[pointInTime]);
        
        let maxDC = data.numDCs;
        let maxCluster = data.numClusters;
        let maxInstances = data.numInstances;
        
    
        let datacenter = data.datacenters

        let startx = 0 - (((maxInstances * (this.spacer+this.cubethickness))+(maxCluster*this.clusterspacer))/2);

        let starty = 0 - ((maxDC/2)*((this.maxZ % this.mostInstancesperCluster) * (this.spacer + this.cubethickness)));

        console.log(data);

        var result = [];

        let x = startx;
        let y = starty;
        
        console.log(x,y)
        
            
        this.grid.forEach(set => {
            let x = set[0]*100
            let y = set[1]*100


        });

        datacenter.forEach(dc => {
            console.log(datacenter)
            let run = 0
            dc.clusters.forEach(cluster => {
                if (run != 0){
                    x += this.clusterspacer
                    y += this.clusterspacer                  
                }

                let clusterx = x
                let clusterrun = 1;
                
                cluster.instances.forEach(cube => {
                    let vegaCube: VegaStruct
                    if(clusterrun == 4){
                        clusterrun = 0;
                        y += this.cubethickness+this.spacer;
                    }
                    //let coordinates = this.grid.get()
                    //vegaCube = {color: [255, 0, 0], position: [, 0], size: [this.cubethickness,this.cubethickness,this.scaleLog(cube.utilization)]}
                    vegaCube = {color: [255, 0, 0], position: [clusterx+(clusterrun*(this.cubethickness+this.spacer)), y, 0], size: [this.cubethickness,this.cubethickness,this.scaleLog(cube.utilization)]}
                    
                    result.push(vegaCube);
                    clusterrun += 1
                });
                
                run+=1;
            });
        });
        
        return result
        
    }
    
    buildNet(){

    }
}
