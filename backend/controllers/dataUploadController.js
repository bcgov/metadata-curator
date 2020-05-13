const { dataUploadService, commentService } = require('../services')
const { createDataUpload, updateDataUpload, listDataUploads, getDataUploadById } = dataUploadService;
const { addComment, getComments } = commentService;

const postDataUpload = async (req, res) => {
    try {
        await createDataUpload(req.body);
        res.status(201);
        res.json({
            status: 201,
            message: 'Data upload saved successfully.'
        });
    } catch(err) {
        console.error(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }
}

const putDataUpload = async (req, res) => {
    try {
        const dataUpload = await updateDataUpload(req.params.dataUploadId, req.body);
        res.status(200);
        res.json(dataUpload);
    } catch(err) {
        console.error(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }
}

const getDataUploads = async (req, res, next) => {
    try {
        let list = await listDataUploads();
        res.json(list);
    } catch(err) {
        console.error(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }
}

const getDataUpload = async (req, res) => {
    try {
        const dataUploadId = req.params.dataUploadId;
        let result = await getDataUploadById(dataUploadId);
        if(!result) {
            res.status(404);
            res.json({
                status: 404,
                message: 'Data Upload(' + dataUploadId + ') not found'
            });
            return;
        }
        res.json(result);
    } catch(err) {
        console.error(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }

}

const postDataUploadComment = async (req, res, next) => {
    try {
        await addComment (req.params.dataUploadId, req.user, req.body.content);
        res.status(201);
        res.json({
            status: 201,
            message: 'Comment saved successfully.'
        });
    } catch(err) {
        console.error(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }
}

const getDataUploadComments = async (req, res, next) => {
    try {
        const comments = await getComments (req.params.dataUploadId, req.user);
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }
}

module.exports = {
    getDataUploads,
    postDataUpload,
    getDataUpload,
    putDataUpload,
    getDataUploadComments,
    postDataUploadComment
}
