import * as THREE from 'three';

class ClusterUtil {

    calculateBBox(clusterIncstanceSet: THREE.Geometry[]): THREE.Box3  { // for return null to work set method return types to THREE.Box3 | null
        if (clusterIncstanceSet.isEmpty()) { // .length == 0
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