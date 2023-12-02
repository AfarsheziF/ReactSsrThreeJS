import * as THREE from "../../../../../../vendor_mods/three/build/three.module";
import { GPUComputationRenderer } from '../../../../../../vendor_mods/three/examples/jsm/misc/GPUComputationRenderer.js';

import BlobShaderFS from "./BlobShaderFS.js";
import BlobShaderVS from "./BlobShaderVS";
import computeShaderVelocity from "./ComputeShaderVelocity";
import computeShaderPosition from "./ComputeShaderPosition";
import computeShaderNormal from "./ComputeShaderNormal"
import computeShaderBlurPos from "./computeShaderBlurPos";

import utils from '../../../../../utils/utils';

let WIDTH = 1024;
const PI = 3.1415926535897932384626433832795;
const TWO_PI = PI * 2.0;
const HALF_PI = PI / 2.0;

let gpuCompute;

let velocityVariable;
let positionVariable;
let normalVariable;
let blurPosVariable;

let dtPosition;
let dtVelocity;
let dtNormal;
let dtBlurPos;

let currentVelocityMul = 0.01;

// smooths values towards a target
class Ior {
    maxAccr = 0.001; maxSpeed = 0.1; dist = 10.0; t = 0.0; v = 0.0; s = 0.0;
    get next() {
        let o = this.t - this.v;
        let d = Math.min(this.dist, Math.abs(o));
        o = Math.sign(o) * (d / this.dist) * this.maxSpeed;
        this.s += Math.min(Math.max(o - this.s, -this.maxAccr), this.maxAccr);
        this.s = Math.min(Math.max(this.s, -this.maxSpeed), this.maxSpeed);
        this.v += this.s;
        return this.v;
    }
}
let smoothCameraNear = new Ior()

