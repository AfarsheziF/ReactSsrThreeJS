import React from "react";
import * as THREE from "../../../vendor_mods/three/build/three.module";

import visualComponents from './Components/visualComponents';
import utils from '../../utils/utils';

let onDebug = false;

// params
let envParams,
    onInitGraphics,
    activeItem,
    blockInteraction,
    updateControls,
    clickableState;

let clock, onEnvironmentUpdate;

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
        if (this.state.reInitGraphics && !onInitGraphics) {
            this.initGraphics(this.state.reInitGraphics);
        }

        // if (this.props.dataStateCallback) {
        //     this.props.dataStateCallback(this.state.dataState);
        // }

        if (this.state.startScene) {
            this.start();
        }
    }

    //

    // Graphics

    initGraphics = init => {
        console.log('Init graphics');
        const that = this;

        // onInitGraphics = true;
        this.setState({
            dataState: 'loading',
            update: false
        })

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
                        // if (onDebug) {
                        //     initGUI()
                        //     // initDebugEnv(sceneObjects);
                        // }
                        // initUI();
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
            visualComponents.initDefaultMaterials(envParams.onReflections);
        }

        function initObjects() {
            console.log('Init Objects')
            console.log('Textures Mode:', that.state.settings.texturesMode);
            // visualComponents.loadingStates.addDestination(29); // How many files are going to be loaded
            visualComponents.components.objects = [];
            return new Promise((resolve, reject) => {
                Promise.all([
                    // visualComponents.loadTexture(`public/images/${that.state.settings.texturesMode}/STARS_COLOR_DARK.jpg`),
                    visualComponents.createObject('water', null, visualComponents.scene),
                    visualComponents.createObject('sky', null, visualComponents.scene)
                ]).then(
                    function (objects) {
                        // console.log('Assets loaded:', objects);
                        // objects[0].encoding = THREE.SRGBColorSpace;
                        // objects[0].mapping = THREE.EquirectangularReflectionMapping;
                        // visualComponents.scene.background = objects[0];

                        visualComponents.scene.add(objects[0]);
                        visualComponents.scene.add(objects[1]);

                        const geometry = new THREE.BoxGeometry(100, 100, 100);
                        const cube = new THREE.Mesh(geometry, visualComponents.defaultMaterial);
                        visualComponents.components.objects.push(cube);
                        visualComponents.scene.add(cube);

                        // Will create a full physical object
                        // const box = visualComponents.addNewShape('box', 100, 1, new THREE.Vector3(0, 0, 0));

                        console.log('Objects loaded');
                        console.log(visualComponents.components);
                        resolve();
                    }, function (e) {
                        reject(e);
                    }
                )
            });
        }

        // End
        function sceneSwitch() {
            console.log("Init active scene:", that.props.activeScene)
            onInitGraphics = false;
            that.setState({
                reInitGraphics: false,
                startScene: true
            });
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
                // planetsCollisions: planetsCollisions,
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

    //listeners

    onWindowResize = () => {
        this.width = this.mount.clientWidth;
        this.height = this.mount.clientHeight;
        visualComponents.onWindowResize(this.width, this.height);
    }

    //

    update = () => {
        const deltaTime = clock.getDelta();
        const time = clock.getElapsedTime();

        if (!onEnvironmentUpdate) {
            if (visualComponents.controls) {
                if (visualComponents.controls.update && updateControls) {
                    visualComponents.controls.update(deltaTime);
                }

                if (visualComponents.stats) {
                    visualComponents.stats.update();
                }

                visualComponents.controls.autoRotate = envParams.cameraRotation;
            }

            TWEEN.update();

            this.updateObjects(time, deltaTime);

            this.frameId = window.requestAnimationFrame(this.update);
            this.renderScene();
        }
    }

    updateObjects = (time, deltaTime) => {
        if (visualComponents.components.water && visualComponents.components.water.visible) {
            visualComponents.components.water.material.uniforms['time'].value += envParams.components.water.waterSpeed;
        }

        visualComponents.components.objects[0].position.y = Math.sin(time) * 20 + 5;
        visualComponents.components.objects[0].rotation.x = time * 0.5;
        visualComponents.components.objects[0].rotation.z = time * 0.51;
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