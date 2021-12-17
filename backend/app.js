const env = process.env.NODE_ENV || 'development';
if (env !== "production"){
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
  require('https').globalAgent.options.rejectUnauthorized = false;
}

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let config = require('config');
let session = require('express-session');
let history = require('connect-history-api-fallback');
if (process.env.NODE_ENV !== "test"){
  require('./db/db').init();
}
let passport = require('./auth/auth');

let backendRouter = require('./routes/backendRouter');

let log = require('npmlog');
log.level = config.get('logLevel');
log.addLevel('debug', 2900, { fg: 'green' });

let app = express();

let logLevel = "dev";
if (config.has("morganLogType")){
  logLevel = config.get("morganLogType");
}

if (logLevel !== 'none'){
  app.use(logger(logLevel));
}

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

app.use(history({
  index: 'dist/index.html'
}));

module.exports = app;
