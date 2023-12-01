// Parse & MongoDB controller. Or sarfati version 07.11.21

import mongoose from 'mongoose';
// import Parse from "parse/node";
import logger from '../logs/logger';

var db, limit = 100;

//Contkt TODO: can be on siteData
var filesUrl = "https://gvhcbqxweb.files-sashido.cloud/";
var databaseUrl = "mongodb://user52cce5:8a1de2ruBf0bEbf45e6@cluster-pgrs2-0-eu-west-1-scalabledbs.cloudstrap.io:27002,cluster-pgrs2-1-eu-west-1-scalabledbs.cloudstrap.io:27002,cluster-pgrs2-2-eu-west-1-scalabledbs.cloudstrap.io:27002/pg-app-1-eu-551mzwwwiduydi4sdk4kcveg0gehee?replicaSet=pgrs2&ssl=true";
var appId = "LQ7YcsDXTGqYCyB7BhGAqOwOcPelCzHYQCTeAOHN";
var javascriptKey = "OGuKCsKYOAype4EoBy1KHXgyTCNVEReHH3cCezLP";
var serverURL = "https://pg-app-551mzwwwiduydi4sdk4kcveg0gehee.scalabl.cloud/1/";

const objects = {

    // Parse

    init() {
        Parse.initialize(appId, javascriptKey);
        Parse.serverURL = serverURL;
        objects.initDB();
    },

    getClassObjects(className, sortBy) {
        return new Promise((resolve, reject) => {
            logger.log('Get class objects: ' + className);
            // Parse.Cloud.useMasterKey();
            var classCount = 0, counter = 0, totalResults = [];
            var query = new Parse.Query(className);
            query.count().then(
                function (count) {
                    logger.log('Total objects count: ' + count);
                    classCount = count;
                    makeQuery();
                }, function (e) {
                    onError(e);
                }
            )

            function makeQuery() {
                logger.log('Getting objects: ' + totalResults.length + ' / ' + classCount);
                query.limit(limit);
                query.skip(counter)
                query.ascending(sortBy ? sortBy : "createdAt");
                query.find({ useMasterKey: true }).then(
                    function (results) {
                        totalResults = totalResults.concat(results);
                        counter = totalResults.length;
                        if (counter < classCount) {
                            makeQuery();
                        } else {
                            onResolve();
                        }
                    },
                    function (e) {
                        onError(e);
                    }
                );
            }

            function onError(e) {
                reject(e);
            }

            function onResolve() {
                resolve(totalResults);
            }
        })
    },

    deleteObj(className, id) {
        return new Promise((resolve, reject) => {
            // Parse.Cloud.useMasterKey();
            objects.getThisObj(className, id).then(
                function (obj) {
                    obj.destroy({ useMasterKey: true }).then(
                        function () {
                            resolve();
                        }, function (e) {
                            reject(e);
                        }
                    )
                }, function (e) {
                    reject(e);
                }
            )
        })

    },

    compareObjects(objects, subValue, subMetric, metric, objToCompare, operator) {
        return new Promise((resolve, reject) => {
            var result = {
                filteredObjects: [],
                skipped: []
            }, count = 0;

            compareThisObj(objects[0]);

            function compareThisObj(obj) {
                // notify('Compare obj => ' + count);
                if (obj[metric]) {
                    objects.getThisObj(obj[metric].className, obj[metric].id || obj[metric].objectId).then(
                        function (fetchedObj) {
                            var objSubValue = fetchedObj.get(subMetric)[subValue];

                            switch (operator.attr) {
                                case "size": compareBySize(objSubValue, obj);
                                    break;
                                default: compareByAttr(objSubValue, obj);
                            }

                            count++;
                            if (count < objects.length) {
                                compareThisObj(objects[count]);
                            } else {
                                resolve(result);
                            }
                        }, function (e) {
                            reject(e);
                        }
                    )
                } else {
                    // notify('Skipped obj => ' + count);
                    result.skipped.push(obj);
                    count++;
                    if (count < objects.length) {
                        compareThisObj(objects[count]);
                    } else {
                        resolve(result);
                    }
                }
            }

            function compareBySize(objSubValue, obj) {
                switch (operator.operator) {
                    case "small":
                        if (objSubValue.length < objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "small_equal":
                        if (objSubValue.length <= objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal":
                        if (objSubValue.length === objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal_big":
                        if (objSubValue.length >= objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "big":
                        if (objSubValue.length < objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                }
            }

            function compareByAttr(objSubValue, obj) {
                switch (operator.operator) {
                    case "small":
                        if (objSubValue[operator.attr] < objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "small_equal":
                        if (objSubValue[operator.attr] <= objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal":
                        if (objSubValue[operator.attr] === objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "not_equal":
                        if (objSubValue[operator.attr] !== objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal_big":
                        if (objSubValue[operator.attr] >= objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "big":
                        if (objSubValue[operator.attr] < objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                }
            }
        });
    },

    getThisObj(className, id) {
        return new Promise(function (resolve, reject) {
            //console.log('getThisObj', className, id);
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.equalTo("objectId", id);
            query.find({ useMasterKey: true }).then(
                function (results) {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject({ error: "Object was not found: " + className + " -> " + id });
                    }
                },
                function (error) {
                    reject(error);
                }
            );
        });
    },

    getThisObjBy(className, metric, input) {
        return new Promise(function (resolve, reject) {
            //console.log('getThisObj', className, id);
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.equalTo(metric, input);
            query.find({ useMasterKey: true }).then(
                function (results) {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject({ error: "Object was not found" });
                    }
                },
                function (error) {
                    reject(error);
                }
            );
        });
    },

    getThisObjsBy(className, metric, input) {
        return new Promise(function (resolve, reject) {
            //logger.log('getThisObj', className, id);
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.count().then(
                function (count) {
                    var query = new Parse.Query(className);
                    query.limit(count);
                    query.equalTo(metric, input);
                    query.find({ useMasterKey: true }).then(
                        function (results) {
                            resolve(results);
                        },
                        function (error) {
                            reject(error);
                        }
                    );
                }, function (e) {
                    reject(e);
                }
            );
        });
    },

    getAllObjs(className, metric, objsArray) {
        return new Promise((resolve, reject) => {
            logger.log("Getting list objects: " + className);
            // Parse.Cloud.useMasterKey();

            var counter = 0, totalResults = [], totalCount = objsArray.length;
            var query = new Parse.Query(className);

            makeQuery();

            function makeQuery() {
                logger.log('Getting objects: ' + className + ' ' + totalResults.length + ' / ' + totalCount);
                var slicedArray = objsArray.splice(0, limit);
                query.limit(limit);
                query.containedIn(metric, slicedArray).ascending('createdAt');
                query.find({ useMasterKey: true }).then(
                    function (results) {
                        totalResults = totalResults.concat(results);
                        counter = totalResults.length;
                        if (counter < totalCount && objsArray.length > 0) {
                            makeQuery();
                        } else {
                            onResolve();
                        }
                    },
                    function (e) {
                        onError(e);
                    }
                )
            }

            function onError(e) {
                reject(e);
            }

            function onResolve() {
                resolve(totalResults);
            }
        });
    },

    getPointerObjs(className, metric, pointerClass, objectId) {
        return new Promise((resolve, reject) => {
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.count({ useMasterKey: true }).then(
                function (count) {
                    var query2 = new Parse.Query(className);
                    query2.limit(count);
                    query2.equalTo(metric, { "__type": "Pointer", "className": pointerClass, "objectId": objectId });
                    query2.find({ useMasterKey: true }).then(
                        function (results) {
                            resolve(results);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                }, function (e) {
                    reject(e);
                }
            );
        })
    },

    getRelationQuery(relation, sortBy) {
        if (process.env.NODE_ENV !== 'production') {
            console.log("getRelationQuery:", relation)
        }
        return new Promise((resolve, reject) => {
            var query = relation.query();
            if (sortBy) {
                query.ascending(sortBy);
            }
            query.find().then(
                function (results) {
                    resolve(results)
                },
                function (e) {
                    reject(e);
                }
            );
        })
    },

    addToArtistVideos(artistId, video) {
        console.log("addToArtistVideos", artistId, video);
        this.getThisObj('WaxingArtists', artistId).then(
            function (artist) {
                var videos = artist.get('videos');
                if (!videos) {
                    videos = [];
                }
                videos.push(video);
                artist.set('videos', videos);
                artist.save().then(
                    function (savedArtist) {
                        console.log(savedArtist.id, savedArtist.get('name'), "saved");
                    }, function (e) {
                        console.log(e);
                    }
                )
            }, function (e) {
                console.log(e);
            }
        )
    },

    sendEmail(subject, email, text, receiver) {
        return new Promise(function (resolve, reject) {
            Parse.Cloud.run("sendMail", {
                param1: subject,
                param2:
                    "<b>Email: </b>" + email + "<br>" +
                    "<b>Text: </b>" + text,
                param3: receiver
            })
                .then(function (result) {
                    console.log("result :" + JSON.stringify(result));
                    resolve();
                }, function (error) {
                    //console.log("result :" + result);
                    reject(error);
                }
                );
        });
    },

    uploadPhotos(id, className) {
        // creating input on-the-fly
        var input = document.createElement("input");
        input.setAttribute("type", "file");
        input.multiple = 'multiple';
        input.addEventListener("change", function () {
            var files = input.files;
            console.log(files);
            if (files != null) {
                var newPhotos = [];
                var saveCounter = 0;
                for (var i = 0; i < files.length; i++) {
                    var parseFile = new Parse.File(files[i].name, files[i]);
                    parseFile.save().then(
                        function (savedFile) {
                            saveCounter++;
                            console.log('Saved:', saveCounter);
                            newPhotos.push(savedFile);
                            if (saveCounter === files.length) {
                                setObject(newPhotos);
                            }
                        },
                        function (error) {
                            console.log(error);
                        });
                }
            }
        });

        input.click();

        function setObject(newPhotos) {
            var query = new Parse.Query(className);
            query.equalTo('objectId', id);
            query.find().then(
                function (results) {
                    var photos = results[0].get('photos');
                    if (!photos) {
                        photos = []
                    }
                    photos = photos.concat(newPhotos);
                    results[0].set('photos', photos);
                    results[0].save().then(
                        function (obj) {
                            console.log(obj.get('name') + " saved");
                        },
                        function (error) {
                            console.log(error);
                        });
                },
                function (error) {
                    console.log(error);
                });
        }
    },

    createParseObject(className) {
        return new Parse.Object(className);
    },

    createParseFile(fileName, data, encoding) {
        return new Promise((resolve, reject) => {
            var parseFile = new Parse.File(fileName, ((encoding && encoding === 'base64') ? { base64: data } : data));
            parseFile.save().then(
                function (savedFile) {
                    resolve(savedFile);
                },
                function (error) {
                    reject(error);
                });
        })
    },

    //MongoDB

    initDB(online) {
        return new Promise((resolve, reject) => {
            mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });
            var connection = mongoose.connection;
            connection.on('error', function (e) {
                reject(e);
            });
            connection.once('open', function () {
                db = connection.db;
                logger.log('MongoDB Connection succeeded')
                resolve();
            })
        });
    },

    getDBCollection(className, sort) {
        return new Promise((resolve, reject) => {
            console.log('Getting DB Collection: ' + className);
            if (!db) {
                objects.initDB().then(
                    function () {
                        getData();
                    }, function (e) {
                        reject(e);
                    }
                )
            } else {
                getData();
            }

            function getData() {
                db.collection(className, function (err, collection) {
                    if (err) {
                        reject(err);
                    } else {
                        collection.find({}).sort({ [sort]: -1 }).toArray(function (err, data) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(objects.formatData(className, data));
                            }
                        })
                    }
                });
            }
        })
    },

    formatData(className, data) {
        logger.log('Formatting DB Collection: ' + data.length);
        for (var i in data) {
            var obj = objects.formatDocument(data[i], className);
            data[i] = obj;
        }

        return data;
    },

    formatDocument(doc, className, writeable) {

        function Obj(doc) {
            // console.log(doc);
            var keys = Object.keys(doc);
            this.className = className;
            this.id = doc._id;
            this.createdAt = new Date(doc._created_at);
            this.updatedAt = new Date(doc._updated_at);
            for (var i in keys) {
                this[keys[i]] = doc[keys[i]];
                if (doc[keys[i]] &&
                    doc[keys[i]].indexOf != undefined) {
                    if (doc[keys[i]].indexOf(".jpg") >= 0 || doc[keys[i]].indexOf(".png") >= 0 || doc[keys[i]].indexOf(".gif") >= 0 || doc[keys[i]].indexOf(".pdf") >= 0) {
                        this[keys[i]] = filesUrl + doc[keys[i]];
                    }
                }
                if (doc[keys[i]] &&
                    keys[i].indexOf &&
                    keys[i].indexOf("_p_") >= 0) {
                    var attr = keys[i].substring(keys[i].indexOf("_p_") + 3, keys[i].length);
                    var id = doc[keys[i]];
                    id = id.substring(id.indexOf("$") + 1, id.length);
                    this[attr] = {
                        id: id
                    }
                }
            }
        }

        if (writeable) {

            Obj.prototype.newState = {};

            Obj.prototype.get = function (key) {
                if (this[key] === undefined || this[key] === null) {
                    return false;
                } else {
                    return this[key];
                }
            }

            Obj.prototype.set = function (key, value) {
                this.__proto__.newState[key] = value;
            }

            Obj.prototype.save = function () {
                const that = this;
                return new Promise((resolve, reject) => {
                    db.collection(that.className, function (err, collection) {
                        if (err) {
                            reject(err);
                        } else {
                            collection.findOneAndUpdate({ _id: that.id }, { $set: that.__proto__.newState }, { new: true }, function (err, res) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(objects.formatDocument(res.value));
                                }
                            })
                        }
                    });
                })
            }
        }

        return new Obj(doc);
    }
}

export default objects;