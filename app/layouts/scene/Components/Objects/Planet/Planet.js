import * as THREE from "../../../../../vendor_mods/three/build/three.module";

import TerrainFace from "./TerrainFace";

class Planet {

    resolution = 10;
    terrainFaces;

    init(scene) {
        this.terrainFaces = [];
        const directions = [
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, -1, 0)
        ];

        for (let i = 0; i < 6; i++) {
            this.terrainFaces[i] = new TerrainFace(null, this.resolution, directions[i]);
            this.terrainFaces[i].ConstructMesh();
            scene.add(this.terrainFaces[i].mesh);
        }
    }
}

export default Planet;