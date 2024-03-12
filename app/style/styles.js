const styles = {
    init() {
        this.styles = {
            colors: require('./colors.scss'),
            fonts: require('./fonts.scss'),
            styles: require('./style.scss'),
            media: require('./media.scss'),
            animations: require('./animations.scss'),
            gui: window.__DEV__ && require('./guiStyle.scss')
        }
    }
}


export default styles;