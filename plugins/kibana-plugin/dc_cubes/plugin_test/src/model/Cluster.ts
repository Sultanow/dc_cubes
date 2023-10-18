import Instance from './Instance';

export default interface Cluster {
  instances: Map<string, Instance>;
  numInstances: number;
}
