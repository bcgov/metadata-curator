let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let config = require('config');
let session = require('express-session');
let passport = require('passport');
let OidcStrategy = require('passport-openidconnect').Strategy;
let history = require('connect-history-api-fallback');

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
  profile.jwt = accessToken;
  profile.refreshToken = refreshToken;


  if ( (typeof(accessToken) === "undefined") || (accessToken === null) || (typeof(refreshToken) === "undefined") || (refreshToken === null) ){
    return done("No access token", null);
  }
  return done(null, profile);
});


// set up passport
passport.use('oidc', strategy);


app.use('/api', backendRouter);

app.use(history({
  index: 'dist/index.html'
}));

module.exports = app;