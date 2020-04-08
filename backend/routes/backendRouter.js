const mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;
let passport = require('passport');
let db = require('./db/db');
let express = require('express');
let router = express.Router();
let auth = require('../modules/auth');
const {Package, Profile, Resource, validate:dataPackageValidate} = require('datapackage');
const {Table, Schema, validate} = require('tableschema');
const axios = require('axios');

router.use('/login', function(req, res, next){
    req.session.r = req.query.r;
    return res.redirect('/api/log');
});

router.use('/log', passport.authenticate('oidc'), function(req, res, next){
    next();
});

router.use('/callback', passport.authenticate('oidc'), function(req, res, next){
    let config = require('config');
    if (req.session.r){
        return res.redirect(config.get('frontend')+'/'+req.session.r);
    }
    return res.redirect(config.get('frontend')+'/');
    
});

router.use('/logout', function(req, res, next){
    req.logout();
    let config = require('config');
    res.redirect(config.get('frontend'));
});

router.use('/token', auth.removeExpired, function(req, res){
    if (req.user && req.user.jwt && req.user.refreshToken) {
        res.json(req.user);
    }else{
        res.json({error: "Not logged in"});
    }
});

router.use('/v1/publickey', auth.removeExpired, function(req, res){
    var config = require('config');
    var atob = require('atob');
    if (!config.has('base64EncodedPGPPublicKey')){
        return res.json({error: "Not configured"});
    }
    let key = atob(config.get('base64EncodedPGPPublicKey'));
    return res.json({key: key});
});

router.use('/v1/uploadurl', auth.removeExpired, function(req, res){
    var config = require('config');
    if (!config.has('uploadUrl')){
        return res.json({error: "Not configured"});
    }
    let url = config.get('uploadUrl');
    return res.json({url: url});
});


