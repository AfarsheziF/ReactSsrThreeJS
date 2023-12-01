import * as THREE from "../../../../../../vendor_mods/three/build/three.module.js";

// import BUFFER_A_FRAG from './bufferA';
// import BUFFER_B_FRAG from './bufferB';
// import Common from './common';
// import BUFFER_FINAL_FRAG from './image';

import Image from './expandingCircle';

import { BufferManager, BufferShader } from "../BufferManager";

const ExpandingSmoke = {

    width: 1024,
    height: 512,

    targetA: null,
    targetB: null,
    targetC: null,

    bufferA: null,
    bufferB: null,
    common: null,
    bufferImage: null,

    counter: 0,
    mousePosition: {},

    init(renderer, width, height) {
        this.width = width ? width : 1024;
        this.height = height ? height : 512;

        let loader = new THREE.TextureLoader();

        this.targetA = new BufferManager(renderer, this.width, this.height);
        // this.targetB = new BufferManager(renderer, this.width, this.height);
        // this.targetC = new BufferManager(renderer, this.width, this.height);

        const resolution = new THREE.Vector3(this.width, this.height, window.devicePixelRatio)
        // const channel0 = loader.load('https://res.cloudinary.com/di4jisedp/image/upload/v1523722553/wallpaper.jpg')
        // loader.setCrossOrigin('')

        this.bufferA = new BufferShader(Image, {
            iFrame: { value: 0 },
            iResolution: { value: resolution },
            // iMouse: { value: this.mousePosition },
            iChannel0: { value: null },
            iChannel1: { value: null }
        })

        // this.bufferA = new BufferShader(BUFFER_A_FRAG, {
        //     iFrame: { value: 0 },
        //     iResolution: { value: resolution },
        //     iMouse: { value: this.mousePosition },
        //     iChannel0: { value: null },
        //     iChannel1: { value: null }
        // })

        // this.bufferB = new BufferShader(BUFFER_B_FRAG, {
        //     iFrame: { value: 0 },
        //     iResolution: { value: resolution },
        //     iMouse: { value: this.mousePosition },
        //     iChannel0: { value: null }
        // })

        // this.common = new BufferShader(Common, {
        //     iFrame: { value: 0 },
        //     iResolution: { value: resolution },
        //     iMouse: { value: this.mousePosition },
        //     iChannel0: { value: null }
        // })

        // this.bufferImage = new BufferShader(BUFFER_FINAL_FRAG, {
        //     iResolution: { value: resolution },
        //     iMouse: { value: this.mousePosition },
        //     iChannel0: { value: channel0 },
        //     iChannel1: { value: null }
        // })
    },

    update() {
        // this.bufferA.uniforms['iFrame'].value = this.counter++

        // this.bufferA.uniforms['iChannel0'].value = this.targetA.readBuffer.texture;
        // this.bufferA.uniforms['iChannel1'].value = this.targetB.readBuffer.texture;
        // this.targetA.render(this.bufferA.scene, this.camera);

        // this.bufferB.uniforms['iChannel0'].value = this.targetB.readBuffer.texture
        // this.targetB.render(this.bufferB.scene, this.camera);

        // this.bufferImage.uniforms['iChannel1'].value = this.targetA.readBuffer.texture
        // this.targetC.render(this.bufferImage.scene, this.orthoCamera, true)

        this.bufferA.uniforms['iFrame'].value = this.counter++
        this.bufferA.uniforms['iChannel0'].value = this.targetA.readBuffer.texture;
        this.bufferA.uniforms['iChannel1'].value = this.targetB.readBuffer.texture;
        this.targetA.render(this.bufferA.scene, this.camera, true);

        // this.animate()
    }
}

export default ExpandingSmoke;