// events are bound to a common connection object through a domain
// applications consume data through a semi-structured array of data stores available to the node server 
// a store consists of a local module that imports a packaged driver from npmjs.org  
// the driver requires an active data    
var name = 'whozurdata',
    domain = require('domain'),
    fs = require('fs'),
    url = require('url'),
    favicon = require('serve-favicon')('page/twohead.ico'),
    urDominion = domain.create(),
    options = { key: fs.readFileSync('page/key.pem'), // not used on c9.io
                cert: fs.readFileSync('page/cert.pem'),
                passphrase: 'test'}; //  remove to prompt, do not hardwire in live system

// object is first thing created inside the domain
urDominion.run(function(data) {
  setTimeout(function() {
    var urData = require('./urData');
    // set this domain as the domain carried in urData
    urData.domain = urDominion;  

    // domain scoped variable initialized in startup event handler
    var srv, app, io;

    var urCallback = function (req, res) {   
      favicon(req, res, function onNext() {
        urData.domain.emit('request', { url: req.url });
        urData.request = url.parse(decodeURI(req.url), true);
        urData.request.IP = req.socket._socketPeer || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        urData.request.agent = req.headers['user-agent'];
        urData.domain.emit('unitTest', {'request': urData.request});
        urData.route = urData.request.query.proc || urData.request.pathname; 
        urData.domain.emit('unitTest', {'route': urData.route});
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
            res.statusCode = 200;
            res.write(urData.render(urData));
          }
          else {
            res.statusCode =  500;
            urData.domain.emit('error', 'schema requirements are not met' );
          }
        }
        catch (e) {
          res.statusCode = 500;
          urData.domain.emit('error', e );
        }
        res.end();
      });
    };

    urDominion.on('newListener', function(data){
      urDominion.emit('unitTest', {'add Listener':data});
    });
    urDominion.on('unitTest', function(data){
      if (urData.options.unitTest) {
        console.dir({unitTest: data});
      }
    });
    urDominion.emit('newListener','newListener');
    urDominion.emit('newListener','unitTest');
    urDominion.on('error', function(err) {
      console.log(err.stack);      
      urDominion.emit('shutDown');      
    });
    urDominion.intercept('error', function(err) {
      console.log("intercept", err.stack);
//      urDominion.emit('shutDown');      
    });
      urDominion.on('removeListener', function(data){
      urDominion.emit('unitTest', {removeListener: data});
      });
    urDominion.on('request', function(data){
      console.dir({time: new Date(), 'request': data});
    });
    urDominion.on('app', function(data){
      console.dir({time: new Date(), app: data});
    });
    urDominion.on('query', function(data){
      console.dir('query', data);
    });
    urDominion.on('shutDown', function() {
      try {
        urData.socket.emit('chat message', 'shutting down server');
        var killtimer = setTimeout(function() {
          process.exit(1);
        }, 6000);
        //broadcast a shutdown
console.dir(urData);
        killtimer.unref();
        if (app) app.close();
      } catch (er2) {
        // oh well, not much we can do at this point.
        console.error('shut down Error!', er2.stack);
      }
    });

//??

    urDominion.once('startUp', function(){

      urData.methods.importStores(urData);
      urData.methods.importRoutes(urData);
      urData.methods.importRender(urData);
      if (urData.methods.verifySchema(urData)) {
        if (process.env.C9_IP) {
          srv = require('http');
          app = srv.createServer(urDominion.bind(urCallback)); 
        }
        else {
          srv = require('https');
          app = srv.createServer(options, urDominion.bind(urCallback));
        }
        urData.domain.emit('unitTest', {'protocol': srv.globalAgent.protocol});
        io = require('socket.io').listen(app);
        io.on('connection', function(socket){
            
          // server (io) broadcasts connection, incoming message and disconnect
          // urData changes should also be push out via the socket
          var message =  {address: socket.conn.remoteAddress, 'connectDT': Date()};        
//          io.emit('chat message', message);
          while (urData.mtail.length > urData.options.mtailsize) urData.mtail.shift();
          urData.mtail.push(message);
  
          socket.on('chat message', function(message){
            // msg needs to get date stamp when created
            if (typeof message === 'string') {
              message =  {'message': message};
            } 
            message.clientAddress =  socket.client.conn.remoteAddress;
            message.broadcastDT = Date();
// how to exclude sender's message.clientAddress? 
            io.emit('chat message', message);
            while (urData.mtail.length > urData.options.mtailsize) urData.mtail.shift();
            urData.mtail.push(message);
            urData.domain.emit('unitTest', message);
//            console.log('chat', message);
            // log to a db? which one is best for logging? should not be on node server for recoverability
          });

          socket.on('object change', function(change){ 
            // should I omit the originator or better to send everything to all? 

console.log("socket's object change event has fired at server");
            socket.broadcast.emit('object change', change);
          });

          socket.on('disconnect', function(){
            urData.domain.emit('unitTest', 'disconnect');
            var message =  {address: socket.conn.remoteAddress, 'disconnectDT': Date()};        
            io.emit('chat message', message);
            while (urData.mtail.length > urData.options.mtailsize) urData.mtail.shift();
            urData.mtail.push(message);
          });

          urData.socket = socket;
          urData.socket.emit('chat message', message);        

        });

        app.listen(urData.options.port);
        urData.methods.getServerIPV4s(urData);

        module.export = urData;

        urData.domain.emit('app', { 
          name: name, 
          version:urData.version, 
          protocol: srv.globalAgent.protocol,
          IPv4: urData.options.IP.toString(),
          port: urData.options.port,
          license: urData.license
        });
      }
    });
    // push your own buttons
    urDominion.emit('startUp');
  },1500);
  process.on('uncaughtException', function(err){
      console.log('uncaughtException', err.stack);
      urDominion.emit('shutDown');
  });
  process.on('exit', function(exitCode){
    console.log('process exit code: ' + exitCode);
    urDominion.emit('shutDown');
  });
});

