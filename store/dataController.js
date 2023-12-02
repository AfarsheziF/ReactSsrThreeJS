// Multer and data requests. 16.10.2022

import request from 'request';
import multer from 'multer';
import logger from '../logs/logger';
import serverUtils from '../utils/serverUtils';
import sessionController from './sessionController';

const folderName = 'uploads';
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, folderName);
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`);
    }
})

const upload = multer({ storage: storage });

const dataController = {

    clearStorageDirectory() {
        return new Promise((resolve, reject) => {
            serverUtils.emptyDir('/' + folderName).then(
                res => resolve(res),
                e => reject(e)
            )
        })
    },

    uploadFile(req, res, next) {
        console.log(req.file, req.body);
    },

    addFileRoute(route, app) {
        console.log('dataController. Adding route', route);
        app.post(route, upload.single('file'),
            function (req, res) {
                // req.file is the name of your file in the form above, here 'file'
                // req.body will hold the text fields, if there were any 
                // console.log(req);
                if (req.body && req.body.params) {
                    let params = JSON.parse(req.body.params);
                    params = params.params;
                    if (params.update) {
                        if (__DEV__ || (params.session && sessionController.validateSession(params.session))) {
                            let filePath = params.filePath + '/' + (params.fileName || req.file.originalname);

                            serverUtils.readFile(filePath)
                                .then(
                                    function (file) {
                                        // console.log(file);
                                        serverUtils.copyFile(
                                            `/${folderName}/` + req.file.originalname,
                                            params.filePath + '/' + req.file.originalname
                                        )
                                            .then(
                                                copyRes => {
                                                    res.status(200);
                                                    res.send('Success');
                                                },
                                                e => {
                                                    onError(res, e);
                                                }
                                            );
                                    }, function (e) {
                                        onError(res, e);
                                    }
                                )
                        } else {
                            if (params.session && !sessionController.validateSession(params.session)) {
                                onError(res, new Error('Invalid session token'));
                            }
                            else if (!params.session) {
                                onError(res, new Error('Missing session token'));
                            }
                            else {
                                onError(res, new Error('Unknown error'));
                            }
                        }
                    } else {
                        res.status(200);
                        res.send('Success');
                    }
                } else {
                    res.status(200);
                    res.send('Success');
                }
            },
            function (e) {
                logger.error(e);
            });

        function onError(res, e) {
            logger.error(e);
            res.status(403);
            res.send(e);
        }
    },

    addDataUpdateRoute(route, app) {
        app.post(route, function (req, res, next) {
            console.log(res);
        });
    },

    postUrlRequest(url, options) {
        return new Promise((resolve, reject) => {
            request(url, {
                method: 'post',
                ...options
            },
                function (e, response, body) {
                    if (e) {
                        e.request = options;
                        reject(e);
                    }
                    else {
                        resolve(body);
                    }
                }
            )
        });
    }
}

export default dataController;