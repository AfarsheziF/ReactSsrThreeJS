import * as THREE from "vendor_mods/three/build/three.module";

import appUtils from "../../../utils/appUtils";

class VisualComponent {

    name;
    envParams;
    uniforms;
    material;
    mesh;
    animations;

    time;

    textureLoader;
    fontLoader;
    needReload;

    onLoad;

    constructor(props) {
        this.props = props;
        this.name = props.name;
        if (!this.props.envParams) {
            console.log(`> VisualComponent: ${this.name} -> Constructor is missing envParams <`);
        } else {
            console.log(`> New VisualComponent: ${this.name} <`);
            this.envParams = props.envParams;
            this.textureLoader = props.textureLoader;
            this.fontLoader = props.fontLoader;
            this.onLoad = props.onLoad;
            this.time = 0;

            this.animations = {
                set_visible: (props) => this.setVisible(props),
                set_position: (props) => this.setPosition(props),
                set_rotation: (props) => this.setRotation(props),
                set_value: (props) => this.setValue(props),
                look_at: (props) => this.lookAt(props)
            }
        }
    }

    // Init

    init() {
        this.createMesh();
        this.loadTextures();
        this.processUniforms();
        this.updateMaterial();
        this.initAnimations();
    }

    processUniforms() {
        this.uniforms = {
            resolution: { value: new THREE.Vector2() },
            time: { type: 'f', value: 1.0 },
        }

        if (this.envParams.uniforms) {
            for (const key in this.envParams.uniforms) {

                switch (typeof this.envParams.uniforms[key]) {
                    case 'number':
                        this.uniforms[key] = { type: 'f', value: this.envParams.uniforms[key] }
                        break;

                    case 'object':
                        if (this.envParams.uniforms[key].z != null) {
                            this.uniforms[key] = { type: 'vec3', value: this.envParams.uniforms[key] }
                        } else {
                            this.uniforms[key] = { type: 'vec2', value: this.envParams.uniforms[key] }
                        }
                        break;

                    case 'string':
                        if (key.toLocaleLowerCase() === 'color' ||
                            (this.envParams.uniforms[key].indexOf && this.envParams.uniforms[key].indexOf("#") === 0)) {
                            this.uniforms[key] = { type: 'vec3', value: new THREE.Color(this.envParams.uniforms[key]) }
                        } else {
                            console.log(`> VisualComponent: ${this.name} -> Uniform Sting type is not supported -> ${key}} <`);
                        }
                        break;

                    default:
                        console.log(`> VisualComponent: ${this.name} -> Uniform type is not supported. ${key} -> ${typeof (this.envParams.uniforms[key])} <`);
                        break;
                }

            }
        }


    }

    createMesh() { }

    loadTextures() {
        for (const key in this.envParams.textures) {
            const texture = this.textureLoader.load(this.envParams.textures[key]);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            this.material[key] = texture;
        }
    }

    addToScene(scene) {
        if (this.mesh) {
            scene.add(this.mesh);
            this.updateMaterial(scene.environment);
        }
    }

    initAnimations() { }

    // Load

    loadFont(path) {
        return new Promise((resolve, reject) => {
            this.fontLoader.load(path, resolve);
        });
    }

