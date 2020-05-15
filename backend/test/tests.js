process.env.NODE_ENV = 'test';

describe("MC Unit Tests", function() {
    require('./v1/dataPackagesTest');
    require('./v1/metadataRevisionsTest');
    require('./v1/repositoriesTest');
    require('./v1/tableSchemaTest');
    require('./v1/dataUploads');
    require('./services/dataUploadServiceTest');
    require('./services/commentServiceTest');
    require('./controllers/dataUploadControllerTest');
});
