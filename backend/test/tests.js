process.env.NODE_ENV = 'test';

describe("MC Unit Tests", function() {
    require('./modules/authTest');
    require('./clients/forumClientTest');
    require('./notifications/emailTest');
    require('./v1/dataPackagesTest');
    require('./v1/metadataRevisionsTest');
    require('./v1/repositoriesTest');
    require('./v1/tableSchemaTest');
    require('./v1/forumApiTest');
    require('./services/dataUploadServiceTest');
    require('./services/commentServiceTest');
    require('./controllers/dataUploadControllerTest');
});
