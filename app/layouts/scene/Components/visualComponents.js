import * as THREE from "vendor_mods/three/build/three.module.js";
// import GUI from 'lil-gui';
var GUI;

import _ from 'lodash';

// import { OBJLoader } from 'vendor_mods/three/examples/jsm/loaders/OBJLoader.js';
import { FontLoader } from 'vendor_mods/three/examples/jsm/loaders/FontLoader';

import { OrbitControls } from "vendor_mods/three/examples/jsm/controls/OrbitControls"
// import { TrackballControls } from 'vendor_mods/three/examples/jsm/controls/TrackballControls';
import { FirstPersonControls } from 'vendor_mods/three/examples/jsm/controls/FirstPersonControls.js';

// import { TextGeometry } from "vendor_mods/three/examples/jsm/geometries/TextGeometry";
// import { ConvexObjectBreaker } from 'vendor_mods/three/examples/jsm/misc/ConvexObjectBreaker';

import { EffectComposer } from 'vendor_mods/three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'vendor_mods/three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'vendor_mods/three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'vendor_mods/three/examples/jsm/postprocessing/ShaderPass.js';
import { SavePass } from 'vendor_mods/three/examples/jsm/postprocessing/SavePass.js';
import { UnrealBloomPass } from 'vendor_mods/three/examples/jsm/postprocessing/UnrealBloomPass';
import { BokehPass } from 'vendor_mods/three/examples/jsm/postprocessing/BokehPass';
import { SSAARenderPass } from 'vendor_mods/three/examples/jsm/postprocessing/SSAARenderPass';
import { AdaptiveToneMappingPass } from 'vendor_mods/three/examples/jsm/postprocessing/AdaptiveToneMappingPass';

import { FXAAShader } from 'vendor_mods/three/examples/jsm/shaders/FXAAShader.js';
import { BlendShader } from 'vendor_mods/three/examples/jsm/shaders/BlendShader.js';
import { CopyShader } from 'vendor_mods/three/examples/jsm/shaders/CopyShader.js';

import Stats from 'vendor_mods/three/examples/jsm/libs/stats.module'

import { Water } from 'vendor_mods/three/examples/jsm/objects/Water.js';
import { Sky } from 'vendor_mods/three/examples/jsm/objects/Sky.js';

// import physicsRendererComponent from './PhysicsRenderer/physicsRendererComponent';
// import ExpandingSmoke from "./Shaders/ExpandingSmoke/ExpandingSmoke.js";
// import WaveletNoise from './Shaders/WaveletNoise/WaveletNoise';
// import TestShader from './Shaders/TestShader/TestShader';
// import AlienSphere from "./Shaders/AlianSphere/AlianSphere.js";
// import Protoplanet from './Shaders/Protoplanet/protoplanet';
// import BlobPlanet from './Shaders/BlobPlanet/BlobPlanet';

// import SeaScape from "./Environment/Water/Seascape/SeaScape.js";
import WaterWaves from "./Environment/Water/WaterWaves/WaterWaves.js";
// import MsdfText from "./Text/MsdfText/MsdfText";
import Text from "./Text/Text/Text";

import SphereMesh from './Objects/SphereMesh/SphereMesh';
import Spline from "./Objects/Spline/Spline";

import VisualAudio from "./Audio/Audio";

import appUtils from '../../../utils/appUtils.js';

export class VisualUtils {
    // text

    static createTextLabel(elementType, id, text, delay) {
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
    }

    // Calculations

    static screenToWorld(x, y, canvasWidth, canvasHeight, _camera) {
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
    }

    static getRandomPointsOnSphere(radius, amount) {
        var points = [];
        for (let i = 0; i < amount; i++) {
            let _pos = new THREE.Vector3();
            let _theta = THREE.MathUtils.randFloatSpread(360);
            let _phi = THREE.MathUtils.randFloatSpread(360);

            _pos.x = radius * Math.sin(_theta) * Math.cos(_phi);
            _pos.y = radius * Math.sin(_theta) * Math.sin(_phi);
            _pos.z = radius * Math.cos(_theta);
            points.push(_pos);
        }
        return points;
    }

    static getFibonacciSpherePoints(_radius, amount, randomize) {
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
    }

    static getRandomSphericalPositionsWithBias(howMany, radius, bias) {
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
    }

    static calculateDistanceFromWidth(m) {
        let c = 1 / Math.pow(window.innerWidth, 0.1) * m;
        console.log('calculateDistanceFromWidth:', c)
        return c;
    }

    static orbitAroundVector(object, target, radius, theta, speed, twisted) {
        if (twisted) {
            object.position.x = Math.sin(theta * speed) * radius * 1.5 + target.x;
            object.position.y = Math.sin(theta * speed) * radius + target.y;
            object.position.z = Math.cos(theta * speed) * radius * 1.5 + target.z;
        } else {
            object.position.x = Math.sin(theta * speed) * radius + target.x;
            object.position.y = Math.sin(theta * speed) * radius + target.y;
            object.position.z = Math.cos(theta * speed) * radius + target.z;
        }
        object.lookAt(target);
    }
}

class VisualComponents {
    sceneElement;
    width;
    height;
    onDebug;

    renderer;
    scene;
    camera;
    controls;
    gui;
    stats;

    composer;
    composers;
    renderPasses;
    pmremGenerator;
    envKey;

    loadingManager;
    textureLoader;
    objLoader;
    fileLoader;
    fontLoader;

    components;
    envParams;

    defaultMaterial;
    debreDefaultMaterial;

    helpers;
    lightHelpers;

    VisualTypes = {
        camera: {
            PERSPECTIVE_CAMERA: 1
        },
        controls: {
            ORBIT_CONTROLS: 1,
            FPS_CONTROLS: 2
        }
    }

    init(sceneElement, envParams, onDebug, loadingManager) {
        this.components = {};
        this.envParams = envParams;
        this.onDebug = onDebug;
        this.sceneElement = sceneElement;
        this.width = sceneElement.clientWidth;
        this.height = sceneElement.clientHeight;
        this.helpers = {};
        this.composers = [];
        this.renderPasses = {};

        this.loadingManager = loadingManager;
        this.initLoadingManager();

        window.addEventListener('mousemove', this.onInputEvent, false);
        window.addEventListener('pointerdown', this.onInputEvent, false);
        window.addEventListener('pointerup', this.onInputEvent, false);
        window.addEventListener('wheel', this.onInputEvent, false);

        // window.addEventListener("touchstart", this.onTouchStart, false);
        // window.addEventListener("touchend", this.onTouchEnd, false);
        // window.addEventListener("touchcancel", this.onTouchCancel, false);
        window.addEventListener("touchmove", this.onInputEvent, false);

        window.addEventListener("keydown", this.onInputEvent, false);

        this.stats = Stats();
        this.stats.domElement.style.cssText = 'position:absolute;bottom:0px;left:0px;';
        this.stats.domElement.style.display = this.onDebug || this.envParams.device.showStats ? 'block' : 'none';
        document.body.appendChild(this.stats.dom)

        if (onDebug) {
            GUI = lil.GUI;
            this.gui = new GUI().close();
            this.gui.onChange((controller) => this.updateGUI(controller));

            const guiFolder = this.addGui('Gui', this.envParams.gui_controls);
            guiFolder.onChange(v => {
                switch (v.property.toLowerCase()) {
                    case "hide":
                        document.getElementsByClassName("lil-gui")[0].style.display = 'none';
                        this.stats.showPanel();
                        break;

                    case "download":
                        //
                        break;
                }
            })
        }
    }

