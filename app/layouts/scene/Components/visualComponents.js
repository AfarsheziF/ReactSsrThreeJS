import * as THREE from "../../../../vendor_mods/three/build/three.module.js";
// import GUI from 'lil-gui';
var GUI;

import { OBJLoader } from '../../../../vendor_mods/three/examples/jsm/loaders/OBJLoader.js';

import { FontLoader } from '../../../../vendor_mods/three/examples/jsm/loaders/FontLoader';
import { OrbitControls } from "../../../../vendor_mods/three/examples/jsm/controls/OrbitControls"
import { TrackballControls } from '../../../../vendor_mods/three/examples/jsm/controls/TrackballControls';

import { TextGeometry } from "../../../../vendor_mods/three/examples/jsm/geometries/TextGeometry";
import { ConvexObjectBreaker } from '../../../../vendor_mods/three/examples/jsm/misc/ConvexObjectBreaker';

import { EffectComposer } from '../../../../vendor_mods/three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from '../../../../vendor_mods/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../../../../vendor_mods/three/examples/jsm/postprocessing/ShaderPass.js';
import { SavePass } from '../../../../vendor_mods/three/examples/jsm/postprocessing/SavePass.js';
import { UnrealBloomPass } from '../../../../vendor_mods/three/examples/jsm/postprocessing/UnrealBloomPass';

import { BlendShader } from '../../../../vendor_mods/three/examples/jsm/shaders/BlendShader.js';
import { CopyShader } from '../../../../vendor_mods/three/examples/jsm/shaders/CopyShader.js';

import Stats from '../../../../vendor_mods/three/examples/jsm/libs/stats.module'

import { Water } from '../../../../vendor_mods/three/examples/jsm/objects/Water.js';
import { Sky } from '../../../../vendor_mods/three/examples/jsm/objects/Sky.js';

import physicsRendererComponent from './PhysicsRenderer/physicsRendererComponent';
import ExpandingSmoke from "./Shaders/ExpandingSmoke/ExpandingSmoke.js";
import WaveletNoise from './Shaders/WaveletNoise/WaveletNoise';
import TestShader from './Shaders/TestShader/TestShader';
import AlienSphere from "./Shaders/AlianSphere/AlianSphere.js";
import Protoplanet from './Shaders/Protoplanet/protoplanet';
// import BlobPlanet from './Shaders/BlobPlanet/BlobPlanet';

import utils from '../../../utils/utils';

var font;

