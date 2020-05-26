const { commentService, dataUploadService, repoService, revisionService } = require('../services')

const postDataUpload = async (req, res, next) => {
    const dataUpload = await dataUploadService.createDataUpload(req.body);
    res.status(201).json(dataUpload);
}

const postRepository = async (req, res, next) => {
    const id = req.params.dataUploadId;
    let fields = {...req.body};

    const repo = await repoService.createRepo(id, fields.name);
    res.status(201).json({id: repo._id.toString()});
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

const getRevisions = async (req, res, next) => {
    const result = await revisionService.listRevisionsByDataUpload(req.params.dataUploadId);
    res.json(result);
}

module.exports = {
    getDataUploads,
    postDataUpload,
    getDataUpload,
    putDataUpload,
    getDataUploadComments,
    postDataUploadComment,
    postRepository,
    getRevisions
}
