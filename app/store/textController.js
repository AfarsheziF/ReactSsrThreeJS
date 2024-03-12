import React from "react";
import appUtils from '../utils/appUtils';

const textController = {
    addSection(name, data) {
        this[name] = data;
    },

    getText: function (section, state) {
        console.log('Texts: get ', section, state);
        let text = this[section][state];
        text = appUtils.isMobile ? text.text.mobile : text.text.desktop;
        text = text.replace('<!images!>', this.getImages(section, state));
        return text;
    },

    getImages: function (section, state) {
        let text = this[section][state];
        if (text.images && text.images.length > 0) {
            return (
                `
                <div style="display: flex; flex-direction: ${appUtils.isMobile ? 'column' : 'row'}; width: ${appUtils.isMobile ? "100%" : "50%"} ">
                ${text.images.map((prop, i) => {
                    return (
                        `
                            <div className="pointer" style="margin: 5px; maxWidth: ${appUtils.isMobile ? '100%' : '33%'}" onClick="${text.images[i]}" key={${i}}>
                                <img className="borderBlack" style="objectFit: contain" src=${prop} />
                            </div>
                            `
                    )
                })}
                </div>
                `
            );
        } else {
            return <></>;
        }
    },

    updateData: function (data) {
        this.texts = data;
    }
}

export default textController;