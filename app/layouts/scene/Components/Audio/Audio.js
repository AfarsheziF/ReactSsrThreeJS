import * as THREE from "vendor_mods/three/build/three.module";

import appUtils from "../../../../utils/appUtils";
import VisualComponent from "../VisualComponent";

class VisualAudio extends VisualComponent {

    listener;
    audio;
    loaded;
    playing;

    constructor(props) {
        super(props)
        this.init();
    }

    init() {
        if (window.os && window.os.type.toLowerCase() === 'ios' && window.os.version < 17) {
            // Not supported
            this.loaded = true;
            this.disabled = true;
            if (this.props.callback) {
                this.props.callback(this);
            }
        } else {
            this.listener = new THREE.AudioListener();
            this.audio = new THREE.Audio(this.listener);

            // const mediaElement = new Audio(this.envParams.file);
            // mediaElement.play();
            // this.audio.setMediaElementSource(mediaElement);

            const audioLoader = new THREE.AudioLoader();
            audioLoader.load(this.envParams.file, (buffer) => {
                console.log("> VisualAudio loaded <");
                this.audio.setBuffer(buffer);
                this.audio.setLoop(this.envParams.loop);
                this.audio.setVolume(this.envParams.volume);
                this.playing = false;
                this.loaded = true;
                if (this.envParams.autoPlay) {
                    this.audio.play();
                    this.playing = true;
                }
                if (this.props.callback) {
                    this.props.callback(this);
                }
            });
        }
    }

    addToScene() { }

    setValue({ value }) {
        if (value.property && this.audio) {
            switch (value.property) {
                case "play":
                    this.audio.play();
                    this.playing = true;
                    break;
                case "stop":
                    this.audio.stop();
                    this.playing = false;
                    break;
                case "mute":
                    this.audio.setVolume(0);
                    break;
                case "unmute":
                    this.audio.setVolume(this.envParams.volume);
                    break;
            }
        }
    }
}

export default VisualAudio;