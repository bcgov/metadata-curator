const passport = require('passport');
const passJwt = require('passport-jwt');
const JWTStrategy = passJwt.Strategy;
const ExtractJWT = passJwt.ExtractJwt;
var config = require('config');
var logger = require('npmlog');
var jwt = require('jsonwebtoken');
let OidcStrategy = require('passport-openidconnect').Strategy;
const mongoose = require('mongoose');


var secret = config.get("jwtSecret");

const buildProfile = (token, refreshToken) => {
    let profile = {...token};

    if (!profile._json) {
        profile._json = {...token};
    }

    profile._json['aud'] = config.get('jwtAud');
    
    let cloneable = JSON.parse(JSON.stringify(token._json));
    delete cloneable.jwt;
    
    profile.jwt = jwt.sign(token._json, config.get('jwtSecret'));
    profile.isAdmin = false;
    let idField = config.get('userIdField');
  
    profile.isDataProvider = false;
    profile.isApprover = false;
    profile.groups = token._json?.groups || [];

    profile.id = profile.email = profile._json?.email || profile._json?.[idField];

    if (config.has('adminGroup')) {
        profile.isAdmin = token.groups.includes(config.get('adminGroup'));
    }

    if (config.has('orgAttribute') && profile._json?.[config.get('orgAttribute')]) {
        profile.organization = profile._json[config.get('orgAttribute')];
    }

    if (config.has('requiredRoleToCreateRequest') && profile.groups.length > 0) {
        profile.canUpload = profile.groups.includes(config.get('requiredRoleToCreateRequest'));
    }

    const approverGroups = config.get("approverGroups");
    profile.isApprover = token.groups.some(group => approverGroups.includes(group));

    profile.refreshToken = refreshToken;

    if (profile.organization) {
        profile.isDataProvider = !profile.isApprover && !profile.isAdmin && profile.groups.includes(config.get('requiredRoleToCreateRequest'));
    }

    return profile;
}

const buildActivity = async function(profile){
  if (!profile.activity){
    profile.activity = {}
    if (profile.lastLogin){  
      const db = require('../db/db');
      const forumClient = require('../clients/forum_client');
      const mongoose = require('mongoose');

      const currentData = await forumClient.getTopics(profile, {});
      
      const topicResponse = {data: [...currentData.data]};

      const topics = topicResponse.data.filter(item => item.parent_id);
      
      const uploadIds = topics
        .map(item => mongoose.isValidObjectId(item.name) ? item.name : "")
        .filter(item => item && String(item).length > 0);

      const ups = await db.DataUploadSchema
        .find({_id: {$in: uploadIds}, upload_date: {$gt: profile.lastLogin}})
        .sort({ "upload_date": -1});
      
      profile.activity.uploads = ups;

      const currentComments = await forumClient.getAllComments(profile, profile.lastLogin);
      
      const cs = currentComments.filter(item => item.author_user !== profile.id)
        .map(async item => {
          let type = item.topic_name.substring(24);
          let record = null;
          let itemId = item.topic_name.substring(0,24)
          switch(type){
            case 'branch':
              record = await db.RepoBranchSchema.findOne({_id: itemId});
              break;

            case 'repo':
              record = await db.RepoSchema.findOne({_id: itemId});
              break;

            case 'varClass':
              record = await db.VariableClassification.findOne({_id: itemId});
              break;

            default:
              //upload
              record = await db.DataUploadSchema.findOne({_id: itemId});
              break;
          }
          if (record){
            item.name = record.name;
          }
          item.type = type;
          item.item_id = itemId
          return item;
        });

      profile.activity.comments = await Promise.all(cs);

      const repoIds = topics
        .map(item => {
          let id = item.name;
          if (!id || id.indexOf("repo") === -1){
              return;
          }
          
          id = id.substring(0,id.length-4);
          let oid = mongoose.Types.ObjectId(id);
          return oid;

        })
        .filter(item => item && String(item).length > 0);

      const rs = await db.RepoSchema
        .find({_id: {$in: repoIds}, create_date: {$gt: profile.lastLogin}})
        .sort({ "create_date": -1});
      
      profile.activity.repos = rs;
      
      const branchIds = topics
        .map(item => {
          let id = item.name;
          if (!id || id.indexOf("branch") === -1){
              return;
          }
          
          id = id.substring(0,id.length-6);
          let oid = mongoose.Types.ObjectId(id);
          return oid;

        })
        .filter(item => item && String(item).length > 0);

      const bs = await db.RepoBranchSchema
        .find({_id: {$in: branchIds}, create_date: {$gt: profile.lastLogin}})
        .sort({ "create_date": -1});
      
      profile.activity.branches = bs;
    }
  }

  return profile;
}

