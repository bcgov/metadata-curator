const {dataUploadService} = require('../services')
const { createDataUpload } = dataUploadService;

const postDataUpload = async (req, res) => {
    // console.log("postDataUpload controller req.user: ", req.user);
    console.log("postDataUpload controller");
    // console.log("user: ", user);
    // console.log("upload: ", body);

    try {
        let upload = req.body;
        // await createDataUpload(req.user, req.body);
        await createDataUpload(req.body);
        res.status(201);
        res.json({
            status: 201,
            message: 'Data upload saved successfully.'
        });
    } catch(e) {
        // log.debug(err);
        res.status(500);
        res.json({
            status: 500,
            error: err.message
        });
    }
}

module.exports = {
    postDataUpload
}
