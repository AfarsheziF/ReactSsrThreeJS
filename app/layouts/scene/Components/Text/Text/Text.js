import * as THREE from "vendor_mods/three/build/three.module"
import { TextGeometry } from 'vendor_mods/three/examples/jsm/geometries/TextGeometry.js';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

import VisualComponent from "../../VisualComponent";
import { VisualUtils } from '../../VisualComponents'

import frag from "./Shaders/frag";
import vert from "./Shaders/vert";

class Text extends VisualComponent {

    font;

    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        this.loadFont('public/fonts/Roboto/Roboto_Regular.json')
            .then(
                res => {
                    this.font = res;
                    this.processUniforms();
                    this.createMesh();
                    this.initAnimations();
                    this.onLoad(this);
                },
                e => { }
            )
    }

    initAnimations() {
        this.animations = {
            ...this.animations,
            morph_target: ({ value }) => {
                this.envParams.morphValue = value;
                this.mesh.morphTargetInfluences[1] = value;
            },
            set_value: ({ value }) => {
                this.envParams.text = value;
                const geometry2 = new TextGeometry(
                    value.toUpperCase(),
                    {
                        font: this.font,
                        size: this.envParams.size,
                        height: this.envParams.height,
                        curveSegments: this.envParams.curveSegments,
                        bevelEnabled: this.envParams.bevelEnabled,
                        bevelThickness: this.envParams.bevelThickness,
                        bevelSize: this.envParams.bevelSize,
                        bevelOffset: this.envParams.bevelOffset,
                        bevelSegments: this.envParams.bevelSegments
                    });

                geometry2.center();
                this.mesh.geometry.setAttribute('position', geometry2.attributes.position);
            }
        }
    }

    createMesh() {
        // this.material = new THREE.ShaderMaterial({
        this.material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            transparent: this.envParams.material.transparent,
            side: THREE.DoubleSide,
            uniforms: this.uniforms,
            vertexShader: vert,
            fragmentShader: frag,
            // morphTargets: true,
            // patchMap: {
            //     csm_test: {
            //         "#include <begin_vertex>": /* glsl */ `
            //             #include <begin_vertex>
            //             #include <morphtarget_vertex>
            //             // transformed /= radius;       
            //             // transformed += vec3( 0.5 * ( 1.0 + sin(  time  ) ) * ( normalize( transformed ) - transformed ) );
            //             transformed *= vec3(position + vNoise);
            //             // csm_Position = vec3(position + vNoise);
            //             // transformed = morphTarget0 * vec3(position + vNoise);
            //             // csm_Position = morphTarget1 * vNoise;
            //             // csm_Position = projectionMatrix * modelViewMatrix * vec4( radius, 1.0 );
            //       `
            //     }
            // }
        });

        const geometry = new TextGeometry(
            this.envParams.text.toUpperCase(),
            {
                font: this.font,
                size: this.envParams.size,
                height: this.envParams.height,
                curveSegments: this.envParams.curveSegments,
                bevelEnabled: this.envParams.bevelEnabled,
                bevelThickness: this.envParams.bevelThickness,
                bevelSize: this.envParams.bevelSize,
                bevelOffset: this.envParams.bevelOffset,
                bevelSegments: this.envParams.bevelSegments
            });

        geometry.center();

        this.positionsAttr = geometry.attributes.position;
        geometry.morphAttributes.position = [geometry.attributes.position];
        geometry.morphAttributes.normal = [geometry.attributes.normal];

        // const positions = new Float32Array(this.textPositionsAttr.count);
        const positions = [];
        const normals = [];

        const n = 800, n2 = n / 2;	// triangles spread in the cube
        const d = 12, d2 = d / 2;	// individual triangle size
        const box = new THREE.Vector3(1, 0.25, 1);

        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();

        for (let i = 0; i < this.positionsAttr.count; i++) {
            const x = Math.random() * n * box.x - n2;
            const y = Math.random() * n * box.y - n2;
            const z = Math.random() * n * box.z - n2;

            const ax = x + Math.random() * d - d2;
            const ay = y + Math.random() * d - d2;
            const az = z + Math.random() * d - d2;

            const bx = x + Math.random() * d - d2;
            const by = y + Math.random() * d - d2;
            const bz = z + Math.random() * d - d2;

            const cx = x + Math.random() * d - d2;
            const cy = y + Math.random() * d - d2;
            const cz = z + Math.random() * d - d2;

            positions.push(ax, ay, az);
            positions.push(bx, by, bz);
            positions.push(cx, cy, cz);

            pA.set(ax, ay, az);
            pB.set(bx, by, bz);
            pC.set(cx, cy, cz);

            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);

            cb.normalize();

            const nx = cb.x;
            const ny = cb.y;
            const nz = cb.z;

            normals.push(nx, ny, nz);
            normals.push(nx, ny, nz);
            normals.push(nx, ny, nz);
        }

        geometry.morphAttributes.position[1] = new THREE.Float32BufferAttribute(positions, 3);
        geometry.morphAttributes.normal[1] = new THREE.Float32BufferAttribute(normals, 3);

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.name = this.name;
        this.mesh.visible = this.envParams.visible;
        this.setPosition({ value: this.envParams.position, offset: this.envParams.offset });
        this.lookAt({ value: this.envParams.lookAt })
        this.loadTextures();

        this.mesh.morphTargetInfluences[1] = this.envParams.morphValue;
    }

    onGuiUpdate({ controller }) {
        switch (controller.property) {
            case 'height':
            case "curveSegments":
            case "size":
            case "bevelEnabled":
            case "bevelThickness":
            case "bevelSize":
            case "bevelOffset":
            case "bevelSegments":
                this.needReload = true;
                break;

            case "update": {
                // this.createMesh();
                const geometry2 = new TextGeometry(
                    this.envParams.text.toUpperCase(),
                    {
                        font: this.font,
                        size: this.envParams.size,
                        height: this.envParams.height,
                        curveSegments: this.envParams.curveSegments,
                        bevelEnabled: this.envParams.bevelEnabled,
                        bevelThickness: this.envParams.bevelThickness,
                        bevelSize: this.envParams.bevelSize,
                        bevelOffset: this.envParams.bevelOffset,
                        bevelSegments: this.envParams.bevelSegments
                    });

                geometry2.center();
                this.mesh.geometry.setAttribute('position', geometry2.attributes.position);
            }
                break;

            case "morphValue":
                this.mesh.morphTargetInfluences[1] = this.envParams.morphValue;
                break;
        }
    }

    //

    update({ time }) {
        if (this.envParams.animate) {
            this.time += this.envParams.uniforms.speed;
            this.material.uniforms.time.value = this.time;
            this.material.uniforms.alpha.value = this.envParams.uniforms.alpha;
        }
    }
}

export default Text;

// There is no darkness
// These are the shades\nof your body and spine
// If white is all unite
// Darkness is completely defined