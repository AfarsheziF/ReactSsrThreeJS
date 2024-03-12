import * as THREE from "vendor_mods/three/build/three.module"
import { Curves } from 'vendor_mods/three/examples/jsm/curves/CurveExtras.js';
import { TransformControls } from 'vendor_mods/three/examples/jsm/controls/TransformControls.js';

import VisualComponent from "../../VisualComponent";

class Spline extends VisualComponent {

    scene;
    camera;
    editorCamera;
    controls;
    editorControls;
    renderer;

    splineHelperObjects;
    splinePointsLength;
    positions;
    point;
    raycaster;
    pointer;
    onUpPosition;
    onDownPosition;
    geometry;

    ARC_SEGMENTS;
    transformControl;
    splines;

    cameraEye;
    cameraPos;
    normal;
    binormal;
    lookAt;

    time;
    timePos;
    speed;

    constructor(props) {
        super(props);

        this.scene = this.props.scene;
        this.renderer = this.props.renderer;
        this.camera = this.props.camera;
        this.editorCamera = this.props.editorCamera;
        this.controls = this.props.controls;
        this.editorControls = this.props.editorControls;

        this.splineHelperObjects = [];
        this.splinePointsLength = 2;
        this.positions = [];
        this.point = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.onUpPosition = new THREE.Vector2();
        this.onDownPosition = new THREE.Vector2();
        this.geometry = new THREE.BoxGeometry(20, 20, 20);

        this.ARC_SEGMENTS = 200;
        this.transformControl;
        this.splines = {};

        this.envParams['addPoint'] = this.addPoint;
        this.envParams['removePoint'] = this.removePoint;
        this.envParams['exportSpline'] = this.exportSpline;

        this.cameraPos = new THREE.Vector3();
        this.normal = new THREE.Vector3();
        this.binormal = new THREE.Vector3();
        this.lookAt = new THREE.Vector3();
        this.time = 0;
        this.timePos = 0;
        this.speed = 1;

        this.init();
    }

    init() {
        if (this.envParams.editorMode) {
            this.transformControl = new TransformControls(this.props.editorCamera, this.props.renderer.domElement);
            this.transformControl.addEventListener('objectChange', () => {
                this.updateSplineOutline();
            });
            this.transformControl.addEventListener('dragging-changed', (event) => {
                this.editorControls.enabled = !event.value;
            });
            this.scene.add(this.transformControl);
        }

        for (let i = 0; i < this.splinePointsLength; i++) {
            this.addSplineObject();

        }
        this.positions.length = 0;

        for (let i = 0; i < this.splinePointsLength; i++) {
            this.positions.push(this.splineHelperObjects[i].position);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3));