    createRenderer(rendererOptions, glVersion, isSecondary) {
        console.log("> VisualComponents. Create renderer < ");
        let renderer;
        if (glVersion === 1) {
            renderer = new THREE.WebGL1Renderer(rendererOptions);
        } else {
            renderer = new THREE.WebGLRenderer({ ...rendererOptions, preserveDrawingBuffer: !this.envParams.editor.enabled });
        }

        renderer.setSize(this.width, this.height);
        this.processDeviceProfile(renderer);
        renderer.setClearColor(this.envParams.renderer.rendererBackgroundColor);

        const toneMapping = THREE[
            this.envParams.renderer.toneMapping_values[this.envParams.renderer.toneMapping]
        ];
        if (toneMapping) {
            renderer.toneMapping = toneMapping;
        }
        renderer.toneMappingExposure = this.envParams.renderer.rendererExposure;
        renderer.gammaFactor = this.envParams.renderer.rendererGamma;

        renderer.autoClear = !this.envParams.editor.enabled;
        renderer.autoClearColor = !this.envParams.editor.enabled;

        if (!isSecondary) {
            this.renderer = renderer;
            this.pmremGenerator = new THREE.PMREMGenerator(renderer);
            if (this.onDebug) {
                const folderRenderer = this.gui.addFolder('Renderer').close();
                folderRenderer.add(this.envParams.renderer, 'toneMapping', this.envParams.renderer.toneMapping_values).onChange(v => {
                    this.renderer.toneMapping = THREE[v];
                });
                folderRenderer.add(this.envParams.renderer, 'rendererExposure', 0, 2, 0.1);
                folderRenderer.add(this.envParams.renderer, 'rendererGamma', 0, 3, 0.1).disable();
                folderRenderer.addColor(this.envParams.renderer, 'rendererBackgroundColor');
            }
        }

        return renderer;
    }

    createScene() {
        console.log(`> VisualComponents. Create scene <`);

        this.scene = new THREE.Scene();
        if (this.envParams.scene.sceneBackgroundColor) {
            this.scene.background = new THREE.Color(this.envParams.scene.sceneBackgroundColor);
        } else {
            this.scene.background = new THREE.Color("0x000000");
        }
        if (this.envParams.scene.fog.active) {
            this.createFog(this.envParams.scene.fog.type);
        }

        if (this.onDebug) {
            this.initEditor();

            this.addGui('Scene', this.envParams.scene).onChange(
                ({ controller, value, property }) => {
                    this.scene.background = new THREE.Color(this.envParams.scene.sceneBackgroundColor);
                    if (controller.parent._title === 'fog') {
                        if (this.envParams.scene.fog.active) {
                            this.createFog(this.envParams.scene.fog.type);
                        }
                        else {
                            this.scene.fog = null;
                        }
                    }

                }
            );
        }
    }

    createCamera(cameraType, controlsType, isSecondary) {
        console.log(`> VisualComponents. Create camera: ${cameraType} <`);
        const setCameraParams = (key, value) => {
            switch (this.VisualTypes.camera[this.cameraType]) {
                case this.VisualTypes.camera.PERSPECTIVE_CAMERA:
                    switch (key.toLowerCase()) {
                        case "position":
                            this.camera.position.copy(
                                new THREE.Vector3(
                                    this.envParams.camera[key].x,
                                    this.envParams.camera[key].y,
                                    this.envParams.camera[key].z
                                ));
                            break;

                        case "lookat":
                            this.camera.lookAt(
                                this.envParams.camera[key].x * Math.PI,
                                this.envParams.camera[key].y * Math.PI,
                                this.envParams.camera[key].z * Math.PI
                            )
                            break;

                        default:
                            this.camera[key] = value;
                            break;
                    }
                    break;

                default:
                    console.log(`> VisualComponents: setCameraParams -> Camera type is not supported: ${controlsType}`);
                    break;
            }
            this.camera.updateProjectionMatrix();
        }

        const setControlsParams = (key, value) => {
            if (key.toLowerCase() !== 'type') {
                switch (this.VisualTypes.controls[controlsType]) {
                    case this.VisualTypes.controls.ORBIT_CONTROLS:
                        switch (key) {
                            default:
                                this.controls[key] = value;
                                break;
                        }
                        break;

                    case this.VisualTypes.controls.FPS_CONTROLS:
                        switch (key.toLowerCase()) {
                            case "verticalmax":
                            case "verticalmin":
                                this.controls[key] = Math.PI * value;
                                break;

                            case "lookat":
                                this.controls.enabled = false;
                                this.controls.lookAt(
                                    new THREE.Vector3(
                                        this.controls.lookAt.x,
                                        this.controls.lookAt.y,
                                        this.controls.lookAt.z
                                    )
                                )
                                this.controls.enabled = true;
                                break;

                            default:
                                this.controls[key] = value;
                                break;
                        }
                        break;
                }
            }
        }

        let camera;

        if (cameraType) {
            this.cameraType = cameraType;

            switch (this.VisualTypes.camera[cameraType]) {
                case this.VisualTypes.camera.PERSPECTIVE_CAMERA:
                    camera = new THREE.PerspectiveCamera(
                        this.envParams.camera.fov,
                        this.width / this.height,
                        this.envParams.camera.near,
                        this.envParams.camera.far
                    );
                    break;

                default:
                    console.log(`> VisualComponents: Camera is not supported: ${controlsType}`);
                    break;
            }

            if (this.onDebug) {
                this.addGui('Camera', this.envParams.camera, 'type')
                    .onChange(v => {
                        if (v.controller.parent._title.toLowerCase() !== 'controls') {
                            setCameraParams(v.controller.parent._title, v.value);
                        } else {
                            setCameraParams(v.property, v.value);
                        }
                        this.helpers[cameraType + '_helper'].visible = this.envParams.camera.cameraHelper;
                    });

                const cameraPerspectiveHelper = new THREE.CameraHelper(camera);
                cameraPerspectiveHelper.visible = this.envParams.camera.cameraHelper;
                this.scene.add(cameraPerspectiveHelper);
                this.helpers[cameraType + '_helper'] = (cameraPerspectiveHelper);
            }

            if (!isSecondary) {
                this.camera = camera;
                for (const key in this.envParams.camera) {
                    setCameraParams(key, this.envParams.camera[key]);
                }

                if (controlsType) {
                    this.controlsType = controlsType;

                    switch (this.VisualTypes.controls[controlsType]) {
                        case this.VisualTypes.controls.ORBIT_CONTROLS:
                            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                            break;

                        case this.VisualTypes.controls.FPS_CONTROLS:
                            this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
                            break;

                        default:
                            console.log(`> VisualComponents: Camera controls are not supported / missing: ${controlsType}`);
                            break;
                    }

                    for (const key in this.envParams.camera_controls) {
                        setControlsParams(key, this.envParams.camera_controls[key]);
                    }

                    if (this.onDebug && controlsType) {
                        const cameraFolder = this.addGui('Camera Controls', this.envParams.camera_controls, 'type');
                        cameraFolder.onChange(v => {
                            if (v.controller.parent._title !== 'Camera Controls') {
                                setControlsParams(v.controller.parent._title, v.value);
                            } else {
                                setControlsParams(v.property, v.value);
                            }
                        })
                    }
                }

                this.scene.add(this.camera);
            }

        } else {
            console.log(`> VisualComponents: Camera type is missing`);
        }
    }