router.post('/v1/datapackageschemas', async (req, res, next) => {

    try {
        let errs = [];
        let resourceErrsMap = new Map();
        let err = {};
        console.log("req.body: ", req.body);

        let descriptor = {...req.body};
        descriptor.profile = "tabular-data-package";

        const dataPackage = await Package.load(descriptor, {strict: false});
        console.log('valid: ' + dataPackage.valid);


        if (!dataPackage.valid) {

            if (descriptor.resources && descriptor.resources.length > 0) {
                console.log("resources property exists");

                for (const resource of descriptor.resources) {
                    const rsrc = Resource.load(resource);
                    const rsrcValid = (await rsrc).valid;
                    const rsrcErrors = (await rsrc).errors;

                    console.log("rsrc valid: ", rsrcValid);
                    for (const error of rsrcErrors) {
                        // console.log("error: ", error);
                        let errorSections = error.message.split("\n");
                        errorSections = errorSections.map(item => item.replace(/\s\s+/g, " ").trim());
                        errorSections = errorSections.map(item => item.replace(/\"/g, ""));

                        let msg = errorSections.join(" ");
                        const err = {
                            resourceName: resource.name,
                            message: msg,
                            //potentially useful if there is a need to make the validation errors returned by frictionless library
                            //to be more humanly understandable
                            validationErrorBySections: {
                                desc: errorSections[0],
                                field: errorSections[1],
                                validationRule: errorSections[2]
                            }
                        };

                        console.log("rsrc err: ", err);
                        let val = resourceErrsMap.get(resource.name);
                        if (val) {
                            val.push(err);
                            resourceErrsMap.set(resource.name, val);
                        } else {
                            // console.log("else...")
                            let newVal = [];
                            newVal.push(err);
                            resourceErrsMap.set(resource.name, newVal);
                        }
                    }
                }
                console.log("resourceErrsMap: ", resourceErrsMap);
            } else {
                console.log("resources property does not exist");
                for (const error of dataPackage.errors) {
                    // console.log("error: ", error);
                    let errorSections = error.message.split("\n");
                    errorSections = errorSections.map(item => item.replace(/\s\s+/g, " ").trim());
                    errorSections = errorSections.map(item => item.replace(/\"/g, ""));

                    let msg = errorSections.join(" ");
                    err = {
                        message: msg,
                        //potentially useful if there is a need to make the validation errors returned by frictionless library
                        //to be more humanly understandable
                        validationErrorBySections: {
                            desc: errorSections[0],
                            field: errorSections[1],
                            validationRule: errorSections[2]
                        }
                    };
                    // console.log("err: ", err);
                    errs.push(err);
                }

            }

            res.status(400);
            res.json({
                status: 400,
                error: {
                    message: "Unable to save tabular data package.  Failed validation.",
                    validationErrors: errs,
                    validationErrorsByResource: [...resourceErrsMap]
                }
            });
            return;

        }

        let dataPackageSchema = new db.DataPackageSchema;
        let resources = [...descriptor.resources];

        console.log("resources: ", resources);
        resources = resources.map(item => {
            let newItem = {...item, tableSchema: {...item.schema}};
            console.log("newItem: ", newItem);
            return newItem;
        });

        dataPackageSchema.profile = descriptor.profile;
        dataPackageSchema.resources = resources;

        await dataPackageSchema.save();
        res.status(201);
        res.json({
            status: 201,
            message: 'Successfully saved tabular data package'
        });
    } catch(err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }
});

router.post('/v1/tableschemas', async (req, res, next) => {

    try {
        console.log("req.bodys: ", req.body);

        let errs = [];
        let schemaDescriptor = {...req.body};

        const schema = await Schema.load(schemaDescriptor);
        if (!schema.valid) {
            for (const error of schema.errors) {
                // console.log("error: ", error);
                let errorSections = error.message.split("\n");
                errorSections = errorSections.map(item => item.replace(/\s\s+/g, " ").trim());
                errorSections = errorSections.map(item => item.replace(/\"/g, ""));

                let msg = errorSections.join(" ");
                const err = {
                    message: msg,
                    //potentially useful if there is a need to make the validation errors returned by frictionless library
                    //to be more humanly understandable
                    validationErrorBySections: {
                        desc: errorSections[0],
                        field: errorSections[1],
                        validationRule: errorSections[2]
                    }
                };
                // console.log("err: ", err);
                errs.push(err);
            }
            res.status(400);
            res.json({
                status: 400,
                error: {
                    message: "Unable to save schema.  Failed validation.",
                    validationErrors: errs
                }
            });
            return;
        }

        const dataPackageSchema = new db.DataPackageSchema;
        // console.log("schemaDescriptor: ", schemaDescriptor);

        dataPackageSchema.profile = "tabular-data-package";
        dataPackageSchema.resources = [
            {
                profile: "tabular-data-resource",
                data: [],
                tableSchema: schemaDescriptor
            }
        ];

        await dataPackageSchema.save();
        res.status(201);
        res.json({
            status: 201,
            message: 'Schema saved successfully.'
        });
    } catch(err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

});


router.post('/v1/datauploads', async (req, res, next) => {
    try {
        console.log("req.body: ", req.body);
        const dataUploadSchema = new db.DataUploadSchema;
        dataUploadSchema.name = req.body.name;
        dataUploadSchema.description = req.body.description;
        dataUploadSchema.uploader = req.body.uploader;
        dataUploadSchema.files = req.body.files;
        dataUploadSchema.topic_id = req.body.topic_id.
        dataUploadSchema.create_date = new Date();

        await dataUploadSchema.save();
        res.status(201);
        res.json({
            status: 201,
            message: 'Data upload saved successfully.'
        });
    } catch(err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

});

router.get('/v1/datauploads', async (req, res, next) => {

    try {
        let result = await db.DataUploadSchema.find({}).sort({ "create_date": 1});
        console.log("result: ", result);
        res.json(result);
    } catch(err) {
        log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

});

router.post('/v1/datauploads/:dataUploadId/comments', async (req, res, next) => {

    try {
        let config = require('config');
        const forumApiConfig = config.get("forumApi");
        // console.log("req.params.dataUploadId: ", req.params.dataUploadId);
        const dataUploadId = req.params.dataUploadId;
        // console.log("req.body: ", req.body);

        let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});
        // console.log("found data upload: ", dataUpload);

        if(!dataUpload) {
            res.status(404);
            res.json({
                status: 404,
                message: 'Data Upload(' + dataUploadId + ') not found'
            })
        }
        const jwt = forumApiConfig.jwt;
        const options = {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        };

        if(!dataUpload.topic_id) {
            //add topic
            const url = forumApiConfig.baseUrl + "/";
            const requestBody = { name: dataUploadId};
            const response = await axios.post(url, requestBody, options);
            // console.log("add topic response.data: ", response.data);

            //update dataUpload
            dataUpload = await db.DataUploadSchema.findOneAndUpdate({_id: dataUploadId},{topic_id: response.data._id}, {new: true});
            // console.log("dataUpload after update: ", dataUpload)
        }

        // console.log("dataUpload.topic_id: " + dataUpload.topic_id);
        const url = forumApiConfig.baseUrl + "/comment/" + dataUpload.topic_id;
        const requestBody = { comment: req.body.content};
        // console.log("requestBody: ", requestBody);
        const response = await axios.post(url, requestBody, options);

        // console.log("response.data: ", response.data);

        res.status(201);
        res.json({
            status: 201,
            message: 'Comment saved successfully.'
        });
    }
    catch (err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });

    }

});


// router.post('/v1/datauploads/:dataUploadId/comments', async (req, res, next) => {
//
//     try {
//         // console.log("req.params.dataUploadId: ", req.params.dataUploadId);
//         const dataUploadId = req.params.dataUploadId;
//
//         // console.log("req.body: ", req.body);
//
//         let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});
//         console.log("found data upload: ", dataUpload);
//
//         if(dataUpload) {
//
//             console.log("existing comments: ", dataUpload.comments);
//
//             let comments = dataUpload.comments;
//             let comment = req.body;
//             comment.create_date = new Date();
//             comments.push(comment);
//
//             await db.DataUploadSchema.findOneAndUpdate({_id: dataUploadId}, {comments: comments});
//
//             res.status(201);
//             res.json({
//                 status: 201,
//                 message: 'Added comment successfully.'
//             });
//
//         }
//         else {
//             res.status(404);
//             res.json({
//                 status: 404,
//                 message: 'Data Upload(' + dataUploadId + ') not found'
//             })
//         }
//
//     }
//     catch (err) {
//         console.log("err: ", err);
//         // log.debug(err);
//         res.status(500);
//         res.json({
//             status: 500,
//             error: err.message
//         });
//
//     }
//
// });

router.get('/v1/datauploads/:dataUploadId/comments', async (req, res, next) => {

    try {

        let config = require('config');
        const forumApiConfig = config.get("forumApi");
        console.log("forumApiConfig: ", forumApiConfig);
        // console.log("req.params.dataUploadId: ", req.params.dataUploadId);
        const dataUploadId = req.params.dataUploadId;
        // console.log("req.body: ", req.body);

        let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});
        // console.log("found data upload: ", dataUpload);

        if(!dataUpload) {
            res.status(404);
            res.json({
                status: 404,
                message: 'Data Upload(' + dataUploadId + ') not found'
            })
        }
        const jwt = forumApiConfig.jwt;
        const options = {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        };

        const url = forumApiConfig.baseUrl + "/comment/" + dataUpload.topic_id;
        const response = await axios.get(url, options);

        // console.log("data: ", response.data);

        const comments = response.data.map(item => {
            const comment = {
                _id: item._id,
                create_ts: item.created_ts,
                comment: item.comment,
                author_user: item.author_user
            };
            // console.log("comment: ", comment);
            return comment;
        });
        // console.log("comments: ", comments);

        res.json(comments);
    }
    catch (err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });

    }

});

router.get('/v1/datauploads/:dataUploadId/comments', async (req, res, next) => {

    try {

        let config = require('config');
        const forumApiConfig = config.get("forumApi");
        console.log("forumApiConfig: ", forumApiConfig);
        // console.log("req.params.dataUploadId: ", req.params.dataUploadId);
        const dataUploadId = req.params.dataUploadId;
        // console.log("req.body: ", req.body);

        let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});
        // console.log("found data upload: ", dataUpload);

        if(!dataUpload) {
            res.status(404);
            res.json({
                status: 404,
                message: 'Data Upload(' + dataUploadId + ') not found'
            })
        }
        const jwt = forumApiConfig.jwt;
        const options = {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        };
        // return axios.get(forumApiConfig.baseUrl, options).then(response => response.data)

        const url = forumApiConfig.baseUrl + "/comment/" + dataUpload.topic_id;
        const response = await axios.get(url, options);

        // console.log("data: ", response.data);

        const comments = response.data.map(item => {
            const comment = {
                _id: item._id,
                create_ts: item.created_ts,
                comment: item.comment,
                author_user: item.author_user
            };
            // console.log("comment: ", comment);
            return comment;
        });
        // console.log("comments: ", comments);

        res.json(comments);
    }
    catch (err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });

    }

});

