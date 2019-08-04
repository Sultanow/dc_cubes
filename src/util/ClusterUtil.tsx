import * as THREE from 'three';

class ClusterUtil {

    calculateBBox(clusterIncstanceSet: THREE.Geometry[]): THREE.Box3 {
        if (clusterIncstanceSet.isEmpty()) {
            return null;
        }

        var mergedGeometry = new THREE.Geometry();
        var previousInstance = clusterIncstanceSet[0];
        for (let i = 1; i < clusterIncstanceSet.length; i++) {
            var meshPrevious = new THREE.Mesh(previousInstance);
            mergedGeometry.merge(mergedGeometry, meshPrevious.matrix);
            previousInstance = clusterIncstanceSet[i];
        }

        mergedGeometry.computeBoundingBox();
        return mergedGeometry.boundingBox.clone();
    };
}