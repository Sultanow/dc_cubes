  type Datacenter = {
    clusters: Map<string, Cluster>;
    numClusters: number,
    numInstances: number
  }