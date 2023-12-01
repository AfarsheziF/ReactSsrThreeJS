import React from "react";

import * as THREE from "../../../vendor_mods/three/build/three.module";

import visualComponents from './Components/visualComponents';
import Constants from './SolarSystem/Constants';
import SolarSystem from './SolarSystem/solarsystem.json';
import Planet from './SolarSystem/Planet';

import astronomyEngineController from "./SolarSystem/astronomy";

import utils from '../../utils/utils';

let onDebug = false;

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let center = new THREE.Vector3(0, 0, 0);
let rayCasterHelper;

let onEnvironmentUpdate = false;

let clock;

let INTERSECTED;

let planetsCollisions = {};

// objs
let menuBox, group;

// params
let envParams,
    onInitGraphics,
    activeItem,
    blockInteraction,
    updateControls,
    clickableState;

// Mouse Controller
let isPointerDown;
//     pointerController = {
//         down: { x: 0, y: 0 },
//         target: { x: 0, y: 0 },
//         targetRotationOnPointerDown: { x: 0, y: 0 }
//     };

export default class Scene extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: props.data ? props.data : [],
            initGraphics: true,
            autoRotate: props.autoRotate,
            settings: props.settings
        };

        this.time = 0;
        onDebug = props.onDebug;
        envParams = props.envParams;
    }

    componentDidMount() {
        console.log("-- Scene mounted --")
        console.log('-- OnDebug: ' + onDebug);
        this.mounted = true;
        this.initGraphics(this.state.initGraphics);
    }

    componentWillUnmount() {
        console.log("Scene unmount")
        this.mounted = false;
    }

    componentDidUpdate() {
        // Auto data load
        // if (this.state.update && !onLoadingData) {
        //     onLoadingData = true;
        //     this.initGraphics(this.state.initGraphics);
        //     this.setState({
        //         update: false
        //     })
        // }

        if (this.state.reInitGraphics && !onInitGraphics) {
            this.initGraphics(this.state.reInitGraphics);
        }

        if (this.props.dataStateCallback) {
            this.props.dataStateCallback(this.state.dataState);
        }

        if (this.state.startScene) {
            this.start();
        }
    }

    // Graphics

    initGraphics = init => {
        console.log('Init graphics');
        onInitGraphics = true;
        this.setState({
            dataState: 'loading',
            update: false
        })

        const that = this;

        if (init) {
            startInits().then(
                function () {
                    sceneSwitch();
                }, function (e) {
                    // handle error. Send back to holder
                }
            );
        } else {
            sceneSwitch();
        }

        function startInits() {
            return new Promise((resolve, reject) => {
                if (!visualComponents.scene) initScene(); // Watch for relaunch
                initEnvironment();
                initObjects().then(
                    function (sceneObjects) {
                        // initPostFX();
                        if (onDebug) {
                            initGUI()
                            // initDebugEnv(sceneObjects);
                        }
                        initUI();
                        that.setState({
                            initGraphics: false
                        })
                        resolve();
                    }, function (e) {
                        console.log(e);
                        reject(e);
                    }
                );
            })

        }

        function initScene() {
            console.log('Init Scene');
            visualComponents.init(that.mount, envParams, onDebug, that.updateEnvironment, that.props.onFileDownloaded);
            clock = new THREE.Clock();

            that.width = that.mount.clientWidth;
            that.height = that.mount.clientHeight;

            // envParams.antialias = window.devicePixelRatio > 1 ? false : true;
            let rendererOptions = {
                antialias: utils.isLowEndMobile ? false : envParams.antialias,
                powerPreference: 'high-performance',
                alpha: true
            };
            // envParams.toneMapping = that.isLowEndMobile ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
            // envParams.toneMapping = THREE.ReinhardToneMapping;
            visualComponents.createRenderer(rendererOptions, that.mount.clientWidth, that.mount.clientHeight);
            that.mount.appendChild(visualComponents.renderer.domElement);

            visualComponents.createScene();
            visualComponents.createCamera(that.width, that.height);
        }

        function initEnvironment() {
            console.log('Init Environment');
            // Lights
            for (let key in envParams.lights) {
                if (window.osType.toLowerCase() === 'ios' && envParams.lights[key].hideInIos) {
                    // skip this light
                } else {
                    envParams.lights[key].name = key;
                    envParams.lights[key].intensity = envParams.lights[key].intensity || 1;
                    visualComponents.scene.add(visualComponents.addLight(key, envParams.lights[key]));
                }
            }
        }

        function initObjects() {
            console.log('Init Objects')
            astronomyEngineController.calculatePlanetsVectors(new Date());
            visualComponents.components.planets = [];
            visualComponents.loadingStates.addDestination(29); // How many files are going to be loaded
            return new Promise((resolve, reject) => {
                Promise.all([
                    visualComponents.loadTexture(`images/${that.state.settings.texturesMode}/STARS_COLOR_DARK.jpg`),
                    new Planet(SolarSystem.sun, null, that.state.settings.texturesMode + "/SUN", astronomyEngineController.planetsVectors.sun, envParams.components.planets),
                ]).then(
                    function (res1) {
                        console.log(res1);
                        res1[0].encoding = THREE.sRGBEncoding;
                        res1[0].mapping = THREE.EquirectangularReflectionMapping;
                        visualComponents.scene.background = res1[0];

                        // Sun
                        res1[1].addToScene(visualComponents.scene);
                        visualComponents.components.planets.push(res1[1]);

                        Promise.all([
                            new Planet(SolarSystem.planets[0], res1[1], that.state.settings.texturesMode + "/MERCURY", astronomyEngineController.planetsVectors.mercury, envParams.components.planets),
                            new Planet(SolarSystem.planets[1], res1[1], that.state.settings.texturesMode + "/VENUS", astronomyEngineController.planetsVectors.venus, envParams.components.planets),
                            new Planet(SolarSystem.planets[2], res1[1], that.state.settings.texturesMode + "/EARTH", astronomyEngineController.planetsVectors.earth, envParams.components.planets),
                            new Planet(SolarSystem.planets[3], res1[1], that.state.settings.texturesMode + "/MARS", astronomyEngineController.planetsVectors.mars, envParams.components.planets),
                            new Planet(SolarSystem.planets[4], res1[1], that.state.settings.texturesMode + "/JUPITER", astronomyEngineController.planetsVectors.jupiter, envParams.components.planets),
                            new Planet(SolarSystem.planets[5], res1[1], that.state.settings.texturesMode + "/SATURN", astronomyEngineController.planetsVectors.saturn, envParams.components.planets),
                            new Planet(SolarSystem.planets[6], res1[1], that.state.settings.texturesMode + "/URANUS", astronomyEngineController.planetsVectors.uranus, envParams.components.planets),
                            new Planet(SolarSystem.planets[7], res1[1], that.state.settings.texturesMode + "/NEPTUNE", astronomyEngineController.planetsVectors.neptune, envParams.components.planets),
                            visualComponents.loadModel(
                                'images/models/iss_obj.obj',
                                'MeshPhysicalMaterial',
                                `images/${that.state.settings.texturesMode}/iss_texture.jpg`,
                                null,
                                `images/${that.state.settings.texturesMode}/iss_Normal.jpg`),
                            visualComponents.createObject('BlobPlanet', new THREE.Vector3(20000.1, 0.1, 0.1), visualComponents.scene),
                        ]).then(
                            function (res2) {
                                // Mercury
                                res2[0].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[0]);
                                // Venus
                                res2[1].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[1]);
                                // Earth
                                res2[2].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[2]);
                                // // ISS
                                res2[8].scale.set(.01, .01, .01);
                                res2[8].position.set(
                                    res2[2].threeObj.position.x - 350,
                                    res2[2].threeObj.position.y,
                                    res2[2].threeObj.position.z);
                                res2[8].userData = {
                                    rotate: true,
                                    rotationTarget: res2[2].threeObj.position.clone(),
                                    rotationTargetNormalized: res2[2].threeObj.position.clone().normalize(),
                                    rotationSpeed: 0.0001,
                                    rotationRadius: res2[2].scaledRadius,
                                    rotationTheta: 3.0,
                                    quaternionVector: new THREE.Vector3(-0.01, 0.01, 0)
                                }
                                res2[8].lookAt(res2[2].threeObj.position);
                                visualComponents.scene.add(res2[8]);
                                visualComponents.components.isis = res2[8];
                                visualComponents.camera.position.set(res2[2].threeObj.position.x, res2[2].threeObj.position.y, -500);
                                visualComponents.controls.target.copy(res2[2].threeObj.position);
                                // Mars
                                res2[3].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[3]);
                                // Jupiter
                                res2[4].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[4]);
                                // Saturn
                                res2[5].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[5]);
                                // Uranus
                                res2[6].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[6]);
                                // Neptune
                                res2[7].addToScene(visualComponents.scene);
                                visualComponents.components.planets.push(res2[7]);

                                for (let i in visualComponents.components.planets) {
                                    planetsCollisions[visualComponents.components.planets[i].data.name] = {
                                        name: visualComponents.components.planets[i].data.name,
                                        collided: false
                                    }
                                    visualComponents.components.planets[i].update();
                                }
                                that.props.updateHolderState({
                                    planetsCollisions: planetsCollisions
                                })

                                visualComponents.BlobPlanet = res2[9];
                                visualComponents.BlobPlanet.setPosition(res2[8].position);
                                visualComponents.BlobPlanet.setSceneObjects(visualComponents.components.planets);

                                console.log('Objects loaded');
                                console.log(visualComponents.components);
                                resolve();
                            },
                            function (e) {
                                reject(e);
                            }
                        )
                    }, function (e) {
                        reject(e);
                    }
                )
            });
        }

        function initDebugEnv(res) {
            visualComponents.components.distText = visualComponents.createTextLabel('p', 'distText', 'Dist:');
            visualComponents.components.distText.element.style.top = '70px';
            visualComponents.components.distText.element.style.left = '10px';
            that.mount.appendChild(visualComponents.components.distText.element);

            initHelpShaders();

            function initHelpShaders() {
                // 0 position
                // mapMesh
                let geometry = new THREE.PlaneBufferGeometry(50, 50, 1, 1);
                let material = new THREE.ShaderMaterial({
                    side: THREE.DoubleSide,
                    vertexShader:  /* glsl */`                            
                                uniform sampler2D drawTexture;
                                uniform vec2 resolution;

                                varying vec2 vUv;

                                void main() {
                                    vUv = uv;
                                   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                                }
                                
                                `,
                    fragmentShader: /* glsl */`                            
                                uniform sampler2D drawTexture;
                                uniform vec2 resolution;

                                varying vec2 vUv;

                                void main() {
                                    // vec2 uv = gl_FragCoord.xy / resolution;
                                    vec4 color = texture2D(drawTexture, vUv);
                                    gl_FragColor = vec4(1.0 / color.rgb, 1.0);
                                }
                                
                                `,
                    uniforms: {
                        drawTexture: { value: null },
                        resolution: { value: new THREE.Vector2(1024) }
                    }
                })
                let mapMesh = new THREE.Mesh(geometry, material);
                mapMesh.position.copy(res[10].position);
                mapMesh.position.x -= 150;
                visualComponents.scene.add(mapMesh);
                visualComponents.components.mapMesh = mapMesh;

                // 1 velocity
                geometry = new THREE.PlaneBufferGeometry(50, 50, 1, 1);
                material = new THREE.ShaderMaterial({
                    side: THREE.DoubleSide,
                    vertexShader:  /* glsl */`                            
                                uniform sampler2D drawTexture;
                                uniform vec2 resolution;

                                varying vec2 vUv;

                                void main() {
                                    vUv = uv;
                                   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                                }
                                
                                `,
                    fragmentShader: /* glsl */`                            
                                uniform sampler2D drawTexture;
                                uniform vec2 resolution;

                                varying vec2 vUv;

                                void main() {
                                    // vec2 uv = gl_FragCoord.xy / resolution;
                                    vec4 color = texture2D(drawTexture, vUv);
                                    gl_FragColor = vec4(color.rgb, 1.0);
                                }
                                
                                `,
                    uniforms: {
                        drawTexture: { value: null },
                        resolution: { value: new THREE.Vector2(1024) }
                    }
                })
                mapMesh = new THREE.Mesh(geometry, material);
                mapMesh.position.copy(res[10].position);
                mapMesh.position.x -= 225;
                visualComponents.scene.add(mapMesh);
                visualComponents.components.mapMesh2 = mapMesh;

                // 2 normal
                geometry = new THREE.PlaneBufferGeometry(50, 50, 1, 1);
                material = new THREE.ShaderMaterial({
                    side: THREE.DoubleSide,
                    vertexShader:  /* glsl */`                            
                                uniform sampler2D drawTexture;
                                uniform vec2 resolution;

                                varying vec2 vUv;

                                void main() {
                                    vUv = uv;
                                   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                                }
                                
                                `,
                    fragmentShader: /* glsl */`                            
                                uniform sampler2D drawTexture;
                                uniform vec2 resolution;

                                varying vec2 vUv;

                                void main() {
                                    // vec2 uv = gl_FragCoord.xy / resolution;
                                    vec4 color = texture2D(drawTexture, vUv);
                                    gl_FragColor = vec4(color.rgb, 1.0);
                                }
                                
                                `,
                    uniforms: {
                        drawTexture: { value: null },
                        resolution: { value: new THREE.Vector2(1024) }
                    }
                })
                mapMesh = new THREE.Mesh(geometry, material);
                mapMesh.position.copy(res[10].position);
                mapMesh.position.x -= 300;
                visualComponents.scene.add(mapMesh);
                visualComponents.components.mapMesh3 = mapMesh;
            }
        }

        function initPostFX() {
            let renderScene = visualComponents.createFxPass("renderPass");

            visualComponents.blurComposer = visualComponents.createComposer();
            visualComponents.blurComposer.renderToScreen = false;
            visualComponents.blurComposer.addPass(renderScene);
            visualComponents.createFxPass("motionBlur", visualComponents.blurComposer);
            visualComponents.createFxPass("bloom", visualComponents.blurComposer, {
                strength: 1.5,
                radius: 0.0,
                threshold: 0.07
            });

            let finalPass = visualComponents.createFxPass("custom", null, {
                uniforms: {
                    baseTexture: { value: null },
                    fxTexture: { value: visualComponents.blurComposer.renderTarget2.texture }
                },
                vertexShader: /* glsl */`
                    varying vec2 vUv;

                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }`,
                fragmentShader: /* glsl */`
                uniform sampler2D baseTexture;
                uniform sampler2D fxTexture;

                varying vec2 vUv;

                void main() {
                    vec4 fx =  texture2D( fxTexture, vUv );
                    if (fx.x > 0.0) {
                        gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * fx);
                    }
                }`,
                defines: {}
            });
            finalPass.needsSwap = true;

            visualComponents.finalComposer = visualComponents.createComposer();
            visualComponents.finalComposer.addPass(renderScene);
            visualComponents.finalComposer.addPass(finalPass)
        }

        function initGUI() {
            // gui

            let solarSystemFolder = visualComponents.gui.addFolder('Solar System').close();
            // solarSystemFolder.add(visualComponents.envParams.solarSystem, 'planetsRadiusScale', 0, 500);
            // solarSystemFolder.add(visualComponents.envParams.solarSystem, 'planetsDistanceScale', 0, 50);
            for (let key in Constants) {
                solarSystemFolder.add(Constants, key, 0, Constants[key] * 2.0);
            }
        }

        function initUI() {
            that.ui = {
                timeText: document.getElementById('timeText')
            }
            console.log(that.ui);
        }

        // End
        function sceneSwitch() {
            console.log("Init active scene:", that.props.activeScene)
            onInitGraphics = false;
            that.setState({
                reInitGraphics: false,
                startScene: true
            });
            // switch (that.props.activeScene) {
            //     case "environment":
            //         that.start();
            //         break;
            //     default:
            //         that.start();
            //         break;
            // }
            // that.start();
        }
    }

    start = () => {
        console.log('Scene start: ' + this.width + " / " + this.height);
        if (!this.frameId || this.state.startScene) {
            this.frameId = requestAnimationFrame(this.update);
        }
        if (this.props.stateCallback && !this.state.started) {
            this.props.stateCallback("start");
        }
        this.setState({
            dataState: 'loaded',
            update: false,
            started: true,
            startScene: false
        })
        // if (activeItem) {
        //     this.setActiveItem(activeItem, true, true);
        // }
        // if (animations.initAnimation) {
        //     this.performStartAnimation();
        // }
        setTimeout(() => {
            this.props.updateHolderState({
                planetsCollisions: planetsCollisions,
                sceneStared: true,
                showLoadingDialog: false
            })
        }, 2000);

        blockInteraction = false;
        updateControls = true;
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    }

    updateEnvironment = (guiController, updateMaterials) => {
        onEnvironmentUpdate = true;
        console.log(guiController);

        visualComponents.updateComponentsMaterials();

        visualComponents.components.planets.forEach(planet => {
            if (planet.updatePlanet) {
                planet.updatePlanet(envParams);
            }
        });

        if (visualComponents.BlobPlanet) {
            visualComponents.BlobPlanet.updateUniforms();
        }

        if (!guiController) {
            visualComponents.camera.fov = envParams.fov;
            visualComponents.camera.near = envParams.near;
            visualComponents.camera.far = envParams.far;
            visualComponents.camera.updateProjectionMatrix();
        }
        onEnvironmentUpdate = false;
    }

    updateSettings(attr, value) {
        const settings = this.state.settings;
        let lights = {}; // TODO: implementation
        let lightsKeys = Object.keys(lights);
        switch (attr) {
            case "texturesMode":
                for (let i = visualComponents.scene.children.length - 1; i >= 0; i--) {
                    visualComponents.scene.remove(visualComponents.scene.children[i]);
                }
                settings.texturesMode = value;
                this.setState({
                    settings: settings,
                    reInitGraphics: true,
                    onShowLoadingDialog: true
                });
                this.props.updateHolderState({
                    showLoadingDialog: true
                });
                break;

            case "blobPlanetMeshDetail":
                visualComponents.BlobPlanet.updateSettings({ meshDetail: value });
                break;

            // NOT IMPLEMENTED

            case "shadows":
                envParams.castShadow = value;
                envParams.receiveShadow = value;
                visualComponents.renderer.shadowMap.enabled = value;
                visualComponents.renderer.shadowMap.autoUpdate = value;
                break;

            case "reflections":
                // camera.layers.toggle(1);
                materials = null;
                envParams.onReflections = value;
                initDefaultMaterials(value);
                if (this.props.activeScene === 'menu' && menuBox) {
                    removeSceneObject(menuBox);
                    menuBox = null;
                }
                this.setData(this.state.data);
                break;

            case "environment":
                if (value) {
                    if (!sky) {
                        createSky();
                    }
                } else {
                    removeSceneObject(sky);
                    sky = null;
                }
                break;

            case "antialising":
                envParams.antialias = value;
                settings.antialias = value;
                this.setState({
                    settings: settings,
                    reInitGraphics: true,
                    onShowLoadingDialog: true
                });
                this.props.updateHolderState({
                    showLoadingDialog: true
                });
                break;

            case "physics":
                usePhysics = value;
                if (group) {
                    removeSceneObject(group);
                    group = null;
                }
                ground = null;
                this.setData(this.state.data);
                break;

            case "brightness":
                // ambientLight.color = new THREE.Color(ColorsShades.gray[value]).convertSRGBToLinear();
                break;

            case "shadowFar":
                for (let i in lightsKeys) {
                    let key = lightKeys[i];
                    if (lights[key].shadow && lights[key].shadow.camera) {
                        lights[key].shadow.camera.far = value;
                    }
                }
                break;

            case "lightDistance":
                for (let i in lightsKeys) {
                    let key = lightKeys[i];
                    if (lights[key].distance) {
                        lights[key].distance = value;
                    }
                }
                break;
        }
        this.updateEnvironment(null, true);
    }

    //listeners

    onWindowResize = () => {
        //TODO
        console.log('onWindowResize');
        this.width = this.mount.clientWidth;
        this.height = this.mount.clientHeight;
        visualComponents.camera.aspect = this.width / this.height;
        visualComponents.camera.updateProjectionMatrix();
        if (visualComponents.controls && visualComponents.controls.handleResize) {
            visualComponents.controls.handleResize();
        }
        visualComponents.renderer.setSize(this.width, this.height);
        visualComponents.renderer.setPixelRatio(window.devicePixelRatio);
        if (visualComponents.composer) visualComponents.composer.setSize(this.width, this.height);
    }

    onMouseMove = event => {
        if (!blockInteraction) {
            if (visualComponents.camera) {
                // if (utils.isMobile) {
                //     event = event.changedTouches ? event.changedTouches[0] : event;
                // }
                if (this.mount) {
                    mouse.x = (event.offsetX / this.width) * 2 - 1;
                    mouse.y = -(event.offsetY / this.height) * 2 + 1;
                }
                // if (isPointerDown) {
                //     let pointerX = event.clientX - window.innerWidth / 2;
                //     pointerController.target.x = pointerController.targetRotationOnPointerDown.x + (pointerX - pointerController.down.x) * 0.008;
                //     let pointerY = event.clientY - window.innerHeight / 2;
                //     pointerController.target.y = pointerController.targetRotationOnPointerDown.y + (pointerY - pointerController.down.y) * 0.008;
                //     if (menuBox) this.getActiveBoxFace();
                // }

                raycaster.setFromCamera(mouse, visualComponents.camera);
                const intersects = raycaster.intersectObjects(visualComponents.scene.children, false);

                if (intersects.length > 0) {
                    if (!INTERSECTED || INTERSECTED.id !== intersects[0].object.id) {
                        INTERSECTED = intersects[0].object;
                        console.log('intersected', INTERSECTED);
                        if (INTERSECTED.userData.clickable) {
                            activeItem = INTERSECTED;
                            document.body.style.cursor = 'pointer';
                            this.props.onHoverItem(activeItem, 'hover');
                        }
                    }
                } else {
                    document.body.style.cursor = 'initial';
                    activeItem = null;
                    INTERSECTED = null;
                    this.props.onHoverItem(null, 'hover');
                }
            }

        }
    }

    onPointerDown = event => {
        if (!blockInteraction && !envParams.blockInteraction) {
            isPointerDown = true

            if (activeItem) {
                this.setActiveItem(activeItem);
            }
        }
    }

    onPointerUp = event => {
        if (!blockInteraction) {
            isPointerDown = false
        }
    }

    onMouseWheel = (event) => {
        // console.log(camera.position.z);
        // camera.updateProjectionMatrix();
    }

    onMaterialLoaded = (loadedCounter, max) => {
        this.props.updateLoadingDialog(Math.round(loadedCounter * 100 / max) + "%");
    }

    // Getters

    // Setters

    // Actions


    moveCamera = (to, duration, _onComplete, lookAt) => {
        if (!visualComponents.camera.position.equals(to)) {
            blockInteraction = true;
            new TWEEN.Tween(visualComponents.camera.position)
                .to(to, duration || 3000)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function (value) {
                    visualComponents.camera.position.copy(value);
                    if (lookAt) {
                        visualComponents.camera.lookAt(lookAt);
                    }
                })
                .onComplete(function () {
                    onComplete();
                })
                .start();
        } else {
            onComplete();
        }

        function onComplete() {
            blockInteraction = false;
            visualComponents.camera.updateProjectionMatrix();
            if (_onComplete) _onComplete();
        }
    }

    rotateCamera = (position, duration, _onComplete) => {
        // backup original rotation
        const startRotation = visualComponents.camera.quaternion.clone();

        // final rotation (with lookAt)
        visualComponents.camera.lookAt(position);
        const endRotation = visualComponents.camera.quaternion.clone();

        // revert to original rotation
        visualComponents.camera.quaternion.copy(startRotation);

        // Tween
        new TWEEN.Tween
            (visualComponents.camera.quaternion)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .to(endRotation, duration || 3000)
            .start()
            .onComplete(function () {
                // visualComponents.camera.lookAt(position);
                // visualComponents.camera.updateProjectionMatrix();
                if (_onComplete) {
                    _onComplete();
                }
            });
    }

    zoomCamera = type => {
        const that = this;
        let zoomValue = 0.01; //envParams.zoomValue;
        let cameraPos = visualComponents.camera.position.clone();
        let allowZoomIn = true;
        let allowZoomOut = true;
        if (visualComponents.controls.minDistance > 0) {
            allowZoomIn = cameraPos.z < visualComponents.controls.minDistance - zoomValue;
        }
        if (visualComponents.controls.maxDistance !== Infinity) {
            allowZoomOut = cameraPos.z > visualComponents.controls.maxDistance + zoomValue;
        }

        this.props.onZoomCallback(allowZoomIn, allowZoomOut);
        if ((type === 'in' && allowZoomIn) || (type === 'out' && allowZoomOut)) {
            // Dolly in/out
            // let zoomDistance = Number(cameraPos.distanceTo(visualComponents.controls.target)),
            // let zoomDistance = 1,
            //     currDistance = cameraPos.length(),
            //     factor = zoomDistance / currDistance;

            // cameraPos.x *= factor;
            // cameraPos.y *= factor;
            // cameraPos.z *= factor;

            // this.moveCamera(cameraPos, 250, function () {
            //     that.props.onZoomCallback(allowZoomIn, allowZoomOut);
            // });
            if (type === 'in') {
                for (let i = 0; i < zoomValue; i++) {
                    visualComponents.controls.dollyIn();
                }
            } else {
                for (let i = 0; i < zoomValue; i++) {
                    visualComponents.controls.dollyOut();
                }
            }
        }
        else {
            this.props.onZoomCallback(allowZoomIn, allowZoomOut);
        }
    }

    setVelocity = vel => {
        visualComponents.BlobPlanet.setVelocity(vel);
        // this.onTransmission = vel > 0;
    }

    increaseDecreaseVel(increase) {
        visualComponents.BlobPlanet.increaseDecreaseVel(increase);
    }

    setTransmissionTime = time => {
        // time in seconds * FPS (60) * current velocity;
        // FPS is not a stable number. we cant really predicant an accurate result. 
        let desiredRadius = time * 50 * visualComponents.BlobPlanet.positionUniforms['velocity'].value;
        visualComponents.BlobPlanet.animateToRadius(desiredRadius, time);
        for (let i in planetsCollisions) {
            planetsCollisions[i].collided = false;
        }
        this.props.updateHolderState({
            planetsCollisions: planetsCollisions,
        })
    }

    holdTransmission = () => {
        visualComponents.BlobPlanet.animate = !visualComponents.BlobPlanet.animate;
    }

    setActiveItem = item => {
        const that = this;
        console.log('\n-- setActiveItem Scene --')
        if (item) {
            if (!item.id) {
                for (let i in visualComponents.scene.children) {
                    if (visualComponents.scene.children[i].userData &&
                        visualComponents.scene.children[i].userData.name &&
                        visualComponents.scene.children[i].userData.name.toLowerCase() === item) {
                        item = visualComponents.scene.children[i];
                        break;
                    }
                }
            }
            this.props.setActiveItem(activeItem, 'click');
            switch (item.userData.clickAction) {
                case 'zoom':
                    // visualComponents.camera.lookAt(activeItem.position);
                    updateControls = false;
                    visualComponents.controls.target.copy(item.position);

                    // this.rotateCamera(item.position, 4000, function () {
                    //     // visualComponents.controls.target.copy(item.position);
                    // });

                    let centerClone = center.clone();
                    let distance = centerClone.distanceTo(item.position);
                    // let calculatedDistance = THREE.MathUtils.mapLinear(distance, 0, 750000, 0, 1) // Neptune is farest on 747908
                    let position = centerClone.lerp(item.position, distance > 400000 ? 0.97 : 0.85);
                    if (item.position.x === 0) {
                        position.z = item.geometry.boundingSphere.radius + 20000;
                    }

                    console.log('Distance', distance);
                    // console.log('Calculated Distance', calculatedDistance)
                    console.log('Length', position.length());
                    console.log('Radius', item.geometry.boundingSphere.radius);

                    that.moveCamera(
                        position,
                        4000,
                        function () {
                            setTimeout(() => {
                                updateControls = true;
                            }, 2000);
                        },
                        item.position);

                    break;
            }
        }
    }

    startTransmission = () => {
        visualComponents.controls.target.copy(visualComponents.components.isis.position);

        clock = new THREE.Clock();
        visualComponents.BlobPlanet.start();
        this.onTransmission = true;

        // Overwrite react UI to avoid multiple class render
        let titles = document.getElementsByClassName('planet_title');
        this.ui = {
            titles: {},
            debugText: document.getElementById('debugText')
        }
        for (let key in titles) {
            this.ui.titles[titles[key].id] = titles[key];
        }
        for (let i in planetsCollisions) {
            planetsCollisions[i].collided = false;
        }
        this.props.updateHolderState({
            planetsCollisions: planetsCollisions,
        })
        console.log(this.ui)
    }

    setCameraRotation = (state) => {
        envParams.cameraRotation = state;
    }

    setInteractionState(interactionState, _clickableState, origin) {
        console.log("setInteractionState:", interactionState, _clickableState, origin);
        blockInteraction = !interactionState;
        clickableState = _clickableState;
        if (visualComponents.controls) visualComponents.controls.enabled = interactionState;
    }

    //Runnables

    update = () => {
        const deltaTime = clock.getDelta();
        const time = clock.getElapsedTime();
        // console.log('blockInteraction:', blockInteraction);
        // console.log('activeItem:', activeItem);

        // if (onDebug) {
        //     let roundTime = Math.round(time);
        //     if (roundTime > this.time) {
        //         this.time = roundTime;
        //         this.props.updateHolderState({
        //             sceneTime: roundTime
        //         });
        //     }
        // }

        if (!onEnvironmentUpdate) {
            if (visualComponents.controls && visualComponents.controls.update && updateControls) {
                visualComponents.controls.update(deltaTime);
            }
            if (visualComponents.stats) {
                visualComponents.stats.update();
            }

            TWEEN.update();

            this.updateObjects(time, deltaTime);

            if (visualComponents.BlobPlanet && visualComponents.BlobPlanet.animate) {

                // UPdate camera
                let dist = Math.floor(visualComponents.BlobPlanet.mesh.position.distanceTo(
                    visualComponents.camera.position));

                if (dist != this.lastCameraDistance) {
                    this.lastCameraDistance = dist;
                    visualComponents.camera.near = Math.sqrt(dist) * 2;
                    visualComponents.camera.far = dist * 20;
                    visualComponents.camera.updateProjectionMatrix();

                    // when dist = 0 -> near = 5
                    // when dist = 2500 -> near = 5000
                    // if (visualComponents.components.distText) {
                    //     visualComponents.components.distText.element.innerHTML =
                    //         `Camera near: ${visualComponents.camera.near}, far: ${visualComponents.camera.far}`
                    // }
                }
                // Planets Collisions
                this.updateCollisions();

                // Debug

                // if (onDebug) {
                //     this.ui.debugText.innerHTML =
                //         `
                //         Radius: ${Math.round(visualComponents.BlobPlanet.radius)} KM<br/>
                //         Simulation Frames: ${visualComponents.BlobPlanet.frameCount}<br/>
                //         Velocity: ${Math.round(visualComponents.BlobPlanet.positionUniforms['velocity'].value)}<br/>
                //         Camera near: ${Math.round(visualComponents.camera.near)}<br/>
                //         Camera far: ${Math.round(visualComponents.camera.far)}<br/>
                //         Renderer Frames: ${visualComponents.renderer.info.render.frame}<br/>
                //         `
                // }

                // Debug
                // if (visualComponents.components.mapMesh) {
                //     visualComponents.components.mapMesh.material.uniforms.drawTexture.value = visualComponents.BlobPlanet.texturePosition;
                //     visualComponents.components.mapMesh2.material.uniforms.drawTexture.value = visualComponents.BlobPlanet.textureVelocity;
                //     visualComponents.components.mapMesh3.material.uniforms.drawTexture.value = visualComponents.BlobPlanet.textureNormal;
                // }

                // if (this.ui) {
                //     if (this.ui.timeText) {
                //         this.ui.timeText.innerHTML = `Transmission time: ${Math.round(this.time)}`
                //     }
                // }
            }

            visualComponents.controls.autoRotate = envParams.cameraRotation;

            this.frameId = window.requestAnimationFrame(this.update);
            this.renderScene();
        }
    }

    updateObjects = (time, deltaTime) => {
        visualComponents.updateComponents(time, deltaTime);

        if (visualComponents.BlobPlanet && visualComponents.BlobPlanet.animate) {
            visualComponents.BlobPlanet.update(time);
            visualComponents.BlobPlanet.render(time);
            if (visualComponents.BlobPlanet.timeUpdated) {
                // this.props.updateHolderState({
                //     animationTime: visualComponents.BlobPlanet.animationTime
                // });
                let transmissionTimeText = document.getElementById('#transmissionTimeText');
                if (transmissionTimeText) {
                    transmissionTimeText.innerHTML = `Transmission time: ${new Date(visualComponents.BlobPlanet.animationTime * 1000).toISOString().substring(14, 19)}`
                }
            }
        }

        if (visualComponents.components && visualComponents.components.isis) {
            if (visualComponents.components.isis.userData && visualComponents.components.isis.userData.rotate) {
                visualComponents.orbitAroundVector(
                    visualComponents.components.isis,
                    visualComponents.components.isis.userData.rotationTarget,
                    visualComponents.components.isis.userData);
                // visualComponents.components.isis.rotateY(THREE.MathUtils.degToRad(90))
            }
        }
    }

    updateCollisions = () => {
        // let blobSphere = new THREE.Sphere(
        //     visualComponents.BlobPlanet.position,
        //     visualComponents.BlobPlanet.radius);
        // let found = false;
        // // for (let i in visualComponents.components.planets) {
        // //     let planet = visualComponents.components.planets[i];
        // //     let collision = blobSphere.intersectsSphere(planet.planetSphere);
        // //     if (collision && !planetsCollisions[planet.data.name].collided) {
        // //         planetsCollisions[planet.data.name].collided = true;
        // //         found = true;
        // //     }
        // //     let title = this.ui.titles[planet.data.name.toLowerCase()];
        // //     let distance = planet.threeObj.position.distanceTo(visualComponents.BlobPlanet.position);
        // //     distance -= visualComponents.BlobPlanet.radius;
        // //     title.innerHTML = `
        // //     ${planet.data.name} 
        // //     ${planetsCollisions[planet.data.name].collided ? 0 : Math.round(distance)} KM
        // //     ${planetsCollisions[planet.data.name].collided}
        // //     `
        // // }
        // if (found) {
        //     //on collide
        //     // this.props.updateHolderState({
        //     //     planetsCollisions: planetsCollisions
        //     // })
        // }
    }

    renderScene = () => {
        if (visualComponents.renderer) {
            visualComponents.renderer.render(visualComponents.scene, visualComponents.camera);
        }

    };

    render() {
        return (
            <div style={{ width: "100%", height: "100%" }} ref={mount => { this.mount = mount }} />
        )
    }
}
