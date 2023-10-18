import DCState from '../../../../model/DCState';
import Datacenter from '../../../../model/Datacenter';
import Cluster from '../../../../model/Cluster';
import Instance from '../../../../model/Instance';

export default class SolrAdapter {
  timeSeries = new Map<string, DCState>();
  temporalAxis = new Array<string>();
  maxh = 0;
  maxZ = 3;
  maxX: number;
  clusterColors = {};
  grid = new Map<string, number[]>();
  clusterColorIndices = new Map<string, number>();
  pointInTime: number;
  pointInTimeCount = 100;
  // TODO: Colors should be generated dynamically according to the count of clusters
  colors = [0x46acc2, 0x98dfaf, 0xf8333c, 0xffd23f];
  colorCounter = 0;

  //generate data from socket json format
  receivedData(json: object, customMapping) {
    const datajson = json['response']['docs'];
    //const l = datajson.length;
    this.timeSeries = new Map<string, DCState>();
    this.temporalAxis = [];

    datajson.forEach(element => {
      // TODO: make stringutilization dynamic to vis diffrent metrics
      const { strTimeStamp, strCluster, strDataCenter, strInstance, strUtilization } = customMapping(element);

      if (this.maxh <= Number(strUtilization)) {
        this.maxh = Number(strUtilization);
      }

      this.buildTimeSeries(strTimeStamp, strCluster, strDataCenter, strInstance, strUtilization);
    });

    /*_______________________*/
    //Do this separately, since it only happeans upon document upload
    //Todo outsourcec --> write once
    const instancesToClusterToDCMap = new Map<string, Map<string, Set<string>>>();
    const timestampValues: DCState[] = Array.from(this.timeSeries.values());
    timestampValues.forEach((dcState: DCState) => {
      dcState.datacenters.forEach((datacenter: Datacenter, keyDc: string) => {
        let instancesToClusterMap: Map<string, Set<string>>;
        if (instancesToClusterToDCMap.has(keyDc)) {
          instancesToClusterMap = instancesToClusterToDCMap.get(keyDc);
        } else {
          instancesToClusterMap = new Map<string, Set<string>>();
          instancesToClusterToDCMap.set(keyDc, instancesToClusterMap);
        }

        const clusters = datacenter.clusters;
        clusters.forEach((valueCluster: Cluster, keyCluster: string) => {
          let instances: Set<string>;
          if (instancesToClusterMap.has(keyCluster)) {
            instances = instancesToClusterMap.get(keyCluster);
          } else {
            instances = new Set<string>();
            instancesToClusterMap.set(keyCluster, instances);
          }
          Array.from(valueCluster.instances.keys()).forEach(s => instances.add(s));
        });
      });
    });

    let dc = 0;
    this.maxX = 0;
    let colorIndex = 0;
    instancesToClusterToDCMap.forEach((instancesToClusterMap: Map<string, Set<string>>, keyDc: string) => {
      let x = 0;
      let z = dc * this.maxZ;
      instancesToClusterMap.forEach((instances: Set<string>, keyCluster: string) => {
        const clusterKey: string = keyDc + '_' + keyCluster;

        this.clusterColors[clusterKey] = this.colors[this.colorCounter];
        this.colorCounter++;

        instances.forEach(keyInstance => {
          const gridKey: string = clusterKey + '_' + keyInstance;
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
  }

  //build main structure from the data
  buildTimeSeries(strTimeStamp: string, strCluster: string, strDataCenter: string, strInstance: string, strUtilization: string) {
    let dcState: DCState | undefined;

    if (this.timeSeries.has(strTimeStamp)) {
      dcState = this.timeSeries.get(strTimeStamp);
    } else {
      dcState = { datacenters: new Map<string, Datacenter>(), numDCs: 0, numClusters: 0, numInstances: 0 };
      this.timeSeries.set(strTimeStamp, dcState);

      this.temporalAxis.push(strTimeStamp);
    }

    let datacenter: Datacenter | undefined;
    if (dcState.datacenters.has(strDataCenter)) {
      datacenter = dcState.datacenters.get(strDataCenter);
    } else {
      datacenter = { clusters: new Map<string, Cluster>(), numClusters: 0, numInstances: 0 };
      dcState.datacenters.set(strDataCenter, datacenter);
      dcState.numDCs++;
    }

    let cluster: Cluster | undefined;
    if (datacenter.clusters.has(strCluster)) {
      cluster = datacenter.clusters.get(strCluster);
    } else {
      cluster = { instances: new Map<string, Instance>(), numInstances: 0 };
      datacenter.clusters.set(strCluster, cluster);
      dcState.numClusters++;
      datacenter.numClusters++;
    }

    let instance: Instance | undefined;
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
}