        let curve = new THREE.CatmullRomCurve3(this.positions);
        curve.curveType = 'catmullrom';
        curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
            color: 0xff0000,
            opacity: 0.35
        }));
        this.splines.uniform = curve;

        curve = new THREE.CatmullRomCurve3(this.positions);
        curve.curveType = 'centripetal';
        curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
            color: 0x00ff00,
            opacity: 0.35
        }));
        this.splines.centripetal = curve;

        curve = new THREE.CatmullRomCurve3(this.positions);
        curve.curveType = 'chordal';
        curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
            color: 0x0000ff,
            opacity: 0.35
        }));
        this.splines.chordal = curve;

        for (const k in this.splines) {
            const spline = this.splines[k];
            spline.mesh.castShadow = true;
            spline.mesh.visible = this.envParams.editorMode
            this.scene.add(spline.mesh);
        }

        if (this.envParams.path && this.envParams.path_values) {
            let path;
            for (const i in this.envParams.path_values) {
                if (this.envParams.path_values[i][this.envParams.path]) {
                    path = this.envParams.path_values[i][this.envParams.path];
                }
            }
            path.map(p => new THREE.Vector3(p.x, p.y, p.z));
            this.load(path);
        } else {
            this.load([
                new THREE.Vector3(289.76843686945404, 0, 56.10018915737797),
                new THREE.Vector3(- 53.56300074753207, 0, - 14.495472686253045),
                new THREE.Vector3(- 91.40118730204415, 0, - 6.958271935582161),
                new THREE.Vector3(- 383.785318791128, 0, 47.869296953772746)]);
        }

        this.cameraEye = new THREE.Mesh(
            new THREE.SphereGeometry(15),
            new THREE.MeshBasicMaterial({ color: this.splines[this.envParams.cameraEye.source].mesh.material.color }));
        this.splines[this.envParams.cameraEye.source].getPointAt(0, this.cameraPos);
        this.cameraEye.position.copy(this.cameraPos);
        this.cameraEye.visible = this.envParams.cameraEye.visible;
        this.scene.add(this.cameraEye);
    }

    addSplineObject(position) {
        const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(this.geometry, material);
        if (position) {
            mesh.position.copy(position);
        } else {
            mesh.position.x = Math.random() * 1000 - 500;
            mesh.position.y = 0;
            mesh.position.z = Math.random() * 800 - 400;
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.visible = this.envParams.editorMode;
        this.scene.add(mesh);
        this.splineHelperObjects.push(mesh);
        return mesh;
    }

    updateSplineOutline() {
        for (const k in this.splines) {
            const spline = this.splines[k];
            const splineMesh = spline.mesh;
            const position = splineMesh.geometry.attributes.position;

            for (let i = 0; i < this.ARC_SEGMENTS; i++) {
                const t = i / (this.ARC_SEGMENTS - 1);
                spline.getPoint(t, this.point);
                position.setXYZ(i, this.point.x, this.point.y, this.point.z);
            }
            position.needsUpdate = true;
        }
    }

    addPoint() {
        this.splinePointsLength++;
        this.positions.push(this.addSplineObject().position);
        this.updateSplineOutline();
    }

    removePoint() {
        if (this.splinePointsLength > 2) {
            const point = this.splineHelperObjects.pop();
            this.splinePointsLength--;
            this.positions.pop();

            if (this.transformControl.object === point) this.transformControl.detach();
            this.scene.remove(point);

            this.updateSplineOutline();
        }
    }

    exportSpline() {
        const strplace = [];
        for (let i = 0; i < this.positions.length; i++) {
            const p = this.positions[i];
            // strplace.push(`${p.x}, ${p.y}, ${p.z}`);
            strplace.push({
                "x": p.x,
                "y": p.y,
                "z": p.z
            })
        }
        // console.log(strplace.join(',\n'));
        // const code = '[' + (strplace.join(',\n\t')) + ']';
        prompt('copy and paste code', JSON.stringify(strplace));
    }

    load(new_positions) {
        while (new_positions.length > this.positions.length) {
            this.addPoint();
        }
        while (new_positions.length < this.positions.length) {
            this.removePoint();
        }
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i].copy(new_positions[i]);
        }
        this.updateSplineOutline();
    }

    //

    onPointerDown = (event) => {
        if (this.envParams.editorMode) {
            this.onDownPosition.x = event.clientX;
            this.onDownPosition.y = event.clientY;
        }
    }

    onPointerUp = (event) => {
        if (this.envParams.editorMode) {
            this.onUpPosition.x = event.clientX;
            this.onUpPosition.y = event.clientY;

            if (this.transformControl &&
                this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
                this.transformControl.detach();
            }
        }
    }

    onMouseMove = (event) => {
        if (this.envParams.editorMode) {
            // this.pointer.x = (event.clientX / (window.innerWidth / 3.5)) * 2 - 1;
            // this.pointer.y = - ((event.clientY - window.innerHeight / 3.5) / (window.innerHeight)) * 3.5 + 2.5;
            this.pointer.x = (event.clientX / (window.innerWidth)) * 2 - 1;
            this.pointer.y = - (event.clientY / (window.innerHeight)) * 2 + 1;
            // console.log(this.pointer);

            this.raycaster.setFromCamera(this.pointer, this.editorCamera);

            const intersects = this.raycaster.intersectObjects(this.splineHelperObjects, false);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object !== this.transformControl.object) {
                    this.transformControl.attach(object);
                }
            }
        }
    }

    //

    guiUpdate({ controller, envParams }) {
        switch (controller.property) {
            case "addPoint":
                this.addPoint();
                break;
            case "removePoint":
                this.removePoint();
                break;
            case "exportSpline":
                this.exportSpline();
                break;

            case "close":
                if (envParams.close) {
                    this.positions.push(this.positions[0]);
                    this.updateSplineOutline();
                } else {
                    this.positions.pop();
                    this.updateSplineOutline();
                }
                break;

            case "editorMode":
                this.splineHelperObjects.forEach(m => m.visible = envParams.editorMode)
                for (let key in this.splines) {
                    this.splines[key].mesh.visible = envParams.editorMode;
                }
                break;

            case "restart":
                this.time = 0;
                this.timePos = 0;
                this.speed = 1;
                this.onSlowDown = false;
                break;

            case "path": {
                for (let i = this.positions.length; i > 2; i--) {
                    this.removePoint();
                }
                const path = Object.values(envParams.path)[0];
                path.map(p => new THREE.Vector3(p.x, p.y, p.z));
                this.load(path);
            }
                break;

            default:
                this.splines.uniform.tension = envParams.tension;
                this.cameraEye.visible = envParams.cameraEye.visible;
                this.cameraEye.material.color = this.splines[envParams.cameraEye.source].mesh.material.color;
                this.updateSplineOutline();
                break;
        }
    }

    update({ time, deltaTime }) {
        if (this.envParams.cameraEye.follow &&
            this.splines[this.envParams.cameraEye.source] &&
            (this.envParams.cameraEye.loop ? true : this.timePos < 0.99)) {
            this.time += this.speed * this.envParams.cameraEye.speed * deltaTime;
            this.timePos = (this.time % 10) / 10;

            this.splines[this.envParams.cameraEye.source].getPointAt(this.timePos, this.cameraPos);

            if (this.envParams.cameraEye.slowDown) {
                this.positions.forEach(p => {
                    const dis = this.cameraPos.distanceTo(p);
                    if (dis < 5) {
                        if (this.positions.indexOf(p) === this.positions.length - 2) {
                            this.onSlowDown = true;
                        }
                    }
                })

                if (this.onSlowDown) {
                    let dis = this.cameraPos.distanceTo(this.positions[this.positions.length - 1]);
                    dis *= this.envParams.cameraEye.slowDownSpeed / 100;
                    this.speed = dis;
                }
            }

            this.cameraEye.position.copy(this.cameraPos);

            if (this.envParams.cameraEye.camera_follow) {
                this.camera.position.copy(this.cameraPos);

                if (this.envParams.cameraEye.lookAhead && this.controls.lookAt) {
                    this.splines[this.envParams.cameraEye.source].getPointAt((this.timePos + 30 / this.splines[this.envParams.cameraEye.source].getLength()) % 1, this.lookAt);
                    this.controls.lookAt(this.lookAt);
                }
            }
        }
    }

}

export default Spline;