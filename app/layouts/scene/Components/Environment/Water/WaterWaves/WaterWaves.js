// https://discourse.threejs.org/t/animated-ocean-waves/43814/19

import * as THREE from "vendor_mods/three/build/three.module";
import { Water } from 'vendor_mods/three/examples/jsm/objects/Water.js';

import VisualComponent from "../../../VisualComponent";
import appUtils from "../../../../../../utils/appUtils";

import frag from "./Shaders/frag";
import vert from "./Shaders/vert";

const waves = {
    "a": {
        "direction": 45,
        "steepness": 0.1,
        "wavelength": 7
    },
    "b": {
        "direction": 306,
        "steepness": 0.2,
        "wavelength": 32
    },
    "c": {
        "direction": 196,
        "steepness": 0.3,
        "wavelength": 59
    }
};

class WaterWaves extends VisualComponent {

    constructor(props) {
        super(props);
        this.init();
    }

    createMesh() {
        const waterGeometry = new THREE.PlaneGeometry(
            this.envParams.size,
            this.envParams.size,
            this.envParams.resolution,
            this.envParams.resolution);

        this.mesh = new Water(waterGeometry, {
            textureWidth: this.envParams.scale,
            textureHeight: this.envParams.scale,
            waterNormals: new THREE.TextureLoader().load('public/images/normalMaps/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Color(this.props.sun),
            sunColor: new THREE.Color(this.props.sunParams.color),
            waterColor: new THREE.Color(this.envParams.uniforms.waterColor),
            distortionScale: this.envParams.uniforms.distortionScale,
            fog: true
        });

        this.mesh.rotation.x = -Math.PI / this.envParams.rotation.x;
        this.mesh.position.set(
            this.envParams.position.x,
            this.envParams.position.y,
            this.envParams.position.z
        );

        this.material = this.mesh.material;
        this.material.uniforms.objectPos = { value: this.mesh.position };
        this.material.uniforms.hideUnderwater = { value: this.envParams.uniforms.hideUnderwater };
        this.material.uniforms.power = { value: this.envParams.uniforms.power };

        this.waves = this.envParams.uniforms.waves || waves;
        this.material.onBeforeCompile = (shader) => {
            shader.uniforms.waveA = {
                value: [
                    Math.sin((this.waves.a.direction * Math.PI) / 180),
                    Math.cos((this.waves.a.direction * Math.PI) / 180),
                    this.waves.a.steepness,
                    this.waves.a.wavelength,
                ],
            };
            shader.uniforms.waveB = {
                value: [
                    Math.sin((this.waves.b.direction * Math.PI) / 180),
                    Math.cos((this.waves.b.direction * Math.PI) / 180),
                    this.waves.b.steepness,
                    this.waves.b.wavelength,
                ],
            };
            shader.uniforms.waveC = {
                value: [
                    Math.sin((this.waves.c.direction * Math.PI) / 180),
                    Math.cos((this.waves.c.direction * Math.PI) / 180),
                    this.waves.c.steepness,
                    this.waves.c.wavelength,
                ],
            };
            shader.vertexShader = vert;
            shader.fragmentShader = frag;
            shader.uniforms.size.value = this.envParams.uniforms.size;
            this.waterCompiled = true;
        };
    }

    getWaveInfo(x, z, time) {
        const pos = new THREE.Vector3();
        const tangent = new THREE.Vector3(1, 0, 0);
        const binormal = new THREE.Vector3(0, 0, 1);
        Object.keys(this.waves).forEach((wave) => {
            const w = this.waves[wave];
            const k = (Math.PI * 2) / w.wavelength;
            const c = Math.sqrt(9.8 / k);
            const d = new THREE.Vector2(
                Math.sin((w.direction * Math.PI) / 180),
                -Math.cos((w.direction * Math.PI) / 180)
            );
            const f = k * (d.dot(new THREE.Vector2(x, z)) - c * time);
            const a = w.steepness / k;
            pos.x += d.y * (a * Math.cos(f));
            pos.y += a * Math.sin(f);
            pos.z += d.x * (a * Math.cos(f));
            tangent.x += -d.x * d.x * (w.steepness * Math.sin(f));
            tangent.y += d.x * (w.steepness * Math.cos(f));
            tangent.z += -d.x * d.y * (w.steepness * Math.sin(f));
            binormal.x += -d.x * d.y * (w.steepness * Math.sin(f));
            binormal.y += d.y * (w.steepness * Math.cos(f));
            binormal.z += -d.y * d.y * (w.steepness * Math.sin(f));
        });
        const normal = binormal.cross(tangent).normalize();
        return {
            position: pos,
            normal: normal,
        };
    }

    updateUniforms() {
        // this.waves = this.envParams.uniforms.waves;

        for (const key in this.envParams.uniforms) {
            if (key.toLocaleLowerCase() === 'color' ||
                (typeof this.envParams.uniforms[key] === 'string' && this.envParams.uniforms[key].indexOf('#') === 0)) {
                this.material.uniforms[key].value = new THREE.Color(this.envParams.uniforms[key]);
            }
            else if (key === 'waves') {
                this.material.uniforms.waveA = {
                    value: [
                        Math.sin((this.waves.a.direction * Math.PI) / 180),
                        Math.cos((this.waves.a.direction * Math.PI) / 180),
                        this.waves.a.steepness,
                        this.waves.a.wavelength,
                    ],
                };
                this.material.uniforms.waveB = {
                    value: [
                        Math.sin((this.waves.b.direction * Math.PI) / 180),
                        Math.cos((this.waves.b.direction * Math.PI) / 180),
                        this.waves.b.steepness,
                        this.waves.b.wavelength,
                    ],
                };
                this.material.uniforms.waveC = {
                    value: [
                        Math.sin((this.waves.c.direction * Math.PI) / 180),
                        Math.cos((this.waves.c.direction * Math.PI) / 180),
                        this.waves.c.steepness,
                        this.waves.c.wavelength,
                    ],
                };
            }
            else {
                this.material.uniforms[key].value = this.envParams.uniforms[key];
            }
        }
    }

    onGuiUpdate({ controller }) { }

    setRotation(newRotation) {
        // if (this.mesh) {
        //     this.mesh.rotation.x = Math.PI * newRotation.x;
        //     this.mesh.rotation.y = Math.PI * newRotation.y;
        //     this.mesh.rotation.z = Math.PI * newRotation.z;
        // }
    }

    //

    update({ time, deltaTime }) {
        this.mesh.material.uniforms['objectPos'].value = this.mesh.position;
        this.mesh.material.uniforms['power'].value = this.envParams.uniforms.power;
        this.mesh.material.uniforms['time'].value += this.envParams.waterSpeed * deltaTime;
    }

}

export default WaterWaves;