    createLights() {
        if (this.onDebug) {
            this.lightHelpers = [];
            const lightsFolder = this.gui.addFolder("Lights").close();
            lightsFolder.add(this.envParams.lights, 'debug').onChange(state => {
                this.lightHelpers.forEach(h => h.visible = state);
            });
        }
        for (let key in this.envParams.lights.lights) {
            if (window.osType && window.osType.toLowerCase() === 'ios' && this.envParams.lights.lights[key].hideInIos) {
                // skip this light
            } else {
                this.scene.add(this.addLight(key, this.envParams.lights.lights[key]));
            }
        }
    }

    setSceneEnvironment(key) {
        this.envKey = key;
        if (this.components[key]) {
            this.scene.environment = this.pmremGenerator.fromScene(this.components[key]).texture;
        }
        else {
            this.scene.environment = this.pmremGenerator.fromScene(this.scene).texture;
        }
    }

    initEditor() {
        this.editorCamera = new THREE.PerspectiveCamera(
            this.envParams.camera.fov,
            (this.width / 3.5) / (this.height / 3.5),
            this.envParams.camera.near,
            this.envParams.camera.far);
        this.editorCamera.position.copy(
            new THREE.Vector3(
                this.envParams.editor.editorCameraPos ?
                    this.envParams.editor.editorCameraPos.x
                    : this.envParams.camera.position.x,
                this.envParams.editor.editorCameraPos ?
                    this.envParams.editor.editorCameraPos.y
                    : this.envParams.camera.position.y,
                this.envParams.editor.editorCameraPos ?
                    this.envParams.editor.editorCameraPos.z
                    : this.envParams.camera.position.z,
            ));
        this.editorCamera.lookAt(
            this.envParams.camera.lookAt.x * Math.PI,
            this.envParams.camera.lookAt.y * Math.PI,
            this.envParams.camera.lookAt.z * Math.PI
        )

        if (this.envParams.editor.enabled && !this.editorControls) {
            this.editorControls = new OrbitControls(this.editorCamera, this.renderer.domElement);
        }

        this.gridHelper = new THREE.GridHelper(
            this.envParams.editor.grid.scale,
            this.envParams.editor.grid.segments,
            new THREE.Color(this.envParams.editor.grid.color));
        this.gridHelper.material.opacity = this.envParams.editor.grid.opacity;
        this.gridHelper.material.transparent = this.envParams.editor.grid.transparent;
        this.gridHelper.visible = this.envParams.editor.enabled && this.envParams.editor.grid.visible;
        this.gridHelper.position.copy(new THREE.Vector3(
            this.envParams.editor.grid.position.x,
            this.envParams.editor.grid.position.y,
            this.envParams.editor.grid.position.z
        ));
        this.scene.add(this.gridHelper);

        this.addGui('Editor', this.envParams.editor).onChange(
            controller => {
                this.gridHelper.visible = this.envParams.editor.enabled && this.envParams.editor.grid.visible;
                this.gridHelper.position.copy(new THREE.Vector3(
                    this.envParams.editor.grid.position.x,
                    this.envParams.editor.grid.position.y,
                    this.envParams.editor.grid.position.z
                ));
                this.gridHelper.material.color = new THREE.Color(this.envParams.editor.grid.color);
                this.gridHelper.material.opacity = this.envParams.editor.grid.opacity;
                this.gridHelper.material.transparent = this.envParams.editor.grid.transparent;
                if (this.envParams.editor.enabled && this.envParams.editor.overrideLights) {
                    this.renderer.toneMappingExposure = 1;
                } else {
                    this.renderer.toneMappingExposure = this.envParams.components.sun.exposure;
                }

                switch (controller.property.toLowerCase()) {
                    case "get_distance": {
                        const source = appUtils.reduceArrayToValue(this.envParams.editor.functions.source.value.split(',').map(v => v.trim()), this);
                        const value = appUtils.reduceArrayToValue(this.envParams.editor.functions.value.value.split(',').map(v => v.trim()), this);
                        const v = source.distanceTo(value);
                        console.log(v);
                        alert(v);
                    }
                        break;

                    case "get_camera_position": {
                        const v = `Camera: ${this.camera.position.x} ${this.camera.position.y} ${this.camera.position.z}
                        Editor Camera: ${this.editorCamera.position.x} ${this.editorCamera.position.y} ${this.editorCamera.position.z}`
                        console.log(v);
                        alert(v);
                    }
                        break;
                }
            }
        );
    }

    initLoadingManager() {
        THREE.DefaultLoadingManager.onStart = this.loadingManager.updateStart;
        THREE.DefaultLoadingManager.onLoad = this.loadingManager.updateLoad;
        THREE.DefaultLoadingManager.onProgress = this.loadingManager.updateProgress;
        THREE.DefaultLoadingManager.onError = this.loadingManager.updateError;

        this.textureLoader = new THREE.TextureLoader();
        this.fileLoader = new THREE.FileLoader();
        this.fontLoader = new FontLoader();
    }

