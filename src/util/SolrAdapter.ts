import DCState from '../model/DCState'
import Datacenter from '../model/Datacenter'
import Cluster from '../model/Cluster'
import Instance from '../model/Instance'

export default class SolrAdapter {

    private timeSeries = new Map<string, DCState>();
    private temporalAxis = new Array<string>();
    private maxh: number = 0;
    private maxZ: number = 3;
    private maxX: number;
    private instancesAddColor = [];
    private grid = new Map<string, Array<number>>();
    private clusterColorIndices = new Map<string, number>();
    public pointInTime: number;
    private pointInTimeCount: number = 100;


    //generate data from socket json format
    receivedData(json: any) {
        let datajson = json["response"]["docs"]
        let l = datajson.length
        this.timeSeries = new Map<string, DCState>();
        this.temporalAxis = [];

        for (let i = 0; i < l; i++) {



            let strTimeStamp: string = datajson[i]["timestamp"];
            let strCluster: string = datajson[i]["cluster"];
            let strDataCenter: string = datajson[i]["dc"];
            let strInstance: string = datajson[i]["instanz"];
            let strUtilization: string = datajson[i]["count"];

            if (this.maxh <= Number(strUtilization)) {
                this.maxh = Number(strUtilization);
            }

            this.buildTimeSeries(strTimeStamp, strCluster, strDataCenter, strInstance, strUtilization);
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
                        if (z === (dc + 1) * this.maxZ) {
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
        this.pointInTime = this.temporalAxis.length - 1;
        this.pointInTimeCount = this.temporalAxis.length;

        console.log(this.timeSeries);
        console.log(this.temporalAxis);
        console.log(instancesToClusterToDCMap);
        // this.init();
        // init Visualisation
    }
    //build main structure from the data
    buildTimeSeries(strTimeStamp: string, strCluster: string, strDataCenter: string, strInstance: string, strUtilization: string) {


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
        /* console.log(dcState);
        console.log(this.timeSeries);
        console.log(this.temporalAxis); */
    }
}

