let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let config = require('config');
let session = require('express-session');
let passport = require('passport');
let history = require('connect-history-api-fallback');
require('./db/db').init();
require('./auth/auth');
const env = process.env.NODE_ENV || 'development';

let backendRouter = require('./routes/backendRouter');

let log = require('npmlog');
log.level = config.get('logLevel');
log.addLevel('debug', 2900, { fg: 'green' });

let app = express();

let logLevel = "dev";
if (config.has("morganLogType")){
  logLevel = config.get("morganLogType");
}
app.use(logger(logLevel));

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

app.get("/api/version", async function(req, res){
  if (req.query.type){
    if (req.query.type.toLowerCase() === "forum"){
      const forumClient = require('./clients/forum_client');
      let v = await forumClient.getVersion();
      return res.json(v.data);

    }else if (req.query.type.toLowerCase() === "formio"){
      // const formioClient = require('./clients/formio_client');
      // let v = await formioClient.getVersion();
      // console.log('vvv', v.data);
      // return res.json(v.data);
    }else if (req.query.type.toLowerCase() === "minio"){
    }else if (req.query.type.toLowerCase() === "tusd"){
      let config = require('config');
      const tusUrl = config.get("uploadUrl");
      const axios = require('axios');

      let baseUrl = tusUrl.substring(0, tusUrl.lastIndexOf("/"))

      const url = `${baseUrl}`;
      let r = await axios.get(url);
      let resp = r.data;

      let vTag = 'Version = ';
      let start = resp.indexOf(vTag);
      let end = resp.indexOf("\n", start);
      let num = vTag.length;
      let v = resp.substring(start+num, end)

      let cTag = 'GitCommit = ';
      start = resp.indexOf(cTag);
      end = resp.indexOf("\n", start);
      num = cTag.length;
      let c = resp.substring(start+num, end)

      let bTag = 'BuildDate = ';
      start = resp.indexOf(bTag);
      end = resp.indexOf("\n", start);
      num = bTag.length;
      let b = resp.substring(start+num, end)

      return res.json({v: v, hash: c, built: b, name: 'tusd'});
    }
  }

  var hash = (process.env.GITHASH) ? process.env.GITHASH : "";
  var pjson = require('./package.json');
  var v = pjson.version;

  var version = v
  if (hash !== ""){
      version += "-"+hash
  }

  res.json({
      v: v,
      hash: hash,
      version: version,
      name: 'Metadata Curator'
  })
});

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
