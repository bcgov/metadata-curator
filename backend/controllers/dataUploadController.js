const { commentService, dataUploadService } = require('../services')

const postDataUpload = async (req, res, next) => {
    await dataUploadService.createDataUpload(req.body);
    res.status(201).json({
        message: 'Data upload saved successfully.'
    });
}

const putDataUpload = async (req, res, next) => {
    const dataUpload = await dataUploadService.updateDataUpload(req.params.dataUploadId, req.body);
    res.status(200).json(dataUpload);
}

const getDataUploads = async (req, res, next) => {
    let list = await dataUploadService.listDataUploads();
    res.json(list);
}

const getDataUpload = async (req, res, next) => {
    const dataUploadId = req.params.dataUploadId;
    let result = await dataUploadService.getDataUploadById(dataUploadId);
    if(!result) {
        throw new Error("Data Upload not found")
    }
    res.json(result);
}

const postDataUploadComment = async (req, res, next) => {
    await commentService.addComment (req.params.dataUploadId, req.user, req.body.content);
    res.status(201).json({
        message: 'Comment saved successfully.'
    });
}

const getDataUploadComments = async (req, res, next) => {
    const comments = await commentService.getComments (req.params.dataUploadId, req.user);
    res.json(comments);
}

module.exports = {
    getDataUploads,
    postDataUpload,
    getDataUpload,
    putDataUpload,
    getDataUploadComments,
    postDataUploadComment
}
