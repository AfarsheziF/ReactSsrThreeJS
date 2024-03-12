class LoadingManager {
    callbacks;

    constructor() {
        this.itemsLoaded = 0;
        this.callbacks = {
            start: [],
            progress: [],
            load: [],
            error: []
        };
    }

    onStart(c) {
        this.callbacks.start.push(c);
    }

    onProgress(c) {
        this.callbacks.progress.push(c);
    }

    onComplete(c) {
        this.callbacks.load.push(c);
    }

    onError(c) {
        this.callbacks.error.push(c);
    }

    //

    updateStart = (url, itemsLoaded, itemsTotal) => {
        this.callbacks.start.forEach((c) => c({ url, itemsLoaded, itemsTotal }));
    }

    updateProgress = (url, itemsLoaded, itemsTotal) => {
        this.callbacks.progress.forEach((c) => c({ url, itemsLoaded, itemsTotal }));
    }

    updateLoad = () => {
        this.callbacks.load.forEach((c) => c());
    }

    updateError = (e) => {
        this.callbacks.error.forEach((c) => c(e));
    }
}

export default LoadingManager;