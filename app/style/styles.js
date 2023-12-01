import appState from '../appState.json';

var styles = {};

if (!appState.production) {
    styles = {
        colors: require('./colors.scss'),
        fonts: require('./fonts.scss'),
        styles: require('./style.scss'),
        media: require('./media.scss'),
        animations: require('./animations.scss')
    }
}

export default styles;