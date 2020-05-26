
const {dataUploadController} = require('../../../controllers')
const { getDataUploads, postDataUpload, postRepository, getDataUpload, putDataUpload, getDataUploadComments, postDataUploadComment, getRevisions } = dataUploadController;

module.exports = (router) => {
    router.get ('', catchAsync(getDataUploads));
    router.post('', catchAsync(postDataUpload));
    router.get ('/:dataUploadId', catchAsync(getDataUpload));
    router.put ('/:dataUploadId', catchAsync(putDataUpload));
    router.post('/:dataUploadId/repositories', catchAsync(postRepository));
    router.get ('/:dataUploadId/comments', catchAsync(getDataUploadComments));
    router.post('/:dataUploadId/comments', catchAsync(postDataUploadComment));
    router.get ('/:dataUploadId/revisions', catchAsync(getRevisions));
    return router;
}