    processDeviceProfile(renderer) {

        renderer.setPixelRatio(window.devicePixelRatio || 1);

        this.envParams.renderer.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        global.isLowEndMobile = appUtils.isLowEndMobile;

        if (this.envParams.renderer.maxAnisotropy <= 4 || global.isLowEndMobile) {
            global.isLowEndMobile = true;
            appUtils.isLowEndMobile = true;
            this.envParams.lights.castShadow = false;
            this.envParams.lights.receiveShadow = false;
            this.envParams.materials.onReflections = false;
        }

        this.envParams.device = {
            ...this.envParams.device,
            gpu: appUtils.gpu,
            antialias: appUtils.isLowEndMobile ? false : this.envParams.renderer.antialias,
            encoding: renderer.outputEncoding,
            precision: renderer.capabilities.precision,
            max_anisotropy: renderer.capabilities.getMaxAnisotropy(),
            max_attributes: renderer.capabilities.maxAttributes,
            max_samples: renderer.capabilities.maxSamples,
            max_textureSize: renderer.capabilities.maxTextureSize,
            max_textures: renderer.capabilities.maxTextures,
            max_vertex_textures: renderer.capabilities.maxVertexTextures,
            devicePixelRatio: renderer.getPixelRatio(),
            hardwareConcurrency: navigator.hardwareConcurrency,
            isMobile: appUtils.isMobile,
            isLowEndMobile: global.isLowEndMobile
        }

        let state = 'medium';
        if (this.envParams.device.settingsStateUser) {
            // Was chosen by user, skip auto detected
            state = this.envParams.device.settingsStateUser;
        } else {
            switch (appUtils.gpu.tier) {
                case 1:
                    state = 'low';
                    if (!appUtils.isMobile && this.envParams.device.precision === 'highp') {
                        state = 'medium';
                    }
                    break;

                case 2:
                    state = 'medium';
                    if (appUtils.isMobile) {
                        state = 'low';
                    }
                    break;

                case 3:
                    state = 'high';
                    if (appUtils.isMobile) {
                        state = 'low';
                    }
                    if (appUtils.gpu.integrated) {
                        state = 'medium';
                    }
                    break;
            }
        }
        appUtils.settingsState = state;
        global.settingsState = state;
        this.envParams.device.settingsState = state;

        renderer.shadowMap.enabled = state !== 'low';
        renderer.shadowMap.autoUpdate = state !== 'low';
        renderer.shadowMap.type = state === 'low' ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;

        // Override mobile settings
        if (appUtils.isMobile) {
            if (this.envParams.settings[state + "_mobile"]) {
                _.merge(this.envParams.settings[state], this.envParams.settings[state + "_mobile"]);
                let osSettings, settingsKey;
                for (const key in this.envParams.settings) {
                    if (key.indexOf(appUtils.os.type) >= 0) {
                        osSettings = this.envParams.settings[key];
                        settingsKey = key;
                        break;
                    }
                }
                if (settingsKey) {
                    settingsKey = settingsKey.substring(settingsKey.lastIndexOf("_") + 1, settingsKey.length);
                    if (parseInt(settingsKey) > 0) {
                        settingsKey = parseInt(settingsKey);
                        if (appUtils.os.version <= settingsKey) {
                            console.log(`> Merging mobile version settings: ${settingsKey} <`, osSettings);
                            _.merge(this.envParams.settings[state], osSettings);
                        }
                    } else {
                        console.log(`> Merging mobile os settings: ${settingsKey} <`, osSettings);
                        _.merge(this.envParams.settings[state], osSettings);
                    }
                }
            }
        }
        const tierSettings = this.envParams.settings[state];

        console.info('Device Profile:', this.envParams.device);
        console.info('Tier Settings:', tierSettings);

        for (const key in tierSettings) {
            if (key !== 'components') {
                _.merge(this.envParams[key], tierSettings[key]);
            }
        }
        for (const componentKey in tierSettings.components) {
            if (this.envParams.components[componentKey]) {
                this.envParams.components[componentKey] =
                    _.merge(this.envParams.components[componentKey], tierSettings.components[componentKey]);
            }
        }

        if (this.onDebug) {
            this.addGui('device', this.envParams.device).onChange(v => {
                switch (v.property) {
                    case "showDebugView":
                        document.getElementById('scene_debug').style.display = v.value ? 'flex' : 'none';
                        break;
                }
            });
        }
    }

    //Objects

