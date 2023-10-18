import Cluster from './Cluster';

export default interface Datacenter {
  clusters: Map<string, Cluster>;
  numClusters: number;
  numInstances: number;
}
