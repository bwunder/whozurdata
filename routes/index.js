var express = require('express'),
    url = require('url'),
    app = express(),
    router = express.Router(),
    path = require('path'),
    fs = require('fs'),
    root = process.cwd(),  // NEVER send root to browser
    result = {}; 


router.get('*', function(req, res, next) {
  var urlParse = url.parse(decodeURI(req.url)||'/', true);
  result = {urData: module.parent.exports.settings.data,
            cur: path.parse(path.normalize(!urlParse.query.cur? '/': urlParse.query.cur)),  
            cwd: '/', 
            dirs: [],
            files: [],
            inquiry: { url: req.url,
                       agent: req.headers['user-agent'],
                       IP: req.socket._socketPeer || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                       path: urlParse.pathname,
                       query: urlParse.query },
            reply: []};
  if (result.urData.methods.recipher(result.urData)) {
    result.cwd = fs.statSync(path.join(root, result.cur.dir, result.cur.base)).isFile()? result.cur.dir: path.join(result.cur.dir, result.cur.base);
    var members = fs.readdirSync(path.join(root, result.cwd));
    members.forEach(function (member) {
console.log('member',member);
      if (fs.statSync(path.join(root, result.cwd, member)).isDirectory()) {
        if (['.c9', '.git', 'node_modules', 'demoCA'].indexOf(member)===-1) {
            result.dirs.push(member);
        }
      }
      else { 
        if (['.gitignore', 'newkey.pem', 'newreq.pem', 'newcert.pem'].indexOf(member)===-1) {
            result.files.push(member);
        }
      }
    });
  } 
  next();
});

router.get('/store', function(req, res, next) {
  if (result.inquiry.query.db != result.urData.db) {
    if (result.urData.stores[result.inquiry.query.db]) {
      result.urData.db = result.inquiry.query.db;
    }
  }
  next();
});

router.get('/buffers', function(req, res, next) {
  if (result.inquiry.query.attribute) {
    if (result.inquiry.query.attribute==='urData') {
        result.reply = result.urData;
    }
    else if (result.inquiry.query.attribute==='bootstrap') {
        result.reply = fs.readFileSync('./urData.js', 'utf-8');
    }
    else {
        result.reply = result.urData[result.inquiry.query.attribute];
    }
  }
  else if (result.inquiry.query.property) {
    if (result.inquiry.query.property=== 'store') {
        result.reply = result.urData.stores[result.urData.db];
    }
    else if (result.inquiry.query.property==='bootstrap') {
        result.reply = fs.readFileSync('./stores/' + result.urData.db + '.js', 'utf-8');
    }
    else {
        result.reply = result.urData.stores[result.urData.db][result.inquiry.query.property];
    }
  }
  next();
});

router.get('/files', function(req, res, next) {
  // directory is loaded to form in get(*) 
  if (fs.statSync(path.join(root, result.cur.dir, result.cur.base)).isFile()) {
    result.reply= fs.readFileSync(path.normalize(path.join(root, result.cur.dir, result.cur.base)), 'utf8');
  }
  next();
});

router.get('/query', function(req, res, next) {
  result.urData.db = result.urData.stores[result.inquiry.query.db]? result.inquiry.query.db: result.urData.db;
  // one key matches need to be one element arrays
  result.inquiry.query.names = result.inquiry.query.names || Object.keys(result.urData.stores);
  if (typeof result.inquiry.query.names==='string' ) {
    result.inquiry.query.names = [result.inquiry.query.names];
  }
  result.inquiry.query.keys = result.inquiry.query.keys || Object.keys(result.urData.stores[result.urData.db]);
  if (typeof result.inquiry.query.keys==='string' ) {
    result.inquiry.query.keys = [result.inquiry.query.keys];
  }
  result.reply = result.urData.stores[result.urData.db].query[result.inquiry.query.proc](result.inquiry.query.names,result.inquiry.query.keys);
  next();
});

router.get('/chat', function(req, res, next) {

console.log('/chat', result);

  next();
});

router.get('*', function(req, res, next) {
  res.render('index', result);
  res.end;
});

module.exports = router;
