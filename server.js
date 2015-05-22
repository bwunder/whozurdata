
var domain = require('domain'),
    fs = require('fs'),
    url = require('url'),
    favicon = require('serve-favicon')('page/twohead.ico'),
    topDomain = domain.create(),
    options = { key: fs.readFileSync('page/key.pem'), // not used on c9.io
                cert: fs.readFileSync('page/cert.pem'),
                passphrase: 'test' }; //  remove to prompt, do not hardwire in live system

topDomain.run(function(data) {
  setTimeout(function() {
    var urData = require('./urData');
    urData.domain = topDomain;
    var srv, app;

    var urCallback = function (req, res) {   
      urData.domain.emit('request', {url: req.url});
      favicon(req, res, function onNext() {
        urData.request = url.parse(decodeURI(req.url), true);
        urData.request.IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        urData.request.agent = req.headers['user-agent'];
        urData.route = urData.request.query.proc || urData.request.pathname; 
        urData.domain.emit('request', urData.route);
        try {
          if (typeof urData.request.query.db != 'undefined') {
            // urData.db set to undefined if no db in query
            urData.db = urData.request.query.db;
            if (urData.storeNames.indexOf(urData.db) === -1) {
              throw(['invalid target store: ' + urData.db].join('') );
            }
          }
          else {
            urData.request.query.db = urData.db || urData.stores[0].name;
          }
          if (typeof urData.request.query.names === 'undefined') {
            // default to urData.db
            urData.request.query.names = [urData.db];
          }    
          else if (typeof urData.request.query.names == 'string') {
            urData.request.query.names = [urData.request.query.names];
          }
          if (typeof urData.request.query.attributes === 'undefined' 
                && typeof urData.request.query.keys === 'undefined') {
            // default to keys of urData.db
            urData.request.query.keys = Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)]);
          }    
          else if (typeof urData.request.query.keys == 'string') {
            urData.request.query.keys = [urData.request.query.keys];
          }
          else if (typeof urData.request.query.attributes == 'string') {
            urData.request.query.attributes = [urData.request.query.attributes];
          }
          if (urData.methods.verifySchema(urData)) {
            res.returnCode = 200;
            res.write(urData.render(urData));
          }
        }
        catch (e) {
          urData.domain.emit('error', e );
          res.returnCode = 500;
        }
        res.end();
      });
    };

    var io = require('socket.io').listen(app);

    topDomain.on('newListener', function(data){
      console.dir({newListener: data});
    });
    console.dir({'add Listener': 'newListener'});
    topDomain.on('error', function(err) {
      console.log(err.stack);
      topDomain.emit('shutDown');      
    });
    topDomain.intercept('error', function(err) {
      console.log("intercept", err.stack);
//      topDomain.emit('shutDown');      
    });
    topDomain.on('removeListener', function(data){
      console.dir({removeListener: data});
    });
    topDomain.on('request', function(data){
      console.dir({'request': data});
    });
    topDomain.on('app', function(data){
      console.dir({app: data});
    });
    topDomain.once('startUp', function(){
      urData.methods.importStores(urData);
      urData.methods.importRoutes(urData);
      urData.methods.importRender(urData);
      if (process.env.C9_IP) {
        srv = require('http');
        app = srv.createServer(topDomain.bind(urCallback)); 
        urData.domain.emit('app', {srv: 'http'});
      }
      else {
        srv = require('https');
        app = srv.createServer(options, topDomain.bind(urCallback));
        urData.domain.emit('app', {srv: 'https'});
      }
      module.export = urData;
      app.listen(urData.options.port);
      urData.domain.emit('app', { 
        startup: {
          name:'whozUrData', 
          port: urData.options.port,
          version:urData.version, 
          license: urData.license
        }
      });
    });
    topDomain.on('query', function(data){
      console.dir('query', data);
    });
    topDomain.on('shutDown', function() {
      console.dir({shutDown: 'requested'});
      try {
        var killtimer = setTimeout(function() {
          process.exit(1);
        }, 15000);
        killtimer.unref();
        if (app) app.close();
      } catch (er2) {
        // oh well, not much we can do at this point.
        console.error('shut down Error!', er2.stack);
      }
    });
    topDomain.emit('startUp');
  },500);
  process.on('uncaughtException', function(err){
      console.log('uncaughtException', err.stack);
      topDomain.emit('shutDown');
  });
  process.once('exit', function(exitCode){
    console.log('process exit code: ' + exitCode);
    topDomain.emit('shutDown');
  });
});