    createObject(name, type, callback) {
        const that = this;
        return new Promise((resolve, reject) => {
            let component;
            switch (type.toLowerCase()) {
                case "nebula":
                    // nebula.init(this.scene);
                    // resolve(nebula);
                    break;

                case "physicsrenderer":
                    physicsRendererComponent.init(this.scene, this.renderer);
                    resolve(physicsRendererComponent);
                    break;

                case "seascape":
                    // No working
                    component = new SeaScape(name, this.envParams.components.SeaScape);
                    this.components[name] = component;
                    if (this.onDebug) {
                        this.addGui('SeaScape', this.envParams.components.SeaScape);
                    }
                    resolve(component);
                    break;

                case "waterwaves":
                    if (!this.components.sun) {
                        this.createSun();
                    }

                    component = new WaterWaves({
                        name: name,
                        envParams: this.envParams.components.WaterWaves,
                        sun: this.components.sun,
                        sunParams: this.envParams.components.sun
                    });
                    this.components[name] = component;
                    if (this.onDebug) {
                        this.addGui('WaterWaves', this.envParams.components.WaterWaves);
                    }
                    resolve(component);
                    break;

                case "water": {
                    if (!this.components.sun) {
                        this.createSun();
                    }

                    const waterSize = appUtils.isMobile ? 5000 : 10000;
                    const waterGeometry = new THREE.PlaneGeometry(waterSize, waterSize)
                    this.components.water = new Water(
                        waterGeometry,
                        {
                            textureWidth: appUtils.isMobile ? this.envParams.components.water.scale / 2 : this.envParams.components.water.scale,
                            textureHeight: appUtils.isMobile ? this.envParams.components.water.scale / 2 : this.envParams.components.water.scale,
                            waterNormals: this.textureLoader.load(
                                this.envParams.components.water.normalMap,
                                function (_texture) {
                                    _texture.wrapS = _texture.wrapT = THREE.RepeatWrapping;
                                }),
                            sunDirection: this.components.sun,
                            sunColor: this.envParams.components.sun.color,
                            waterColor: this.envParams.components.water.waterColor,
                            distortionScale: this.envParams.components.water.waterDistortionScale,
                            fog: this.envParams.scene.fog.active
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
                        folderWater.add(this.envParams.components.water, 'normalMap', this.envParams.assets.normalMaps)
                            .onChange(val => {
                                VisualComponents.textureLoader.load(val,
                                    function (_texture) {
                                        _texture.wrapS = _texture.wrapT = THREE.RepeatWrapping;
                                        VisualComponents.components.water.material.uniforms['normalSampler'].value = _texture;
                                    });
                            });
                        folderWater.addColor(this.envParams.components.water, 'waterColor');
                        folderWater.add(this.envParams.components.water, 'waterDistortionScale', 0, 20, 0.1);
                        folderWater.add(this.envParams.components.water, 'waterSpeed', 0, 0.1, 0.0001);
                    }

                    resolve(this.components.water);
                }
                    break;

                case "sky": {
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
                    skyUniforms['sunPosition'].value.copy(this.components.sun);

                    this.renderer.toneMappingExposure =
                        this.envParams.editor.enabled && this.envParams.editor.overrideLights ?
                            1 :
                            this.envParams.components.sun.exposure;

                    if (this.onDebug) {
                        const folderSky = this.gui.addFolder('Sky').close();
                        folderSky.add(this.envParams.components.sky, 'visible');
                        folderSky.add(this.envParams.components.sky, 'turbidity', 0.0, 20.0, 0.1);
                        folderSky.add(this.envParams.components.sky, 'rayleigh', 0.0, 4, 0.001);
                        folderSky.add(this.envParams.components.sky, 'mieCoefficient', 0.0, 0.1, 0.001);
                        folderSky.add(this.envParams.components.sky, 'mieDirectionalG', 0.0, 1, 0.001);
                    }

                    resolve(this.components.sky);
                }
                    break;

                case "protoplanet":
                    Protoplanet.init(this.renderer, this.scene || this.scene, this.camera, null).then(
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
                    // ThreeJS inject has error
                    // BlobPlanet.init(this.renderer, scene || this.scene, this.camera, this.envParams, position, that.onDebug ? that.gui : null).then(
                    //     function () {
                    //         resolve(BlobPlanet);
                    //     }, function (e) {
                    //         reject(e);
                    //     }
                    // )
                    break;

                case "spheremesh":
                    component = new SphereMesh(name, this.envParams.components.SphereMesh, { textureLoader: this.textureLoader });
                    this.components[name] = component;
                    if (this.onDebug) {
                        this.addGui('SphereMesh', this.envParams.components.SphereMesh);
                    }
                    resolve(component);
                    break;

                case "msdftext":
                    new MsdfText({
                        name: name,
                        envParams: this.envParams.components[name],
                        textureLoader: this.textureLoader,
                        fontLoader: this.fontLoader,
                        onLoad: (_component) => {
                            this.components[name] = _component;
                            resolve(_component)
                        }
                    });

                    if (this.onDebug) {
                        this.addGui(name, this.envParams.components[name]);
                    }
                    break;

                case "text":
                    new Text({
                        name: name,
                        envParams: this.envParams.components[name],
                        textureLoader: this.textureLoader,
                        fontLoader: this.fontLoader,
                        onLoad: (_component) => {
                            this.components[name] = _component;
                            resolve(_component)
                        }
                    });

                    if (this.onDebug) {
                        this.addGui(name, this.envParams.components[name]);
                    }
                    break;

                case "spline":
                    this.components[name] = new Spline({
                        name: name,
                        envParams: this.envParams.components[name],
                        scene: this.scene,
                        renderer: this.renderer,
                        camera: this.camera,
                        controls: this.controls,
                        editorCamera: this.editorCamera,
                        editorControls: this.editorControls
                    });

                    if (this.onDebug) {
                        this.addGui(name, this.envParams.components[name]);
                    }

                    resolve(this.components[name]);
                    break;

                case "audio":
                    this.components[name] = new VisualAudio({
                        envParams: this.envParams.components[name],
                        callback,
                        name
                    });
                    if (this.onDebug) {
                        this.addGui(name, this.envParams.components[name]);
                    }
                    resolve(this.components[name]);
                    break;

                default:
                    reject({ error: `VisualComponents createObject: object ${type} is not supported` });
                    break;
            }
        })
    }

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
    }

    createFog(type) {
        switch (type) {
            case 'Fog':
                this.scene.fog = new THREE.Fog(
                    new THREE.Color(this.envParams.scene.fog.color),
                    this.envParams.scene.fog.near,
                    this.envParams.scene.fog.far
                );
                break;

            case "FogExp2":
                this.scene.fog = new THREE.FogExp2(this.envParams.scene.fog.color, 0.005);
                break;

            default:
                console.log(`> VisualComponents: Fog -> Type is not supported: ${type} <`);
                break;
        }
    }

    createTextGeometry(text, params, material) {
        let textGeom = new TextGeometry(text, {
            font: this.font,
            ...params
        });
        let mesh = new THREE.Mesh(textGeom, material);

        // mesh.position.x = centerOffset;
        // mesh.position.y = hover;
        // mesh.position.z = 0;

        // mesh.rotation.x = 0;
        // mesh.rotation.y = Math.PI * 2;

        return mesh;
    }

    loadModel(modelUrl, materialType, textureUrl, bumpUrl, normalMapUrl, displacementUrl) {
        const that = this;
        return new Promise((resolve, reject) => {
            that.updateLoadingStates(modelUrl, false);
            if (!this.objLoader) {
                this.objLoader = new OBJLoader();
            }
            this.objLoader.load(
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
                                        child.material = VisualComponents.makeMaterial(
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
    }

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
    }

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
    }

    addNewShape(type, size, mass, position, material, parseObj, isKinematic, rotations, addCamera, breakable) {
        let mesh, btBoxShape;

        if (!material) {
            material = this.defaultMaterial.clone();
        }

        if (addCamera) {
            if (!this.cubeCamera1) {
                this.cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(256, {
                    format: THREE.RGBFormat,
                    generateMipmaps: true,
                    minFilter: THREE.LinearMipmapLinearFilter,
                    encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
                });

                this.cubeCamera1 = new THREE.CubeCamera(1, 1000, this.cubeRenderTarget1);

                this.cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget(256, {
                    format: THREE.RGBFormat,
                    generateMipmaps: true,
                    minFilter: THREE.LinearMipmapLinearFilter,
                    // encoding: THREE.sRGBEncoding
                });

                this.cubeCamera2 = new THREE.CubeCamera(1, 1000, this.cubeRenderTarget2);
            }
            let map = material.map || material.roughnessMap;
            this.cubeCameraMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                envMap: this.cubeRenderTarget2.texture,
                // transparent: true
                map: map,
                emissive: new THREE.Color(this.envParams.materials.materialsEmissiveColor).convertSRGBToLinear(),
                emissiveIntensity: this.envParams.materials.materialEmissiveIntensity,
                emissiveMap: map,
                specular: this.envParams.materials.materialsSpecularColor,
                specularMap: map,
                shininess: this.envParams.materials.materialsShininess,
                reflectivity: this.envParams.materials.materialsReflectivity,
                refractionRatio: this.envParams.materials.materialsReflectionRatio,
                // transparent: true,
                combine: THREE.MultiplyOperation,
                side: THREE.FrontSide,
            });
            material = this.cubeCameraMaterial;
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
    }

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

    }

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

    }

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

            if (object.userData.physicsBody) {
                physicsWorld.removeRigidBody(object.userData.physicsBody);
                for (let i in rigidBodies) {
                    if (rigidBodies[i].id === object.id) {
                        delete rigidBodies[i];
                    }
                }
            }



