import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
    GUI
} from 'dat.gui';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';
import {
    Water
} from 'three/examples/jsm/objects/Water';
import {
    Sky
} from "three/examples/jsm/objects/Sky";
import * as CANNON from 'cannon-es'

var stats;
var camera, scene, renderer;
var water, waterCompiled = false;
var light, helper, lightShift = new THREE.Vector3(0, 1, 0);
var clock, delta, numHelipads;
var world, cannonDebugRenderer;
var rotorBody, heliBody, helipadBodies;
var rotorMesh, heliBodyMesh, helipadMeshes;
var v = new THREE.Vector3();
var chaseCamPivot;
var banking = false;
var climbing = false;
var pitching = false;
var yawing = false;
var stableLift = 14.7;
var thrust = new CANNON.Vec3(0, 5, 0);
var keyMap = {};
var onDocumentKey = function (e) {
    keyMap[e.key] = e.type === 'keydown';
};
document.addEventListener('keydown', onDocumentKey, false);
document.addEventListener('keyup', onDocumentKey, false);
const waves = [{
    direction: 45,
    steepness: 0.1,
    wavelength: 7,
},
{
    direction: 306,
    steepness: 0.2,
    wavelength: 32,
},
{
    direction: 196,
    steepness: 0.3,
    wavelength: 59,
},
];

function getWaveInfo(x, z, time) {
    const pos = new THREE.Vector3();
    const tangent = new THREE.Vector3(1, 0, 0);
    const binormal = new THREE.Vector3(0, 0, 1);
    Object.keys(waves).forEach((wave) => {
        const w = waves[wave];
        const k = (Math.PI * 2) / w.wavelength;
        const c = Math.sqrt(9.8 / k);
        const d = new THREE.Vector2(
            Math.sin((w.direction * Math.PI) / 180),
            -Math.cos((w.direction * Math.PI) / 180)
        );
        const f = k * (d.dot(new THREE.Vector2(x, z)) - c * time);
        const a = w.steepness / k;
        pos.x += d.y * (a * Math.cos(f));
        pos.y += a * Math.sin(f);
        pos.z += d.x * (a * Math.cos(f));
        tangent.x += -d.x * d.x * (w.steepness * Math.sin(f));
        tangent.y += d.x * (w.steepness * Math.cos(f));
        tangent.z += -d.x * d.y * (w.steepness * Math.sin(f));
        binormal.x += -d.x * d.y * (w.steepness * Math.sin(f));
        binormal.y += d.y * (w.steepness * Math.cos(f));
        binormal.z += -d.y * d.y * (w.steepness * Math.sin(f));
    });
    const normal = binormal.cross(tangent).normalize();
    return {
        position: pos,
        normal: normal,
    };
}

