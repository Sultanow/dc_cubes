import * as THREE from 'three';

class ClusterUtil {
  calculateBBox(clusterIncstanceSet: THREE.Geometry[]): THREE.Box3 | null {
    if (clusterIncstanceSet.length === 0) {
      return null;
    }

    const mergedGeometry = new THREE.Geometry();
    let previousInstance = clusterIncstanceSet[0];
    for (let i = 1; i < clusterIncstanceSet.length; i++) {
      const meshPrevious = new THREE.Mesh(previousInstance);
      mergedGeometry.merge(mergedGeometry, meshPrevious.matrix);
      previousInstance = clusterIncstanceSet[i];
    }

    mergedGeometry.computeBoundingBox();
    return mergedGeometry.boundingBox.clone();
  }
}
