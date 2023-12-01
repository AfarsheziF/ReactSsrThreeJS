import * as THREE from "../../../../../vendor_mods/three/build/three.module.js";

class BufferShader {

    material
    scene

    constructor(fragmentShader, uniforms = {}) {
        this.material = new THREE.ShaderMaterial({
            fragmentShader,
            vertexShader: VERTEX_SHADER,
            uniforms
        })
        this.scene = new THREE.Scene()
        this.scene.add(
            new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material)
        )
    }
}

class BufferManager {

    readBuffer
    writeBuffer

    constructor(renderer, width, height) {

        this.readBuffer = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        })

        this.writeBuffer = this.readBuffer.clone()
    }

    swap() {
        const temp = this.readBuffer
        this.readBuffer = this.writeBuffer
        this.writeBuffer = temp
    }

    // render(scene, camera, toScreen) {
    //     if (toScreen) {
    //         this.renderer.render(scene, camera)
    //     } else {
    //         this.renderer.render(scene, camera, this.writeBuffer, true)
    //     }
    //     this.swap()
    // }

}

export { BufferShader, BufferManager };


// class BufferShader {

//     public material: THREE.ShaderMaterial
//     public scene: THREE.Scene

//     constructor(fragmentShader: string, public uniforms: {} = {}) {
//         this.material = new THREE.ShaderMaterial({
//             fragmentShader,
//             vertexShader: VERTEX_SHADER,
//             uniforms
//         })
//         this.scene = new THREE.Scene()
//         this.scene.add(
//             new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material)
//         )
//     }

// }

// class BufferManager {

//     public readBuffer: THREE.WebGLRenderTarget
//     public writeBuffer: THREE.WebGLRenderTarget

//     constructor(private renderer: THREE.WebGLRenderer, { width, height }) {

//         this.readBuffer = new THREE.WebGLRenderTarget(width, height, {
//             minFilter: THREE.LinearFilter,
//             magFilter: THREE.LinearFilter,
//             format: THREE.RGBAFormat,
//             type: THREE.FloatType,
//             stencilBuffer: false
//         })

//         this.writeBuffer = this.readBuffer.clone()

//     }

//     public swap() {
//         const temp = this.readBuffer
//         this.readBuffer = this.writeBuffer
//         this.writeBuffer = temp
//     }

//     public render(scene: THREE.Scene, camera: THREE.Camera, toScreen: boolean = false) {
//         if (toScreen) {
//             this.renderer.render(scene, camera)
//         } else {
//             this.renderer.render(scene, camera, this.writeBuffer, true)
//         }
//         this.swap()
//     }

// }
