var ecstatic = require('ecstatic');
var fs = require('fs');
/*
var server = require('http').createServer(
*/
var options = { key: fs.readFileSync('key.pem'), 
                cert: fs.readFileSync('cert.pem'),
                passphrase: 'test'};
var server = require('https').createServer(
  options,
  ecstatic({ root: __dirname })
);
var p2pserver = require('socket.io-p2p-server').Server;
var io = require('socket.io')(server);

server.listen(3030, function() {
  console.log("Listening on 3030");
});

io.use(p2pserver);

io.on('connection', function(socket) {
  socket.on('peer-msg', function(data) {
    console.log(socket.id, 'Message from peer:', data, socket);
    socket.broadcast.emit('peer-msg', data);
  })

  socket.on('go-private', function(data) {
    socket.broadcast.emit('go-private', data);
  })
})