const BlobPlanet = {

    mesh: null,
    sceneObjects: [],

    init(renderer, scene, camera, envParams, position, gui) {
        console.log('BlobPlanet init');

        const that = this;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.envParams = envParams.components.blobPlanet;
        this.position = position;
        this.gui = gui;
        this.frameCount = 0;
        this.currentTimeVertical = 0;

        this.envParams.sineWaveColor = new THREE.Color(
            this.envParams.sineWaveColor.x,
            this.envParams.sineWaveColor.y,
            this.envParams.sineWaveColor.z
        )
        this.envParams.ambientLightColor = new THREE.Color(
            this.envParams.ambientLightColor.x,
            this.envParams.ambientLightColor.y,
            this.envParams.ambientLightColor.z
        )
        this.envParams.gradientColor1 = new THREE.Color(
            this.envParams.gradientColor1.x,
            this.envParams.gradientColor1.y,
            this.envParams.gradientColor1.z
        )
        this.envParams.gradientColor2 = new THREE.Color(
            this.envParams.gradientColor2.x,
            this.envParams.gradientColor2.y,
            this.envParams.gradientColor2.z
        )

        WIDTH = this.envParams.width;

        if (utils.isMobile) {
            // this.envParams.meshDetail = this.envParams.meshDetail_ios;
            WIDTH = this.envParams.width_mobile;
            // this.envParams.sineWavesAutoResize = false; 
        }

        return new Promise((resolve, reject) => {
            let geometry;
            if (utils.osType.toLowerCase() === 'macos' || utils.osType.toLowerCase() === 'ios') {
                geometry = new THREE.SphereBufferGeometry(1, this.envParams.meshDetail, this.envParams.meshDetail);
            } else {
                geometry = new THREE.IcosahedronGeometry(1, this.envParams.meshDetail);
            }


            that.geometryUniforms = {
                time: { value: 0.0 },
                vertPosTexture: { type: "t", value: null },
                vertNormalTexture: { type: "t", value: null },
                velTexture: { type: "t", value: null },
                opacity: { value: that.envParams.opacity },
                rimPower: { value: that.envParams.rimPower },
                rimStrength: { value: that.envParams.rimStrength },

                sineWavesStrength: { value: that.envParams.sineWavesStrength },
                sineWavesSpeed: { value: that.envParams.sineWavesSpeed },
                sineWavesPow: { value: that.envParams.sineWavesPow },
                sineWavesScale: { value: that.envParams.sineWavesScale },
                sineWavesCustomScale: { value: that.envParams.sineWavesCustomScale },
                sineWaveColor: { value: that.envParams.sineWaveColor },
                sineWavesAutoResize: { value: that.envParams.sineWavesAutoResize },

                ambientLightsStrength: { value: that.envParams.ambientLightsStrength },

                ambientLightColor: { value: that.envParams.ambientLightColor },
                velColorStrength: { value: that.envParams.velColorStrength },
                posColorScale: { value: that.envParams.posColorScale },
                gradientColor1: { value: that.envParams.gradientColor1 },
                gradientColor2: { value: that.envParams.gradientColor2 },
                gradientColorStrength: { value: that.envParams.gradientColorStrength }
            };

            const material = new THREE.ShaderMaterial({
                vertexShader: BlobShaderVS,
                fragmentShader: BlobShaderFS,
                uniforms: that.geometryUniforms,
                side: THREE.DoubleSide,
                precision: "highp",
                transparent: true,
                //depthFunc: THREE.LessDepth,
                //blending: THREE.AdditiveBlending,
                wireframe: that.envParams.wireframe
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            scene.add(mesh);

            that.mesh = mesh;

            initComputeRenderer();
            initGui();

            const error = gpuCompute.init();
            if (error !== null) {
                console.error(error);
                reject(error);
            } else {
                resolve();
            }

            function initComputeRenderer() {
                gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

                if (renderer.capabilities.isWebGL2 === false) {
                    gpuCompute.setDataType(THREE.HalfFloatType);
                }

                dtVelocity = gpuCompute.createTexture();
                dtPosition = gpuCompute.createTexture();
                dtNormal = gpuCompute.createTexture();
                dtBlurPos = gpuCompute.createTexture();

                // that.fillTextures();

                velocityVariable = gpuCompute.addVariable('textureVelocity', computeShaderVelocity, dtVelocity);
                positionVariable = gpuCompute.addVariable('texturePosition', computeShaderPosition, dtPosition);
                normalVariable = gpuCompute.addVariable('textureNormal', computeShaderNormal, dtNormal);
                blurPosVariable = gpuCompute.addVariable('textureBlurPos', computeShaderBlurPos, dtBlurPos);

                // Set wrapping
                velocityVariable.wrapS = THREE.RepeatWrapping;
                velocityVariable.wrapT = THREE.RepeatWrapping;

                positionVariable.wrapS = THREE.RepeatWrapping;
                //positionVariable.wrapT = THREE.RepeatWrapping;

                normalVariable.wrapS = THREE.RepeatWrapping;
                normalVariable.wrapT = THREE.RepeatWrapping;

                blurPosVariable.wrapS = THREE.RepeatWrapping;
                blurPosVariable.wrapT = THREE.RepeatWrapping;

                gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
                gpuCompute.setVariableDependencies(blurPosVariable, [blurPosVariable, positionVariable]);
                gpuCompute.setVariableDependencies(normalVariable, [normalVariable, blurPosVariable]);
                gpuCompute.setVariableDependencies(velocityVariable, [velocityVariable, blurPosVariable]);

                that.velocityUniforms = velocityVariable.material.uniforms;
                that.positionUniforms = positionVariable.material.uniforms;
                that.normalUniforms = normalVariable.material.uniforms;
                that.blurPosUniforms = blurPosVariable.material.uniforms;

                // objects in space
                let objectsPositions = [],
                    objectsRadius = [],
                    objectsInteracted = [];
                for (let i = 0; i < 50; i++) {
                    objectsPositions[i] = new THREE.Vector3(0, 0, 0);
                    objectsRadius[i] = 0.0;
                    objectsInteracted[i] = 0.0;
                }

                that.velocityUniforms['time'] = { value: 0.0 };
                that.velocityUniforms['objectsPositions'] = { value: objectsPositions };
                that.velocityUniforms['objectsRadius'] = { value: objectsRadius };
                that.velocityUniforms['objectsInteracted'] = { value: objectsInteracted };
                that.velocityUniforms['objectsCount'] = { value: 0 };
                that.velocityUniforms['origin'] = { value: position };
                that.velocityUniforms['seed'] = { value: Math.random() * 100.0 };
                that.velocityUniforms['reset'] = { value: 0.0 };
                that.velocityUniforms['collisionsClusterNoiseScale'] = { value: that.envParams.collisionsClusterNoiseScale }

                that.positionUniforms['velocity'] = { value: that.envParams.velocity };
                that.positionUniforms['reset'] = { value: 0.0 };
            }

            function initGui() {
                if (gui) {
                    const guiFolder = gui.addFolder('Blob Planet').close();
                    guiFolder.add(that.envParams, 'visible');
                    guiFolder.add(that.envParams, 'meshDetail', 10, 500, 1);
                    guiFolder.add(that.envParams, 'wireframe');
                    guiFolder.add(that.envParams, 'opacity', 0, 1);
                    guiFolder.add(that.envParams, 'velocity', 0, 100);
                    guiFolder.add(that.envParams, 'rimPower', 0, 5.0);
                    guiFolder.add(that.envParams, 'rimStrength', 0, 1.0);

                    guiFolder.add(that.envParams, 'sineWavesStrength', 0, 1.0);
                    // guiFolder.add(that.envParams, 'sineWavesSpeed', 0.0, 10.0);
                    guiFolder.add(that.envParams, 'sineWavesPow', 0, 10.0);
                    guiFolder.add(that.envParams, 'sineWavesCustomScale', 0, 10.0);
                    guiFolder.addColor(that.envParams, 'sineWaveColor');
                    guiFolder.add(that.envParams, 'sineWavesAutoResize');

                    guiFolder.add(that.envParams, 'velColorStrength', 0.0, 1.0);

                    guiFolder.addColor(that.envParams, 'gradientColor1');
                    guiFolder.addColor(that.envParams, 'gradientColor2');
                    guiFolder.add(that.envParams, 'gradientColorStrength', 0.0, 1.0);

                    guiFolder.addColor(that.envParams, 'ambientLightColor');
                    guiFolder.add(that.envParams, 'ambientLightsStrength', 0, 1.0);

                    guiFolder.add(that.envParams, 'collisionsClusterNoiseScale', 0, 100.0);
                }
            }
        })
    },

    fillTextures() {
        const radius = 1.0;
        const velocity = this.envParams.velocity;
        const N = WIDTH * 4;
        let pos = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < dtPosition.image.data.length; i += 4) {
            // normalized UV
            let u = (i % N) / (N * 1.0);
            let v = (i / N) / (WIDTH * 1.0);

            let vSigned = Math.sin(v * PI - HALF_PI);
            let radiusAtV = Math.sqrt(1.0 - vSigned * vSigned);
            let phi = u * TWO_PI - HALF_PI;
            pos.z = radius * Math.cos(phi) * radiusAtV;
            pos.x = radius * Math.sin(phi) * radiusAtV;
            pos.y = radius * vSigned;

            // initial position
            dtPosition.image.data[i + 0] = pos.x;
            dtPosition.image.data[i + 1] = pos.y;
            dtPosition.image.data[i + 2] = pos.z;
            dtPosition.image.data[i + 3] = 1.0;

            // initial normal
            pos.normalize();
            dtNormal.image.data[i + 0] = pos.x;
            dtNormal.image.data[i + 1] = pos.y;
            dtNormal.image.data[i + 2] = pos.z;
            dtNormal.image.data[i + 3] = 1.0;

            // initial velocity
            pos.multiplyScalar(velocity);
            dtVelocity.image.data[i + 0] = pos.x;
            dtVelocity.image.data[i + 1] = pos.y;
            dtVelocity.image.data[i + 2] = pos.z;
            dtVelocity.image.data[i + 3] = 0.0;
        }
    },

    // Setters

    setPosition(position) {
        this.position = position;
        if (this.mesh) {
            this.mesh.position.copy(position);
        }
        this.velocityUniforms.origin.value = position;
    },

    setSceneObjects(objects) {
        this.sceneObjects = objects;
        for (let i in objects) {
            this.velocityUniforms['objectsPositions'].value[i] = objects[i].threeObj.position;
            this.velocityUniforms['objectsRadius'].value[i] = objects[i].scaledRadius;
            // this.velocityUniforms['objectsInteracted'].value[i] = 0.0;
        }
        this.velocityUniforms['objectsCount'] = { value: objects.length };
    },

    updateUniforms() {
        // smoothCameraNear.v = Math.sqrt(this.camera.near); // jump to target
        // smoothCameraNear.t = smoothCameraNear.v;
        // smoothCameraNear.s = 0.0;

        this.geometryUniforms['opacity'].value = this.envParams.opacity;
        this.geometryUniforms['rimPower'].value = this.envParams.rimPower;
        this.geometryUniforms['rimStrength'].value = this.envParams.rimStrength;

        this.geometryUniforms['sineWavesStrength'].value = this.envParams.sineWavesStrength;
        // this.geometryUniforms['sineWavesSpeed'].value = this.envParams.sineWavesSpeed;
        this.geometryUniforms['sineWavesPow'].value = this.envParams.sineWavesPow;
        this.geometryUniforms['sineWavesCustomScale'].value = this.envParams.sineWavesCustomScale;

        this.geometryUniforms['ambientLightsStrength'].value = this.envParams.ambientLightsStrength;
        this.geometryUniforms['velColorStrength'].value = this.envParams.velColorStrength;
        this.geometryUniforms['gradientColorStrength'].value = this.envParams.gradientColorStrength;

        this.mesh.material.wireframe = this.envParams.wireframe;

        this.positionUniforms['velocity'].value = this.envParams.velocity;

        this.velocityUniforms['collisionsClusterNoiseScale'].value = this.envParams.collisionsClusterNoiseScale;
    },

    start() {
        const that = this;
        this.animate = false;
        this.time = 0;
        this.animationTime = 0;
        this.radius = 1.0;
        this.frameCount = 0;
        this.envParams.velocity = this.envParams.initVelocity;

        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        let geometry;
        if (utils.osType.toLowerCase() === 'macos' || utils.osType.toLowerCase() === 'ios') {
            geometry = new THREE.SphereBufferGeometry(1, this.envParams.meshDetail, this.envParams.meshDetail);
        } else {
            geometry = new THREE.IcosahedronGeometry(1, this.envParams.meshDetail);
        }

        smoothCameraNear.v = 25;

        this.geometryUniforms = {
            time: { value: 0.0 },
            vertPosTexture: { type: "t", value: null },
            vertNormalTexture: { type: "t", value: null },
            velTexture: { type: "t", value: null },

            opacity: { value: this.envParams.opacity },
            rimPower: { value: this.envParams.rimPower },
            rimStrength: { value: this.envParams.rimStrength },

            sineWavesStrength: { value: this.envParams.sineWavesStrength },
            sineWavesSpeed: { value: this.envParams.sineWavesSpeed },
            sineWavesPow: { value: this.envParams.sineWavesPow },
            sineWavesScale: { value: this.envParams.sineWavesScale },
            sineWavesCustomScale: { value: this.envParams.sineWavesCustomScale },
            sineWaveColor: { value: this.envParams.sineWaveColor },

            ambientLightsStrength: { value: this.envParams.ambientLightsStrength },
            ambientLightColor: { value: this.envParams.ambientLightColor },
            velColorStrength: { value: this.envParams.velColorStrength },

            gradientColor1: { value: this.envParams.gradientColor1 },
            gradientColor2: { value: this.envParams.gradientColor2 },
            gradientColorStrength: { value: this.envParams.gradientColorStrength }

        };
        const material = new THREE.ShaderMaterial({
            vertexShader: BlobShaderVS,
            fragmentShader: BlobShaderFS,
            uniforms: this.geometryUniforms,
            side: THREE.DoubleSide,
            precision: "highp",
            transparent: true,
            //depthFunc: THREE.LessDepth,
            //blending: THREE.AdditiveBlending,
            wireframe: this.envParams.wireframe
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        this.scene.add(mesh);
        this.mesh = mesh;

        this.velocityUniforms['seed'].value = Math.random() * 100.0;

        dtVelocity = gpuCompute.createTexture();
        dtPosition = gpuCompute.createTexture();
        dtNormal = gpuCompute.createTexture();
        dtBlurPos = gpuCompute.createTexture();
        that.fillTextures();

        // Need to be called serval time for complete reset
        clearTextures();
        clearTextures();
        clearTextures();
        clearTextures();
        clearTextures();
        clearTextures();
        clearTextures();
        clearTextures();

        this.animate = true;

        function clearTextures() {

            that.positionUniforms['texturePosition'].value = dtPosition;
            gpuCompute.doRenderTarget(positionVariable.material, positionVariable.renderTargets[0]);
            gpuCompute.doRenderTarget(positionVariable.material, positionVariable.renderTargets[1]);

            that.blurPosUniforms['textureBlurPos'].value = dtBlurPos;
            gpuCompute.doRenderTarget(blurPosVariable.material, blurPosVariable.renderTargets[0]);
            gpuCompute.doRenderTarget(blurPosVariable.material, blurPosVariable.renderTargets[1]);

            that.velocityUniforms['textureVelocity'].value = dtVelocity;
            gpuCompute.doRenderTarget(velocityVariable.material, velocityVariable.renderTargets[0]);
            gpuCompute.doRenderTarget(velocityVariable.material, velocityVariable.renderTargets[1]);

            that.normalUniforms['textureNormal'].value = dtNormal;
            gpuCompute.doRenderTarget(normalVariable.material, normalVariable.renderTargets[0]);
            gpuCompute.doRenderTarget(normalVariable.material, normalVariable.renderTargets[1]);
        }

    },

    setVelocity(vel) {
        this.envParams.velocity = vel;
        this.animate = vel !== 0.0;
    },

    increaseDecreaseVel(increase) {
        if (increase) {
            this.envParams.velocity += 0.1;
        } else {
            this.envParams.velocity -= 0.1;
        }
        if (this.envParams.velocity < 0.0) {
            this.envParams.velocity = 0.0;
        }
        this.animate = this.envParams.velocity !== 0.0;
        // console.log(this.envParams.velocity);
    },

    animateToRadius(radius, time) {
        console.log(`animateToRadius: ${radius}`, time);
        this.desiredRadius = radius;
        this.onNewRadiusAnimation = true;
        currentVelocityMul = 1.0;
        if (time < this.animationTime) {
            // restart and animate to selected time
            this.currentTimeVertical = time;
            this.start();
        } else {
            this.currentTimeVertical = 0;
            this.currentTimeVertical = Math.abs(time - Math.round(this.time));
        }
    },

    updateSettings(settings) {
        this.envParams.meshDetail = parseInt(settings.meshDetail);
    },

    // Runnables

    update(time) {
        //Down to seconds resolution
        this.timeUpdated = false;
        this.time = time;
        let roundTime = Math.round(time) + this.currentTimeVertical;
        if (this.animate && roundTime > this.animationTime) {
            // Fix hold time vertical
            // let vertical = Math.abs(roundTime - this.animationTime);
            // if (vertical > 1) {
            //     roundTime -= (vertical - 1);
            // }
            this.animationTime = roundTime;
            // this.time = Math.round(time);
            this.timeUpdated = true;
        }
    },

    render(time) {
        if (this.animate) {
            this.frameCount++;

            gpuCompute.compute();

            this.texturePosition = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
            this.textureVelocity = gpuCompute.getCurrentRenderTarget(velocityVariable).texture;
            this.textureNormal = gpuCompute.getCurrentRenderTarget(normalVariable).texture;
            this.textureBlurPos = gpuCompute.getCurrentRenderTarget(blurPosVariable).texture;

            // ComputeShaderPosition.js
            if (this.positionUniforms['velocity'].value < 0.0 && this.radius < 0.0) {
                this.positionUniforms['velocity'].value = 0.0;
                this.animate = false;
            } else {
                this.positionUniforms['velocity'].value = this.camera.near * this.envParams.velocity * currentVelocityMul;
            }

            // WrappingSphere
            this.radius += this.positionUniforms['velocity'].value;
            // this.wrappingSphere.scale.set(this.radius, this.radius, this.radius);

            if (this.onNewRadiusAnimation && this.radius > this.desiredRadius) {
                this.onNewRadiusAnimation = false;
                currentVelocityMul = 0.01;
            }

            // ComputeShaderVelocity.js
            this.velocityUniforms['time'].value = time;
            if (this.helpBox) {
                this.helpBox.update();
            }

            // BlobShaderVS.js (rendering)
            // this.geometryUniforms['vertPosTexture'].value = this.textureBlurPos;
            this.geometryUniforms['vertPosTexture'].value = this.texturePosition; //Skipping blur
            this.geometryUniforms['vertNormalTexture'].value = this.textureNormal;
            this.geometryUniforms['velTexture'].value = this.textureVelocity;
            if (this.envParams.sineWavesAutoResize) {
                smoothCameraNear.t = Math.sqrt(this.camera.near); // set target
                this.geometryUniforms['sineWavesScale'].value = Math.pow(smoothCameraNear.next, 4) * 0.1;
            }
            this.geometryUniforms['time'].value = time;

            // this.animationTime = time;
        }
    }
}

export default BlobPlanet;