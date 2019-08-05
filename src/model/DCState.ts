import Datacenter from './Datacenter';
export default interface DCState {
    datacenters: Map<string, Datacenter>;
    numDCs: number,
    numClusters: number,
    numInstances: number
}