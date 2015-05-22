// store names map to .js files relative to server folder
// the modules created are schema conformed  
// do not include the .js extention
var fs = require('fs'),
    path = require('path'),
    serverPort = process.env.PORT||8124,
    storesFolder = './stores/',
    storeNames = [];
    
/*
    storeNames = 
    
    [
      'scratch', 
      'mongo', 
      'orient',
//      'sqlite',
//      'cassandra',
//      'redis',
//      'postgres',
    ];  
*/

// use basename for all .js files in the stores folder
//?? function output should use emitter ???  
var initStoreNames = function (urData) {
  storeNames = [];
  fs.readdirSync(storesFolder).forEach(function (file) {
    storeNames.push(path.basename(file, '.js'));
  });
  urData.storeNames = storeNames;
  urData.domain.emit('app', {'function': 'initStoreNames', 'storeNames': urData.storeNames});
};

// stores, rendering and routing are loaded at startup but file can also be edited on the fly?
var importStores = function(urData) {
  try {
    // revert to existing on error
    var save = urData;
    initStoreNames(urData);
    urData.stores = [];
    urData.storeNames.forEach(function(name) {
      try {
        urData.stores.push(require('./stores/' + name)); 
        urData.stores[urData.storeNames.indexOf(name)].store.setVersion();
        urData.domain.emit('app', {'function': 'importStores', 'store': name});
      }
      catch (e) {
        urData.domain.emit('app', {'function': 'importStores', 'store': name, 'NODB': e});
      }
    });
  }
  catch (e) {
    urData.domain.emit('error', e);
    urData = save;
  }
};

//?? expecting the functional import to enable on the fly changes???
var importRender = function(urData) {
  urData.render = require('./page/render');
  urData.domain.emit('app', {'function': 'importRender', 'result': urData.render });
};

var importRoutes = function(urData) {
  urData.routes = require('./urRoutes');
  urData.domain.emit('app', {'function': 'importRoutes', 'result': urData.routes});
};

// make sure top level keys and all 2nd level keys in store and driver of all configured stores have same names whoop whoop kerplop!
var verifySchema = function(urData) {
  var expectedTopKeys = Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)]);
  var expectedStoreKeys = Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)].store);
  var expectedDriverKeys = Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)].driver);
  urData.storeNames.forEach(function(name) {
    var actualTopKeys = Object.keys(urData.stores[urData.storeNames.indexOf(name)]);
    var actualStoreKeys = Object.keys(urData.stores[urData.storeNames.indexOf(name)].store);
    var actualDriverKeys = Object.keys(urData.stores[urData.storeNames.indexOf(name)].driver);
    if (actualTopKeys.length != expectedTopKeys.length) return false;
    if (actualStoreKeys.length != expectedStoreKeys.length) return false;
    if (actualDriverKeys.length != expectedDriverKeys.length) return false;
    for (var k in actualTopKeys) if (actualTopKeys[k] != expectedTopKeys[k]) return false;
    for (var s in actualStoreKeys) if (actualStoreKeys[s] != expectedStoreKeys[s]) return false;
    for (var d in actualDriverKeys) if (actualDriverKeys[d] != expectedDriverKeys[d]) return false;
  }); 
  return true;
};

var getServerIPV4s = function(urData) {
  var IPs = [];
  if (process.env.C9_PID) {
    IPs.push(process.env.IP); 
  }
  else  {
    var os = require('os');
    Object.keys(os.networkInterfaces()).forEach(function (key) {
        os.networkInterfaces()[key].forEach (function (iface) {
          if (iface.family === 'IPv4') {
            IPs.push(iface.address); 
          }   
        });  
      });
  }
  urData.domain.emit('app', {'function': 'getServerIPV4s', 'return': IPs});
  urData.IP = IPs;  // [ XXX.XXX.XXX.XXX, ...]
};

//load all stores from urData.db into urData object 
var load= function (urData) {
  // init from files on server if targeting the memory object
  if (urData.db === urData.storeNames[0]) {
    // would be a good place to load a snapshot too
    importStores();
  }
  else { // overload object from urData.db 
    urData.route = 'load';
    urData = urData.routes[urData.route](urData);     
  }
};

//persist current UrData object to urData.db
var commit = function (urData) {
  urData.stores.forEach( function (store) {
    if (urData.db != store.name) {
      urData.route = 'upsert';


    } 
  });
};

//persist current urData object image to each store in UrData 
var concur = function (urData) {
  urData.stores.forEach( function (store) {
    if (urData.db != store.name) {
      urData.stores[urData.storeNames.indexOf(urData.db)].queries.upsertUrData(urData);
    }
  });
};

module.exports = { 
  db: 'scratch',
  storeNames: [],
  options: {
    IP: [],
    port: serverPort,
  },
  stores: [],
  methods: {
    initStoreNames: initStoreNames, 
    importRender: importRender,
    importRoutes: importRoutes,
    importStores: importStores,
    verifySchema: verifySchema,
    getServerIPV4s: getServerIPV4s,  
    load: load,
    commit: commit,
    concur: concur
  },
  routes: [],
  render: {},
  contact: {
    name: 'Bill Wunder',
    email: 'bwunder@yahoo.com'
  },  
  version: '0.0.1',
  license: 'MIT'
};

