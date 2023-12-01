import objects from "./objects";

const siteData = {

    data: null,
    className: "z_OrSarfatiObjects",

    init() {
        objects.init();
    },

    fetchSiteData(overwrite) {
        var that = this;
        return new Promise((resolve, reject) => {
            if (that.data === null || overwrite
                || process.env.NODE_ENV === 'development'
            ) {
                objects.getDBCollection(that.className, 'date').then(
                    function (data) {
                        that.data = [];
                        for (var i in data) {
                            if (data[i].show) {
                                that.data.push(data[i]);
                            }
                        }
                        resolve(that.data);
                    }, function (e) {
                        reject(e);
                    }
                )
            } else {
                resolve(that.data);
            }
        })
    }
}

export default siteData;