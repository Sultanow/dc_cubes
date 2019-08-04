type DCState = {
    datacenters: Map<string, Datacenter>;
    numDCs: number,
    numClusters: number,
    numInstances: number
}