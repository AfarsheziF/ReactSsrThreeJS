import React from "react";
import * as THREE from "vendor_mods/three/build/three.module";

import VisualComponents from './Components/VisualComponents';
import VisualAnimations from "./Components/VisualAnimations";
import appUtils from '../../utils/appUtils';

let clock, onEnvironmentUpdate;

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

        // if (this.props.dataStateCallback) {
        //     this.props.dataStateCallback(this.state.dataState);
        // }

        if (this.state.startScene) {
            this.start();
        }
    }

    // Graphics

    initGraphics = init => {
        console.log('Init graphics');

        const startInits = () => {
            return new Promise((resolve, reject) => {
                if (!VisualComponents.scene) initScene(); // Watch for relaunch
                initEnvironment();
                initObjects().then(
                    () => {
                        initPostFx();
                        this.setState({
                            initGraphics: false
                        })
                        resolve();
                    }, function (e) {
                        reject(e);
                    }
                );
            })

        }

        const initScene = () => {
            console.log('Init Scene');
            this.width = this.mount.clientWidth;
            this.height = this.mount.clientHeight;

            VisualComponents.init(this.mount, this.envParams, this.onDebug, this.props.loadingManager);
            clock = new THREE.Clock();

            let rendererOptions = {
                antialias: this.envParams.renderer.antialias,
                powerPreference: 'high-performance',
                alpha: true
            };
            VisualComponents.createRenderer(rendererOptions);
            this.mount.appendChild(VisualComponents.renderer.domElement);

            VisualComponents.createScene();
            VisualComponents.createCamera(this.envParams.camera.type, this.envParams.camera_controls.type);
        }

        const initEnvironment = () => {
            console.log('Init Environment');
            VisualComponents.createLights();
            VisualComponents.initDefaultMaterials(this.envParams.materials.onReflections);
        }

        const initObjects = () => {
            console.log('Init Objects')
            // visualComponents.loadingStates.addDestination(29); // How many files are going to be loaded
            return new Promise((resolve, reject) => {
                Promise.all([
                    VisualComponents.createObject('Audio', 'Audio', this.onComponentsLoaded),
                    VisualComponents.createObject('sky', 'sky'),
                    VisualComponents.createObject('WaterWaves', 'WaterWaves'),
                    VisualComponents.createObject('SphereMesh', 'SphereMesh'),
                    VisualComponents.createObject('Spline', 'Spline'),
                    VisualComponents.createObject('Text', 'Text'),
                ]).then(
                    (objects) => {
                        VisualComponents.setSceneEnvironment("sky");

                        objects.forEach(obj => {
                            obj.addToScene ? obj.addToScene(VisualComponents.scene) : VisualComponents.scene.add(obj);
                            obj.updateMaterial && obj.updateMaterial(VisualComponents.scene.environment);
                        })

                        VisualComponents.camera.position.copy(VisualComponents.components.Spline.positions[0]);
                        VisualAnimations.init({
                            visualComponents: VisualComponents,
                            envParams: this.envParams.animation,
                            state: {
                                setSceneState: this.setState,
                                setHolderState: this.props.updateHolderState
                            }
                        });

                        console.log('Objects loaded');
                        console.log(VisualComponents.components);
                        resolve();
                    }, function (e) {
                        reject(e);
                    }
                )
            });
        }

        const initPostFx = () => {
            VisualComponents.createComposer(this.envParams.postFX, this.envParams.editor.enabled);
        }

        // End
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
            startInits().then(
                function () {
                    loadScene();
                }, function (e) {
                    // handle error. Send back to holder
                    console.log(e);
                }
            );
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
        VisualComponents.onWindowResize(this.width, this.height);
    }

    // Setters

    setCameraRotation = (state) => {
        console.log(`> Scene. enableCameraRotation: ${state} <`);
        this.envParams.camera.enableCameraRotation = state;
        VisualComponents.controls.autoRotate = this.envParams.camera.enableCameraRotation;
    }

    setInteractionState(interactionState, _clickableState, origin) {
        console.log("setInteractionState:", interactionState, _clickableState, origin);
        this.blockInteraction = !interactionState;
        this.clickableState = _clickableState;
        if (VisualComponents.controls) VisualComponents.controls.enabled = interactionState;
    }

    moveCamera = (to, duration, _onComplete, lookAt) => {
        if (!VisualComponents.camera.position.equals(to)) {
            this.blockInteraction = true;
            new TWEEN.Tween(VisualComponents.camera.position)
                .to(to, duration || 3000)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function (value) {
                    VisualComponents.camera.position.copy(value);
                    if (lookAt) {
                        VisualComponents.camera.lookAt(lookAt);
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
            this.blockInteraction = false;
            VisualComponents.camera.updateProjectionMatrix();
            if (_onComplete) _onComplete();
        }
    }

    rotateCamera = (position, duration, _onComplete) => {
        // backup original rotation
        const startRotation = VisualComponents.camera.quaternion.clone();

        // final rotation (with lookAt)
        VisualComponents.camera.lookAt(position);
        const endRotation = VisualComponents.camera.quaternion.clone();

        // revert to original rotation
        VisualComponents.camera.quaternion.copy(startRotation);

        // Tween
        new TWEEN.Tween
            (VisualComponents.camera.quaternion)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .to(endRotation, duration || 3000)
            .start()
            .onComplete(function () {
                // visualComponents.camera.lookAt(position);
                // visualComponents.camera.updateProjectionMatrix();
                if (_onComplete != null) {
                    _onComplete();
                }
            });
    }

    zoomCamera = type => {
        const that = this;
        let zoomValue = 0.01; //envParams.zoomValue;
        let cameraPos = VisualComponents.camera.position.clone();
        let allowZoomIn = true;
        let allowZoomOut = true;
        if (VisualComponents.controls.minDistance > 0) {
            allowZoomIn = cameraPos.z < VisualComponents.controls.minDistance - zoomValue;
        }
        if (VisualComponents.controls.maxDistance !== Infinity) {
            allowZoomOut = cameraPos.z > VisualComponents.controls.maxDistance + zoomValue;
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
                    VisualComponents.controls.dollyIn();
                }
            } else {
                for (let i = 0; i < zoomValue; i++) {
                    VisualComponents.controls.dollyOut();
                }
            }
        }
        else {
            this.props.onZoomCallback(allowZoomIn, allowZoomOut);
        }
    }

    updateSettings(input) {
        VisualComponents.updateSettings(input, true);
    }

    setAnimationGroupsState(groupsState) {
        for (const key in groupsState) {
            if (VisualAnimations.envParams.groups[key]) {
                VisualAnimations.envParams.groups[key].active = groupsState[key];
            }
        }
    }

    setComponentValue(key, props) {
        const component = VisualComponents[key] || VisualComponents.components[key];
        if (component) {
            if (component.setValue) {
                component.setValue(props.value ? props : { value: props });
            }
        } else {
            console.log("> Scene. setComponentValue: Component was not found: " + key);
        }
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

            if (this.sceneStared && VisualComponents.components) {
                VisualAnimations.update({ time: this.time, deltaTime: this.deltaTime });
            }

            this.frameId = window.requestAnimationFrame(this.update);
            this.renderScene({ time: this.time, deltaTime: this.deltaTime });
        }
    }

    updateObjects = (time, deltaTime) => {
        VisualComponents.updateComponents(time, deltaTime);
    }

    renderScene = (timeProps) => {
        VisualComponents.renderScene(timeProps);
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