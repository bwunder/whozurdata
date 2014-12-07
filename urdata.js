var os = require('os');

var localIP4s = function () {
  var x = [];
  Object.keys(os.networkInterfaces()).forEach(function (key) {
    os.networkInterfaces()[key].forEach (function (iface) {
      if (iface.family === 'IPv4') {
        x.push(iface.address); 
      }   
    });  
  }); 
  return x;  // [ XXX.XXX.XXX.XXX, ...]
};

module.exports= (function () {
  return { db: 'scratch',  
    localIP: localIP4s,
    httpsPort: 8124,
    stores: {
      scratch: require('./scratch'),    
      MongoDb: require('./mongo'),
      Cassandra: require('./cassandra'),
      OrientDb: require('./orient'),
      Sqlite: require('./sqlite'),
      Redis: require('./redis'),
      MSSQL: require('./mssql'),
    },
    email: 'bwunder@yahoo.com',
    version: '0.0.0'
  }  
})();

