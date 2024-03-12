import envParams from "./envParams.json";
import settings from "./settings.json";
import texts from "./texts.json";

import envParams_backup from "./envParams backup.json";
import settings_backup from "./settings_backup.json";
import texts_backup from "./texts_backup.json";

import serverUtils from "../utils/serverUtils";

const config = {
    data: {
        envParams: envParams,
        settings: settings,
        texts: texts,
        images: {}
    },

    backups: {
        envParams_backup: envParams_backup,
        settings_backup: settings_backup,
        texts_backup: texts_backup
    },

    loadAssets() {
        return new Promise((resolve, reject) => {
            if (!this.data.envParams.assets.textures) {
                Promise.all([
                    serverUtils.readDir(global.baseUrl + '/public/images/textures', true),
                    serverUtils.readDir(global.baseUrl + '/public/images/normalMaps', true),
                    serverUtils.readDir(global.baseUrl + '/public/images/svg', true),
                ]).then(
                    res => {
                        this.data.envParams.assets.textures = res[0];
                        this.data.envParams.assets.normalMaps = res[1];
                        this.data.images = res[2].reduce((k, v) => ({ ...k, [v.substring(v.lastIndexOf('/') + 1, v.length)]: { url: v } }), {});
                        resolve(this.data);
                    },
                    e => {
                        console.error(e);
                        reject(e);
                    }
                )
            } else {
                resolve(this.data);
            }
        })
    }
}

export default config;