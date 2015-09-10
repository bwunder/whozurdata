var io = require('socket.io-client');
var P2P = require('socket.io-p2p');
var socket = io();
console.dir(socket);
var p2p = new P2P(socket);
console.dir(p2p);

function sendMsg() {
  var message = { message: document.getElementById('m').value , 
                  sender: document.getElementById('nickname').value,
                  db: document.getElementById('db').value,
                  emitDate: new Date()
                }; 
  socket.emit('chat message', message);
  document.getElementById('m').value = '';
}
  
// server sends the latest few messages it has seen on load
// after that, this client keeps everything seen until page is closed or reloaded
socket.on('chat message', function(message){
  // peer-to-peer cryptography - messages could be encrypted here as a blob or individual columns 
  // not even server could decipher without pkey of cert(s) used or breaking the encryption 
  // server web comms are also using self-signed openSSL cert for HTTPS tunnel if possible
  // Cloud 9 for example accepts HTTP servers only for attachment to their man-in-the-middle HTTPS  
  var dt = document.createElement('dt');
  dt.appendChild(document.createTextNode([new Date(message.emitDate).toLocaleTimeString(), 
                                         message.senderAddress,
                                         message.sender].join(' ')));
  document.getElementById('messageList').appendChild(dt); 
  var dd = document.createElement('dd');
  dd.appendChild(document.createTextNode(message.message));
  document.getElementById('messageList').appendChild(dd); 
});

function resize(that) {
  // caller (this/that) is a button in legend if fieldset in div, min the div
  var socketio = document.getElementById('socketio');
  if (socketio.contains(that)) {
    // button is in socketio div
    socketio.style.height = '2em';
    socketio.style.overflow = 'hidden';
  }
  var peerjs = document.getElementById('peerjs');
  if (peerjs.contains(that)) {
    peerjs.style.height = '2em';
    peerjs.style.overflow = 'hidden';
  }
}

function disconnect(that) {
  // caller (this/that) is a button - parent is legend - parent is a fieldset - parent is div#socketio
  socket.disconnect();
}

function getDb() {
  return document.getElementById('db').value;
}

function getModule(that) {
  that.form.action = '/module?db=' + getDb();  
  that.form.submit();    
}

function getObject(that) {
  that.form.action = '/urData';  
  that.form.submit();    
}

function openDoc(that) {
  that.form.target = '_blank';
  that.form.action = that.value;  
  that.form.submit();    
}

function openSource(that) {
  that.form.target = '_blank';
  that.form.action = that.value;
  that.form.submit();    
}

function openTextarea(that) {
  var a = that.value.split('\n');
  for (var row in a) {
    if (a[row].length > that.cols) {
      that.cols = a[row].length;
    }    
    that.rows += 1;
  }
}

function closeTextarea(that) {
  that.cols = undefined;
  that.rows = undefined;
}

//http://stackoverflow.com/questions/1766861/
// find-the-exact-height-and-width-of-the-viewport-in-a-cross-browser-way-no-proto?rq=1
function getViewport() {
 return [window.innerWidth, window.innerHeight];
}

// too many buttons! pushing enter is ambiguous so just turn it off for the page
// DANGER WILL ROBINSON! One step away from being a keylogger 
function stopRKey(evt) { 
console.log(evt);
  var evt = (evt) ? evt : ((event) ? event : null); 
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;} 
} 

document.onkeypress = stopRKey; 

