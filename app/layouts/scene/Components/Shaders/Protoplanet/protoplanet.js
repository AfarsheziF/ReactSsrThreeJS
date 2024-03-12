import * as THREE from "../../../../../../vendor_mods/three/build/three.module.js";
import { GPUComputationRenderer } from '../../../../../../vendor_mods/three/examples/jsm/misc/GPUComputationRenderer.js';
import { ConvexGeometry } from '../../../../../../vendor_mods/three/examples/jsm/geometries/ConvexGeometry.js';

import computeShaderVelocity from "./computeShaderVelocity.js";
import computeShaderPosition from "./computeShaderPosition.js";
import particleVertexShader from './particleVertexShader';
import particleFragmentShader from "./particleFragmentShader.js";
import VisualComponents from "../../VisualComponents.js";

const AMOUNT = 100;
const WIDTH = Math.sqrt(AMOUNT);
const PARTICLES = AMOUNT;
var currentPoints = 0;
var currentPointsIndex = 0;

var gpuCompute;
var velocityVariable;
var positionVariable;

var dtPosition;
var dtVelocity;
// var dtTemp;

const Protoplanet = {

    particles: null,
    convexMesh: null,

    renderer: null,
    scene: null,
    camera: null,
    objects: [],
    renderTarget: null,

    velocityUniforms: null,
    particleUniforms: null,

    envParams: null,

    init(renderer, scene, camera, position) {
        const that = this;
        return new Promise((resolve, reject) => {
            that.renderer = renderer;
            that.scene = scene;
            that.camera = camera;
            that.envParams = {
                amount: PARTICLES,
                origin: position,
                // Can be changed dynamically
                // gravityConstant: 100.0,
                gravityConstant: 10.0,
                density: 0.45,

                // Must restart simulation
                // radius: 300,
                radius: 10,
                height: 8,
                exponent: 0.0,
                maxMass: 5.0,
                velocity: 15.0,
                initVelocity: 10.0,
                // velocity: 10,
                velocityExponent: 0.0,
                randVelocity: 0.001,

                randomLifetime: true,
                size: 1.5,
                lifetime: 600.0,
                speed: 1.0,
                pulsSpeed: 0.05,
                visible: true,
                opacity: 1.0,
                growInc: 0.005,
                growThreshold: 500.0,
                color: new THREE.Color(0xffffff)
            };

            // camera.layers.enable(0);
            // camera.layers.enable(1);

            initComputeRenderer();

            function initComputeRenderer() {
                // effectController = {
                //     // Can be changed dynamically
                //     // gravityConstant: 100.0,
                //     gravityConstant: 10.0,
                //     density: 0.45,

                //     // Must restart simulation
                //     radius: 500,
                //     // radius: 100,
                //     height: 8,
                //     exponent: 0.4,
                //     maxMass: 15.0,
                //     velocity: 70,
                //     // velocity: 10,
                //     velocityExponent: 0.2,
                //     randVelocity: 0.001
                // };
                that.sPositions = VisualComponents.getRandomSphericalPositionsWithBias(PARTICLES, 1, 0.5);

                gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

                if (renderer.capabilities.isWebGL2 === false) {
                    gpuCompute.setDataType(THREE.HalfFloatType);
                }

                dtPosition = gpuCompute.createTexture();
                dtVelocity = gpuCompute.createTexture();
                // dtTemp = gpuCompute.createTexture();

                that.fillTextures(dtPosition, dtVelocity);

                velocityVariable = gpuCompute.addVariable('textureVelocity', computeShaderVelocity, dtVelocity); // +"#define NUM_PARCELS
                positionVariable = gpuCompute.addVariable('texturePosition', computeShaderPosition, dtPosition);

                gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
                gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);

                that.velocityUniforms = velocityVariable.material.uniforms;
                that.positionUniforms = positionVariable.material.uniforms;

                let objectsPositions = [], objectsRadius = [];
                for (let i = 0; i < 50; i++) {
                    objectsPositions[i] = new THREE.Vector3(0, 0, 0);
                    objectsRadius[i] = 0.0;
                }
                that.velocityUniforms['gravityConstant'] = { value: that.envParams.gravityConstant };
                that.velocityUniforms['density'] = { value: that.envParams.density };
                that.velocityUniforms['time'] = { value: 0.0 };
                that.velocityUniforms['objectsPositions'] = { value: objectsPositions };
                that.velocityUniforms['objectsRadius'] = { value: objectsRadius };
                that.velocityUniforms['objectsCount'] = { value: 0 };
                that.velocityUniforms['origin'] = { value: that.envParams.origin }
                that.velocityUniforms['velocity'] = { value: that.envParams.velocity }
                that.velocityUniforms['gravityConstant'].value = that.envParams.gravityConstant;
                that.velocityUniforms['density'].value = that.envParams.density;

                that.positionUniforms['time'] = { value: 0.0 };
                that.positionUniforms['lifetime'] = { value: that.envParams.lifetime }
                that.positionUniforms['origin'] = { value: that.envParams.origin }
                that.positionUniforms['velocity'] = { value: that.envParams.velocity }

                // that.renderTarget = new THREE.WebGLRenderTarget(WIDTH, WIDTH);

                const error = gpuCompute.init();

                if (error !== null) {
                    console.error(error);
                    reject(error);
                } else {
                    resolve();
                }
            }
        })
    },

    fillTextures(texturePosition, textureVelocity) {
        const posArray = texturePosition.image.data;
        const velArray = textureVelocity.image.data;

        // const radius = this.envParams.radius;
        // const height = effectController.height;
        // const exponent = this.envParams.exponent;
        // const maxMass = effectController.maxMass * 1024 / PARTICLES;
        // const maxVel = effectController.velocity;
        // const velExponent = effectController.velocityExponent;
        // const randVel = effectController.randVelocity;
        // console.log(posArray.length);

        // let offset = 2 / PARTICLES;
        // let increment = Math.PI * (3 - Math.sqrt(5));
        // let random = Math.random() * PARTICLES;
        let counter = 0;

        // let positions = visualComponents.getSphericalPositionsWithBias(PARTICLES, 1, 0.5);

        for (let k = 0; k < posArray.length; k += 4) {

            // Position
            let x = 0,
                y = 0,
                z = 0,
                rr = 1;

            // do {
            //     x = (Math.random() * 2 - 1);
            //     y = (Math.random() * 2 - 1);
            //     z = (Math.random() * 2 - 1);
            //     rr = x * x + y * y + z * z;
            // } while (rr > 1);

            rr = Math.sqrt(rr);

            // const rExp = this.envParams.radius * Math.pow(rr, exponent);

            // Velocity
            // const vel = maxVel * Math.pow(rr, velExponent);
            // const vel = maxVel * Math.pow(1, velExponent);
            // const vel = this.envParams.velocity;

            // let vy = ((k * offset) - 1) + (offset / 2);
            // let distance = Math.sqrt(1 - Math.pow(vy, 2));
            // // let _phi = (k % PARTICLES) * increment;
            // let _phi = ((k + random) % PARTICLES) * increment;
            // let vx = Math.cos(_phi) * distance;
            // let vz = Math.sin(_phi) * distance;

            let vx = this.sPositions[counter].x;
            let vy = this.sPositions[counter].y;
            let vz = this.sPositions[counter].z;
            counter++;

            // x *= rExp;
            // y *= rExp;
            // z *= rExp;
            // const y = (Math.random() * 2 - 1) * height;

            // const mass = Math.random() * maxMass + 1;
            const mass = this.envParams.maxMass;

            // Fill in texture values
            posArray[k + 0] = x;
            posArray[k + 1] = y;
            posArray[k + 2] = z;
            // posArray[k + 3] = Math.random() * 3600 - 1;
            posArray[k + 3] = Math.random() * this.envParams.lifetime / 2 - 1;
            // posArray[k + 3] = this.envParams.lifetime;
            // posArray[k + 3] = 0.0;

            velArray[k + 0] = vx * this.envParams.initVelocity;
            velArray[k + 1] = vy * this.envParams.initVelocity;
            velArray[k + 2] = vz * this.envParams.initVelocity;
            velArray[k + 3] = mass;
        }
    },

    setSceneObjects(objects) {
        this.sceneObjects = objects;
        for (let i in objects) {
            this.velocityUniforms['objectsPositions'].value[i] = objects[i].threeObj.position;
            this.velocityUniforms['objectsRadius'].value[i] = objects[i].radius;
        }
        this.velocityUniforms['objectsCount'] = { value: objects.length };
    },

    initParticles(renderer, scene, camera) {
        const that = this;
        if (this.particles) {
            scene.remove(this.particles);
            this.init(renderer, scene, camera, that.envParams.origin).then(
                () => {
                    that.setSceneObjects(that.sceneObjects)
                    start();
                },
                (e) => {
                    console.log(e);
                }
            )
        } else {
            start();
        }

        function start() {
            let geometry = new THREE.BufferGeometry();
            console.log(`PARTICLES: ${PARTICLES}. WIDTH: ${WIDTH}`);

            const positions = new Float32Array(PARTICLES * 3);
            let p = 0, random = Math.random() * PARTICLES;

            let offset = 2 / PARTICLES;
            let increment = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < PARTICLES; i++) {
                // positions[p++] = (Math.random() * 2 - 1) * that.envParams.radius;
                // positions[p++] = (Math.random() * 2 - 1) * that.envParams.radius;
                // positions[p++] = (Math.random() * 2 - 1) * that.envParams.radius;

                // let y = ((i * offset) - 1) + (offset / 2);
                // let distance = Math.sqrt(1 - Math.pow(y, 2));
                // // let _phi = (i % PARTICLES) * increment;
                // let _phi = ((i + random) % PARTICLES) * increment;
                // let x = Math.cos(_phi) * distance;
                // let z = Math.sin(_phi) * distance;
                // positions[p++] = x * that.envParams.radius;
                // positions[p++] = y * that.envParams.radius;
                // positions[p++] = z * that.envParams.radius;

                positions[p++] = that.sPositions[i].x;
                positions[p++] = that.sPositions[i].y;
                positions[p++] = that.sPositions[i].z;

            }

            const uvs = new Float32Array(PARTICLES * 2);
            p = 0;
            for (let j = 0; j < WIDTH; j++) {
                for (let i = 0; i < WIDTH; i++) {
                    uvs[p++] = i / (WIDTH - 1);
                    uvs[p++] = j / (WIDTH - 1);
                }
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

            that.particleUniforms = {
                texturePosition: { value: null },
                textureVelocity: { value: null },
                cameraConstant: { value: getCameraConstant() },
                density: { value: that.envParams.density },
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(1 / WIDTH, 1 / WIDTH) },
                color: { value: new THREE.Color(that.envParams.color) },
                opacity: { value: that.envParams.opacity },
                size: { value: that.envParams.size },
                origin: { value: that.envParams.origin },
                pulsSpeed: { value: that.envParams.pulsSpeed },
                growInc: { value: that.envParams.growInc },
                growThreshold: { value: that.envParams.growThreshold }
            };

            // THREE.ShaderMaterial
            const material = new THREE.ShaderMaterial({
                uniforms: that.particleUniforms,
                vertexShader: particleVertexShader,
                fragmentShader: particleFragmentShader,

                depthTest: true,
                transparent: true,
                blending: THREE.NormalBlending,
                // blending: THREE.AdditiveBlending,
                // blending: THREE.MultiplyBlending
                // color: that.particleUniforms.color
            });
            material.extensions.drawBuffers = true;

            that.particles = new THREE.Points(geometry, material);
            that.particles.position.copy(that.envParams.origin);
            // that.particles.matrixAutoUpdate = false;
            // that.particles.updateMatrix();
            that.particles.visible = that.envParams.visible;
            // that.particles.layers.set(1);
            scene.add(that.particles);
        }

        function getCameraConstant() {
            return window.innerHeight / (Math.tan(THREE.MathUtils.DEG2RAD * 0.5 * camera.fov) / camera.zoom);
        }
    },

    addParticles() {
        // let positions = this.particles.geometry.attributes.position.array;
        // let uvs = this.particles.geometry.attributes.uv.array;
        // console.log(this.particles.geometry.attributes.position);

        // let newCount = currentPoints + 50;
        // let prevCurrentPointsIndex = currentPointsIndex;

        // for (let i = currentPoints; i < newCount; i++) {
        //     positions[currentPointsIndex++] = (Math.random() * 2 - 1) * 100;
        //     positions[currentPointsIndex++] = 0; //( Math.random() * 2 - 1 ) * effectController.radius;
        //     positions[currentPointsIndex++] = (Math.random() * 2 - 1) * 100;
        // }

        // for (let j = 0; j < WIDTH; j++) {
        //     for (let i = 0; i < WIDTH; i++) {
        //         uvs[prevCurrentPointsIndex++] = i / (WIDTH - 1);
        //         uvs[prevCurrentPointsIndex++] = j / (WIDTH - 1);
        //     }
        // }

        // currentPoints = newCount;

        // // this.fillTextures(dtPosition, dtVelocity);

        // this.particles.geometry.attributes.uv.needsUpdate = true;
        // this.particles.geometry.attributes.position.needsUpdate = true;
        // // this.particles.geometry.setDrawRange(0, currentPoints);
        // console.log(this.particles.geometry.attributes.position);

    },

    guiUpdate(guiController) {
        if (this.particles) {
            this.particles.visible = this.envParams.visible;

            this.particleUniforms['pulsSpeed'].value = this.envParams.pulsSpeed;
            this.particleUniforms['size'].value = this.envParams.size;
            this.particleUniforms['opacity'].value = this.envParams.opacity;
            this.particleUniforms['growInc'].value = this.envParams.growInc;
            this.particleUniforms['growThreshold'].value = this.envParams.growThreshold;
            this.particleUniforms['color'].value = new THREE.Color(this.envParams.color);

            this.velocityUniforms['velocity'].value = this.envParams.velocity;

            this.positionUniforms['lifetime'].value = this.envParams.lifetime;
            this.positionUniforms['velocity'].value = this.envParams.velocity;
        }
    },

    render(time) {
        if (this.particles) {
            gpuCompute.compute();

            // this.renderer.setRenderTarget(this.renderTarget);
            // this.renderer.render(this.scene, this.camera);
            // this.renderer.setRenderTarget(null);
            // this.renderer.clear();

            //renderTarget.readRenderTargetPixels();

            // const pixelBuffer = new Uint8Array(4);
            // const pixels = new Float32Array(WIDTH * WIDTH);
            // const currentRenderTarget = gpuCompute.getCurrentRenderTarget(velocityVariable);
            // this.renderer.readRenderTargetPixels(currentRenderTarget, 0, 0, 1, 1, pixels);

            this.particleUniforms['texturePosition'].value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
            this.particleUniforms['textureVelocity'].value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture;
            this.particleUniforms['time'].value = time * this.envParams.speed;
            this.particleUniforms['origin'].value = this.envParams.origin;

            this.velocityUniforms['time'].value = time * this.envParams.speed;
            this.velocityUniforms['origin'].value = this.envParams.origin;

            this.positionUniforms['origin'].value = this.envParams.origin;
            this.positionUniforms['time'].value = time * this.envParams.speed;


            // this.particles.geometry.getAttribute('position').needsUpdate = true;
            // this.particles.geometry.getAttribute('uv').needsUpdate = true;

            // this.renderer.copyTextureToTexture(new THREE.Vector2(0, 0), renderTarget.texture, dtTemp);

            // this.convexMesh.geometry.setAttribute('position', this.particles.geometry.getAttribute('position'));
            // this.convexMesh.geometry.attributes.position.needsUpdate = true;

            // let positions = this.particles.geometry.attributes['position'];

            // this.renderer.setRenderTarget(null);
            // this.renderer.render(this.scene, this.camera);
        }
    }

}

export default Protoplanet;