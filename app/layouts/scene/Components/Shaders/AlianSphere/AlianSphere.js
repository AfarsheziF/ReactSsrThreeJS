import * as THREE from "../../../../../../vendor_mods/three/build/three.module.js";

import VS from './VS';
import FS from './FS';

class AlienSphere extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                u_time: {
                    type: "f",
                    value: 0.0
                },
                u_frame: {
                    type: "f",
                    value: 0.0
                },
                u_resolution: {
                    type: "v2",
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio)
                },
                u_mouse: {
                    type: "v2",
                    value: new THREE.Vector2(0.7 * window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio)
                },
                u_radius: {
                    type: "f",
                    value: 10.0
                }
            },
            vertexShader: VS,
            fragmentShader: FS,
            transparent: true,
            extensions: {
                derivatives: true
            }
        })
    }
};

export default AlienSphere;
