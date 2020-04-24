const mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;
let passport = require('passport');
let db = require('./db/db');
let express = require('express');
let router = express.Router();
let notify = require('../notifications/notifications')(db);
let auth = require('../modules/auth');
const {Package, Profile, Resource, validate:dataPackageValidate} = require('datapackage');
const {Table, Schema, validate} = require('tableschema');
const axios = require('axios');

router.use('/login', function(req, res, next){
    req.session.r = req.query.r;
    return res.redirect('/api/log');
});

router.use('/log', passport.authenticate('oidc'), function(req, res, next){
    console.log("log", req.user);
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
    // console.log("token", req.user);
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

router.put('/v1/datauploads/:dataUploadId', async (req, res, next) => {
    try {
        // console.log("req.body: ", req.body);
        const dataUploadId = req.body._id;
        // console.log("dataUploadId: " + dataUploadId);
        let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});

        if(!dataUpload) {
            res.status(404);
            res.json({
                status: 404,
                message: 'Data Upload(' + dataUploadId + ') not found'
            })
        }
        console.log("dataUpload: ", dataUpload);

        dataUpload.name = req.body.name;
        dataUpload.description = req.body.description;
        dataUpload.files = req.body.files;
        dataUpload.opened_by_approver = req.body.opened_by_approver;
        dataUpload.approver_has_commented = req.body.approver_has_commented;

        await dataUpload.save();
        console.log("BE router dataupload from save: ", dataUpload);

        res.status(200);
        // res.json({
        //     status: 200,
        //     message: 'Data upload updated successfully.'
        // });
        res.json(dataUpload);
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
        // console.log("result: ", result);
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


router.get('/v1/datauploads/:dataUploadId', async (req, res, next) => {

    try {
        const dataUploadId = req.params.dataUploadId;
        let result = await db.DataUploadSchema.findOne({_id: dataUploadId});
        if(!result) {
            res.status(404);
            res.json({
                status: 404,
                message: 'Data Upload(' + dataUploadId + ') not found'
            })
        }

        // console.log("result: ", result);
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
        console.log("req: ", req.user);
        const jwt = req.user.jwt;

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

        const alwaysNotifyUninvolvedOnCommentAdd = config.has("alwaysNotifyUninvolvedOnCommentAdd")
            && config.has("alwaysNotifyUninvolvedOnCommentAdd") === true;
        const notifyAllApprovers = alwaysNotifyUninvolvedOnCommentAdd && dataUpload.opened_by_approver
            && !dataUpload.approver_has_commented && req.user.isDataProvider;
        console.log("notifyAllApprovers: " + notifyAllApprovers);

        const options = {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        };

        let topicResponse = null;

        //TODO: topic creation should reside in create upload endpoint implementation which hasn't currently been
        // wired into the FE yet.  For the time being, it is included here to make it easier to test the functionality
        // that is currently implemented
        if(!dataUpload.topic_id) {
            if (req.user.organization){
                console.log("biz category exists");
                const parentTopicResponse = await createTopicIfDoesNotExist(req.user.organization, req.user);
                if(!parentTopicResponse) {
                    res.status(500);
                    res.json({error: "Error creating/fetching parent topic"});
                    return;
                }
                parentId = parentTopicResponse.data._id;

                topicResponse = await createTopic(dataUpload._id, parentId, req.user);
            } else {
                topicResponse = await createTopic(dataUpload._id, null, req.user)
            }

            console.log("topicResponse: ", topicResponse);
            //update dataUpload
            dataUpload = await db.DataUploadSchema.findOneAndUpdate(
                {_id: dataUploadId},{topic_id: topicResponse.data._id}, {new: true});
            // console.log("dataUpload after update: ", dataUpload)
        }

        // console.log("dataUpload.topic_id: " + dataUpload.topic_id);
        const url = forumApiConfig.baseUrl + "/comment/" + dataUpload.topic_id;
        const requestBody = { comment: req.body.content};
        // console.log("requestBody: ", requestBody);
        const response = await axios.post(url, requestBody, options);

        // console.log("response.data: ", response.data);

        if(req.user.isApprover) {
            console.log("api add comment is approver");
            if(!dataUpload.approver_has_commented) {
                dataUpload.approver_has_commented = true;
                await dataUpload.save();
            }
        }

        //send out notifications if req'd to approvers
        if(notifyAllApprovers) {
            console.log("BE post comment notify all approvers");
            notify.notify(dataUpload, req.user);
            dataUpload.opened_by_approver = false;
            await dataUpload.save();
        }

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

var modifyJWTGroups = function(token, newGroups){
    var config = require('config');
    var jwt = require('jsonwebtoken');
    var secret = config.get("jwtSecret")
    var decoded = jwt.verify(token, secret);
    decoded.groups = newGroups;
    var tempToken = jwt.sign(decoded, secret);
    return tempToken;
};

var createTopic = async function(topicName, parent, user){
    var config = require('config');
    const forumApiConfig = config.get("forumApi");
    const url = forumApiConfig.baseUrl;

    var topic = {
        name: topicName
    };

    if (parent){
        topic.parent_id = parent;
    }

    const options = {
        withCredentials: true,
        headers: {
            'Authorization': "Bearer "+user.jwt
        }
    };

    const response = await axios.post(url, topic, options);
    return response;
}

var createTopicIfDoesNotExist = async function(topicName, user){
    let config = require('config');
    const forumApiConfig = config.get("forumApi");

    var newG = user.groups.slice();
    newG.push("admin");

    const options = {
        withCredentials: true,
        headers: {
            'Authorization': "Bearer "+modifyJWTGroups(user.jwt, newG)
        }
    };

    const url = forumApiConfig.baseUrl + '/?name='+topicName;
    const parentTopicResponse = await axios.get(url, options);
    console.log("parentTopic response is: ", parentTopicResponse);

    if(parentTopicResponse) {
        console.log("parent topic response came back");
        console.log("parentTopicResponse.data: ", parentTopicResponse.data);
        if(parentTopicResponse.data.length === 0) {
            console.log("create parent topic");
            // create parent topic
            var origGroups = user.groups.slice();
            var origJwt = user.jwt;
            user.groups = [user.organization, config.get('requiredRoleToCreateRequest')];
            user.jwt = modifyJWTGroups(user.jwt, user.groups);

            // create upload topic
            const response = await createTopic(topicName, parentTopicResponse.data._id, user);
            return response;

        }

        console.log("return existing parent topic");
        // return parent topic
        return parentTopicResponse;
    }



}

router.get('/v1/datauploads/:dataUploadId/comments', async (req, res, next) => {

    try {

        let config = require('config');
        const forumApiConfig = config.get("forumApi");
        // console.log("forumApiConfig: ", forumApiConfig);
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

        const jwt = req.user.jwt;
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

// router.get('/v1/datauploads/:dataUploadId/comments', async (req, res, next) => {
//
//     try {
//
//         let config = require('config');
//         const forumApiConfig = config.get("forumApi");
//         console.log("forumApiConfig: ", forumApiConfig);
//         // console.log("req.params.dataUploadId: ", req.params.dataUploadId);
//         const dataUploadId = req.params.dataUploadId;
//         // console.log("req.body: ", req.body);
//
//         let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});
//         // console.log("found data upload: ", dataUpload);
//
//         if(!dataUpload) {
//             res.status(404);
//             res.json({
//                 status: 404,
//                 message: 'Data Upload(' + dataUploadId + ') not found'
//             })
//         }
//
//         const jwt = user.jwt;
//         const options = {
//             withCredentials: true,
//             headers: {
//                 'Authorization': `Bearer ${jwt}`
//             }
//         };
//         // return axios.get(forumApiConfig.baseUrl, options).then(response => response.data)
//
//         const url = forumApiConfig.baseUrl + "/comment/" + dataUpload.topic_id;
//         const response = await axios.get(url, options);
//
//         // console.log("data: ", response.data);
//
//         const comments = response.data.map(item => {
//             const comment = {
//                 _id: item._id,
//                 create_ts: item.created_ts,
//                 comment: item.comment,
//                 author_user: item.author_user
//             };
//             // console.log("comment: ", comment);
//             return comment;
//         });
//         // console.log("comments: ", comments);
//
//         res.json(comments);
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
        // console.log("req.params.dataUploadId: ", req.params.dataUploadId);
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
        // console.log("results: ", result);
        result = result.map(item => item.mr);
        // console.log("final results: ", result);
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
