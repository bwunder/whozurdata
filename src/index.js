var Socketiop2p = require('../../../index');
var io = require('socket.io-client');

function init () {

  var socket = io();
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false};
  var p2psocket = new Socketiop2p(socket, opts, function () {
    privateButton.disabled = false;
    p2psocket.emit('peer-obj', 'peerId' + p2psocket.peerId);
  });

  // Elements
  var privateButton = document.getElementById('private');
  var form = document.getElementById('msg-form');
  var box = document.getElementById('msg-box');
  var msgList = document.getElementById('msg-list');
  var upgradeMsg = document.getElementById('upgrade-msg');

  p2psocket.on('peer-msg', function(data) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(data));
    msgList.appendChild(li);
  });

  form.addEventListener('submit', function(e, d) {
    e.preventDefault();
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(box.value));
    msgList.appendChild(li);
    p2psocket.emit('peer-msg', box.value)
    box.value = '';
  });

  privateButton.addEventListener('click', function(e) {
    goPrivate();
    p2psocket.emit('go-private', true)
  })

  p2psocket.on('go-private', function () {
    goPrivate();
  });

  function goPrivate () {
    p2psocket.useSockets = false;
    upgradeMsg.innerHTML = "WebRTC connection established!";
    privateButton.disabled = true;
  }

}

document.addEventListener('DOMContentLoaded', init, false)

function toggle(txtArea) {
  if (typeof txtArea.cols==='undefined') {
    txtArea.cols = undefined;
    txtArea.rows = undefined;
  }
  else {
    var a = txtArea.value.split('\n');
    for (var row in a) {
      if (a[row].length > txtArea.cols) {
        txtArea.cols = a[row].length;
      }    
      txtArea.rows += 1;
    }
  }  
}

// enter is ambiguous so is set off for the page - works in soft wrapping textarea
function stopRKey(evt) { 
  var evt = (evt) ? evt : ((event) ? event : null); 
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  if ((evt.keyCode == 13) && (node.type=="text"))  {
    return false;
  } 
} 

document.onkeypress = stopRKey; 

