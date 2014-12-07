var util = require('util');
var fs = require('fs');
var https = require('https');
var favicon = require('serve-favicon');
var Favicon = favicon('./favicon.ico');             

// ??? to modify: save changes, delete from require.cache and reimport (restart)
var urData = require('./urData');
// ??? to refresh the export ? works too or restart reqd?
module.exports = urData;
var render = require('./render');

/*
  OpenSSL overwrites private key and certificate during node prestart 
  remove phrase in package.json to be prompted for YOUR passin phrase during create   
  to use you must click thru browser warnings about self-signed certificate 

  to use a CA signed cert or skip the key re-generation step - to reuse existing key 
  clear prestart value b4 'npm start' else start app by passing server.js to node
*/

var options = {
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./cert.pem')
}

https.createServer(options, function (request, response) {   
  Favicon(request, response, function onNext(err) {
    if (err) {
      response.end();
      throw err;
    }  
    urData.req = require('url').parse(request.url, true); 
    if (Object.keys(urData.req.query).length===0) {
      urData.req.query.db = urData.db;
    } 
    urData.db = urData.req.query.db;
    util.log([request.connection.remoteAddress, urData.req.href, ].join(":"));    
    if (Object.keys(urData.stores).indexOf(urData.db)>=0) {
      response.returnCode= 200;
      response.write(render());
      response.end();
    }
    else {
      util.error([[ 'problem parsing request from', 
                      request.connection.remoteAddress].join(" ")].join("\n"));
      util.error(util.inspect(request.headers, depth=3));  
      response.returnCode= 500;
      response.end('may the farse be with you');
    }    
  });
}).listen(urData.httpsPort);

util.log([module.filename, 'https server running on port ', urData.httpsPort, ' at ', urData.localIP() ].join(' ') );



