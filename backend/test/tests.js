process.env.NODE_ENV = 'test';

describe("MC Unit Tests", function() {
    require('./modules/authTest');
    require('./modules/semantic_infer');
    require('./modules/resourceDiffTest');
    require('./clients/forumClientTest');
    require('./clients/formioClientTest');
    require('./notifications/emailTest');
    require('./v1/dataPackagesTest');
    require('./v1/metadataRevisionsTest');
    require('./v1/repositoriesTest');
    require('./v1/tableSchemaTest');
    require('./v1/forumApiTest');
    require('./v1/formioTest');
    require('./services/dataUploadServiceTest');
    require('./services/commentServiceTest');
    require('./services/tableSchemaServiceTest');
    require('./services/dataPackageServiceTest');
    require('./controllers/dataUploadControllerTest');
});