router.post('/v1/repos', async (req, res, next) => {

    try {
        console.log("req.body: ", req.body);
        const repoSchema = new db.RepoSchema;
        repoSchema.name = req.body.name;
        repoSchema.create_date = new Date();
        repoSchema.data_upload_id = req.body.data_upload_id;

        await repoSchema.save();
        res.status(201);
        res.json({
            status: 201,
            message: 'Repo saved successfully.'
        });
    } catch(err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

});

router.post('/v1/repobranches', async (req, res, next) => {

    try {
        console.log("req.body: ", req.body);
        const repoBranchSchema = new db.RepoBranchSchema;
        repoBranchSchema.repo_id = req.body.repo_id;
        repoBranchSchema.type = req.body.type;
        repoBranchSchema.name = req.body.name;
        repoBranchSchema.description = req.body.description;
        repoBranchSchema.create_date = new Date();

        await repoBranchSchema.save();
        res.status(201);
        res.json({
            status: 201,
            message: 'Repo branch saved successfully.'
        });

    } catch(err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

});

router.post('/v1/metadatarevisions', async (req, res, next) => {

    try {
        console.log("req.body: ", req.body);
        const metadataRevisionSchema = new db.MetadataRevisionSchema;

        metadataRevisionSchema.repo_branch_id = req.body.repo_branch_id;
        metadataRevisionSchema.type = req.body.type;
        metadataRevisionSchema.revision_number = req.body.revision_number;
        metadataRevisionSchema.change_summary = req.body.change_summary;
        metadataRevisionSchema.content = req.body.content;
        metadataRevisionSchema.updater = req.body.updater;
        metadataRevisionSchema.create_date = new Date();

        await metadataRevisionSchema.save();
        res.status(201);
        res.json({
            status: 201,
            message: 'Metadata revision saved successfully.'
        });

    } catch(err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

});


router.get('/v1/metadatarevisions/:dataUploadId', async (req, res, next) => {

    try {
        console.log("req.params.dataUploadId: ", req.params.dataUploadId);
        const dataUploadId = req.params.dataUploadId;

        var pipeline = [
            {
                "$project": {
                    "_id": 0,
                    "du": "$$ROOT"
                }
            },
            {
                "$lookup": {
                    "localField": "du._id",
                    "from": "repo",
                    "foreignField": "data_upload_id",
                    "as": "r"
                }
            },
            {
                "$unwind": {
                    "path": "$r",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$lookup": {
                    "localField": "r._id",
                    "from": "repo_branch",
                    "foreignField": "repo_id",
                    "as": "rb"
                }
            },
            {
                "$unwind": {
                    "path": "$rb",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$lookup": {
                    "localField": "rb._id",
                    "from": "metadata_revision",
                    "foreignField": "repo_branch_id",
                    "as": "mr"
                }
            },
            {
                "$unwind": {
                    "path": "$mr",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$match": {
                    "du._id": new ObjectId(dataUploadId)
                }
            },
            {
                "$sort": {
                    "mr.revision_number": 1
                }
            },
            {
                "$project": {
                    "mr._id": "$mr._id",
                    "mr.type": "$mr.type",
                    "mr.revision_number": "$mr.revision_number",
                    "mr.change_summary": "$mr.change_summary",
                    "mr.create_date": "$mr.create_date",
                    "mr.updater": "$mr.updater",
                    "_id": 0
                }
            }
        ];

        let result = await db.DataUploadSchema.aggregate(pipeline).exec();
        console.log("results: ", result);
        result = result.map(item => item.mr);
        console.log("final results: ", result);
        res.json(result);
    } catch(err) {
        console.log("err: ", err);
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

});

module.exports = router;
