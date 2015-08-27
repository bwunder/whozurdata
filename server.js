var name = 'whozurdata',
    domain = require('domain'),
    fs = require('fs'),
    url = require('url'),
    favicon = require('serve-favicon')('page/twohead.ico'),
    urDomain = domain.create(),
    srv = (process.env.C9_IP)? require('http'): require('https'),
    options = (process.env.C9_IP)? {}: { key: fs.readFileSync('page/newkey.pem'), 
                                         cert: fs.readFileSync('page/newcert.pem'),
                                         passphrase: 'test'};
// !! remove passphrase to be prompted at tls startup

urDomain.run(function() {
  // init buffer object from source file and within domain scope
  // then overload with a snapshot or from urData.db as is appropriate       
  var urData = require('./urData');
  urData.domain = urDomain;  
  var app;
  
  var urCallback = function (req, res) {   
    if (req.url === '/page/bundle.js') {
      // serve the requested file
      res.setHeader('content-type', 'application/javascript');
      res.end(fs.readFileSync(__dirname + req.url, 'utf8'));
    }
    else {
      favicon(req, res, 
        function onNext() {
          try {
            urData.request = url.parse(decodeURI(req.url), true);
            urData.request.IP = req.socket._socketPeer || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            urData.request.agent = req.headers['user-agent'];
// move parse to the emitter
        urData.domain.emit('request', {'IP': urData.request.IP, 'agent': urData.request.agent, 'url': req.url});
            urData.domain.emit('test', {'request': urData.request});
            urData.route = urData.request.query.proc || urData.request.pathname; 
            urData.domain.emit('test', {'route': urData.route});
            if (typeof urData.request.query.db != 'undefined') {
              // urData.db set to undefined if no db in query
              urData.db = urData.request.query.db;
              if (urData.storeNames.indexOf(urData.db) === -1) {0
                throw(['invalid target store: ' + urData.db].join('') );
              }
            }
            else {
              urData.request.query.db = urData.db || urData.stores[0].name;
            }
            if (typeof urData.request.query.names === 'undefined') {
              // default to current
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
            res.statusCode = 200;
            res.write(urData.render(urData));
          }
          catch (e) {
            res.statusCode = 500;
            urData.domain.emit('error', e );
          }
          res.end();
      });
    }  
  };
  
  urDomain.on('newListener', function(data){
    urDomain.emit('test', {'add Listener':data});
  });
  urDomain.on('test', function(data){
    if (urData.options.test) {
      console.dir({time: new Date().toLocaleTimeString(), test: data});
    }
  });
  urDomain.emit('newListener','newListener');
  urDomain.emit('newListener','test');
  urDomain.on('error', function(err) {
    console.log(err.stack);      
    urDomain.emit('shutDown');      
  });
  urDomain.on('removeListener', function(data){
    urDomain.emit('test', {removeListener: data});
  });
  urDomain.on('request', function(data){
    console.log('request', new Date().toLocaleTimeString(), data.IP, data.agent, '\n\t' + data.url);
  });
  urDomain.on('app', function(data){
    console.log('app', new Date().toLocaleTimeString(), data);
  });
  urDomain.on('peerServer', function(data){
    console.log('peerServer', new Date().toLocaleTimeString(), data);
  });
  urDomain.on('journal', function(data){
    // must be journaled in order to replicate
    console.log('journal', new Date(data.emitDate), data.senderAddress, (data.sender)?data.sender:'', data.message);
  // TODO!! mark, commit, concur, verify as copied to each
  });
  urDomain.on('query', function(data){
    console.dir({querytime: new Date().toLocaleTimeString(), query: data});
  });
  urDomain.on('shutDown', function() {
    try {
      if (urData.socket.emit) {
        urData.socket.emit('chat message', {
          sender: 'server', 
          message: 'server shut down', 
          emitDate: new Date() 
        });
      } 
      var killtimer = setTimeout(function() {
        urDomain.removeAllListeners();    
        console.info('whozurdata is shut down');
        process.exit(1);
      }, 15000);  // set longer if needed
      killtimer.unref();
      if (app) {
        app.close();
      }  
    } catch (er2) {
      // oh well, not much we can do at this point.
      console.error('[and yet another] error during shut down!', er2.stack);
    }
  });
  urDomain.once('startUp', function() {
    // flesh out object then open a socket
    urData.methods.importStores(urData);
    urData.methods.importRoutes(urData);
    urData.methods.importRender(urData);
  
    if (urData.methods.verifySchema(urData)) {
      if (srv.globalAgent.protocol.indexOf('https') === 0) {
        app = srv.createServer(options, urDomain.bind(urCallback));
      }
      else {
        app = srv.createServer(urDomain.bind(urCallback)); 
      }
      // eveything sharing one key and cert but doesn't HAVE to     
      urData.io = require('socket.io').listen(app);
//      p2pServer = require('socket.io-p2p-server').Server;

// TODO! if the server needs to be a socket or a peer 
//        urData.socket.id = new socket??;
//        urData.p2p = require('socket.io-p2p'); // will throw "window is not defined" error
//        urData.peer = new peer??;

// socket.io-p2p http://socket.io/blog/socket-io-p2p/#more-738 7-14-15  
//var p2p = new P2P(socket);
//var p2pServer = require('socket.io-p2p-server').Server;

var connectionUrl = '/chat';
var nomspace = urData.io.of(connectionUrl);
nomspace.on('connection', function(socket){
  console.log(socket.id, 'connected');
});
nomspace.emit('hi', 'everyone!');


        urData.io.on('connection', function(socket){
          var connectMessage =  {
            senderAddress: socket.client.conn.remoteAddress, 
            socket: socket.id,
            message: 'connect', 
            emitDate: new Date() 
          };        
          socket.on('chat message', function(message){
// TODO!  encrypt this
            var cmessage = {'cmessage': message};
            if (typeof message === 'string') {
              message =  {'message': message};
            } 
            // remote address as detected by server
            message.senderAddress =  socket.client.conn.remoteAddress;
            // msg gets date stamp when emitted 
            if (!message.emitDate) {
              message.emitDate = new Date();
              message.postDated = true;
            }             urData.domain.emit('journal', message);

            // trim the recent history object array then append this message
            while (urData.messageLog && urData.messageLog.length > urData.options.mtailsize) urData.messageLog.shift();
            urData.messageLog.push(cmessage);
            // TODO!  commit & concur each message as it is seen at the server 
            
            urData.io.sockets.emit('chat message', message);

            // chat emits could emit into the domain and file system in this handler - then avoid both elsewhere   
            // chat log is saved to urData.db and may be concurred elsewhere
            urData.domain.emit('journal', message);
            urData.io.sockets.emit('chat message', connectMessage);
          });

          socket.on('disconnect', function(data){
            var disconnectMessage =  {senderAddress: socket.client.conn.remoteAddress, message: ['disconnect socket:', socket.id, data].join(' '), emitDate: new Date()};        
            urData.domain.emit('journal', disconnectMessage);
            urData.io.emit('chat message', disconnectMessage);
          });

          urData.io.sockets.emit('chat message', connectMessage);
          
          socket.on('error', function (err) {
            urData.domain.emit('error', err);
console.log('@server.js io socket.on(error...', err.stack, '\n\ntake this out after you see socket escalate error into urDomain');
          });

          // attach server's socket to urData?
        });

        app.listen(urData.options.port);
        urData.methods.getServerIPV4s(urData);

        module.export = urData;

        urData.domain.emit('test', { 
          name: name, 
          version: urData.version, 
          protocol: srv.globalAgent.protocol,
          IPv4: urData.options.IP.toString(),
          port: urData.options.port,
          license: urData.license
        });
        urData.domain.emit('app', ['listening for ', srv.globalAgent.protocol, 'requests at',
                                   urData.options.IP.join(', '), 'on port ', urData.options.port].join(' '));
      }
    });
    // push your own buttons
  setTimeout(function() {
    urDomain.emit('startUp');
  }, 500);

  process.on('uncaughtException', function(err){
    urDomain.emit('error', err);
  });
  process.on('exit', function(exitCode){
    if (urDomain.listeners) {
      urDomain.emit('shutDown');
    }
    else {
      console.log(process.title);
      console.log('process', process.title, '\nexit code:', exitCode);
    }
  });
});