const visualComponents = {
    width: null,
    height: null,
    onDebug: false,

    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    gui: null,
    stats: null,

    composer: null,
    pmremGenerator: null,

    textureLoader: null,
    objLoader: null,
    fileLoader: null,
    fontLoader: null,

    components: null,
    envParams: null,

    defaultMaterial: null,
    debreDefaultMaterial: null,

    init(sceneElement, envParams, onDebug, updateGuiCallback, uiFilesDownloadCallback) {
        this.components = {};
        this.envParams = envParams;
        this.onDebug = onDebug;
        this.updateGuiCallback = updateGuiCallback;
        this.sceneElement = sceneElement;
        this.uiFilesDownloadCallback = uiFilesDownloadCallback;
        // loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader();
        this.fileLoader = new THREE.FileLoader();
        this.fontLoader = new FontLoader();

        this.loadingStates = {
            destination: 0,
            progress: 0,
            loaded: 0,
            addDestination: function (newDestination) {
                this.destination += newDestination;
            }
        };
        // loadingManager.onProgress = function (param) {
        //     console.log('loading', param);
        // };
        // loadingManager.onLoad = function (param) {
        //     console.log('loaded', param);
        // };
        // loadingManager.onError = function (e) {
        //     console.log('Loading error', e);
        // };

        this.fontLoader.load('fonts/gentilis_bold.typeface.json',
            function (_font) {
                font = _font;
            });

        if (onDebug) {
            GUI = lil.GUI
            this.gui = new GUI().close();
            this.gui.onChange(this.updateGUI);
            this.gui.add({
                Hide: () => {
                    document.getElementsByClassName("lil-gui")[0].style.display = 'none';
                    this.stats.showPanel();
                }
            }, 'Hide');
            this.gui.add({
                Download: () =>
                    console.log("Download function is missing")
            }, 'Download');

            this.stats = Stats()
            this.stats.domElement.style.cssText = 'position:absolute;bottom:0px;left:0px;';
            document.body.appendChild(this.stats.dom)
        }
    },

    createRenderer(rendererOptions, width, height, glVersion, isSecondary) {
        let renderer;
        if (glVersion === 1) {
            renderer = new THREE.WebGL1Renderer(rendererOptions);
        } else {
            renderer = new THREE.WebGLRenderer(rendererOptions);
        }
        renderer.setClearColor(this.envParams.renderer.rendererBackgroundColor);
        if (renderer.setPixelRatio) renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height);
        this.envParams.renderer.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        global.isLowEndMobile = false;
        if (this.envParams.renderer.maxAnisotropy.maxAnisotropy <= 4) {
            global.isLowEndMobile = true;
            this.envParams.lights.castShadow = false;
            this.envParams.lights.receiveShadow = false;
            this.envParams.materials.onReflections = false;
        }
        renderer.shadowMap.enabled = !utils.isMobile;
        renderer.shadowMap.autoUpdate = !utils.isMobile;
        renderer.shadowMap.type = utils.isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
        renderer.toneMapping = this.envParams.renderer.toneMapping;
        renderer.toneMappingExposure = Math.pow(this.envParams.renderer.rendererExposure, 4.0);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.physicallyCorrectLights = true;
        renderer.gammaFactor = this.envParams.renderer.rendererGamma;

        // renderer.autoClear = false;

        if (this.onDebug) {
            console.log(`Renderer init. 
                Antialias: ${rendererOptions.antialias}
                Encoding: ${renderer.outputEncoding}
                Gamma: ${renderer.gammaFactor}
                Tone Mapping: ${renderer.toneMapping}
                Exposure: ${renderer.toneMappingExposure}
                Max Anisotropy: ${this.envParams.maxAnisotropy}

                devicePixelRatio: ${window.devicePixelRatio}
                isLowEndMobile: ${global.isLowEndMobile}`
            );

            // console.log(`
            // UNMASKED_RENDERER_WEBGL: ${debugInfo.UNMASKED_RENDERER_WEBGL}
            // UNMASKED_VENDOR_WEBGL: ${debugInfo.UNMASKED_VENDOR_WEBGL}
            // ${vendor}
            // ${deviceRenderer}`);
        }
        if (!isSecondary) {
            this.width = width;
            this.height = height;
            this.renderer = renderer;
            this.pmremGenerator = new THREE.PMREMGenerator(renderer);
            if (this.onDebug) {
                const folderRenderer = this.gui.addFolder('Renderer').close();
                folderRenderer.add(this.envParams.renderer, 'toneMapping', ['NoToneMapping', 'ReinhardToneMapping', 'ACESFilmicToneMapping']);
                folderRenderer.add(this.envParams.renderer, 'rendererExposure', 0, 2, 0.1);
                folderRenderer.add(this.envParams.renderer, 'rendererGamma', 0, 3, 0.1).disable();
                folderRenderer.addColor(this.envParams.renderer, 'rendererBackgroundColor');
            }
        }

        return renderer;
    },

    createScene(backgroundTexture) {
        this.scene = new THREE.Scene();
        if (this.envParams.scene.sceneBackgroundColor) {
            this.scene.background = new THREE.Color(this.envParams.scene.sceneBackgroundColor);
        } else {
            this.scene.background = new THREE.Color("0x000000");
        }
        if (this.envParams.fog.active) {
            this.scene.fog = new THREE.Fog(
                new THREE.Color(this.envParams.fog.color),
                this.envParams.fog.near,
                this.envParams.fog.far
            );
        }

        if (this.onDebug) {
            const folderScene = this.gui.addFolder('Scene').close();
            folderScene.addColor(this.envParams.scene, 'sceneBackgroundColor');

            const folderFog = this.gui.addFolder('Fog').close();
            folderFog.add(this.envParams.fog, 'active');
            folderFog.add(this.envParams.fog, 'near', 0, 1);
            folderFog.add(this.envParams.fog, 'far', 500, 10000);
            folderFog.addColor(this.envParams.fog, 'color');
        }
    },

    createCamera(width, height, isSecondary) {
        let camera = new THREE.PerspectiveCamera(
            this.envParams.camera.fov,
            width / height,
            this.envParams.camera.near,
            this.envParams.camera.far
        );
        if (!isSecondary) {
            this.camera = camera;
            camera.position.copy(new THREE.Vector3(
                this.envParams.camera.cameraStartPos.x,
                this.envParams.camera.cameraStartPos.y,
                this.envParams.camera.cameraStartPos.z
            ));

            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = this.envParams.camera.enableDamping;
            this.controls.dampingFactor = this.envParams.camera.dampingFactor;
            this.controls.enableZoom = !utils.isMobile;
            this.controls.zoomSpeed = this.envParams.camera.zoomSpeed;
            this.controls.minDistance = this.envParams.camera.minDistance || 0;
            this.controls.maxDistance = this.envParams.camera.maxDistance || Infinity;
            this.controls.enableKeys = true;
            this.controls.enabled = true;
            this.controls.enablePan = !utils.isMobile;;
            this.controls.enableRotate = this.envParams.camera.enableControlsRotation;
            this.controls.autoRotateSpeed = this.envParams.camera.cameraRotationSpeed;
            this.controls.autoRotate = this.envParams.camera.enableCameraRotation;

            if (this.onDebug) {
                const folderCamera = this.gui.addFolder('Camera').close();
                folderCamera.add(this.envParams.camera, 'fov', 10, 100);
                folderCamera.add(this.envParams.camera, 'near', 0.1, 10000);
                folderCamera.add(this.envParams.camera, 'far', 1, 100000000);
                folderCamera.add(this.envParams.camera, 'zoomSpeed', 0, 1);
                folderCamera.add(this.envParams.camera, 'dampingFactor', 0, 1);
                folderCamera.add(this.envParams.camera, 'enableDamping');
                folderCamera.add(this.envParams.camera, 'enableCameraRotation');
                folderCamera.add(this.envParams.camera, 'enableControlsRotation').onChange((value) => {
                    if (!this.controls) {
                        this.controls = new OrbitControls(this.camera, this.components.renderer.domElement);
                        this.controls.enableDamping = this.envParams.camera.enableDamping;
                        this.controls.dampingFactor = this.envParams.camera.dampingFactor;
                        this.controls.enableZoom = true;
                        this.controls.enableKeys = false;
                        this.controls.enabled = true;
                        this.controls.enablePan = false;
                        this.controls.enableRotate = false;
                        this.controls.maxPolarAngle = Math.PI / 2;
                    }
                    this.controls.enableRotate = value;
                });
                folderCamera.add(this.envParams.camera, 'blockInteraction');
                this.envParams.camera.resetControls = this.controls.reset;
                folderCamera.add(this.envParams.camera, 'resetControls');
            }
        }
    },

    //Objects

    createObject(name, position, scene) {
        const that = this;
        return new Promise((resolve, reject) => {
            switch (name.toLowerCase()) {
                case "nebula":
                    nebula.init(this.scene);
                    resolve(nebula);
                    break;

                case "physicsrenderer":
                    physicsRendererComponent.init(this.scene, this.renderer);
                    resolve(physicsRendererComponent);
                    break;

                case "protoplanet":
                    Protoplanet.init(this.renderer, scene || this.scene, this.camera, position).then(
                        function () {
                            if (that.onDebug) {
                                const systemFolder = that.gui.addFolder('Particle System').close();
                                systemFolder.add(Protoplanet.envParams, 'visible');
                                systemFolder.add(Protoplanet.envParams, 'randomLifetime');
                                systemFolder.add(Protoplanet.envParams, 'size', 0, 10);
                                systemFolder.add(Protoplanet.envParams, 'lifetime', 1.0, 600.0);
                                systemFolder.add(Protoplanet.envParams, 'speed', 0.1, 10.0);
                                systemFolder.add(Protoplanet.envParams, 'pulsSpeed', 0.00001, 1.0);
                                systemFolder.add(Protoplanet.envParams, 'velocity', 0.0, 200.0);
                                systemFolder.add(Protoplanet.envParams, 'opacity', 0.0, 1.0);
                                systemFolder.add(Protoplanet.envParams, 'growInc', 0.0, 0.05);
                                systemFolder.add(Protoplanet.envParams, 'growThreshold', 0.0, 2500.0);
                                systemFolder.addColor(Protoplanet.envParams, 'color');
                            }
                            resolve(Protoplanet);
                        }, function (e) {
                            reject(e);
                        }
                    );
                    break;

                case "blobplanet":
                    //TODO: Threejs inject has error
                    // BlobPlanet.init(this.renderer, scene || this.scene, this.camera, this.envParams, position, that.onDebug ? that.gui : null).then(
                    //     function () {
                    //         resolve(BlobPlanet);
                    //     }, function (e) {
                    //         reject(e);
                    //     }
                    // )
                    break;

                case "water":
                    if (!this.components.sun) {
                        this.createSun();
                    }

                    const waterSize = utils.isMobile ? 5000 : 10000;
                    const waterGeometry = new THREE.PlaneGeometry(waterSize, waterSize)
                    this.components.water = new Water(
                        waterGeometry,
                        {
                            textureWidth: utils.isMobile ? this.envParams.components.water.scale / 2 : this.envParams.components.water.scale,
                            textureHeight: utils.isMobile ? this.envParams.components.water.scale / 2 : this.envParams.components.water.scale,
                            waterNormals: this.textureLoader.load('public/images/water/waternormals.jpg',
                                function (_texture) {
                                    _texture.wrapS = _texture.wrapT = THREE.RepeatWrapping;
                                }),
                            sunDirection: this.components.sun,
                            sunColor: this.envParams.components.sun.color,
                            waterColor: this.envParams.components.water.waterColor,
                            distortionScale: this.envParams.components.water.waterDistortionScale,
                            fog: this.envParams.fog.active
                        }
                    );
                    // water.material.side = THREE.BackSide;
                    this.components.water.position.y = this.envParams.components.water.position.y;
                    this.components.water.rotation.x = - Math.PI / this.envParams.components.water.rotation.x;
                    this.components.water.visible = this.envParams.components.water.visible;
                    this.components.water.receiveShadow = this.envParams.receiveShadow;

                    if (this.onDebug) {
                        const folderWater = this.gui.addFolder('Water').close();
                        folderWater.add(this.envParams.components.water, 'visible');
                        folderWater.add(this.envParams.components.water, 'size');
                        folderWater.add(this.envParams.components.water, 'normalMap', this.envParams.components.water.normalMap)
                            .onChange(val => {
                                visualComponents.textureLoader.load(val,
                                    function (_texture) {
                                        _texture.wrapS = _texture.wrapT = THREE.RepeatWrapping;
                                        visualComponents.components.water.material.uniforms['normalSampler'].value = _texture;
                                    });
                            });
                        folderWater.addColor(this.envParams.components.water, 'waterColor');
                        folderWater.add(this.envParams.components.water, 'waterDistortionScale', 0, 20, 0.1);
                        folderWater.add(this.envParams.components.water, 'waterSpeed', 0, 0.1, 0.0001);
                    }

                    resolve(this.components.water);
                    break;

                case "sky":
                    if (!this.components.sun) {
                        this.createSun();
                    }

                    this.components.sky = new Sky();
                    this.components.sky.scale.setScalar(10000);
                    this.components.sky.visible = this.envParams.components.sky.visible;

                    const skyUniforms = this.components.sky.material.uniforms;
                    skyUniforms['turbidity'].value = this.envParams.components.sky.turbidity;
                    skyUniforms['rayleigh'].value = this.envParams.components.sky.rayleigh;
                    skyUniforms['mieCoefficient'].value = this.envParams.components.sky.mieCoefficient;
                    skyUniforms['mieDirectionalG'].value = this.envParams.components.sky.mieDirectionalG;
                    // skyUniforms['color'].value = new THREE.Color(this.envParams.components.sky.skyColor);
                    skyUniforms['sunPosition'].value.copy(this.components.sun);
                    // const color = new THREE.Color(this.envParams.components.sky.skyColor);
                    // skyUniforms['color'].value = { x: color.r * 0.00001, y: color.g * 0.00001, z: color.b * 0.00001 };

                    // scene.background = this.pmremGenerator.fromScene(this.components.sky).texture;
                    scene.environment = this.pmremGenerator.fromScene(this.components.sky).texture;

                    if (this.onDebug) {
                        const folderSky = this.gui.addFolder('Sky').close();
                        folderSky.add(this.envParams.components.sky, 'visible');
                        folderSky.addColor(this.envParams.components.sky, 'skyColor').disable();
                        folderSky.addColor(this.envParams.components.sky, 'skyRayColor').disable();
                        folderSky.add(this.envParams.components.sky, 'turbidity', 0.0, 20.0, 0.1);
                        folderSky.add(this.envParams.components.sky, 'rayleigh', 0.0, 4, 0.001);
                        folderSky.add(this.envParams.components.sky, 'mieCoefficient', 0.0, 0.1, 0.001);
                        folderSky.add(this.envParams.components.sky, 'mieDirectionalG', 0.0, 1, 0.001);
                    }

                    resolve(this.components.sky);
                    break;

                default:
                    reject({ error: `object ${name} is not supported` });
                    break;
            }
        })
    },

    createSun() {
        this.components.sun = new THREE.Vector3(0, 0, 0);
        let _phi = THREE.MathUtils.degToRad(90 - (this.envParams.components.sun.elevation));
        let _theta = THREE.MathUtils.degToRad(this.envParams.components.sun.azimuth);
        this.components.sun.setFromSphericalCoords(1, _phi, _theta);

        if (this.onDebug) {
            const folderSun = this.gui.addFolder('Sun').close();
            folderSun.add(this.envParams.components.sun, 'elevation', -90, 90, 1);
            folderSun.add(this.envParams.components.sun, 'azimuth', - 180, 180, 0.1);
            folderSun.add(this.envParams.components.sun, 'exposure', 0, 1, 0.0001);
            folderSun.addColor(this.envParams.components.sun, 'color');
        }
    },

    createTextGeometry(text, params, material) {
        let textGeom = new TextGeometry(text, {
            font: font,
            ...params
        });
        let mesh = new THREE.Mesh(textGeom, material);

        // mesh.position.x = centerOffset;
        // mesh.position.y = hover;
        // mesh.position.z = 0;

        // mesh.rotation.x = 0;
        // mesh.rotation.y = Math.PI * 2;

        return mesh;
    },

    loadModel(modelUrl, materialType, textureUrl, bumpUrl, normalMapUrl, displacementUrl) {
        const that = this;
        return new Promise((resolve, reject) => {
            that.updateLoadingStates(modelUrl, false);
            if (!objLoader) {
                objLoader = new OBJLoader();
            }
            objLoader.load(
                modelUrl,
                function (object) {
                    // console.log(object);
                    object.type = 'model';
                    if (textureUrl) {
                        Promise.all([
                            that.textureLoader.load(textureUrl),
                            (bumpUrl ? that.textureLoader.load(bumpUrl) : null),
                            (normalMapUrl ? that.textureLoader.load(normalMapUrl) : null),
                            (displacementUrl ? that.textureLoader.load(displacementUrl) : null)
                        ]).then(
                            function (res) {
                                object.traverse(function (child) {
                                    // console.log(child)
                                    if (child instanceof THREE.Mesh) {
                                        child.material = visualComponents.makeMaterial(
                                            materialType,
                                            res[0],
                                            res[1] ? res[1] : null,
                                            res[2] ? res[2] : null,
                                            res[3] ? res[3] : null);
                                    }
                                });
                                onResolve(object);
                            }, function (e) {
                                reject(e);
                            }
                        )
                    } else {
                        onResolve(object);
                    }
                },
                function (xhr) {
                    console.log('Model ' + (xhr.loaded / xhr.total * 100) + '% loaded');

                },
                function (e) {
                    reject(e);
                }
            );
            function onResolve(object) {
                that.updateLoadingStates(modelUrl, true);
                resolve(object);
            }
        });
    },

    loadTexture(url) {
        const that = this;
        that.updateLoadingStates(url, false);
        return new Promise((resolve, reject) => {
            that.textureLoader.load(
                url,
                function (texture) {
                    that.updateLoadingStates(url, true);
                    resolve(texture);
                },
                function (xhr) {
                    console.log('Texture ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (e) {
                    that.updateLoadingStates(url, true);
                    // reject(e);
                    resolve(null); //File does not exists. Just resolve nothing and check the result in the caller
                }
            )
        });
    },

    loadShader(name, objects, width, height) {
        switch (name.toLowerCase()) {
            case "expandingcircle":
                ExpandingSmoke.init(objects.renderer, width, height);
                return ExpandingSmoke;

            case "waveletnoise":
                return new THREE.ShaderMaterial({
                    uniforms: WaveletNoise.uniforms,
                    vertexShader: WaveletNoise.vertexShader,
                    fragmentShader: WaveletNoise.fragmentShader
                });

            case "testshader":
                return new THREE.ShaderMaterial({
                    uniforms: TestShader.uniforms,
                    vertexShader: TestShader.vertexShader,
                    fragmentShader: TestShader.fragmentShader
                });

            case "aliensphere":
                return new AlienSphere();
        }
    },

    addNewShape(type, size, mass, position, material, parseObj, isKinematic, rotations, addCamera, breakable) {
        let mesh, btBoxShape;

        if (!material) {
            material = this.defaultMaterial.clone();
        }

        if (addCamera) {
            if (!cubeCamera1) {
                cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(256, {
                    format: THREE.RGBFormat,
                    generateMipmaps: true,
                    minFilter: THREE.LinearMipmapLinearFilter,
                    encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
                });

                cubeCamera1 = new THREE.CubeCamera(1, 1000, cubeRenderTarget1);;

                cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget(256, {
                    format: THREE.RGBFormat,
                    generateMipmaps: true,
                    minFilter: THREE.LinearMipmapLinearFilter,
                    // encoding: THREE.sRGBEncoding
                });

                cubeCamera2 = new THREE.CubeCamera(1, 1000, cubeRenderTarget2);
            }
            let map = material.map || material.roughnessMap;
            cubeCameraMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                envMap: cubeRenderTarget2.texture,
                // transparent: true
                map: map,
                emissive: new THREE.Color(envParams.materials.materialsEmissiveColor).convertSRGBToLinear(),
                emissiveIntensity: envParams.materials.materialEmissiveIntensity,
                emissiveMap: map,
                specular: envParams.materials.materialsSpecularColor,
                specularMap: map,
                shininess: envParams.materials.materialsShininess,
                reflectivity: envParams.materials.materialsReflectivity,
                refractionRatio: envParams.materials.materialsReflectionRatio,
                // transparent: true,
                combine: THREE.MultiplyOperation,
                side: THREE.FrontSide,
            });
            material = cubeCameraMaterial;
        }
        switch (type) {
            case "sphere":
                mesh = new THREE.Mesh(new THREE.SphereGeometry(size), material);
                btBoxShape = new Ammo.btSphereShape(new Ammo.btVector3(size * 0.5, size * 0.5, size * 0.5));
                break;
            case "sphereBox":
                mesh = new THREE.Mesh(new THREE.SphereGeometry(size), material);
                btBoxShape = new Ammo.btBoxShape(new Ammo.btVector3(size * 0.5, size * 0.5, size * 0.5));
                break;

            case "box":
                mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(size, size, size, 5, 5, 5), material);
                btBoxShape = new Ammo.btBoxShape(new Ammo.btVector3(size * 0.5, size * 0.5, size * 0.5));
                break;

            case "plate":
                mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(size.x, size.y, size.z), material);
                btBoxShape = new Ammo.btBoxShape(new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5));
                break;

            case "doDecahedronBufferGeometry":
                mesh = new THREE.Mesh(new THREE.DodecahedronBufferGeometry(size, 5), material);
                btBoxShape = new Ammo.btSphereShape(new Ammo.btVector3(size * 0.5, size * 0.5, size * 0.5));
                break;

            case "IcosahedronGeometry":
                mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(20, 8), material);
                btBoxShape = new Ammo.btSphereShape(new Ammo.btVector3(size * 0.5, size * 0.5, size * 0.5));
                break;

            default: console.log("! Geometry type is not supported: " + type)
        }

        if (addCamera) {
            // threeObject.add(cubeCamera);
            // threeObject.camera = cubeCamera;
            // threeObject.cameraMaterial = cameraMaterial;
        }

        if (rotations && rotations.x) {
            mesh.rotateX(rotations.x * Math.PI / 180);
        }
        if (rotations && rotations.y) {
            mesh.rotateX(rotations.y * Math.PI / 180);
        }
        if (rotations && rotations.z) {
            mesh.rotateX(rotations.z * Math.PI / 180);
        }

        quat.set(0, 0, 0, 1);
        mesh.position.copy(position);
        mesh.quaternion.copy(quat);

        mesh.castShadow = envParams.castShadow;
        mesh.receiveShadow = envParams.receiveShadow;
        // threeObject.geometry.caseShadows = envParams.castShadows;
        // threeObject.geometry.receiveShadow = envParams.receiveShadow;

        mesh.userData.parseObj = parseObj;
        mesh.userData.interactive = true;

        if (btBoxShape) btBoxShape.setMargin(margin);

        mesh.name = parseObj ? parseObj.id : mesh.id;

        mesh.isKinematic = isKinematic;
        if (!isKinematic) {
            convexBreaker.prepareBreakableObject(mesh, mass, new THREE.Vector3(), new THREE.Vector3(), breakable);
            createDebrisFromBreakableObject(mesh);
        }
        else {
            createRigidBody(mesh, btBoxShape, position, mass, quat, null, null, true);
        }

        return mesh;
    },

    createRigidBody(threeObject, physicsShape, _pos, mass, _quat, vel, angVel, isKinematic) {

        if (_pos) {
            threeObject.position.copy(_pos);
        } else {
            _pos = threeObject.position;
        }

        if (_quat) {
            threeObject.quaternion.copy(_quat);
        } else {
            _quat = threeObject.quaternion;
        }

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(_pos.x, _pos.y, _pos.z));
        transform.setRotation(new Ammo.btQuaternion(_quat.x, _quat.y, _quat.z, _quat.w));
        const motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        // body.setDamping(0.02, 0.02);
        body.setFriction(0.5);

        if (vel) {
            body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
        }

        if (angVel) {
            body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
        }

        threeObject.userData.physicsBody = body;
        threeObject.userData.collided = false;

        if (mass > 0) {
            rigidBodies.push(threeObject);
            // Disable deactivation
            //     ACTIVE: 1,
            //     ISLAND_SLEEPING: 2,
            //     WANTS_DEACTIVATION: 3,
            //     DISABLE_DEACTIVATION: 4,
            //     DISABLE_SIMULATION: 5
            body.setActivationState(isKinematic ? 2 : 4);
        }

        physicsWorld.addRigidBody(body);

        return body;

    },

    createDebrisFromBreakableObject(object) {

        object.castShadow = envParams.castShadow;
        object.receiveShadow = envParams.receiveShadow;

        const shape = createConvexHullPhysicsShape(object.geometry.attributes.position.array);
        shape.setMargin(margin);

        const body = createRigidBody(object, shape, null, object.userData.mass, null, object.userData.velocity, object.userData.angularVelocity);

        // Set pointer back to the three object only in the debris objects
        const btVecUserData = new Ammo.btVector3(0, 0, 0);
        btVecUserData.threeObject = object;
        body.setUserPointer(btVecUserData);

        return object;

        function createConvexHullPhysicsShape(coords) {

            const _shape = new Ammo.btConvexHullShape();

            for (let i = 0, il = coords.length; i < il; i += 3) {
                tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2]);
                const lastOne = (i >= (il - 3));
                _shape.addPoint(tempBtVec3_1, lastOne);
            }

            return _shape;

        }

    },

    removeSceneObject(object) {
        if (object) {
            console.log("Removing object: " + object.name);
            // var selectedObject = scene.getObjectByName(object.name);
            // for better memory management and performance
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (object.material instanceof Array) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
            object.removeFromParent();

            physicsWorld.removeRigidBody(object.userData.physicsBody);
            for (var i in rigidBodies) {
                if (rigidBodies[i].id === object.id) {
                    delete rigidBodies[i];
                }
            }
            scene.remove(object);
        }
    },

    addHaloSphereAroundObject(object) {
        let _hoverHaloSphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                object.geometry.parameters.radius + object.geometry.parameters.radius * .2,
                object.geometry.parameters.widthSegments,
                object.geometry.parameters.heightSegments),
            new THREE.ShaderMaterial(
                {
                    uniforms: {
                        "c": { type: "f", value: 0 },
                        "p": { type: "f", value: 1.5 },
                        glowColor: { type: "c", value: new THREE.Color(secondaryColor).convertSRGBToLinear() },
                        viewVector: { type: "v3", value: camera.position }
                    },
                    vertexShader: glowVertexShader,
                    fragmentShader: glowFragmentShader,
                    // side: THREE.BackSide,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 1
                })
        );
        // _hoverHaloSphere.position.copy(object.position);
        _hoverHaloSphere.name = "hoverHaloSphere_" + object.name;
        _hoverHaloSphere.isHaloObject = true;
        _hoverHaloSphere.userData.parent = { object: object };
        _hoverHaloSphere.userData.parseObj = object.userData.parseObj;
        scene.add(_hoverHaloSphere);
        return _hoverHaloSphere
    },

    // Motion

    orbitAroundVector(object, target, settings) {
        if (!settings) {
            settings = {} // set init values
        }
        settings.rotationTheta += settings.rotationSpeed;
        object.position.x = Math.sin(settings.rotationTheta) * settings.rotationRadius * 1.5 + target.x;
        object.position.y = Math.sin(settings.rotationTheta) * settings.rotationRadius + target.y;
        object.position.z = Math.cos(settings.rotationTheta) * settings.rotationRadius * 1.5 + target.z;
        object.lookAt(target);
    },

    //Materials

    initDefaultMaterials(withReflections) {
        if (!withReflections) {
            this.defaultMaterial = new THREE.MeshStandardMaterial({
                color: this.envParams.materials.materialsColor,
            });
            this.debreDefaultMaterial = this.defaultMaterial.clone();
        } else {
            if (!this.pmremGenerator) {
                this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            }
            let envMap;
            if (this.components.sky) {
                envMap = this.pmremGenerator.fromScene(this.components.sky).texture
            } else if (this.components.terrain) {
                envMap = this.pmremGenerator.fromScene(this.components.terrain).texture
            } else {
                envMap = this.pmremGenerator.fromScene(this.scene).texture
            }
            this.defaultMaterial = new THREE.MeshPhysicalMaterial({
                color: this.envParams.materials.materialsColor,
                envMap: envMap,
                envMapIntensity: this.envParams.materials.materialEnvMapIntensity,
                clearcoat: this.envParams.materials.materialsClearcoat,
                clearcoatMap: envMap,
                clearcoatRoughness: this.envParams.materials.materialsClearcoatRoughness,
                clearcoatRoughnessMap: envMap,
                roughness: this.envParams.materials.materialsRoughness,
                metalness: this.envParams.materials.materialsMetalness,
                reflectivity: this.envParams.materials.materialsReflectivity,
                refractionRatio: this.envParams.materials.materialsReflectionRatio,
            });
            this.debreDefaultMaterial = this.defaultMaterial.clone();
        }

        if (this.onDebug) {
            const folderMaterials = this.gui.addFolder('Materials').close();
            folderMaterials.add(this.envParams.materials, 'materialEnvMapIntensity', 0, 2, 0.1);
            folderMaterials.addColor(this.envParams.materials, 'materialsColor');
            folderMaterials.addColor(this.envParams.materials, 'materialsEmissiveColor');
            folderMaterials.add(this.envParams.materials, 'materialEmissiveIntensity', 0, 2, 0.1);
            folderMaterials.add(this.envParams.materials, 'materialsReflectivity', 0, 1, 0.1);
            folderMaterials.add(this.envParams.materials, 'materialsReflectionRatio', 0, 0.98, 0.1);
            folderMaterials.add(this.envParams.materials, 'materialsWireframe');
            folderMaterials.add(this.envParams.materials, 'materialsFlatShading');

            const folderPhongMaterials = this.gui.addFolder('Phong Materials').close();
            folderPhongMaterials.add(this.envParams.materials, 'materialsShininess', 0, 500, 1);
            // folderPhongMaterials.add(envParams.materials, 'phongMaterialsMetalness', 0, 10, 0.1);
            folderPhongMaterials.addColor(this.envParams.materials, 'materialsSpecularColor');

            const folderPhysicalMaterials = this.gui.addFolder('Mesh Physical Materials').close();
            folderPhysicalMaterials.add(this.envParams.materials, 'materialsRoughness', 0, 1, 0.1);
            folderPhysicalMaterials.add(this.envParams.materials, 'materialsMetalness', 0, 1, 0.1);
            folderPhysicalMaterials.add(this.envParams.materials, 'materialsClearcoat', 0, 1, 0.1);
            folderPhysicalMaterials.add(this.envParams.materials, 'materialsClearcoatRoughness', 0, 1, 0.1);
            folderPhysicalMaterials.add(this.envParams.materials, 'materialBumpScale', 0, 1, 0.1);
            folderPhysicalMaterials.add(this.envParams.materials, 'materialsDisplacementScale', -100, 100, 0.1);
            folderPhysicalMaterials.add(this.envParams.materials, 'materialsDisplacementBias', -10, 10, 0.1);
            // folderPhysicalMaterials.add(envParams, 'materialsTransmission', 0, 1, 0.1);
        }

    },

    // TODO: will need implementation
    loadMaterials(_data, displace, progressCallback, stateCallback) {
        const that = this;
        return new Promise((resolve, reject) => {
            var materialsToLoad = [], loadCounter = 0, progressCounter = 0;

            if (!materials) {
                materials = {};
            }

            for (let i in _data) {
                if (_data[i].cover && !materials[_data[i].id]) {
                    materialsToLoad.push(_data[i]);
                }

                else if (materials[_data[i].id]) {
                    progressCounter++;
                    // if (progressCallback) {
                    //     progressCallback(progressCounter, _data.length)
                    // }
                }
                else {
                    progressCounter++;
                    materials[_data[i].id] = defaultMaterial.clone();
                    // if (progressCallback) {
                    //     progressCallback(progressCounter, _data.length)
                    // }
                }
            }

            if (materialsToLoad.length > 0) {
                if (stateCallback) {
                    stateCallback('loading');
                }
                loadCover(materialsToLoad[loadCounter]);
            }
            else {
                console.log("Materials loaded from memory");
                if (stateCallback) {
                    stateCallback('loaded');
                }
                resolve();
            }

            function loadCover(obj) {
                loadNewMaterial(obj);
            }

            function loadNewMaterial(obj) {
                that.textureLoader.load(obj.cover,
                    function (_texture) {
                        console.log("New material loaded", _texture);
                        // texture.wrapT = THREE.RepeatWrapping;
                        // texture.wrapS = THREE.RepeatWrapping;
                        _texture.mapping = THREE.EquirectangularReflectionMapping;
                        materials[obj.id] = makeMaterial(envParams.materials.onReflections, _texture, displace);
                        count();
                    }, function (progress) {
                        console.log(progress);
                    }, function (e) {
                        console.log('Error loading obj cover:', obj)
                        console.error(e);
                        count();
                        // reject(e);
                    }
                );
            }

            function count() {
                loadCounter++;
                progressCounter++;
                if (progressCallback) {
                    progressCallback(progressCounter, _data.length)
                }
                if (loadCounter < materialsToLoad.length) {
                    loadCover(materialsToLoad[loadCounter]);
                } else {
                    console.log('New materials loaded:', loadCounter);
                    resolve();
                }
            }
        })
    },

    loadNodeMaterial() {
        return new Promise((resolve, reject) => {
            let cloud = new THREE.TextureLoader().load('images/cloud.png');
            cloud.wrapS = cloud.wrapT = THREE.RepeatWrapping;
            const url = "images/nodes/caustic.json";
            const loader = new NodeMaterialLoader(undefined, { "cloud": cloud })
                .load(url, function () {
                    const time = loader.getObjectByName("time");
                    if (time) {
                        // enable time scale
                        time.timeScale = true;
                    }
                    // set material
                    nodeMaterial = loader.material;
                    resolve();
                }, null,
                    function (e) {
                        console.log(e);
                        nodeMaterial = new THREE.MeshPhongMaterial({
                            color: materialsColor,
                            emissiveIntensity: envParams.emissiveIntensity
                        })
                        resolve();
                    });
        })

    },

    makeMaterial(type, texture, bumpMap, normalMap, displacementMap, materialConfig) {
        let newMaterial;

        switch (type.toLowerCase()) {
            case "meshbasicmaterial":
                newMaterial = new THREE.MeshBasicMaterial({});
                break;

            case "meshphysicalmaterial":
                newMaterial = new THREE.MeshPhysicalMaterial({});
                break;

            case "meshphongmaterial":
                newMaterial = new THREE.MeshPhongMaterial({});
                break;

            default:
                newMaterial = new THREE.MeshStandardMaterial({});
                break;
        }

        newMaterial.color = new THREE.Color(this.envParams.materials.materialsColor).convertSRGBToLinear();
        // let envMap = sky ? pmremGenerator.fromScene(sky).texture : (terrain ? pmremGenerator.fromScene(terrain).texture : null); // dynamic envMap generation from scene environment
        if (texture) {
            texture.encoding = THREE.sRGBEncoding;
            texture.anisotropy = this.envParams.maxAnisotropy;
            //newMaterial.// envMap: envMap,
            newMaterial.envMapIntensity = this.envParams.materials.materialEnvMapIntensity;
            newMaterial.map = texture;
            newMaterial.normalMap = normalMap;
            if (newMaterial.type.toLowerCase() !== 'meshbasicmaterial' &&
                newMaterial.type.toLowerCase() !== 'meshphongmaterial') {
                newMaterial.clearcoat = this.envParams.materials.materialsClearcoat;
                //newMaterial.// clearcoatMap: envMap,
                newMaterial.clearcoatRoughness = this.envParams.materials.materialsClearcoatRoughness;
                // newMaterial.// clearcoatRoughnessMap: envMap,
                newMaterial.roughness = this.envParams.materials.materialsRoughness;
                newMaterial.roughnessMap = texture;
            }
            newMaterial.metalness = this.envParams.materials.materialsMetalness;
            newMaterial.metalnessMap = texture;
            newMaterial.emissive = new THREE.Color(this.envParams.materials.materialsEmissiveColor).convertSRGBToLinear();
            newMaterial.emissiveIntensity = materialConfig ? materialConfig.emissiveIntensity : this.envParams.materials.materialEmissiveIntensity;
            newMaterial.emissiveMap = texture;
            newMaterial.reflectivity = this.envParams.materials.materialsReflectivity;
            newMaterial.refractionRatio = this.envParams.materials.materialsReflectionRatio;
            if (bumpMap) {
                newMaterial.bumpMap = bumpMap;
                newMaterial.bumpScale = this.envParams.materials.materialBumpScale;
            }
            if (displacementMap) {
                newMaterial.displacementMap = displacementMap;
                newMaterial.displacementScale = this.envParams.materials.materialsDisplacementScale;
                newMaterial.displacementBias = this.envParams.materials.materialsDisplacementBias;
            }
            //    newMaterial.// combine: THREE.MixOperation

        } else {
            // newMaterial.envMap = envMap;
            newMaterial.envMapIntensity = this.envParams.materials.materialEnvMapIntensity;
            newMaterial.roughness = this.envParams.materials.materialsRoughness;
            newMaterial.metalness = this.envParams.materials.materialsMetalness;
            newMaterial.emissive = new THREE.Color(this.envParams.materials.materialsEmissiveColor).convertSRGBToLinear();
            newMaterial.emissiveIntensity = this.envParams.materials.materialEmissiveIntensity;
            // reflectivity: 0.8,
            // combine: THREE.MixOperation

        }

        return newMaterial;
    },

    // Lights
    addLight(type, lightConfig, target) {
        // name, _color, _pos, _intensity, _distance, lightAngle, target, isKinematic, power
        var light, lightFolder;
        this.envParams[lightConfig.name] = { visible: true, intensity: lightConfig.intensity };
        if (lightConfig.color != null) {
            this.envParams[lightConfig.name].color = lightConfig.color;
        }
        if (this.onDebug) {
            lightFolder = this.gui.addFolder(lightConfig.name).close();
            lightFolder.add(this.envParams[lightConfig.name], 'visible');
            lightFolder.add(this.envParams[lightConfig.name], 'intensity', 0, 2);
            if (lightConfig.color != null) {
                lightFolder.addColor(this.envParams[lightConfig.name], 'color');
            }
        }
        switch (type.toLowerCase()) {
            case "ambientlight":
                light = new THREE.AmbientLight(new THREE.Color(lightConfig.color), lightConfig.intensity);
                break;

            case "pointlight":
                light = new THREE.PointLight(new THREE.Color(lightConfig.color), lightConfig.intensity, lightConfig.distance, lightConfig.decay);
                this.envParams[lightConfig.name].distance = lightConfig.distance;
                if (this.envParams.lights.debugLights) {
                    const pointLightHelper = new THREE.PointLightHelper(light, 10);
                    this.scene.add(pointLightHelper);
                    this.envParams.lights.lightHelpers.push(pointLightHelper);
                }
                break;

            case "spotlight":
                let _spotLightAngle = lightConfig.lightAngle || this.envParams.lights.spotLightAngle;
                light = new THREE.SpotLight(new THREE.Color(lightConfig.color), lightConfig.intensity, lightConfig.distance, lightConfig.decay);
                light.angle = lightConfig.spotLightAngle;
                light.penumbra = 0.2;
                light.decay = 1;
                // light.target.position.set(center.x, center.y, center.z);
                if (target) light.target = target;
                // scene.add(light.target);

                this.envParams[lightConfig.name].distance = lightConfig.distance;
                this.envParams[lightConfig.name].angle = lightConfig.spotLightAngle;
                this.envParams[lightConfig.name].penumbra = 0.2;
                // if (sceneUtils.onDebug) {
                //     lightFolder.add(envParams[name], 'angle', 0, Math.PI / 2, 0.01);
                //     lightFolder.add(envParams[name], 'penumbra', 0, 1, 0.01);
                //     lightFolder.add(envParams[name], 'distance', 0, 5000, 1);

                //     if (envParams.debugLights) {
                //         let lightHelper = new THREE.SpotLightHelper(light);
                //         scene.add(lightHelper);
                //         lightHelpers.push(lightHelper);
                //     }
                // }
                break;

            case "directionallight":
                light = new THREE.DirectionalLight(new THREE.Color(lightConfig.color), lightConfig.intensity);
                // light.target.position.set(center.x, center.y, center.z);
                // scene.add(light.target);

                // if (envParams.debugLights) {
                //     let lightHelper = new THREE.DirectionalLightHelper(light);
                //     scene.add(lightHelper);
                //     lightHelpers.push(lightHelper);
                // }
                break;

            case "lightprobe":
                // light = new THREE.LightProbe();
                // light.copy(LightProbeGenerator.fromCubeTexture(scene));
                console.log('Light probe is not implemented');
                break;
        }
        light.name = lightConfig.name;

        if (type.toLowerCase() === 'ambientlight') {
            //
        } else {
            if (lightConfig.pos || lightConfig.position) {
                let pos = lightConfig.pos || lightConfig.position;
                light.position.set(pos.x, pos.y, pos.z);
            }

            light.power = lightConfig.power || this.envParams.lights.lightsPower;

            light.castShadow = this.envParams.lights.castShadow;
            light.shadow.mapSize.width = this.envParams.lights.shadowMapResolution;
            light.shadow.mapSize.height = this.envParams.lights.shadowMapResolution;
            light.shadow.camera.near = this.envParams.lights.shadowNear;
            light.shadow.camera.far = this.envParams.lights.shadowFar; //from light distance
            // light.shadow.camera.left = -500;
            // light.shadow.camera.bottom = -500;
            // light.shadow.camera.right = 500;
            // light.shadow.camera.top = 500;
            light.shadow.focus = this.envParams.lights.shadowFocus;

            // if (this.envParams.debugLights) {
            //     var shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
            //     this.scene.add(shadowCameraHelper);
            //     this.envParams.lightHelpers.push(shadowCameraHelper);
            // }

            // if (!isKinematic) {
            //     scene.add(light);
            // } else {
            //     camera.add(light);
            // }

            this.envParams[lightConfig.name].castShadow = this.envParams.lights.castShadow;
            this.envParams[lightConfig.name].power = lightConfig.power || this.envParams.lights.lightsPower;
            this.envParams[lightConfig.name].position = { x: light.position.x, y: light.position.y, z: light.position.z };
            this.envParams[lightConfig.name].shadow = {
                camera: {
                    far: light.shadow.camera.far,
                    near: light.shadow.camera.near,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    top: 0
                },
                focus: light.shadow.focus
            };

            if (this.onDebug) {
                lightFolder.add(this.envParams[lightConfig.name], 'power', 0, 110000, 1);
                lightFolder.add(this.envParams[lightConfig.name].position, 'x', -window.innerWidth, window.innerWidth, 1);
                lightFolder.add(this.envParams[lightConfig.name].position, 'y', -100, 5000, 1);
                lightFolder.add(this.envParams[lightConfig.name].position, 'z', -2000, 2000, 1);
                lightFolder.add(this.envParams[lightConfig.name].shadow.camera, 'near', 0, 10, 0.1);
                lightFolder.add(this.envParams[lightConfig.name].shadow.camera, 'far', 0, 5000, 1);
                // lightFolder.add(envParams[name].shadow.camera, 'bottom', 0, 5000, 1);
                // lightFolder.add(envParams[name].shadow.camera, 'top', 0, 5000, 1);
                // lightFolder.add(envParams[name].shadow.camera, 'left', 0, 5000, 1);
                // lightFolder.add(envParams[name].shadow.camera, 'right', 0, 5000, 1);
                lightFolder.add(this.envParams[lightConfig.name].shadow, 'focus', 0, 1, 0.1);
                lightFolder.add(this.envParams[lightConfig.name], 'castShadow');
            }
        }

        this.scene.add(light);
        this.envParams[lightConfig.name].light = light; //TODO: not really working with update. need to change
        return light;
    },

    // Helpers

    addLineHelper(origin, direction, extendedLength) {
        origin = origin.clone();
        direction = direction.clone();
        let tG = new THREE.BufferGeometry().setFromPoints([origin, direction]);
        let tM = new THREE.LineBasicMaterial({ color: "red" });
        let line = new THREE.Line(tG, tM);
        if (extendedLength) {
            direction.setLength(direction.length() + extendedLength)
        }
        line.direction = direction;
        line.origin = origin;
        line.extendedLength = extendedLength;

        line.update = (newOrigin, newDirection) => {
            line.origin = newOrigin;
            line.direction = newDirection;
            if (line.extendedLength) {
                line.direction.setLength(line.direction.length() + line.extendedLength)
            }
            line.geometry.attributes.position.setXYZ(0, line.origin.x, line.origin.y, line.origin.z);
            line.geometry.attributes.position.setXYZ(1, line.direction.x, line.direction.y, line.direction.z);
            line.geometry.attributes.position.needsUpdate = true;
        }

        scene.add(line);
        return line;
    },

    // text

    createTextLabel(elementType, id, text, delay) {
        const that = this;
        var element = document.createElement(elementType);
        element.className = 'text-label';
        element.id = id;
        element.style.position = 'absolute';
        element.style.width = 100;
        element.style.height = 100;
        element.innerHTML = text || 'TEXT';
        element.style.top = 0;
        element.style.left = 0;
        element.style.color = '#ffffff';
        element.style.transition = 'all';
        element.style.opacity = delay ? 0 : 1;

        this.sceneElement.appendChild(element);

        return {
            element: element,
            parent: false,
            position: new THREE.Vector3(0, 0, 0),
            // delay: delay,
            delay: delay ? new Date().getTime() + delay : false,
            setHTML: function (html) {
                this.element.innerHTML = html;
            },
            setParent: function (threejsObj) {
                this.parent = threejsObj;
            },
            update: function () {
                let boundingBox;
                if (this.parent) {
                    this.position.copy(this.parent.position);
                    if (!this.parent.boundingBox) {
                        this.parent.geometry.computeBoundingBox();
                    }
                    boundingBox = this.parent.geometry.boundingBox;
                }

                var coords2d = this.get2DCoords(this.position, that.camera);
                this.element.style.left = coords2d.x + (boundingBox ? boundingBox.max.x * 2.5 : 0) + 'px';
                this.element.style.top = coords2d.y - 12 + 'px';

                if (!this.kill) {
                    if (this.delay && this.delay < new Date().getTime() && element.style.opacity < 1) {
                        this.element.style.opacity = parseFloat(this.element.style.opacity) + 0.1;
                    }
                }

                else {
                    if (this.element.style.opacity > 0) {
                        this.element.style.opacity = parseFloat(this.element.style.opacity) - 0.1;
                    } else {
                        this.isDead = true;
                    }
                }
            },
            get2DCoords: function (_position, _camera) {
                var vector = _position.project(_camera);
                vector.x = (vector.x + 1) / 2 * window.innerWidth;
                vector.y = -(vector.y - 1) / 2 * window.innerHeight;
                return vector;
            },
            setTransform(rotationArg, scaleArg, skewXArg, skewYArg) {
                var transformString = ("rotate(" + rotationArg + "deg ) scale(" + scaleArg + ") skewX(" + skewXArg + "deg ) skewY(" + skewYArg + "deg )");
                this.element.style.webkitTransform = transformString;
                this.element.style.MozTransform = transformString;
                this.element.style.msTransform = transformString;
                this.element.style.OTransform = transformString;
                this.element.style.transform = transformString;
            }
        };
    },

    // Calculations

    screenToWorld(x, y, canvasWidth, canvasHeight, _camera) {
        const coords = new THREE.Vector3(
            (x / canvasWidth) * 2 - 1,
            -(y / canvasHeight) * 2 + 1,
            0.5
        )
        const worldPosition = new THREE.Vector3()
        const plane = new THREE.Plane(new THREE.Vector3(0.0, 1.0, 0.0))
        const _raycaster = new THREE.Raycaster()
        _raycaster.setFromCamera(coords, _camera)
        return _raycaster.ray.intersectPlane(plane, worldPosition);
    },

    getRandomPointsOnSphere(_radius, amount) {
        var points = [];
        for (let i = 0; i < amount; i++) {
            let _pos = new THREE.Vector3();
            let _theta = THREE.Math.randFloatSpread(360);
            let _phi = THREE.Math.randFloatSpread(360);

            _pos.x = radius * Math.sin(_theta) * Math.cos(_phi);
            _pos.y = radius * Math.sin(_theta) * Math.sin(_phi);
            _pos.z = radius * Math.cos(_theta);
            points.push(_pos);
        }
        return points;
    },

    getFibonacciSpherePoints(_radius, amount, randomize) {
        let random = 1;
        if (randomize) {
            random = Math.random() * amount;
        }

        let points = []
        let offset = 2 / amount
        let increment = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < amount; i++) {
            let y = ((i * offset) - 1) + (offset / 2);
            let distance = Math.sqrt(1 - Math.pow(y, 2));
            let _phi = ((i + random) % amount) * increment;
            let x = Math.cos(_phi) * distance;
            let z = Math.sin(_phi) * distance;
            x = x * _radius;
            y = y * _radius;
            z = z * _radius;
            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    },

    getRandomSphericalPositionsWithBias(howMany, radius, bias) {
        var vectors = [];
        var spherical = new THREE.Spherical();
        spherical.radius = radius;
        for (var i = 0; i < howMany; i += 1) {
            spherical.phi = getRndBias(0, Math.PI, Math.PI / 2, bias); // Phi is between 0 - PI
            spherical.theta = THREE.Math.randFloat(0, Math.PI * 2); // Theta is between 0 - 2 PI
            var vec3 = new THREE.Vector3().setFromSpherical(spherical);
            vectors.push(vec3);
        }
        return vectors;

        function getRndBias(min, max, bias, influence) {
            const rnd = Math.random() * (max - min) + min; // random in range
            const mix = Math.random() * influence; // random mixer
            return rnd * (1 - mix) + bias * mix; // mix full range and bias
        }
    },

    calculateDistanceFromWidth(m) {
        let c = 1 / Math.pow(window.innerWidth, 0.1) * m;
        console.log('calculateDistanceFromWidth:', c)
        return c;
    },

    // Gui

    addGui(name, value, callback, isColor, min, max) {
        let node;
        param[name] = value;
        if (isColor) {
            node = this.gui.addColor(param, name).onChange(function () {
                callback(param[name]);
            });

        } else if (typeof value == 'object') {
            param[name] = value[Object.keys(value)[0]];
            node = this.gui.add(param, name, value).onChange(function () {
                callback(param[name]);
            });

        } else {
            node = this.gui.add(param, name, min, max).onChange(function () {
                callback(param[name]);
            });
        }
        return node;
    },

    // PostFX

    createComposer(renderTarget) {
        let composer = new EffectComposer(this.renderer, renderTarget);
        // var renderPass = new RenderPass(this.scene, this.camera);
        // composer.addPass(renderPass);
        return composer;

        // bloomPass.enabled = envParams.bloomEnabled;
        // composer.addPass(bloomPass);

        // nodeScreen = new Nodes.ScreenNode();
        // nodePass = new NodePass();
        // nodePass.enabled = envParams.nodePassEnabled;
        // composer.addPass(nodePass);

        // const effect1 = new ShaderPass(DotScreenShader);
        // effect1.uniforms['scale'].value = 4;
        // composer.addPass(effect1);

        // const effect2 = new ShaderPass(RGBShiftShader);
        // effect2.uniforms['amount'].value = 0.0015;
        // composer.addPass(effect2);
    },

    createFxPass(name, composer, params, scene) {
        switch (name) {
            case "renderPass":
                return new RenderPass(scene || this.scene, this.camera);

            case "motionBlur":
                var renderTargetParameters = {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    stencilBuffer: false
                };

                var savePass = new SavePass(new THREE.WebGLRenderTarget(this.width, this.height, renderTargetParameters));
                // blend pass

                var blendPass = new ShaderPass(BlendShader, 'tDiffuse1');
                blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture;
                blendPass.uniforms['mixRatio'].value = 0.95;
                blendPass.uniforms['opacity'].value = 0.8;
                if (this.onDebug) {
                    const folderBlur = this.gui.addFolder('Blur').close();
                    folderBlur.add(blendPass.uniforms.mixRatio, 'value', 0, 1);
                    folderBlur.add(blendPass.uniforms.opacity, 'value', 0, 1);
                    // folderBlur.add(blendPass.uniforms.bypass, 'value');
                }

                // output pass

                var outputPass = new ShaderPass(CopyShader);
                outputPass.renderToScreen = true;
                // outputPass.renderToScreen = false;

                // setup pass chain
                composer.addPass(blendPass);
                composer.addPass(savePass);
                composer.addPass(outputPass);
                break;

            case "savePass":
                return new SavePass(new THREE.WebGLRenderTarget(this.width, this.height, params));

            case "bloom":
                let bloomPass = new UnrealBloomPass(
                    new THREE.Vector2(this.width, this.height),
                    params ? params.strength : 1.5,
                    params ? params.radius : 0.4,
                    params ? params.threshold : 0.85);
                if (this.onDebug) {
                    const folderBlur = this.gui.addFolder('Bloom').close();
                    folderBlur.add(bloomPass, 'strength', 0, 10);
                    folderBlur.add(bloomPass, 'radius', 0, 1);
                    folderBlur.add(bloomPass, 'threshold', 0, 1);
                }
                if (composer) {
                    composer.addPass(bloomPass);
                }
                return bloomPass;

            case "custom":
                let finalPass = new ShaderPass(
                    new THREE.ShaderMaterial({
                        uniforms: params.uniforms || {},
                        vertexShader: params.vertexShader,
                        fragmentShader: params.fragmentShader,
                        defines: params.defines || {}
                    }), 'baseTexture'
                );
                return finalPass
        }
    },

    // Update

    updateComponents(time, deltaTime, data) {
        // console.log('on updateComponents');
        if (this.components) {
            for (let key in this.components) {
                if (Array.isArray(this.components[key])) {
                    for (let key2 in this.components[key]) {
                        if (this.components[key][key2].update) {
                            // console.log('updating', key, key2);
                            this.components[key][key2].update();
                        }
                    }
                } else {
                    if (this.components[key].update) {
                        // console.log('updating', key);
                        this.components[key].update();
                    }
                }
            }
        }
    },

    updateComponentsMaterials() {
        // console.log('on updateComponentsMaterials');
        const that = this;
        if (this.components) {
            for (let key in this.components) {
                if (Array.isArray(this.components[key])) {
                    for (let key2 in this.components[key]) {
                        if (this.components[key][key2].threeObj &&
                            this.components[key][key2].threeObj.material) {
                            // console.log('updating material', key, key2);
                            updateThisObject(this.components[key][key2].threeObj, this.components[key][key2].threeObj.material);
                        }
                    }
                } else {
                    if (this.components[key].material) {
                        // console.log('updating material', key);
                        updateThisObject(this.components[key], this.components[key].material);
                    }
                }
            }
        }

        function updateThisObject(obj, material) {
            if (obj && obj.userData && obj.userData.blockMaterialUpdate) {
                console.log("Material update was blocked: " + obj.name);
            } else {
                that.updateMaterial(material);
            }
        }
    },

    updateMaterial(material, texture, updateEnvMap) {
        if (typeof material === 'object') {
            if (material.color) material.color = new THREE.Color(this.envParams.materials.materialsColor).convertSRGBToLinear();
            material.fog = this.envParams.fog.active;
            material.wireframe = this.envParams.materials.materialsWireframe;
            material.flatShading = this.envParams.materials.materialsFlatShading;
            material.emissive = new THREE.Color(this.envParams.materials.materialsEmissiveColor).convertSRGBToLinear();
            material.emissiveIntensity = this.envParams.materials.materialEmissiveIntensity;
            material.reflectivity = this.envParams.materials.materialsReflectivity;
            material.refractionRatio = this.envParams.materials.materialsReflectionRatio;
            material.envMapIntensity = this.envParams.materials.materialEnvMapIntensity;
            material.receiveShadow = this.envParams.materials.receiveShadow;
            material.castShadow = this.envParams.materials.castShadow;

            if (material.type === "MeshStandardMaterial" || material.type === "MeshPhysicalMaterial") {
                material.roughness = this.envParams.materials.materialsRoughness;
                material.metalness = this.envParams.materials.materialsMetalness;
                material.clearcoat = this.envParams.materials.materialsClearcoat;
                material.clearcoatRoughness = this.envParams.materials.materialsClearcoatRoughness;
                material.bumpScale = this.envParams.materials.materialBumpScale;
                material.displacementScale = this.envParams.materials.materialsDisplacementScale;
                material.displacementBias = this.envParams.materials.materialsDisplacementBias;
                if (updateEnvMap) {
                    let envMap = sky ? this.pmremGenerator.fromScene(sky).texture : (terrain ? this.pmremGenerator.fromScene(terrain).texture : null);
                    material.envMap = envMap;
                    material.clearcoatMap = envMap;
                    material.clearcoatRoughnessMap = envMap;
                    // material.metalnessMap = pmremGenerator.fromScene(sky).texture;
                }
            }
            else if (material.type === "MeshPhongMaterial") {
                material.shininess = this.envParams.materials.materialsShininess;
                // material.metalness = this.envParams.phongMaterialsMetalness;
                material.specular = this.envParams.materials.materialsSpecularColor
            }

            material.needsUpdate = true;
        }
    },

    updateLight(name) {
        if (name) {
            let lightConfig = this.envParams[name];
            for (let key in lightConfig.light) {
                if (lightConfig[key] != null) {
                    if (key === 'color') {
                        let color = new THREE.Color(lightConfig.color).convertSRGBToLinear();
                        // lightConfig[key] = color;
                        lightConfig.light.color = color;
                    }
                    else if (key === 'position') {
                        // lightConfig[key].x = this.envParams[lightConfig.name][key].x;
                        // lightConfig[key].y = this.envParams[lightConfig.name][key].y;
                        // lightConfig[key].z = this.envParams[lightConfig.name][key].z;
                        lightConfig.light.position.set(
                            lightConfig.position.x,
                            lightConfig.position.y,
                            lightConfig.position.z
                        );
                    }
                    else if (key === 'shadow') {
                        // lightConfig[key].camera.near = this.envParams[lightConfig.name][key].camera.near;
                        // lightConfig[key].camera.far = this.envParams[lightConfig.name][key].camera.far;
                        // lightConfig[key].focus = this.envParams[lightConfig.name][key].focus;
                        // lightConfig[key].camera.updateProjectionMatrix();
                        lightConfig.light.shadow.camera.near = lightConfig.shadow.camera.near;
                        lightConfig.light.shadow.camera.far = lightConfig.shadow.camera.far;
                        lightConfig.light.shadow.focus = lightConfig.shadow.focus;
                        lightConfig.light.shadow.camera.updateProjectionMatrix();
                    }
                    else {
                        // lightConfig[key] = this.envParams[lightConfig.name][key];
                        lightConfig.light[key] = lightConfig[key];
                    }
                }
            }
            // if (lightConfig.type !== "AmbientLight") {
            //     lightConfig.castShadow = this.envParams.castShadow;
            // }
        }
    },

    updateGUI(guiController, updateMaterials) {
        // onEnvironmentUpdate = true;

        if (guiController != null) {
            console.log('updateEnvironment:', guiController.controller.parent._title)
        }

        const toneMapping = THREE[visualComponents.envParams.renderer.toneMapping];
        if (toneMapping) {
            visualComponents.renderer.toneMapping = toneMapping;
        }
        visualComponents.renderer.toneMappingExposure = Math.pow(visualComponents.envParams.renderer.rendererExposure, 4.0);
        visualComponents.renderer.gammaFactor = visualComponents.envParams.renderer.rendererGamma;
        visualComponents.renderer.setClearColor(visualComponents.envParams.renderer.rendererBackgroundColor);

        // scene.background = new THREE.Color(envParams.scene.sceneBackgroundColor);

        if (visualComponents.envParams.fog.active) {
            visualComponents.scene.fog = new THREE.Fog(
                new THREE.Color(visualComponents.envParams.fog.color),
                visualComponents.envParams.fog.near,
                visualComponents.envParams.fog.far
            );
        } else {
            visualComponents.scene.fog = null;
        }

        if (visualComponents.components.sun) {
            // let _phi = THREE.MathUtils.degToRad(90 - (animations.initAnimation ? animations.startElevation : envParams.elevation));
            let _phi = THREE.MathUtils.degToRad(90 - (visualComponents.envParams.components.sun.elevation));
            let _theta = THREE.MathUtils.degToRad(visualComponents.envParams.components.sun.azimuth);
            visualComponents.components.sun.setFromSphericalCoords(1, _phi, _theta);
        }

        if (visualComponents.envParams.components.sky) {
            visualComponents.components.sky.visible = visualComponents.envParams.components.sky.visible;
            let skyUniforms = visualComponents.components.sky.material.uniforms;
            skyUniforms['turbidity'].value = visualComponents.envParams.components.sky.turbidity;
            skyUniforms['rayleigh'].value = visualComponents.envParams.components.sky.rayleigh;
            skyUniforms['mieCoefficient'].value = visualComponents.envParams.components.sky.mieCoefficient;
            skyUniforms['mieDirectionalG'].value = visualComponents.envParams.components.sky.mieDirectionalG;
            skyUniforms['sunPosition'].value.copy(visualComponents.components.sun);
            // let color = new THREE.Color(visualComponents.envParams.skyColor);
            // skyUniforms['color'].value = { x: color.r * 0.00001, y: color.g * 0.00001, z: color.b * 0.00001 };
            // color = new THREE.Color(envParams.skyRayColor);
            // skyUniforms['rayColor'].value = { x: color.r * 0.000001, y: color.g * 0.000001, z: color.b * 0.000001 };
            // console.log(skyUniforms['color'].value);
            // console.log(skyUniforms['rayColor'].value);
            visualComponents.scene.environment = visualComponents.pmremGenerator.fromScene(visualComponents.components.sky).texture;
        }

        if (visualComponents.components.water) {
            let waterUniforms = visualComponents.components.water.material.uniforms;
            waterUniforms['size'].value = visualComponents.envParams.components.water.size;
            waterUniforms['sunDirection'].value.copy(visualComponents.components.sun).normalize();
            waterUniforms['waterColor'].value = new THREE.Color(visualComponents.envParams.components.water.waterColor).convertSRGBToLinear();
            waterUniforms['sunColor'].value = new THREE.Color(visualComponents.envParams.components.sun.color).convertSRGBToLinear();
            waterUniforms['distortionScale'].value = visualComponents.envParams.components.water.waterDistortionScale;
            visualComponents.components.water.visible = visualComponents.envParams.components.water.visible;
            visualComponents.components.water.receiveShadow = visualComponents.envParams.lights.receiveShadow;
        }

        // if (group) {
        //     let _updateMaterials = updateMaterials ||
        //         (guiController && (guiController.controller.parent._title === "Sky" || guiController.controller.parent._title === "Renderer"));
        //     for (let i in group.children) {
        //         group.children[i].castShadow = envParams.castShadow;
        //         group.children[i].receiveShadow = envParams.receiveShadow;
        //         let material = group.children[i].material;
        //         if (Array.isArray(material)) {
        //             for (let y in material) {
        //                 updateMaterial(material[y], null, _updateMaterials);
        //             }
        //         } else {
        //             updateMaterial(material, null, _updateMaterials);
        //         }
        //     }
        // }

        // let lightsKeys = Object.keys(visualComponents.envParams.lights);
        for (let name in visualComponents.envParams.lights.lights) {
            // let i = lightsKeys[a];
            visualComponents.updateLight(name);
        }
        if (visualComponents.envParams.lights.lightHelpers) {
            for (let i in visualComponents.envParams.lights.lightHelpers) {
                visualComponents.envParams.lights.lightHelpers[i].update();
            }
        }

        for (let name in visualComponents.components) {
            if (visualComponents.components[name].guiUpdate) {
                visualComponents.components[name].guiUpdate(guiController);
            }
        }

        if (visualComponents.updateGuiCallback) {
            visualComponents.updateGuiCallback(guiController);
        }

        visualComponents.camera.fov = visualComponents.envParams.camera.fov;
        visualComponents.camera.far = visualComponents.envParams.camera.far;
        visualComponents.camera.updateProjectionMatrix();

        visualComponents.controls.enableDamping = visualComponents.envParams.camera.enableDamping;
        visualComponents.controls.dampingFactor = visualComponents.envParams.camera.dampingFactor;
        visualComponents.controls.zoomSpeed = visualComponents.envParams.camera.zoomSpeed;
        visualComponents.controls.minDistance = visualComponents.envParams.camera.minDistance || 0;
        visualComponents.controls.maxDistance = visualComponents.envParams.camera.maxDistance || Infinity;
        visualComponents.controls.enableRotate = visualComponents.envParams.camera.enableControlsRotation;
        visualComponents.controls.autoRotateSpeed = visualComponents.envParams.camera.cameraRotationSpeed;
        visualComponents.controls.autoRotate = visualComponents.envParams.camera.enableCameraRotation;

        // onEnvironmentUpdate = false; 

    },

    updateLoadingStates(url, state) {
        this.loadingStates[url] = {
            url: url,
            loaded: state
        }
        if (state) {
            this.loadingStates.loaded++;
            this.loadingStates.progress = this.loadingStates.loaded * 100 / this.loadingStates.destination;
        }
        if (this.uiFilesDownloadCallback) {
            this.uiFilesDownloadCallback(this.loadingStates);
        }
    },

    //

    onWindowResize(width, height) {
        if (this.renderer && this.camera) {
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            if (this.controls && this.controls.handleResize) {
                this.controls.handleResize();
            }
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            if (this.composer) this.composer.setSize(width, height);
        }
    }
}

export default visualComponents;