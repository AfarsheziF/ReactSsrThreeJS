import { MSDFTextGeometry, MSDFTextMaterial, uniforms } from "three-msdf-text-utils";
import * as THREE from "vendor_mods/three/build/three.module"
import { TextGeometry } from 'vendor_mods/three/examples/jsm/geometries/TextGeometry.js';

// import appUtils from "../../../../../../utils/appUtils";
import VisualComponent from "../../VisualComponent";

import frag from "./Shaders/frag";
import vert from "./Shaders/vert";

class MsdfText extends VisualComponent {

    init() {
        this.createMesh().then(
            res => {
                // this.loadTextures();
                this.onLoad(this);
                this.updateMaterial();
            },
            e => {

            }
        )
    }

    createMesh() {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.loadTexture("public/fonts/Roboto/Roboto-Regular.png"),
                this.loadFont("public/fonts/Roboto/Roboto-Regular.fnt"),
            ]).then(([atlas, font]) => {

                const text = `
                There is no darkness
                These are the shades of your body and spine
                There is no color in it
                If white is all unite
                Darkness is completely defined
                `.toUpperCase();

                const geometry = new MSDFTextGeometry({
                    text: text,
                    font: font.data,
                    width: 1000,
                    align: 'left',
                });

                this.processUniforms();

                this.material = new THREE.ShaderMaterial({
                    side: THREE.DoubleSide,
                    transparent: true,
                    defines: {
                        IS_SMALL: false,
                    },
                    extensions: {
                        derivatives: true,
                    },
                    uniforms: {
                        // Common
                        ...uniforms.common,
                        // Rendering
                        ...uniforms.rendering,
                        // Strokes
                        ...uniforms.strokes,

                        ...this.uniforms
                    },
                    vertexShader: vert,
                    fragmentShader: frag,
                    // wireframe: true
                });
                this.material.uniforms.uMap.value = atlas;

                this.mesh = new THREE.Mesh(geometry, this.material);
                this.mesh.name = this.name;
                this.mesh.visible = this.envParams.visible;
                this.mesh.rotation.z = Math.PI * 1;
                const scale = .5;
                this.mesh.scale.set(scale, scale, scale);
                this.envParams.position &&
                    this.mesh.position.set(
                        this.envParams.position.x,
                        this.envParams.position.y,
                        this.envParams.position.z
                    );
                // this.mesh.position.x = -geometry.layout.width / 2 * 3;

                resolve();
            });
        })
    }

    update(time) {
        this.material.uniforms.time.value += this.envParams.uniforms.speed;
    }
}

export default MsdfText;