let oidcConfig = {passReqToCallback: true, ...config.get('oidc')};

//req, claims.iss, uiProfile, idProfile, context, idToken, accessToken, refreshToken, params, verified
var strategy = new OidcStrategy(oidcConfig, async function(req, issuer, uiProfile, idProfile, context, accessToken, refreshToken, params, done){
    if (req.user){
      return done(null, req.user);
    }

    if ( (typeof(idProfile) === "undefined") || (idProfile === null) ) {
      return done("No idProfile", null);
    }

    let decodedJWT = jwt.decode(accessToken);
    decodedJWT._json = JSON.parse(JSON.stringify(decodedJWT));

    let profile = buildProfile(decodedJWT, refreshToken);
  
    var db = require('../db/db');
    if (profile.email){
      try{
        var u = await db.User.findOne({email: profile.email});
        profile.lastLogin = u.lastLogin;
        profile.bcdcSet = u.bcdc_apiKey && u.bcdc_accessKey;
      }catch(ex){
        console.log("No previous user info oidc", ex);
      }
      try{
        profile = await buildActivity(profile);
      }catch(ex){
        console.log("fail building activity", ex);
      }
      
      
    }
  
    var user = {
      email: profile.email,
      name: profile.displayName,
      groups: profile.groups,
      lastLogin: new Date()
    }
  
    if (profile.email){
      db.User.updateOne({email: profile.email}, user, {upsert: true, setDefaultsOnInsert: true}, function(e,r){
        if (e){
          console.log("Error updating user info", e);
        }else{
          console.log("Updated user info");
        }
  
      });
    }
    
    req.user = profile;
    done(null, profile);
});
  
  
// set up passport
passport.use('oidc', strategy);

passport.use('jwt', new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
  passReqToCallback: true,
  ignoreExpiration: true
}, async function(req, jwtPayload, cb) {
  if (req.user){
    return cb(null, req.user);
  }

  var originalJwt = req.headers['authorization'].substring("Bearer ".length);
  var encodedJWT = originalJwt;
  if (!encodedJWT){
      cb("No JWT", null);
  }
  var decodedJWT = null;

  // invalid token - synchronous
  try {
      decodedJWT = jwt.verify(originalJwt, secret, {clockTolerance: 10000});
      decodedJWT.aud = config.get('jwtAud');
      decodedJWT._json = JSON.parse(JSON.stringify(decodedJWT));
      decodedJWT = buildProfile(decodedJWT, 'a');
  } catch(err) {
    console.log("Error resigning", err);
    return cb(err, null);
  }
    var db = require('../db/db');

    if (process.env.NODE_ENV !== "test" && decodedJWT.email){
      try{
        var u = await db.User.findOne({email: decodedJWT.email});
        decodedJWT.lastLogin = u.lastLogin;
        decodedJWT.bcdcSet = u.bcdc_apiKey && u.bcdc_accessKey;
      }catch(ex){
        console.log("No previous user info jwt", ex);
      }
      try{
        decodedJWT = await buildActivity(decodedJWT);
      }catch(ex){
        console.log("fail building activity", ex);
      }
      
    }
  //var userConf = config.get('user');
  if (!decodedJWT){
      cb("No JWT", null);
  }

  var user = {
    email: decodedJWT.email,
    name: decodedJWT.displayName,
    groups: decodedJWT.groups,
    lastLogin: new Date()
  }

  if (decodedJWT.email){
    db.User.updateOne({email: decodedJWT.email}, user, {upsert: true, setDefaultsOnInsert: true}, function(e,r){
      if (e){
        logger.error("Error updating user info", e);
      }else{
        logger.verbose("Updated user info jwt");
      }

    });
  }
      
  logger.verbose('user ' + decodedJWT.jwt + ' authenticated successfully');
  
  cb(null, decodedJWT);
}
));

module.exports = {
  passport: passport,
  buildProfile: buildProfile
}