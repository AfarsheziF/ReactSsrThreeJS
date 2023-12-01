import axios from 'axios';

let baseUrl = '';

const dataController = {

    makeRequest(method, routes, params) {
        baseUrl = global.__DEV__ ? "" : window.envParams.baseUrl
        return new Promise((resolve, reject) => {
            if (!Array.isArray(routes)) {
                routes = [routes];
            }
            for (let i in routes) {
                routes[i] = makePromise(routes[i]);
            }

            return Promise.all(routes)
                .then((results) => resolve(results.length > 1 ? results : results[0]))
                .catch(e => reject(e));

            function makePromise(route) {
                // console.log('makeRequest:', baseUrl + route);
                return fetch(baseUrl + route, {
                    method: method,
                    body: params ? JSON.stringify(params) : null,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).then(res => res.json())
            }
        })
    },

    uploadFile(params, nameToValidate, callback) {
        baseUrl = global.__DEV__ ? "" : window.envParams.baseUrl
        // expecting multer on express side. name = file
        return new Promise((resolve, reject) => {
            // console.log('uploadFile', params);
            const input = document.createElement("input");
            input.onchange = onChange;
            input.setAttribute("type", "file");
            input.setAttribute("name", "file");
            input.setAttribute("id", "file");

            document.body.appendChild(input);
            input.click();

            function onChange(event) {
                const data = new FormData();
                const file = event.target.files[0];
                if (nameToValidate) {
                    if (file.name.toLowerCase() === nameToValidate.toLowerCase()) {
                        makeUpload();
                    } else {
                        callback({ message: 'File name does not match: ' + nameToValidate });
                    }
                } else {
                    makeUpload()
                }

                function makeUpload() {
                    data.append('file', file);
                    data.append('params', JSON.stringify({ params: params }));
                    axios({
                        method: 'POST',
                        url: baseUrl + "/uploadFile",
                        data: data,
                        headers: { "Content-Type": "multipart/form-data" }
                    })
                        .then(res => {
                            console.log(res);
                            if (res.data == 'Success') {
                                callback({ message: 'File uploaded' });
                            }
                            else {
                                callback({ message: 'Error uploading file' });
                            }
                        })
                        .catch(e => callback(e))
                }
            }
        })
    },
}

export default dataController;