            this.scene.remove(object);
        }
    }

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
    }

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
                // refractionRatio: this.envParams.materials.materialsReflectionRatio,
            });
            this.debreDefaultMaterial = this.defaultMaterial.clone();
        }

        // if (this.onDebug) {
        //     const folderMaterials = this.gui.addFolder('Materials').close();
        //     folderMaterials.add(this.envParams.materials, 'materialEnvMapIntensity', 0, 2, 0.1);
        //     folderMaterials.addColor(this.envParams.materials, 'materialsColor');
        //     folderMaterials.addColor(this.envParams.materials, 'materialsEmissiveColor');
        //     folderMaterials.add(this.envParams.materials, 'materialEmissiveIntensity', 0, 2, 0.1);
        //     folderMaterials.add(this.envParams.materials, 'materialsReflectivity', 0, 1, 0.1);
        //     folderMaterials.add(this.envParams.materials, 'materialsReflectionRatio', 0, 0.98, 0.1);
        //     folderMaterials.add(this.envParams.materials, 'materialsWireframe');
        //     folderMaterials.add(this.envParams.materials, 'materialsFlatShading');

        //     const folderPhongMaterials = this.gui.addFolder('Phong Materials').close();
        //     folderPhongMaterials.add(this.envParams.materials, 'materialsShininess', 0, 500, 1);
        //     // folderPhongMaterials.add(envParams.materials, 'phongMaterialsMetalness', 0, 10, 0.1);
        //     folderPhongMaterials.addColor(this.envParams.materials, 'materialsSpecularColor');

        //     const folderPhysicalMaterials = this.gui.addFolder('Mesh Physical Materials').close();
        //     folderPhysicalMaterials.add(this.envParams.materials, 'materialsRoughness', 0, 1, 0.1);
        //     folderPhysicalMaterials.add(this.envParams.materials, 'materialsMetalness', 0, 1, 0.1);
        //     folderPhysicalMaterials.add(this.envParams.materials, 'materialsClearcoat', 0, 1, 0.1);
        //     folderPhysicalMaterials.add(this.envParams.materials, 'materialsClearcoatRoughness', 0, 1, 0.1);
        //     folderPhysicalMaterials.add(this.envParams.materials, 'materialBumpScale', 0, 1, 0.1);
        //     folderPhysicalMaterials.add(this.envParams.materials, 'materialsDisplacementScale', -100, 100, 0.1);
        //     folderPhysicalMaterials.add(this.envParams.materials, 'materialsDisplacementBias', -10, 10, 0.1);
        //     // folderPhysicalMaterials.add(envParams, 'materialsTransmission', 0, 1, 0.1);
        // }

    }

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
    }

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

    }

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
            texture.anisotropy = this.envParams.renderer.maxAnisotropy;
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
    }

    // Lights
    addLight(name, params, target) {
        let light, lightHelper;

        if (params && params.type) {
            params.intensity = params.intensity || 1;
            params.color = params.color || '#ffffff';
            params.name = name;

            switch (params.type.toLowerCase()) {
                case "ambientlight":
                    light = new THREE.AmbientLight(new THREE.Color(params.color), params.intensity);
                    break;

                case "directionallight":
                    light = new THREE.DirectionalLight(new THREE.Color(params.color), params.intensity);
                    if (params.target) {
                        light.target.position.set(params.x, params.y, params.z);
                    }
                    if (this.onDebug) {
                        lightHelper = new THREE.DirectionalLightHelper(light);
                    }
                    break;

                case "pointlight":
                    light = new THREE.PointLight(new THREE.Color(params.color), params.intensity, params.distance, params.decay);
                    // this.envParams[params.name].distance = params.distance;
                    if (this.envParams.lights.debug) {
                        lightHelper = new THREE.PointLightHelper(light, 10);
                    }
                    break;

                case "spotlight":
                    light = new THREE.SpotLight(new THREE.Color(params.color), params.intensity, params.distance, params.decay);
                    light.angle = params.angle != null ? Math.PI / parseFloat(params.angle) : Math.PI / 3;
                    light.penumbra = params.penumbra != null ? params.penumbra : 0.2;
                    if (target) light.target = target;

                    if (this.onDebug) {
                        lightHelper = new THREE.SpotLightHelper(light);
                    }
                    break;

                case "lightprobe":
                    // light = new THREE.LightProbe();
                    // light.copy(LightProbeGenerator.fromCubeTexture(scene));
                    console.log('Light probe is not implemented');
                    break;
            }

            this.envParams.lights.lights[name].light = light; // Store the light for update access

            // Shadow
            if (params.type.toLowerCase() === 'ambientlight') {
                //
            } else {
                if (params.position) {
                    light.position.set(params.position.x, params.position.y, params.position.z);
                }

                // light.power = params.power || this.envParams.lights.lightsPower;
                light.shadow.mapSize.width = this.envParams.lights.shadowMapResolution;
                light.shadow.mapSize.height = this.envParams.lights.shadowMapResolution;
                light.shadow.camera.near = this.envParams.lights.shadowNear;
                light.shadow.camera.far = this.envParams.lights.shadowFar;
                light.shadow.focus = this.envParams.lights.shadowFocus;
            }

            if (this.onDebug) {
                this.addGui(name, params, ['name', 'type', 'light']);

                if (this.envParams.onDebug) {
                    const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
                    shadowCameraHelper.visible = this.envParams.lights.debug;
                    this.lightHelpers.push(shadowCameraHelper);
                    this.scene.add(shadowCameraHelper);
                }
            }

            if (lightHelper) {
                lightHelper.visible = this.envParams.lights.debug;
                this.lightHelpers.push(lightHelper);
                this.scene.add(lightHelper);
            }

            light.visible = params.visible;

        } else {
            console.log(`> addLight: ${name} -> ${params ? 'Type is missing' : 'Params are missing'}<`)
        }

        return light;
    }

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
    }

    // Gui // Can move to a shared controller

    addGui(name, params, skip) {
        skip = skip ?
            Array.isArray(skip) ? skip : [skip]
            : [];
        const guiFolder = this.gui.addFolder(name).close();
        for (const key in params) {
            if (!skip || skip.indexOf(key) < 0) {
                const controls = this.addGuiControl(guiFolder, key, params, skip);
                // controls.forEach(c => c.listen(true))
            }
        }
        return guiFolder;
    }

    addGuiControl(guiFolder, key, params, skip) {
        let controls = [];

        const addControl = (_guiFolder, _key, _params) => {
            if (_key.toLowerCase().indexOf("_function") > 0) {
                const valueKey = _key.substring(0, _key.indexOf("_function"));
                // .replace(/_/g, ' ')
                _params[valueKey] = (v) => { };
                controls.push(_guiFolder.add(_params, valueKey));
                skip.push(valueKey)
            } else {
                switch (typeof _params[_key]) {
                    case 'boolean':
                    case "string":
                    case 'number':
                        if (skip.indexOf(_key) >= 0) {
                            //
                        }
                        else if (_key.toLowerCase() === 'color' ||
                            (_params[_key].indexOf && _params[_key].indexOf("#") === 0)) {
                            controls.push(_guiFolder.addColor(_params, _key));
                        } else {
                            controls.push(_guiFolder.add(_params, _key));
                        }
                        break;

                    case "object":
                        if (_key.toLowerCase() === 'color') {
                            controls.push(_guiFolder.addColor(_params, _key));
                        }
                        else if (_key.toLowerCase() === 'uniforms') {
                            const subFolder = _guiFolder.addFolder(_key).close();
                            for (const key2 in _params[_key]) {
                                addControl(subFolder, key2, _params[_key]);
                            }
                        }
                        else if (_key.toLowerCase() === 'textures') {
                            const subFolder = _guiFolder.addFolder(_key).close();
                            for (const key2 in _params[_key]) {
                                subFolder.add(_params[_key], key2, this.envParams.assets.textures);
                                // Update will be done in class guiUpdate()
                            }
                        }
                        else if (Array.isArray(_params[_key])) {
                            switch (typeof _params[_key][0]) {
                                // case 'object':
                                //     const subFolder = _guiFolder.addFolder(_key).close();
                                //     for (const i in _params[_key]) {
                                //         addControl(subFolder, i, _params[_key])
                                //     }
                                //     break;

                                default: {
                                    const valueKey = _key.substring(0, _key.indexOf("_"));
                                    controls.push(_guiFolder.add(_params, valueKey, _params[_key]));
                                    skip.push(valueKey);
                                }
                                    break;
                            }
                        } else {
                            const subFolder = _guiFolder.addFolder(_key).close();
                            for (const key2 in _params[_key]) {
                                addControl(subFolder, key2, _params[_key]);
                            }
                        }
                        break;

                    default:
                        console.log(`> GUI type is not supported: ${_key} -> ${typeof _params[_key]} <`)
                        break;
                }
            }
        }

        addControl(guiFolder, key, params);

        return controls;
    }

    processGuiController() {
        //TODO
        // see camera gui update
        // if (v.controller.parent._title.toLowerCase() !== 'controls') {
        //     setCameraParams(v.controller.parent._title, v.value, v.property);
        // } else {
        //     setCameraParams(v.property, v.value);
        // }
    }

    // PostFX

    createComposer(envParams, createEditor) {
        const rtParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            type: THREE.FloatType
        };
        this.composer = new EffectComposer(
            this.renderer,
            new THREE.WebGLRenderTarget(this.width, this.height, rtParameters)
        );
        this.composer.setPixelRatio(1);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composers.push(this.composer);

        if (createEditor) {
            this.editorComposer = new EffectComposer(
                this.renderer,
                new THREE.WebGLRenderTarget(this.width, this.height, rtParameters)
            );
            this.editorComposer.setPixelRatio(1);
            this.editorComposer.addPass(new RenderPass(this.scene, this.editorCamera));
            this.composers.push(this.editorComposer);
        }

        Object.keys(envParams.passes).forEach(
            key => {
                if (envParams.passes[key].active) {
                    this.addFxPass(key);
                }
            }
        )

        for (let key in this.renderPasses) {
            if (this.envParams.editor.enabled) {
                if (key.indexOf("_editor") > 0) {
                    this.editorComposer.addPass(this.renderPasses[key])
                } else {
                    this.editorComposer.addPass(this.renderPasses[key])
                    this.composer.addPass(this.renderPasses[key])
                }
            } else {
                this.composer.addPass(this.renderPasses[key])
            }

        }

        this.composer.addPass(new OutputPass());
        if (this.envParams.editor.enabled) {
            this.editorComposer.addPass(new OutputPass());
        }

        if (this.onDebug) {
            this.addGui('PostFX', this.envParams.postFX).onChange(v => {
                Object.keys(envParams.passes).forEach(
                    key => this.processPassParams(key)
                );
            });
        }
    }

    addFxPass(key) {
        switch (key.toLowerCase()) {
            case 'bloom':
                this.renderPasses[key] = new UnrealBloomPass(
                    new THREE.Vector2(
                        this.width * this.envParams.postFX.passes[key].resolution,
                        this.height * this.envParams.postFX.passes[key].resolution),
                    1.5, 0.4, 0.85);

                // costly?
                // this.renderPasses[key].renderTargetsHorizontal.forEach(element => {
                //     element.texture.type = THREE.FloatType;
                // });
                // this.renderPasses[key].renderTargetsVertical.forEach(element => {
                //     element.texture.type = THREE.FloatType;
                // });

                this.processPassParams(key);
                break;

            case 'fxaa': {
                const pixelRatio = this.renderer.getPixelRatio();
                this.renderPasses[key] = new ShaderPass(FXAAShader);
                this.renderPasses[key].material.uniforms['resolution'].value.x = this.envParams.postFX.passes[key].resolution / (this.width * pixelRatio);
                this.renderPasses[key].material.uniforms['resolution'].value.y = this.envParams.postFX.passes[key].resolution / (this.height * pixelRatio);
            }
                break;

            case "bokeh":
                this.renderPasses[key] = new BokehPass(this.scene, this.camera, {
                    focus: this.envParams.postFX.passes[key].uniforms.focus,
                    aperture: this.envParams.postFX.passes[key].uniforms.aperture,
                    maxblur: this.envParams.postFX.passes[key].uniforms.maxblur
                });
                break;

            case "ssaa":
                this.renderPasses[key] = new SSAARenderPass(this.scene, this.camera);
                if (this.envParams.editor.enabled) {
                    this.renderPasses[key + "_editor"] = new SSAARenderPass(this.scene, this.editorCamera);
                }

                this.processPassParams(key);
                break;

            case "adaptivetonemapping":
                this.renderPasses[key] = new AdaptiveToneMappingPass(this.envParams.postFX.passes[key].params.adaptive, this.envParams.postFX.passes[key].resolution);
                this.processPassParams(key);
                break;

            default:
                console.log(`VisualComponents. createComposer: Pass is not supported -> ${key}`);
                break;
        }
    }

    processPassParams(key) {
        if (this.renderPasses[key]) {
            this.renderPasses[key].enabled = this.envParams.postFX.passes[key].enabled;
            for (const key2 in this.envParams.postFX.passes[key].params) {
                this.renderPasses[key][key2] = this.envParams.postFX.passes[key].params[key2];
            }
            for (const key2 in this.envParams.postFX.passes[key].uniforms) {
                this.renderPasses[key].uniforms[key2].value = this.envParams.postFX.passes[key].uniforms[key2];
            }
            // Only needed when editorCamera is used
            if (this.envParams.editor.enabled && this.renderPasses[key + "_editor"]) {
                this.renderPasses[key + "_editor"].enabled = this.envParams.postFX.passes[key].enabled;
                for (const key2 in this.envParams.postFX.passes[key].params) {
                    this.renderPasses[key + "_editor"][key2] = this.envParams.postFX.passes[key].params[key2];
                }
                for (const key2 in this.envParams.postFX.passes[key].uniforms) {
                    this.renderPasses[key + "_editor"].uniforms[key2].value = this.envParams.postFX.passes[key].uniforms[key2];
                }
            }
        } else {
            this.addFxPass(key);
        }
    }

    createFxPass_old(name, composer, params, scene) {
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
    }

    // listeners

    onWindowResize(width, height) {
        this.width = width;
        this.height = height;
        if (this.renderer && this.camera) {
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            if (this.editorCamera) {
                this.editorCamera.aspect = this.width / this.height;
                this.editorCamera.updateProjectionMatrix();
            }
            if (this.controls && this.controls.handleResize) {
                this.controls.handleResize();
            }
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            if (this.composer) {
                this.composer.setSize(width, height);
            }
            if (this.editorComposer) {
                this.editorComposer.setSize(width, height);
            }
        }
    }

    onInputEvent = (event) => {
        for (let key in this.components) {
            if (this.components[key].onInputEvent) {
                this.components[key].onInputEvent(event)
            }
        }
    }

    // Update

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
    }

    updateMaterial(material, texture, updateEnvMap) {
        if (typeof material === 'object') {
            if (material.color) material.color = new THREE.Color(this.envParams.materials.materialsColor).convertSRGBToLinear();
            material.fog = this.envParams.scene.fog.active;
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
    }

    updateLight(name) {
        if (name) {
            let params = this.envParams.lights.lights[name];
            for (let key in params) {
                if (params[key] != null &&
                    key !== 'type' &&
                    key !== 'name' &&
                    key !== 'light') {
                    switch (key) {
                        case "color":
                            params.light.color = new THREE.Color(params.color);
                            break;

                        case "angle":
                            params.light.angle = Math.PI / parseFloat(params.angle);
                            break;

                        case "position":
                            params.light.position.set(
                                params.position.x,
                                params.position.y,
                                params.position.z
                            );
                            break;

                        case "shadow":
                            params.light.shadow.camera.near = params.shadow.camera.near;
                            params.light.shadow.camera.far = params.shadow.camera.far;
                            params.light.shadow.focus = params.shadow.focus;
                            params.light.shadow.camera.updateProjectionMatrix();
                            break;

                        default:
                            params.light[key] = params[key];
                            break;
                    }
                }
            }
        }
    }

    // TODO: Change to envParams update and separate gui controller callback
    updateGUI(guiController) {
        let controller = guiController.controller || guiController;
        while (controller && controller.parent && controller.parent._title !== 'Controls') {
            controller = controller.parent;
        }
        console.log('Update Gui:', controller._title);

        this.renderer.toneMappingExposure =
            this.envParams.editor.enabled && this.envParams.editor.overrideLights ?
                1 :
                this.envParams.components.sun ?
                    this.envParams.components.sun.exposure :
                    this.envParams.renderer.rendererExposure;
        this.renderer.gammaFactor = this.envParams.renderer.rendererGamma;
        this.renderer.setClearColor(this.envParams.renderer.rendererBackgroundColor);


        if (this.components.sun) {
            let _phi = THREE.MathUtils.degToRad(90 - (this.envParams.components.sun.elevation));
            let _theta = THREE.MathUtils.degToRad(this.envParams.components.sun.azimuth);
            this.components.sun.setFromSphericalCoords(1, _phi, _theta);
        }

        if (this.components.sky) {
            this.components.sky.visible = this.envParams.components.sky.visible;
            let skyUniforms = this.components.sky.material.uniforms;
            skyUniforms['turbidity'].value = this.envParams.components.sky.turbidity;
            skyUniforms['rayleigh'].value = this.envParams.components.sky.rayleigh;
            skyUniforms['mieCoefficient'].value = this.envParams.components.sky.mieCoefficient;
            skyUniforms['mieDirectionalG'].value = this.envParams.components.sky.mieDirectionalG;
            skyUniforms['sunPosition'].value.copy(this.components.sun);
            // this.renderer.toneMappingExposure = this.envParams.editor.enabled ? 1 : this.envParams.components.sun.exposure;
        }

        if (this.components.water) {
            let waterUniforms = this.components.water.material.uniforms;
            waterUniforms['size'].value = this.envParams.components.water.size;
            waterUniforms['sunDirection'].value.copy(this.components.sun).normalize();
            waterUniforms['sunColor'].value = new THREE.Color(this.envParams.components.sun.color).convertSRGBToLinear();
            waterUniforms['waterColor'].value = new THREE.Color(this.envParams.components.water.waterColor).convertSRGBToLinear();
            waterUniforms['distortionScale'].value = this.envParams.components.water.waterDistortionScale;
            this.components.water.visible = this.envParams.components.water.visible;
            this.components.water.receiveShadow = this.envParams.lights.receiveShadow;
        }

        this.setSceneEnvironment(this.envKey);

        // Lights

        for (let name in this.envParams.lights.lights) {
            this.updateLight(name);
        }
        if (this.envParams.lights.lightHelpers) {
            for (let i in this.envParams.lights.lightHelpers) {
                this.envParams.lights.lightHelpers[i].update();
            }
        }

        // Component
        if (this.components && this.components[controller._title]) {
            const components = { scene: this.scene, ...this.components }
            const component = this.components[controller._title];
            if (component.guiUpdate) {
                component.guiUpdate({
                    globalParams: this.envParams,
                    envParams: this.envParams.components[component.name],
                    controller: guiController,
                    components: components
                });
                if (component.needReload) {
                    component.reload(this.scene);
                }
            }
        }

        if (this.updateGuiCallback) {
            this.updateGuiCallback({ controller: guiController });
        }

        // Camera

        this.camera.fov = this.envParams.camera.fov;
        this.camera.far = this.envParams.camera.far;
        this.camera.updateProjectionMatrix();
    }

    updateSettings(input, reloadComponents) {

        if (Array.isArray(input.key)) {
            appUtils.setObjValueFromArray(input.key, this[input.key[0]] != null ? this : this.envParams, input.value);
            switch (input.key[0]) {
                case "postFX":
                    for (let k in this.envParams.postFX.passes) {
                        this.processPassParams(k);
                    }
                    break;

                case "camera":
                    this.camera.updateProjectionMatrix();
                    break;
            }
        } else {
            switch (input.key) {
                case "environment":
                    this.components.sky.visible = input.value;
                    break;

                case "settings_mode": {
                    global.settingsState = input.value;
                    this.envParams.device.settingsState = input.value
                    const settings = this.envParams.settings[input.value];
                    for (const key1 in settings) {
                        switch (key1) {
                            case "components":
                                for (const componentKey in settings[key1]) {
                                    if (this.envParams.components[componentKey]) {
                                        this.envParams.components[componentKey] =
                                            _.merge(this.envParams.components[componentKey], settings[key1][componentKey]);
                                        if (reloadComponents && this.components[componentKey] && this.components[componentKey].reload) {
                                            this.components[componentKey].reload(this.scene);
                                        }
                                    }
                                }
                                break;
                        }
                    }
                }
                    break;

                case "show_stats":
                    this.envParams.device.showStats = input.value;
                    this.stats.domElement.style.display = this.envParams.device.showStats ? 'block' : 'none';
                    break;

                default:
                    console.log("VisualComponents. updateSettings -> key is not supported: " + input.key);
                    break;
            }
        }
    }

    // Render

    updateComponents(time, deltaTime, data) {

        if (this.controls) {
            if (this.controls.update) {
                this.controls.update(deltaTime);
            }
        }

        if (this.stats) {
            this.stats.update();
        }

        let params = {
            time: time,
            deltaTime: deltaTime,
            data: data
        }
        if (this.components) {
            for (let key in this.components) {
                if (Array.isArray(this.components[key])) {
                    for (let key2 in this.components[key]) {
                        if (this.components[key][key2].update) {
                            this.components[key][key2].update(params);
                        }
                    }
                } else {
                    if (this.components[key].update) {
                        this.components[key].update(params);
                    }
                }
            }
        }

        if (this.onDebug) {
            if (this.envParams.lights.debug) {
                this.lightHelpers.forEach(h => h.update());
            }
        }
    }

    renderScene({ time, deltaTime }) {
        if (this.renderer) {
            if (this.composer && this.envParams.postFX.enabled) {
                this.renderer.setScissorTest(true);
                if (this.envParams.editor.enabled) {
                    this.renderer.clear();

                    this.renderer.setScissor(0, 0, this.width, this.height);
                    this.renderer.setViewport(0, 0, this.width, this.height);
                    this.editorComposer.render(deltaTime);

                    if (this.envParams.editor.showCameraPreview) {
                        this.renderer.setScissor(0, 0, this.width / 3.5, this.height / 3.5);
                        this.renderer.setViewport(0, 0, this.width / 3.5, this.height / 3.5);
                        this.composer.render(deltaTime);
                    }
                } else {
                    this.renderer.clear();
                    this.renderer.setViewport(0, 0, this.width, this.height);
                    this.renderer.setScissor(0, 0, this.width, this.height);
                    this.composer.render(deltaTime);
                }
                this.renderer.setScissorTest(false);
            } else {
                if (this.envParams.editor.enabled) {
                    this.renderer.clear();
                    this.renderer.setViewport(0, 0, this.width, this.height);
                    this.renderer.render(this.scene, this.editorCamera);

                    if (this.envParams.editor.showCameraPreview) {
                        this.renderer.setViewport(0, 0, this.width / 3.5, this.height / 3.5);
                        this.renderer.render(this.scene, this.camera);
                    }
                } else {
                    this.renderer.clear();
                    this.renderer.setViewport(0, 0, this.width, this.height);
                    this.renderer.render(this.scene, this.camera);
                }
            }

        }
    }
}

export default new VisualComponents();