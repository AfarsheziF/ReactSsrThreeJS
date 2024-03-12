import * as THREE from "vendor_mods/three/build/three.module";
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

import VisualComponent from "../../../VisualComponent";
import frag from "./Shaders/frag";
import vert from "./Shaders/vert";

class SeaScape extends VisualComponent {

    constructor(name, envParams, textureLoader) {
        super(name, envParams, textureLoader);

        const plane = new THREE.PlaneGeometry(100, 100, 100, 100);

        //plane.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                angv: { type: 'v3', value: new THREE.Vector2(1, 1, 1) },
                ang: { type: 'v3', value: new THREE.Vector2(1, 1, 1) },
                ori: { type: 'v3', value: new THREE.Vector2(1, 1, 1) },
                dir: { type: 'v3', value: new THREE.Vector2(1, 1, 1) },
                time: { type: 'f', value: 0.0 }
            },
            vertexShader: vert,
            fragmentShader: frag,
            transparent: true,
        })

        this.mesh = new THREE.Mesh(plane, this.material);
        this.mesh.rotation.x = Math.PI / -2;
    }

    update({ time, camera }) {
        this.material.uniforms.time.value = time;
        this.material.uniforms.ang.value = camera.rotation;
        const angv = camera.position.clone();
        angv.normalize();
        angv.applyQuaternion(camera.quaternion);
        this.material.uniforms.angv.value = angv;
        const ori = new THREE.Vector3();
        ori.x = camera.position.x;
        ori.y = camera.position.z;
        ori.z = camera.position.y;
        this.material.uniforms.ori.value = camera.position.clone().multiplyScalar(1);
        // this.material.uniforms.dir.value = dir;
    }
}

export default SeaScape;