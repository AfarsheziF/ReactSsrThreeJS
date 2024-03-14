import React from "react";
import * as THREE from "vendor_mods/three/build/three.module";
import Stats from 'vendor_mods/three/examples/jsm/libs/stats.module'

import { OrbitControls } from "vendor_mods/three/examples/jsm/controls/OrbitControls";
import { TeapotGeometry } from 'vendor_mods/three/examples/jsm/geometries/TeapotGeometry';

let clock, onEnvironmentUpdate, objects, gui, envParams;

export default class SceneTest extends React.Component {

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

            objects = {
                objects: {},
                lights: {}
            };

            // RENDERER
            objects.renderer = new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: 'high-performance',
                alpha: true
            });
            objects.renderer.setPixelRatio(window.devicePixelRatio || 1);
            objects.renderer.setSize(this.width, this.height);
            this.mount.appendChild(objects.renderer.domElement);

            // CAMERA
            objects.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 5, 10000);
            objects.camera.position.set(0, 0, 1500);

            // CONTROLS
            objects.cameraControls = new OrbitControls(objects.camera, objects.renderer.domElement);
            objects.cameraControls.enableDamping = true;
            // LIGHTS
            // objects.ambientLight = new THREE.AmbientLight(0x7c7c7c, 3.0);
            objects.lights.directionalLight = new THREE.DirectionalLight('#ffffff', 3.0);
            objects.lights.directionalLight.position.set(0.32, 0.39, 0.7);

            // SCENE
            objects.scene = new THREE.Scene();

            // objects.scene.add(objects.ambientLight);
            objects.scene.add(objects.lights.directionalLight);

            let geometry = new TeapotGeometry(300, -1);
            const teapot = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide }));
            objects.scene.add(teapot);
            objects.objects.teapot = teapot;

            // const geometry = new THREE.BoxGeometry(150, 150, 150);
            // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            // const mesh = new THREE.Mesh(geometry, material);
            // objects.scene.add(mesh);
            // objects.objects.cube1 = mesh;

            clock = new THREE.Clock();

            objects.stats = Stats();
            objects.stats.domElement.style.cssText = 'position:absolute;bottom:0px;left:0px;';
            document.body.appendChild(objects.stats.dom)

            envParams = {
                teapot: {
                    wireframe: false
                },
                directionalLight: {
                    color: '#ffffff',
                    intensity: 1
                }
            };

            gui = new lil.GUI().close();
            let teapotFolder = gui.addFolder('Teapot')
            teapotFolder.add(envParams.teapot, 'wireframe');

            let lightsFolder = gui.addFolder('DirectionalLight')
            lightsFolder.addColor(envParams.directionalLight, 'color');
            lightsFolder.add(envParams.directionalLight, 'intensity');

            gui.onChange((controller) => {
                // console.log(controller);
                objects.objects.teapot.material.wireframe = envParams.teapot.wireframe;
                objects.lights.directionalLight.color = new THREE.Color(envParams.directionalLight.color);
                objects.lights.directionalLight.intensity = envParams.directionalLight.intensity
            });

            loadScene();
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

    onWindowResize = () => {
        this.width = this.mount.clientWidth;
        this.height = this.mount.clientHeight;

        objects.renderer.setSize(this.width, this.height);

        objects.camera.aspect = this.width / this.height;
        objects.camera.updateProjectionMatrix();
    }

    //

    update = () => {
        this.deltaTime = Math.min(0.05, clock.getDelta());
        this.time = clock.getElapsedTime();

        objects.stats.update();
        objects.cameraControls.update(this.deltaTime);

        //
        // objects.objects.teapot.rotation.x += 0.005;
        // objects.objects.teapot.rotation.y += 0.01;

        this.frameId = window.requestAnimationFrame(this.update);
        objects.renderer.render(objects.scene, objects.camera);
    }

    render() {
        return (
            <div style={{ width: "100%", height: "100%" }} >
                <p>Start state: {this.sceneStared ? '1' : '0'}</p>
                <div style={{ width: "100%", height: "100%" }} ref={mount => { this.mount = mount }} />
            </div>
        )
    }
}