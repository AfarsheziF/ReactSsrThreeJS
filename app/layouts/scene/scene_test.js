import React from "react";
import * as THREE from "vendor_mods/three/build/three.module";

import { OrbitControls } from "vendor_mods/three/examples/jsm/controls/OrbitControls";
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';

let clock, onEnvironmentUpdate, objects;

export default class Scene extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: props.data ? props.data : [],
            initGraphics: true,
            autoRotate: props.autoRotate
        };

        this.time = 0;
        this.onDebug = props.onDebug;
        this.envParams = props.envParams;
    }

    componentDidMount() {
        console.log("-- Scene mounted --")
        console.log('-- OnDebug: ' + this.onDebug);

        this.debugView = document.getElementById('scene_debug');
        this.debugViewTime = document.getElementById('scene_debug_time');
        this.debugViewDeltaTime = document.getElementById('scene_debug_deltaTime');

        this.mounted = true;
        this.initGraphics(this.state.initGraphics);
    }

    componentWillUnmount() {
        console.log("Scene unmount")
        this.mounted = false;
    }

    componentDidUpdate() {
        if (this.state.reInitGraphics && !this.onInitGraphics) {
            this.initGraphics(this.state.reInitGraphics);
        }

        if (this.state.startScene) {
            this.start();
        }
    }

    // Graphics

    initGraphics = init => {
        console.log('Init graphics');

        const loadScene = () => {
            console.log("Init active scene:", this.props.activeScene)
            this.onInitGraphics = false;
            this.setState({
                reInitGraphics: false,
                startScene: true
            });
        }

        this.setState({
            dataState: 'loading',
            update: false
        })

        if (init) {
            this.onInitGraphics = true;
            this.width = this.mount.clientWidth;
            this.height = this.mount.clientHeight;

            objects = {};

            // RENDERER
            objects.renderer = new THREE.WebGLRenderer({ antialias: true });
            objects.renderer.setPixelRatio(window.devicePixelRatio);
            objects.renderer.setSize(this.width, this.height);

            // CAMERA
            objects.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 80000);
            objects.camera.position.set(- 600, 550, 1300);

            // CONTROLS
            objects.cameraControls = new OrbitControls(objects.camera, objects.renderer.domElement);
            objects.cameraControls.addEventListener('change', objects.render);

            // LIGHTS
            objects.ambientLight = new THREE.AmbientLight(0x7c7c7c, 3.0);

            objects.light = new THREE.DirectionalLight(0xFFFFFF, 3.0);
            objects.light.position.set(0.32, 0.39, 0.7);

            // scene itself
            objects.scene = new THREE.Scene();
            objects.scene.background = new THREE.Color(0xAAAAAA);

            objects.scene.add(objects.ambientLight);
            objects.scene.add(objects.light);

            const geometry = new TeapotGeometry(300, -1);
            const teapot = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ wireframe: true }));
            objects.scene.add(teapot);

        } else {
            loadScene();
        }
    }

    start = () => {
        console.log('Scene start: ' + this.width + " X " + this.height);
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
        setTimeout(() => {
            this.sceneStared = true;
            this.props.updateHolderState({
                sceneStared: true,
                showLoadingDialog: false
            })
        }, 5000);

        this.blockInteraction = false;
        this.updateControls = true;

    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    }

    // listeners

    onComponentsLoaded = (component) => {
        // For inner components promises such as assets load
        this.props.updateHolderState({
            components: {
                [[component.name]]: component
            }
        })
    }

    onWindowResize = () => {
        this.width = this.mount.clientWidth;
        this.height = this.mount.clientHeight;
        // VisualComponents.onWindowResize(this.width, this.height);
    }

    // Setters

    setCameraRotation = (state) => {
        console.log(`> Scene. enableCameraRotation: ${state} <`);
        this.envParams.camera.enableCameraRotation = state;
        // VisualComponents.controls.autoRotate = this.envParams.camera.enableCameraRotation;
    }

    setInteractionState(interactionState, _clickableState, origin) {
        console.log("setInteractionState:", interactionState, _clickableState, origin);
        this.blockInteraction = !interactionState;
        this.clickableState = _clickableState;
        // if (VisualComponents.controls) VisualComponents.controls.enabled = interactionState;
    }


    //

    update = () => {
        this.deltaTime = Math.min(0.05, clock.getDelta());
        this.time = clock.getElapsedTime();

        if (this.onDebug && this.envParams.device.showDebugView) {
            this.debugViewTime.innerHTML = `Time: ${Math.round((this.time + Number.EPSILON) * 100) / 100}`;
            this.debugViewDeltaTime.innerHTML = `DeltaTime: ${Math.round((this.deltaTime + Number.EPSILON) * 10000) / 10000}`;
        }

        if (!onEnvironmentUpdate) {
            this.updateObjects(this.time, this.deltaTime);

            // if (this.sceneStared && VisualComponents.components) {
            //     VisualAnimations.update({ time: this.time, deltaTime: this.deltaTime });
            // }

            this.frameId = window.requestAnimationFrame(this.update);
            this.renderScene({ time: this.time, deltaTime: this.deltaTime });
        }
    }

    // updateObjects = (time, deltaTime) => {
    //     VisualComponents.updateComponents(time, deltaTime);
    // }

    renderScene = (timeProps) => {
        // VisualComponents.renderScene(timeProps);
        objects.renderer.render(objects.scene, objects.camera);
    };

    render() {
        return (
            <div style={{ width: "100%", height: "100%" }} >
                <div
                    id="scene_debug"
                    style={{
                        display: this.envParams.device.showDebugView ? 'flex' : 'none',
                        position: 'absolute',
                        top: 0,
                        flexDirection: 'column',
                        padding: 15
                    }}
                >
                    <p style={{ flex: 1 }}>Tier: {this.envParams.device.settingsState}</p>
                    <p style={{ flex: 1 }} id="scene_debug_time"></p>
                    <p style={{ flex: 1 }} id="scene_debug_deltaTime"></p>
                </div>
                <div style={{ width: "100%", height: "100%" }} ref={mount => { this.mount = mount }} />
            </div>
        )
    }
}