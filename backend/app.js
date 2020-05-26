let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let config = require('config');
let session = require('express-session');
let passport = require('passport');
let OidcStrategy = require('passport-openidconnect').Strategy;
let history = require('connect-history-api-fallback');
require('./db/db').init();
require('./auth/auth');
const env = process.env.NODE_ENV || 'development';

let backendRouter = require('./routes/backendRouter');

let log = require('npmlog');
log.level = config.get('logLevel');
log.addLevel('debug', 2900, { fg: 'green' });



let app = express();


if(env != 'test') { app.use(logger('dev')); }
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));


app.use(session({
  secret: config.get('sessionSecret'),
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
    secure: false,
    sameSite: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, next) => {
  next(null, user);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});

var strategy = new OidcStrategy(config.get('oidc'), function(issuer, sub, profile, accessToken, refreshToken, done){

  var jwt = require('jsonwebtoken');
  profile.jwt = jwt.sign(profile._json, config.get('jwtSecret'));

  profile.isAdmin = false;

  profile.isDataProvider = false;
  profile.isApprover = false;
  profile.groups = [];
  if ((typeof(profile._json) !== "undefined") && (typeof(profile._json.groups) !== "undefined")){
    profile.groups = profile._json.groups;
  }

  if (config.has('adminGroup')){
    profile.isAdmin = (profile.groups.indexOf(config.get('adminGroup')) !== -1);
  }

  
  profile.refreshToken = refreshToken;

  if(env == 'development' && config.hasOwnProperty("testJwt")
      && config.get('testJwt') && config.get('testJwt').length > 0) {
    console.log("dev mode");
    const testJwt = config.get("testJwt");
    // console.log("testJwt: ", testJwt);
    const orgAttribute = config.has('orgAttribute') ? config.get('orgAttribute') : false;
    const secret = config.get("jwtSecret");
    profile = genProfileFromJwt(profile, testJwt, secret, orgAttribute);
    profile.refreshToken = refreshToken;
  }

  const approverGroups = config.get("approverGroups");
  // console.log("approverGroups: ", approverGroups);
  const foundApprover = profile.groups.some(group => approverGroups.includes(group));
  if(foundApprover) {profile.isApprover = true; }
  // console.log("foundApprover: " + foundApprover);


  if(profile.organization) {
    const alwaysNotifyList = new Map(Object.entries(config.get("alwaysNotifyList")));
    // console.log("alwaysNotifyList: ", alwaysNotifyList);
    profile.isDataProvider = alwaysNotifyList.has(profile.organization) ? true : false;
  }

  // console.log("setting token: ", profile);

  if ( (typeof(accessToken) === "undefined") || (accessToken === null) || (typeof(refreshToken) === "undefined") || (refreshToken === null) ){
    console.log("No token");
    return done("No access token", null);
  }

  console.log("setting profile");
  return done(null, profile);
});


// set up passport
passport.use('oidc', strategy);

var genProfileFromJwt = function(profile, jwt, secret, orgAttribute) {
  var jwtLib = require('jsonwebtoken');
  var decoded = jwtLib.verify(jwt, secret);
  // console.log("decoded token: ", decoded);

  profile.displayName = `${decoded.GivenName} ${decoded.Surname}`;
  profile.name = `${decoded.GivenName} ${decoded.Surname}`;

  if (orgAttribute){
    profile.organization = decoded[orgAttribute] ? decoded[orgAttribute] : false;
  }

  profile.groups = decoded.Groups;
  profile.email = decoded.Email;

  profile._json = decoded;
  profile.jwt = jwt;

  return profile;
}

if (env === "test") {
    // use JWT auth for testing, rather than OIDC
    app.use('/api', passport.authenticate(['jwt']));
}

app.get('/', (req, res) => { res.redirect('/api/v1/api-docs'); });

app.use('/api', backendRouter);

app.use('/api', (err, req, res, next) => {
    log.debug(typeof err);
    log.debug(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    const response = {
        status: err.status,
        message: err.message
    }

    if (err.errors) {
        response['errors'] = err.errors;
    }
    res.status(err.statusCode).json(response);
});

app.use(history({
  index: 'dist/index.html'
}));

module.exports = app;
