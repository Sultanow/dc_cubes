import DCState from '../../../model/DCState'
import Datacenter from '../../../model/Datacenter'
import Cluster from '../../../model/Cluster'
import Instance from '../../../model/Instance'

interface ClusterColors {
    [key: string]: number
}

export default class SolrAdapter {

    public timeSeries = new Map<string, DCState>();
    public rawTimeSeriesData: [];
    public temporalAxis = new Array<string>();
    public maxh: number = 0;
    public maxZ: number = 3;
    public maxX: number;
    public clusterColors: ClusterColors = {};
    public grid = new Map<string, Array<number>>();
    public clusterColorIndices = new Map<string, number>();
    public pointInTime: number;
    public pointInTimeCount: number = 100;
    // TODO: Colors should be generated dynamically according to the count of clusters
    public colors = [0x46ACC2, 0x98DFAF, 0xF8333C, 0xFFD23F];
    public colorCounter = 0;


    //generate data from socket json format
    receivedData(data: any, customMapping, selectedMeasure: string) {
        let datajson: [] = data.data.response.docs
        this.rawTimeSeriesData = datajson
        this.temporalAxis = [];

        datajson.forEach(element => {
            // TODO: make stringutilization dynamic to vis diffrent metrics
            let { strTimeStamp, strCluster, strDataCenter, strInstance, strSelectedMeasure } = customMapping(element, selectedMeasure)

            if (this.maxh <= Number(strSelectedMeasure)) {
                this.maxh = Number(strSelectedMeasure);
            }


            if (strTimeStamp !== undefined || null) {
                this.buildTimeSeries(strTimeStamp, strCluster, strDataCenter, strInstance, strSelectedMeasure);
            }
        });


        this.buildGrid()
    }

    buildGrid() {
        /*_______________________*/
        //Do this separately, since it only happeans upon document upload 
        //Todo outsourcec --> write once
        let instancesToClusterToDCMap = new Map<string, Map<string, Set<string>>>();
        let timestampValues: Array<DCState> = Array.from(this.timeSeries.values());
        timestampValues.forEach((dcState: DCState) => {
            dcState.datacenters.forEach((datacenter: Datacenter, keyDC: string) => {
                let instancesToClusterMap: Map<string, Set<string>>;
                if (instancesToClusterToDCMap.has(keyDC)) {
                    instancesToClusterMap = instancesToClusterToDCMap.get(keyDC)!;
                } else {
                    instancesToClusterMap = new Map<string, Set<string>>();
                    instancesToClusterToDCMap.set(keyDC, instancesToClusterMap);
                }

                let clusters = datacenter.clusters;
                clusters.forEach((valueCluster: Cluster, keyCluster: string) => {
                    let instances: Set<string>;
                    if (instancesToClusterMap.has(keyCluster)) {
                        instances = instancesToClusterMap.get(keyCluster)!;
                    } else {
                        instances = new Set<string>();
                        instancesToClusterMap.set(keyCluster, instances);
                    }
                    Array.from(valueCluster.instances.keys()).forEach((s) => instances.add(s));
                });
            });
        });

        var dc = 0;
        this.maxX = 0;
        var colorIndex = 0;
        instancesToClusterToDCMap.forEach((instancesToClusterMap: Map<string, Set<string>>, keyDC: string) => {
            var x = 0;
            var z = dc * this.maxZ;
            instancesToClusterMap.forEach((instances: Set<string>, keyCluster: string) => {
                let clusterKey: string = keyDC + "_" + keyCluster;

                this.clusterColors[clusterKey] = this.colors[this.colorCounter];
                this.colorCounter++;

                instances.forEach((keyInstance) => {
                    let gridKey: string = clusterKey + "_" + keyInstance;
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
    }

    // Build main structure from the data
    buildTimeSeries(strTimeStamp: string, strCluster: string, strDataCenter: string, strInstance: string, strUtilization: string) {
        //console.log("foreach" + strTimeStamp + ":::" + strUtilization);
        let dcState: DCState;
        if (this.timeSeries.has(strTimeStamp)) {
            dcState = this.timeSeries.get(strTimeStamp)!;
        } else {
            dcState = { datacenters: new Map<string, Datacenter>(), numDCs: 0, numClusters: 0, numInstances: 0 };
            this.timeSeries.set(strTimeStamp, dcState);

            this.temporalAxis.push(strTimeStamp);
        }

        let datacenter: Datacenter;
        if (dcState.datacenters.has(strDataCenter)) {
            datacenter = dcState.datacenters.get(strDataCenter)!;
        } else {
            datacenter = { clusters: new Map<string, Cluster>(), numClusters: 0, numInstances: 0 };
            dcState.datacenters.set(strDataCenter, datacenter);
            dcState.numDCs++;
        }

        let cluster: Cluster;
        if (datacenter.clusters.has(strCluster)) {
            cluster = datacenter.clusters.get(strCluster)!;
        } else {
            cluster = { instances: new Map<string, Instance>(), numInstances: 0 };
            datacenter.clusters.set(strCluster, cluster);
            dcState.numClusters++;
            datacenter.numClusters++;
        }

        let instance: Instance;
        if (cluster.instances.has(strInstance)) {
            instance = cluster.instances.get(strInstance)!;
        } else {

            console.log("strUtiz " + strUtilization + "  :" + strInstance);
            instance = { utilization: Number(strUtilization) };
            cluster.instances.set(strInstance, instance);
            dcState.numInstances++;
            datacenter.numInstances++;
            cluster.numInstances++;
        }
    }
}

