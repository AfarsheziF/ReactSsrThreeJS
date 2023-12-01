import * as THREE from "three";
import utils from '../utils/utils';

let envParams = {
    // Renderer
    antialias: true,
    rendererExposure: 1, //1.25
    rendererGamma: 2,
    rendererBackgroundColor: 0x454545,
    toneMapping: THREE.ACESFilmicToneMapping,

    //Scene
    sceneBackgroundColor: 0x000000,

    // Camera
    near: 5.0, // 500
    fov: 50,
    far: utils.isMobile ? 15000 : 10000000,
    cameraStartPos: (utils.isMobile ? new THREE.Vector3(0, 0, -1200) : new THREE.Vector3(0, 0, -4500000)), // Mobile pos must be round to 100 for zoom
    controlsEnableRotate: false,
    blockInteraction: false,
    cameraRotation: true,
    cameraRotationSpeed: 0.1,

    // Materials
    materialsColor: 0xffffff,
    materialDebreeColor: 0xffffff,
    materialsCombine: THREE.MixOperation,
    materialsRoughness: 1,
    materialsMetalness: 1,
    materialsEmissiveColor: 0xffffff,
    materialEmissiveIntensity: 0.0,
    materialsWireframe: false,
    materialsFlatShading: false,
    materialsSpecularColor: 0xffffff,
    materialsShininess: 200,
    materialsReflectivity: 0.8,
    materialsReflectionRatio: 0.98,
    materialsClearcoat: 1,
    materialsClearcoatRoughness: 1.0,
    materialsTransmission: 0,
    materialBumpScale: 0.3,
    materialsDisplacementScale: 3,
    materialsDisplacementBias: 0,
    phongMaterialsMetalness: 1,
    materialEnvMapIntensity: 1,
    onReflections: true,

    // lights
    lights: {
        ambientLight: {
            color: 0xffffff,
            intensity: 0.1
        },
        pointLight: {
            color: 0xffffff,
            position: { x: 0, y: 0, z: 0 },
            intensity: 2,
            distance: 0,
            decay: 0,
            power: 150
        }
    },
    lightHelpers: [],
    debugLights: true,
    lightsColor: 0xffffff,
    lightsIntensity: 2,
    spotLightAngle: 0.25,
    lightsCenterDistance: utils.isMobile ? 150 : 600,
    lightDistance: 5000,
    lightsPower: 180,
    castShadow: !utils.isMobile,
    receiveShadow: !utils.isMobile,
    shadowMapResolution: utils.isMobile ? 256 : 2048, //1014
    shadowNear: 0.5,
    shadowFar: 500,
    shadowFocus: 1,
    ambientColor: 0xffffff,

    // Simulation
    width: 1024,
    meshDetail: 200,
    visible: true,
    opacity: 0.7,
    // opacity: 0.1,
    velocity: 1.0,
    initVelocity: 1.0,
    wireframe: false,

    rimPower: 2.0,
    rimStrength: 0.2,

    sineWavesStrength: 0.1,
    sineWavesSpeed: 1.0,
    sineWavesPow: 1.52,
    sineWavesScale: 1.0,
    sineWavesCustomScale: 0.93,
    sineWaveColor: new THREE.Color(1.0, 1.0, 1.0),
    sineWavesAutoResize: true,

    ambientLightsStrength: 0.5,
    collisionsClusterNoiseScale: 20.0,
    ambientLightColor: new THREE.Color(1.0, 1.0, 1.0),
    velColorStrength: 0.0,

    gradientColor1: new THREE.Color(0.0, 0.0, 1.0),
    gradientColor2: new THREE.Color(0.75, 0.25, 0.85),
    gradientColorStrength: 0.5,

    blobPlanet: {
        meshDetail: 200,
        visible: true,
        opacity: 0.7,
        velocity: 1.0,
        initVelocity: 1.0,
        wireframe: false,

        rimPower: 2.0,
        rimStrength: 0.2,

        sineWavesStrength: 0.1,
        sineWavesSpeed: 1.0,
        sineWavesPow: 1.52,
        sineWavesScale: 1.0,
        sineWavesCustomScale: 0.93,
        sineWaveColor: new THREE.Color(1.0, 1.0, 1.0),
        sineWavesAutoResize: true,

        ambientLightsStrength: 0.5,
        collisionsClusterNoiseScale: 20.0,
        ambientLightColor: new THREE.Color(1.0, 1.0, 1.0),
        velColorStrength: 0.0,

        gradientColor1: new THREE.Color(0.0, 0.0, 1.0),
        gradientColor2: new THREE.Color(0.75, 0.25, 0.85),
        gradientColorStrength: 0.5
    }
};

export default envParams;