function updateHelipads(delta) {
    var t = water.material.uniforms['time'].value;
    helipadMeshes.forEach(function (b, i) {
        var waveInfo = getWaveInfo(b.position.x, b.position.z, t);
        b.position.y = waveInfo.position.y;
        var quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(waveInfo.normal.x, waveInfo.normal.y, waveInfo.normal.z));
        b.quaternion.rotateTowards(quat, delta * 0.5);
        helipadBodies[i].quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
        helipadBodies[i].position.set(b.position.x, b.position.y, b.position.z);
    });
}
init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    //
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x909497);
    //scene.fog = new THREE.FogExp2(0x909497, 0.005);
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 50000);
    camera.position.set(30, 30, 100);
    var chaseCam = new THREE.Object3D();
    chaseCam.position.set(0, 0, 0);
    chaseCamPivot = new THREE.Object3D();
    chaseCamPivot.position.set(0, 2, 4);
    chaseCam.add(chaseCamPivot);
    scene.add(chaseCam);
    light = new THREE.DirectionalLight();
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.001;
    light.shadow.camera.far = 10;
    light.shadow.camera.top = 10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.left = -10;
    light.shadow.camera.right = 10;
    scene.add(light);
    scene.add(light.target);
    //helper = new THREE.CameraHelper(light.shadow.camera)
    //scene.add(helper)
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    var boxGeometry = new THREE.BoxGeometry(5, 1, 5);
    numHelipads = 10;
    helipadMeshes = [];
    helipadBodies = [];
    var material = new THREE.MeshStandardMaterial({});
    for (var i = 0; i < numHelipads; i++) {
        var box = new THREE.Mesh(boxGeometry, material);
        box.position.set(Math.random() * 500 - 250, 0, Math.random() * 500 - 250);
        box.receiveShadow = true;
        scene.add(box);
        helipadMeshes.push(box);
        var shape = new CANNON.Box(new CANNON.Vec3(2.5, 0.5, 2.5));
        var body = new CANNON.Body({
            mass: 0
        });
        body.addShape(shape);
        body.position.x = helipadMeshes[i].position.x;
        body.position.y = helipadMeshes[i].position.y;
        body.position.z = helipadMeshes[i].position.z;
        world.addBody(body);
        helipadBodies.push(body);
    }
    var heliBodyGeometry = new THREE.SphereGeometry(0.66);
    heliBodyMesh = new THREE.Mesh(heliBodyGeometry, material);
    heliBodyMesh.position.y = 2;
    heliBodyMesh.castShadow = true;
    scene.add(heliBodyMesh);
    heliBodyMesh.add(chaseCam);
    var heliTailGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
    var heliTailMesh = new THREE.Mesh(heliTailGeometry, material);
    heliTailMesh.position.z = 1;
    heliTailMesh.castShadow = true;
    heliBodyMesh.add(heliTailMesh);
    var skidGeometry = new THREE.BoxGeometry(0.1, 0.05, 1.5);
    var skidLeftMesh = new THREE.Mesh(skidGeometry, material);
    var skidRightMesh = new THREE.Mesh(skidGeometry, material);
    skidLeftMesh.position.set(-0.5, -0.45, 0);
    skidRightMesh.position.set(0.5, -0.45, 0);
    skidLeftMesh.castShadow = true;
    skidRightMesh.castShadow = true;
    heliBodyMesh.add(skidLeftMesh);
    heliBodyMesh.add(skidRightMesh);
    var heliBodyShape = new CANNON.Box(new CANNON.Vec3(0.6, 0.5, 0.6));
    heliBody = new CANNON.Body({
        mass: 0.5
    });
    heliBody.addShape(heliBodyShape);
    heliBody.position.x = heliBodyMesh.position.x;
    heliBody.position.y = heliBodyMesh.position.y;
    heliBody.position.z = heliBodyMesh.position.z;
    heliBody.angularDamping = 0.9; //so it doesn't pendulum so much
    world.addBody(heliBody);

    var rotorGeometry = new THREE.BoxGeometry(0.1, 0.01, 5);
    rotorMesh = new THREE.Mesh(rotorGeometry, material);
    rotorMesh.position.x = 0;
    rotorMesh.position.y = 100;
    rotorMesh.position.z = 0;
    scene.add(rotorMesh);
    var rotorShape = new CANNON.Sphere(0.1);
    rotorBody = new CANNON.Body({
        mass: 1
    });
    rotorBody.addShape(rotorShape);
    rotorBody.position.x = rotorMesh.position.x;
    rotorBody.position.y = rotorMesh.position.y;
    rotorBody.position.z = rotorMesh.position.z;
    rotorBody.linearDamping = 0.5; //simulates auto altitude
    world.addBody(rotorBody);
    var rotorConstraint = new CANNON.PointToPointConstraint(heliBody, new CANNON.Vec3(0, 1, 0), rotorBody, new CANNON.Vec3());
    rotorConstraint.collideConnected = false;
    world.addConstraint(rotorConstraint);

    const geometry = new THREE.BufferGeometry();

    const thetaSegments = 128;
    const phiSegments = 512;
    const thetaStart = 0;
    const thetaLength = Math.PI * 2;

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    let radius = 0;
    let radiusStep = 1;
    const vertex = new THREE.Vector3();
    const uv = new THREE.Vector2();

    for (let j = 0; j <= phiSegments; j++) {
        for (let i = 0; i <= thetaSegments; i++) {
            const segment = thetaStart + (i / thetaSegments) * thetaLength;
            vertex.x = radius * Math.cos(segment);
            vertex.y = radius * Math.sin(segment);
            vertices.push(vertex.x, vertex.y, vertex.z);
            normals.push(0, 0, 1);
            uv.x = (vertex.x + 1) / 2;
            uv.y = (vertex.y + 1) / 2;
            uvs.push(uv.x, uv.y);
        }
        radiusStep = radiusStep * 1.01;
        radius += radiusStep;
    }

    for (let j = 0; j < phiSegments; j++) {
        const thetaSegmentLevel = j * (thetaSegments + 1);
        for (let i = 0; i < thetaSegments; i++) {
            const segment = i + thetaSegmentLevel;
            const a = segment;
            const b = segment + thetaSegments + 1;
            const c = segment + thetaSegments + 2;
            const d = segment + 1;
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    geometry.setIndex(indices);
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

    water = new Water(geometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/Sean-Bradley/three.js/gerstner-waves/examples/textures/waternormals.jpg', function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 8,
        fog: scene.fog !== undefined
    });
    water.rotation.x = -Math.PI / 2;
    water.material.onBeforeCompile = function (shader) {
        shader.uniforms.offsetX = {
            value: 0
        };
        shader.uniforms.offsetZ = {
            value: 0
        };
        shader.uniforms.waveA = {
            value: [
                Math.sin((waves[0].direction * Math.PI) / 180),
                Math.cos((waves[0].direction * Math.PI) / 180),
                waves[0].steepness,
                waves[0].wavelength,
            ],
        };
        shader.uniforms.waveB = {
            value: [
                Math.sin((waves[1].direction * Math.PI) / 180),
                Math.cos((waves[1].direction * Math.PI) / 180),
                waves[1].steepness,
                waves[1].wavelength,
            ],
        };
        shader.uniforms.waveC = {
            value: [
                Math.sin((waves[2].direction * Math.PI) / 180),
                Math.cos((waves[2].direction * Math.PI) / 180),
                waves[2].steepness,
                waves[2].wavelength,
            ],
        };
        shader.vertexShader = "\n                uniform mat4 textureMatrix;\n                uniform float time;\n\n                varying vec4 mirrorCoord;\n                varying vec4 worldPosition;\n\n                #include <common>\n                #include <fog_pars_vertex>\n                #include <shadowmap_pars_vertex>\n                #include <logdepthbuf_pars_vertex>\n\n                uniform vec4 waveA;\n                uniform vec4 waveB;\n                uniform vec4 waveC;\n\n                uniform float offsetX;\n                uniform float offsetZ;\n\n                vec3 GerstnerWave (vec4 wave, vec3 p) {\n                    float steepness = wave.z;\n                    float wavelength = wave.w;\n                    float k = 2.0 * PI / wavelength;\n                    float c = sqrt(9.8 / k);\n                    vec2 d = normalize(wave.xy);\n                    float f = k * (dot(d, vec2(p.x, p.y)) - c * time);\n                    float a = steepness / k;\n\n                    return vec3(\n                        d.x * (a * cos(f)),\n                        d.y * (a * cos(f)),\n                        a * sin(f)\n                    );\n                }\n\n                void main() {\n\n                    mirrorCoord = modelMatrix * vec4( position, 1.0 );\n                    worldPosition = mirrorCoord.xyzw;\n                    mirrorCoord = textureMatrix * mirrorCoord;\n                    vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );\n                    \n                    vec3 gridPoint = position.xyz;\n                    vec3 tangent = vec3(1, 0, 0);\n                    vec3 binormal = vec3(0, 0, 1);\n                    vec3 p = gridPoint;\n                    gridPoint.x += offsetX;//*2.0;\n                    gridPoint.y -= offsetZ;//*2.0;\n                    p += GerstnerWave(waveA, gridPoint);\n                    p += GerstnerWave(waveB, gridPoint);\n                    p += GerstnerWave(waveC, gridPoint);\n                    gl_Position = projectionMatrix * modelViewMatrix * vec4( p.x, p.y, p.z, 1.0);\n\n                    #include <beginnormal_vertex>\n                    #include <defaultnormal_vertex>\n                    #include <logdepthbuf_vertex>\n                    #include <fog_vertex>\n                    #include <shadowmap_vertex>\n                }";
        /* shader.fragmentShader = "\n                uniform sampler2D mirrorSampler;\n                uniform float alpha;\n                uniform float time;\n                uniform float size;\n                uniform float distortionScale;\n                uniform sampler2D normalSampler;\n                uniform vec3 sunColor;\n                uniform vec3 sunDirection;\n                uniform vec3 eye;\n                uniform vec3 waterColor;\n\n                varying vec4 mirrorCoord;\n                varying vec4 worldPosition;\n\n                uniform float offsetX;\n                uniform float offsetZ;\n\n                vec4 getNoise( vec2 uv ) {\n                    vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);\n                    vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );\n                    vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );\n                    vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );\n                    vec4 noise = texture2D( normalSampler, uv0 ) +\n                        texture2D( normalSampler, uv1 ) +\n                        texture2D( normalSampler, uv2 ) +\n                        texture2D( normalSampler, uv3 );\n                    return noise * 0.5 - 1.0;\n                }\n\n                void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {\n                    vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );\n                    float direction = max( 0.0, dot( eyeDirection, reflection ) );\n                    specularColor += pow( direction, shiny ) * sunColor * spec;\n                    diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;\n                }\n\n                #include <common>\n                #include <packing>\n                #include <bsdfs>\n                #include <fog_pars_fragment>\n                #include <logdepthbuf_pars_fragment>\n                #include <lights_pars_begin>\n                #include <shadowmap_pars_fragment>\n                #include <shadowmask_pars_fragment>\n\n                void main() {\n\n                    #include <logdepthbuf_fragment>\n\n                    vec4 noise = getNoise( (worldPosition.xz) + vec2(offsetX/12.25,offsetZ/12.25) * size );\n                    vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );\n\n                    vec3 diffuseLight = vec3(0.0);\n                    vec3 specularLight = vec3(0.0);\n\n                    vec3 worldToEye = eye-worldPosition.xyz;\n                    vec3 eyeDirection = normalize( worldToEye );\n                    sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );\n\n                    float distance = length(worldToEye);\n\n                    vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;\n                    vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );\n\n                    float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );\n                    float rf0 = 0.3;\n                    float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );\n                    vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;\n                    vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);\n                    vec3 outgoingLight = albedo;\n                    gl_FragColor = vec4( outgoingLight, alpha );\n\n                    #include <tonemapping_fragment>\n                    #include <fog_fragment>\n                }"; */
        shader.uniforms.size.value = 10.0;
        waterCompiled = true;
    };
    scene.add(water);


    const sun = new THREE.Vector3();
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const parameters = {
        elevation: 2,
        azimuth: 180,
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms["sunPosition"].value.copy(sun);
        water.material.uniforms["sunDirection"].value.copy(sun).normalize();

        scene.environment = pmremGenerator.fromScene(sky).texture;
    }

    updateSun();

    stats = Stats();
    document.body.appendChild(stats.dom);


    const gui = new GUI();
    gui.close();
    gui.add(water.material, "wireframe");
    const waveAFolder = gui.addFolder("Wave A");
    waveAFolder
        .add(waves[0], "direction", 0, 359)
        .name("Direction")
        .onChange(function (v) {
            const x = (v * Math.PI) / 180;
            water.material.uniforms.waveA.value[0] = Math.sin(x);
            water.material.uniforms.waveA.value[1] = Math.cos(x);
        });
    waveAFolder
        .add(waves[0], "steepness", 0, 1, 0.1)
        .name("Steepness")
        .onChange(function (v) {
            water.material.uniforms.waveA.value[2] = v;
        });
    waveAFolder
        .add(waves[0], "wavelength", 1, 100)
        .name("Wavelength")
        .onChange(function (v) {
            water.material.uniforms.waveA.value[3] = v;
        });
    //waveAFolder.open()
    const waveBFolder = gui.addFolder("Wave B");
    waveBFolder
        .add(waves[1], "direction", 0, 359)
        .name("Direction")
        .onChange(function (v) {
            const x = (v * Math.PI) / 180;
            water.material.uniforms.waveB.value[0] = Math.sin(x);
            water.material.uniforms.waveB.value[1] = Math.cos(x);
        });
    waveBFolder
        .add(waves[1], "steepness", 0, 1, 0.1)
        .name("Steepness")
        .onChange(function (v) {
            water.material.uniforms.waveB.value[2] = v;
        });
    waveBFolder
        .add(waves[1], "wavelength", 1, 100)
        .name("Wavelength")
        .onChange(function (v) {
            water.material.uniforms.waveB.value[3] = v;
        });
    //waveBFolder.open()
    const waveCFolder = gui.addFolder("Wave C");
    waveCFolder
        .add(waves[2], "direction", 0, 359)
        .name("Direction")
        .onChange(function (v) {
            const x = (v * Math.PI) / 180;
            water.material.uniforms.waveC.value[0] = Math.sin(x);
            water.material.uniforms.waveC.value[1] = Math.cos(x);
        });
    waveCFolder
        .add(waves[2], "steepness", 0, 1, 0.1)
        .name("Steepness")
        .onChange(function (v) {
            water.material.uniforms.waveC.value[2] = v;
        });
    waveCFolder
        .add(waves[2], "wavelength", 1, 100)
        .name("Wavelength")
        .onChange(function (v) {
            water.material.uniforms.waveC.value[3] = v;
        });
    //waveCFolder.open()
    //
    window.addEventListener('resize', onWindowResize);
    clock = new THREE.Clock();
    //cannonDebugRenderer = new CannonDebugRenderer(scene, world)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    delta = Math.min(clock.getDelta(), 0.1);
    world.step(delta);
    //cannonDebugRenderer.update()

    rotorMesh.position.set(rotorBody.position.x, rotorBody.position.y, rotorBody.position.z);
    rotorMesh.rotateY(thrust.y * delta * 2);
    heliBodyMesh.position.set(heliBody.position.x, heliBody.position.y, heliBody.position.z);
    heliBodyMesh.quaternion.set(heliBody.quaternion.x, heliBody.quaternion.y, heliBody.quaternion.z, heliBody.quaternion.w);
    climbing = false;
    if (keyMap['w']) {
        if (thrust.y < 40) {
            thrust.y += 5 * delta;
            climbing = true;
        }
    }
    if (keyMap['s']) {
        if (thrust.y > 0) {
            thrust.y -= 5 * delta;
            climbing = true;
        }
    }
    yawing = false;
    if (keyMap['a']) {
        if (rotorBody.angularVelocity.y < 2.0)
            rotorBody.angularVelocity.y += 5 * delta;
        yawing = true;
    }
    if (keyMap['d']) {
        if (rotorBody.angularVelocity.y > -2.0)
            rotorBody.angularVelocity.y -= 5 * delta;
        yawing = true;
    }
    pitching = false;
    if (keyMap['8']) {
        if (thrust.z >= -10.0)
            thrust.z -= 5 * delta;
        pitching = true;
    }
    if (keyMap['5']) {
        if (thrust.z <= 10.0)
            thrust.z += 5 * delta;
        pitching = true;
    }
    banking = false;
    if (keyMap['4']) {
        if (thrust.x >= -10.0)
            thrust.x -= 5 * delta;
        banking = true;
    }
    if (keyMap['6']) {
        if (thrust.x <= 10.0)
            thrust.x += 5 * delta;
        banking = true;
    }
    //auto stabilise
    if (!yawing) {
        if (rotorBody.angularVelocity.y < 0)
            rotorBody.angularVelocity.y += 1 * delta;
        if (rotorBody.angularVelocity.y > 0)
            rotorBody.angularVelocity.y -= 1 * delta;
    }
    heliBody.angularVelocity.y = rotorBody.angularVelocity.y;
    if (!pitching) {
        if (thrust.z < 0)
            thrust.z += 2.5 * delta;
        if (thrust.z > 0)
            thrust.z -= 2.5 * delta;
    }
    if (!banking) {
        if (thrust.x < 0)
            thrust.x += 2.5 * delta;
        if (thrust.x > 0)
            thrust.x -= 2.5 * delta;
    }
    if (!climbing && heliBodyMesh.position.y > 4) {
        thrust.y = stableLift;
    }
    rotorBody.applyLocalForce(thrust, new CANNON.Vec3());
    camera.lookAt(heliBodyMesh.position);
    chaseCamPivot.getWorldPosition(v);
    if (v.y < 1) {
        v.y = 1;
    }
    camera.position.lerpVectors(camera.position, v, 0.05);
    water.material.uniforms['time'].value += delta;
    updateHelipads(delta);
    light.target.position.set(heliBodyMesh.position.x, heliBodyMesh.position.y, heliBodyMesh.position.z);
    light.position.copy(light.target.position).add(lightShift);
    //helper.update()
    if (waterCompiled) {
        water.position.x = heliBodyMesh.position.x;
        water.position.z = heliBodyMesh.position.z;
        water.material.uniforms['offsetX'].value =
            heliBodyMesh.position.x;
        water.material.uniforms['offsetZ'].value =
            heliBodyMesh.position.z;
    }
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}
