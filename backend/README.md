# Metadata Curator Backend

This backend bridge is used by the frontend.

To install dependencies `npm install`
To run this run `npm run serve`

## Configuration
Copy `default.json.example` to `default.json`

Configurable options are:

database.host - the ip/name to connect to the database at (mongo)
database.username - username to connect to the database with
database.password - password to connect to the database with
database.dbName - the name of the collection inside of mongo
  
sessionSecret - what sessions are encoded with
jwtSecret - what jwts are signed with
frontend - where the frontend is running

oidc.issuer - the issuer for the sso domain you're using
oidc.authorizationURL - the authorize url for the sso domain you're using
oidc.tokenURL - the token url for the sso domain you're using
oidc.userInfoURL - the user info url for the sso domain you're using
oidc.clientID - the client id for the sso domain you're using
oidc.clientSecret - the client secret for the sso domain you're using
oidc.callbackURL - where this resides + /api/callback
oidc.scope": "openid profile offline_access"


forumApi.baseUrl - the endpoint (with version) for the forumApi
uploadUrl - where tusd is running (with /files)
base64EncodedPGPPublicKey - create a pgp public key and base 64 encode it (echo "myKey" | base64 -)

orgAttribute - an attribute on jwts that defines their business category, if not present it will be ignored

requiredRoleToCreateRequest - the users jwt must have this group to be able to create an upload

alwaysNotifyListOnTopicCreate - whether or not to notify a list of people everytime a topic/request/upload is created
alwaysNotifyUninvolvedOnCommentAdd - whether or not to notify a list of people everytime a comment is created

approverGroups - list of groups of people that are allowed to approve uploads

alwaysNotifyList - object defining group -> a list of name/emails to notify from the alwaysNotify settings
    
email.enabled - whether or not email is enabled at all
email.service - the smtp address of the mail server
email.secure - is the email service secured 
email.port - the port to use for email
email.user - the username to use when sending emails
email.pass - the password to use when sending emails
email.from - who the email should read as being from
email.subject - the subject line of the email