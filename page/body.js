
    onload= function()  {
      db = getDb();
    };

  var socket = io();
  
  function sendMsg(that) {
    socket.emit('chat message', {message: document.getElementById('m').value , sentDT: Date()});
    document.getElementById('m').value = '';
  }

  socket.on('chat message', function(message){
    var mtail = document.getElementById('mtail').value.split('\n');
    while (mtail.length > 20) mtail.shift();
    mtail.push(message);
    document.getElementById('mtail').value = mtail.join('\n');
  });

  socket.on('object change', function(change){
alert("object change event heard at client");
    // now process the change(s) into the document
    // for now  reload the root page again when you hear about a change
    // that should always work but could easily lose work at clients 
    // data only changes could be easier to apply from here
console.dir(change);
// 

    alert('Changes made at the server require the page to be reloaded');
    window.location.reload('/');
  });
  
  
