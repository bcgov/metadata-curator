
const {dataUploadController} = require('../../controllers')
const { getDataUploads, postDataUpload, getDataUpload, putDataUpload, getDataUploadComments, postDataUploadComment } = dataUploadController;

module.exports = (router) => {

    router.get ('', getDataUploads);
    router.post('', postDataUpload);
    router.get ('/:dataUploadId', getDataUpload);
    router.put ('/:dataUploadId', putDataUpload);
    router.get ('/:dataUploadId/comments', getDataUploadComments);
    router.post('/:dataUploadId/comments', postDataUploadComment);
    return router;
}
