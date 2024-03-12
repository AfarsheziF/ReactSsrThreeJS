import * as THREE from "vendor_mods/three/build/three.module";
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

import frag from "./Shaders/frag";
import vert from "./Shaders/vert";
import appUtils from "../../../../../utils/appUtils";

class SphereMesh {

    name;
    envParams;
    uniforms;
    material;
    mesh;

    textureLoader;

    needReload;

    constructor(name, envParams, { textureLoader }) {
        if (!envParams) {
            console.log("> SphereMesh: Constructor is missing envParams <");
        } else {
            this.name = name;
            this.envParams = envParams;
            this.uniforms = {
                resolution: { value: new THREE.Vector2() },
                radius: { type: 'f', value: 1.0 },
                time: { type: 'f', value: 1.0 },
                speed: { type: 'f', value: 1.0 },
                noise_values: { type: 'vec3', value: { x: 1.0, y: 1.0, z: 1.0 } },
                color: { type: 'vec3', value: { r: 1.0, g: 1.0, b: 1.0 } },
                tDiffuse: { type: "t", value: new THREE.Vector2(0, 0) },
                tNormal: { type: "t", value: new THREE.Vector2(0, 0) },
            }
            this.material = new CustomShaderMaterial({
                baseMaterial: THREE.MeshPhysicalMaterial,
                vertexShader: vert,
                // fragmentShader: frag,
                // silent: true, // Disables the default warning if true
                uniforms: this.uniforms,
            });
            // this.material = new THREE.MeshPhysicalMaterial(this.uniforms);
            this.textureLoader = textureLoader;

            this.createMesh();
            this.loadTextures();
            this.updateMaterial();
        }
    }

    createMesh() {
        const geometry = new THREE.IcosahedronGeometry(1, this.envParams.resolution);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.name = this.name;
        this.mesh.visible = this.envParams.visible;
        this.envParams.position &&
            this.mesh.position.set(
                this.envParams.position.x,
                this.envParams.position.y,
                this.envParams.position.z
            );
    }

    addToScene(scene) {
        if (this.mesh) {
            scene.add(this.mesh);
            this.updateMaterial(scene.environment);
        }
    }

    loadTextures() {
        for (const key in this.envParams.textures) {
            const texture = this.textureLoader.load(this.envParams.textures[key]);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            this.material[key] = texture;
        }
    }

    updateMaterial(environment) {
        this.mesh.visible = this.envParams.visible;
        if (environment) this.material.envMap = environment;
        for (let key in this.envParams.material) {
            if (this.material[key] != null) {
                if (key.toLocaleLowerCase() === 'color' ||
                    (this.envParams.material[key].indexOf &&
                        this.envParams.material[key].indexOf("#") === 0)) {
                    this.material[key] = new THREE.Color(this.envParams.material[key]);
                } else {
                    this.material[key] = this.envParams.material[key];
                }
            }
        }
        //TODO dynamic
        if (this.envParams.material.tiling) {
            if (this.material.normalMap) {
                this.material.normalMap.repeat.copy(new THREE.Vector2(
                    this.envParams.material.tiling.x,
                    this.envParams.material.tiling.y
                ));
            }
            if (this.material.map) {
                this.material.map.repeat.copy(new THREE.Vector2(
                    this.envParams.material.tiling.x,
                    this.envParams.material.tiling.y
                ));
            }
            if (this.material.roughnessMap) {
                this.material.roughnessMap.repeat.copy(new THREE.Vector2(
                    this.envParams.material.tiling.x,
                    this.envParams.material.tiling.y
                ));
            }
            if (this.material.aoMap) {
                this.material.aoMap.repeat.copy(new THREE.Vector2(
                    this.envParams.material.tiling.x,
                    this.envParams.material.tiling.y
                ));
            }
            if (this.material.emissiveMap) {
                this.material.emissiveMap.repeat.copy(new THREE.Vector2(
                    this.envParams.material.tiling.x,
                    this.envParams.material.tiling.y
                ));
            }
            if (this.material.specularColorMap) {
                this.material.specularColorMap.repeat.copy(new THREE.Vector2(
                    this.envParams.material.tiling.x,
                    this.envParams.material.tiling.y
                ));
            }
        }
        this.updateUniforms();
        this.material.needsUpdate = true;
    }

    updateUniforms() {
        for (let key in this.envParams.uniforms) {
            if (key.toLocaleLowerCase() === 'color') {
                this.uniforms[key].value = new THREE.Color(this.envParams.uniforms[key]);
            } else {
                this.uniforms[key].value = this.envParams.uniforms[key];
            }
        }
    }

    guiUpdate({ envParams, guiController, components }) {
        // console.log(envParams);
        if (envParams) {
            this.envParams = envParams;
            if (this.envParams.resolution !== this.mesh.geometry.parameters.detail) {
                this.needReload = true;
            }
            this.envParams.position &&
                this.mesh.position.set(
                    this.envParams.position.x,
                    this.envParams.position.y,
                    this.envParams.position.z
                );
            // this.loadTextures(); //TODO: update only on texture change
            this.updateMaterial(components && components.scene && components.scene.environment);
        }
    }

    reload(scene) {
        this.mesh.geometry.dispose();
        this.material.dispose();
        scene.remove(this.mesh);
        this.createMesh();
        this.addToScene(scene);
        this.needReload = false;
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

    //

    update({ time }) {
        if (this.envParams) {
            if (this.envParams.animate) {
                this.uniforms.time.value = time;
            }
        }
    }
}

export default SphereMesh;