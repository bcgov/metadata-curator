const passport = require('passport');
const passJwt = require('passport-jwt');
const JWTStrategy = passJwt.Strategy;
const ExtractJWT = passJwt.ExtractJwt;
var config = require('config');
var logger = require('npmlog');
var jwt = require('jsonwebtoken');
let OidcStrategy = require('passport-openidconnect').Strategy;


var secret = config.get("jwtSecret");

passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret,
        passReqToCallback: true,
    }, async function(req, jwtPayload, cb) {

        var originalJwt = req.headers['authorization'].substring("Bearer ".length);
        var encodedJWT = originalJwt;
        if (!encodedJWT){
            cb("No JWT", null);
        }
        var decodedJWT = null;

        // invalid token - synchronous
        try {
            decodedJWT = jwt.verify(originalJwt, secret);
            decodedJWT.aud = config.get('jwtAud');
            decodedJWT._json = JSON.parse(JSON.stringify(decodedJWT));
            decodedJWT = buildProfile(decodedJWT, 'a');
            var db = require('../db/db');
  
            if (process.env.NODE_ENV !== "test" && decodedJWT.email){
              try{
                var u = await db.User.findOne({email: decodedJWT.email});
                decodedJWT.lastLogin = u.lastLogin;
                decodedJWT.bcdcSet = u.bcdc_apiKey && u.bcdc_accessKey;
                decodedJWT = await buildActivity(decodedJWT);
              }catch(ex){
                console.log("No previous user info", ex);
              }
            }
        } catch(err) {
            console.log("Error resigning", err);
            return cb(err, null);
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
              console.log("Error updating user info", e);
            }else{
              console.log("Updated user info jwt");
            }
      
          });
        }
            
        logger.verbose('user ' + decodedJWT.jwt + ' authenticated successfully');
        
        cb(null, decodedJWT);
    }
));

var buildProfile = function(token, refreshToken){
    let profile = token;
    if (!profile._json){
      profile._json = {};
    }
    profile._json['aud'] = config.get('jwtAud');
    
    let cloneable = JSON.parse(JSON.stringify(token._json));
    delete cloneable.jwt;
    
    profile.jwt = jwt.sign(token._json, config.get('jwtSecret'));
    profile.isAdmin = false;
    let idField = config.get('userIdField');
  
    profile.isDataProvider = false;
    profile.isApprover = false;
    profile.groups = [];

    if ((typeof(token._json) !== "undefined") && (typeof(token._json.groups) !== "undefined")){
        profile.groups = token._json.groups;
    }

    if ((typeof(token._json) !== "undefined") && (typeof(token._json.email) !== "undefined")){
        profile.id =  token._json.email;
        profile.email = token._json.email;
    }

    if ((typeof(token._json) !== "undefined") && (typeof(token._json[idField]) !== "undefined")){
      profile.id = token._json[idField];
    }
    
    if (config.has('adminGroup')){
        profile.isAdmin = (token.groups.indexOf(config.get('adminGroup')) !== -1);
    }

    if ( (config.has('orgAttribute')) && (token._json[config.get('orgAttribute')]) ){
        profile.organization = token._json[config.get('orgAttribute')];
    }

    if ((config.has('requiredRoleToCreateRequest')) && (profile.groups.length>0)){
      profile.canUpload = (profile.groups.indexOf(config.get('requiredRoleToCreateRequest')) !== -1);
    }
    
    
    profile.refreshToken = refreshToken;

    const approverGroups = config.get("approverGroups");
    
    const foundApprover = token.groups.some(group => approverGroups.includes(group));
    
    if(foundApprover) {
        profile.isApprover = true; 
    }

    if(profile.organization) {
        // const alwaysNotifyList = new Map(Object.entries(config.get("alwaysNotifyList")));
        // console.log("alwaysNotifyList: ", alwaysNotifyList);
        // profile.isDataProvider = alwaysNotifyList.has(profile.organization) ? true : false;
        profile.isDataProvider = !profile.isApprover && !profile.isAdmin && (token.groups.indexOf(config.get('requiredRoleToCreateRequest')) !== -1);
    }

    return profile;
}

var buildActivity = async function(profile){

  if (!profile.activity){
    profile.activity = {}
    // profile.lastLogin = new Date("01/01/1900");
    if (profile.lastLogin){  
      var db = require('../db/db');
      var forumClient = require('../clients/forum_client');
      const mongoose = require('mongoose');

      let topics = [];
              
      let currentData = await forumClient.getTopics(profile, {});
      
      let topicResponse = {data: []};
      topicResponse.data = topicResponse.data.concat(currentData.data);

      topics = topicResponse.data.filter(item => item.parent_id);
      
      const uploadIds = topics.map( (item) => {
          if ( (item) && (item.name) && (String(item.name).indexOf("repo") === -1) && (String(item.name).indexOf("branch") ===-1) && (String(item.name).indexOf("varClass") === -1)){
              return item.name
          }
          return ""
      }).filter( (item) => {
          return (item && String(item).length > 0)
      });

      let ups = await db.DataUploadSchema.find({_id: {$in: uploadIds}, upload_date: {$gt: profile.lastLogin}}).sort({ "upload_date": -1});;
      profile.activity.uploads = ups;

      let currentComments = await forumClient.getAllComments(profile, profile.lastLogin);
      
      let cs = currentComments.filter ( item => {
        return item.author_user !== profile.id
      });

      for (key in cs){
        item = cs[key];
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
      }

      profile.activity.comments = cs


      const repoIds = topics.map( (item) => {
          let id = item.name;
          if (!id || id.indexOf("repo") === -1){
              return;
          }
          
          id = id.substring(0,id.length-4);
          let oid = mongoose.Types.ObjectId(id);
          return oid;

      }).filter( (item) => { 
          return (item && String(item).length > 0)
      });
      let rs = await db.RepoSchema.find({_id: {$in: repoIds}, create_date: {$gt: profile.lastLogin}}).sort({ "create_date": -1});;
      profile.activity.repos = rs;
      
      const branchIds = topics.map( (item) => {
          let id = item.name;
          if (!id || id.indexOf("branch") === -1){
              return;
          }
          
          id = id.substring(0,id.length-6);
          let oid = mongoose.Types.ObjectId(id);
          return oid;

      }).filter( (item) => { 
          return (item && String(item).length > 0)
      });
      let bs = await db.RepoBranchSchema.find({_id: {$in: branchIds}, create_date: {$gt: profile.lastLogin}}).sort({ "create_date": -1});;
      profile.activity.branches = bs;

    }
  }

  return profile;
}

let oidcConfig = {passReqToCallback: false, ...config.get('oidc')};

var strategy = new OidcStrategy(oidcConfig, async function(issuer, sub, profile, accessToken, refreshToken, done){
    
    if ( (typeof(accessToken) === "undefined") || (accessToken === null) || (typeof(refreshToken) === "undefined") || (refreshToken === null) ){
      console.log("No token");
      return done("No access token", null);
    }

    profile = buildProfile(profile, refreshToken);
  
    var db = require('../db/db');
  
    if (profile.email){
      try{
        var u = await db.User.findOne({email: profile.email});
        profile.lastLogin = u.lastLogin;
        profile.bcdcSet = u.bcdc_apiKey && u.bcdc_accessKey;
        profile = await buildActivity(profile);
      }catch(ex){
        console.log("No previous user info", ex);
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
    
  
    console.log("setting profile", profile);
    done(null, profile);
});
  
  
// set up passport
passport.use('oidc', strategy);

module.exports = {
  passport: passport,
  buildProfile: buildProfile
}