    loadTexture(path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(path, resolve);
        })
    }

    // Setters

    setVisible({ value }) {
        if (this.mesh) this.mesh.visible = value;
    }

    setPosition({ value, offset = {} }) {
        this.envParams.position = value;
        this.envParams.offset = offset;
        if (this.mesh) {
            const _offset = new THREE.Vector3(offset.x, offset.y, offset.z);
            this.mesh.position.copy(
                new THREE.Vector3(
                    value.x,
                    value.y,
                    value.z
                ).add(_offset)
            );
        }
    }

    setRotation({ value }) {
        if (this.mesh) {
            this.mesh.rotation.x = Math.PI * value.x;
            this.mesh.rotation.y = Math.PI * value.y;
            this.mesh.rotation.z = Math.PI * value.z;
        }
    }

    lookAt({ value }) {
        this.envParams.lookAt = value;
        if (this.mesh) {
            this.mesh.lookAt(value);
        }
    }

    setValue({ value }) {
        if (value.property) {
            if (Array.isArray(value.property)) {
                appUtils.setObjValueFromArray(value.property, this, value.value);
            } else {
                this[value.property] = value.value;
            }
        }
    }

    // listeners

    onInputEvent = (event) => {
        switch (event.type.toLowerCase()) {
            case 'mousemove':
                this.onMouseMove(event);
                break;

            case 'pointerdown':
                this.onPointerDown(event);
                break;

            case 'pointerup':
                this.onPointerUp(event);
                break;

            case 'wheel':
                this.onMouseWheel(event);
                break;
        }
    }

    onMouseMove = (event) => { }

    onPointerDown = (event) => { }

    onPointerUp = (event) => { }

    onMouseWheel = (event) => { }

    // Update

    updateMaterial(environment) {

        const updateMat = (material, key) => {
            switch (key.toLocaleLowerCase()) {
                case 'tiling':
                    for (let texKey in this.envParams.textures) {
                        this.material[texKey].repeat.copy(new THREE.Vector2(
                            this.envParams.material.tiling.x,
                            this.envParams.material.tiling.y
                        ));
                    }
                    break;

                default:
                    if (material[key] != null) {
                        if (key.toLocaleLowerCase() === 'color' ||
                            (this.envParams.material[key].indexOf &&
                                this.envParams.material[key].indexOf("#") === 0)) {
                            material[key] = new THREE.Color(this.envParams.material[key]);
                        } else {
                            material[key] = this.envParams.material[key];
                        }
                    }
                    break;
            }
        }

        if (this.mesh) {
            this.mesh.visible = this.envParams.visible;
            if (Array.isArray(this.material)) {
                this.material.forEach(material => {
                    if (environment) material.envMap = environment;
                    for (let key in this.envParams.material) {
                        updateMat(material, key);
                    }
                })
            } else {
                if (environment) this.material.envMap = environment;
                for (let key in this.envParams.material) {
                    updateMat(this.material, key);
                }
            }

            this.updateUniforms();
        }
    }

    updateUniforms() {
        for (let key in this.envParams.uniforms) {
            if (key.toLocaleLowerCase() === 'color' ||
                (typeof this.envParams.uniforms[key] === 'string' && this.envParams.uniforms[key].indexOf('#') === 0)) {
                this.material.uniforms[key].value = new THREE.Color(this.envParams.uniforms[key]);
            } else {
                this.material.uniforms[key].value = this.envParams.uniforms[key];
            }
        }
    }

    guiUpdate(props) {
        // console.log(envParams);
        if (props.envParams && this.mesh) {
            this.envParams = props.envParams;

            const getComponentControl = controller => {
                while (controller.parent._title.toLowerCase() !== this.name.toLocaleLowerCase()) {
                    controller = controller.parent;
                }
                return controller;
            }

            switch (props.controller.property) {
                case "resolution":
                case "scale":
                case "size":
                    this.needReload = true;
                    break;
            }

            if (props.controller.controller) {
                const parent = getComponentControl(props.controller.controller);
                if (parent._title) {
                    switch (parent._title.toLocaleLowerCase()) {
                        case "position":
                            if (this.envParams.position) {
                                this.setPosition({ value: this.envParams.position });
                            }
                            break;

                        case "rotation":
                            if (this.envParams.rotation) {
                                this.setRotation({ value: this.envParams.rotation })
                            }
                            break;

                        case "lookat":
                            if (this.envParams.lookAt) {
                                this.lookAt({ value: this.envParams.lookAt });
                            }
                            break;
                    }
                }
            }

            // this.loadTextures(); //TODO: update only on texture change
            this.updateMaterial(props.components && props.components.scene && props.components.scene.environment);
        }

        this.onGuiUpdate(props);
    }

    onGuiUpdate({ controller }) { }

    reload(scene) {
        this.mesh.geometry.dispose();
        this.material.dispose();
        scene.remove(this.mesh);
        this.createMesh();
        this.addToScene(scene);
        this.needReload = false;
    }

    // Animation

    runAnimation({ animation, animValue }) {
        if (this.animations[animation.key]) {
            this.animations[animation.key]({ ...animation, value: animValue });
        } else {
            console.log(`> VisualComponent. runAnimation: animation key is not supported -> ${animation.key}`)
        }
    }

    // Runnable

    update({ time }) { }

}

export default VisualComponent;