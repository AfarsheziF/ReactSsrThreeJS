import * as THREE from "../../../../../../vendor_mods/three/build/three.module";

class TerrainFace {
    mesh;
    resolution;
    localUp;
    axisA;
    axisB;

    constructor(mesh, resolution, localUp) {
        this.mesh = mesh;
        this.resolution = resolution;
        this.localUp = localUp;

        this.axisA = new THREE.Vector3(this.localUp.y, this.localUp.z, this.localUp.x);
        this.axisB = localUp.cross(this.axisA);
    }

    ConstructMesh() {
        const vertices = [];
        const triangles = [];
        let triIndex = 0;

        const div = new THREE.Vector2(this.resolution - 1, this.resolution - 1);

        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                const i = x + y * this.resolution;
                const percent = new THREE.Vector2(x, y).divide(div);
                const a = new THREE.Vector2((percent.x - .5) * 2 * this.axisA, (percent.y - .5) * 2 * this.axisB);
                const pointOnUnitCube = new THREE.Vector3(this.localUp).add(a);
                vertices[i] = pointOnUnitCube;

                if (x !== this.resolution - 1 && y !== this.resolution - 1) {
                    triangles[triIndex] = i;
                    triangles[triIndex + 1] = i + this.resolution + 1;
                    triangles[triIndex + 2] = i + this.resolution + 1;

                    triangles[triIndex + 3] = i;
                    triangles[triIndex + 4] = i + 1;
                    triangles[triIndex + 5] = i + this.resolution + 1;
                    triIndex += 6;
                }
            }
        }

        // this.mesh.Clear();
        // this.mesh.vertices = vertices;
        // this.mesh.triangles = triangles;
        // this.mesh.uv = uvs;
        // this.mesh.RecalculateNormals();

        // console.log(triangles);
        // console.log(vertices);
        // const vert = new Float32Array(triangles);

        // const geometry = new THREE.BufferGeometry();
        // // geometry.setIndex(vertices);
        // geometry.setAttribute('position', new THREE.BufferAttribute(vert, 3));
        // geometry.computeVertexNormals();
        // const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        // this.mesh = new THREE.Mesh(geometry, material);
    };
}

export default TerrainFace;