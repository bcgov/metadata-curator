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

let backendRouter = require('./routes/backendRouter');

let app = express();

app.use(logger('dev'));
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

  var env = process.env.NODE_ENV || 'development';

  if(env == 'development' && config.hasOwnProperty("testJwt")
      && config.get('testJwt') && config.get('testJwt').length > 0) {
    console.log("dev mode");
    const testJwt = config.get("testJwt");
    // console.log("testJwt: ", testJwt);
    const secret = config.get("jwtSecret");
    var orgAttribute = config.has('orgAttribute') ? config.get('orgAttribute') : false;

    profile = genProfileFromJwt(profile, testJwt, secret, orgAttribute);
    profile.refreshToken = refreshToken;
  }
  else {
    profile.jwt = accessToken;
    profile.refreshToken = refreshToken;
  }

  // console.log("setting token: ", profile);

  if ( (typeof(accessToken) === "undefined") || (accessToken === null) || (typeof(refreshToken) === "undefined") || (refreshToken === null) ){
    return done("No access token", null);
  }
  return done(null, profile);
});


// set up passport
passport.use('oidc', strategy);

var genProfileFromJwt = function(profile, jwt, secret, orgAttribute) {
  var jwtLib = require('jsonwebtoken');
  var decoded = jwtLib.verify(jwt, secret);
  console.log("decoded token: ", decoded);

  profile.displayName = `${decoded.GivenName} ${decoded.Surname}`;
  profile.name = {
    familyName: decoded.Surname,
    givenName: decoded.Givenname,
    middleName: undefined
  };

  if (orgAttribute){
    profile.organization = decoded[orgAttribute] ? decoded[orgAttribute] : false;
  }

  profile.groups = decoded.Groups;
  profile.email = decoded.Email;

  profile._json = decoded;
  profile.jwt = jwt;

  return profile;
}

app.use('/api', backendRouter);

app.use(history({
  index: 'dist/index.html'
}));

module.exports = app;
