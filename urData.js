// store names map to .js file name of the interface module
// the modules created are built from the fixed schema elements  
// do not include the .js extention
var fs = require('fs'),
    path = require('path'),
    serverPort = process.env.PORT||8124,
    storesFolder = './stores/',
    storeNames = [];

// use basename for all .js files in the stores folder
//?? function output should use emitter ???  
var initStoreNames = function (urData) {
  storeNames = [];
  fs.readdirSync(storesFolder).forEach(function (file) {
    storeNames.push(path.basename(file, '.js'));
  });
  urData.storeNames = storeNames;
  urData.domain.emit('unitTest', {'function': 'initStoreNames', 'storeNames': urData.storeNames});
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
        urData.domain.emit('unitTest', {'function': 'importStores', 'store': name});
      }
      catch (e) {
        urData.domain.emit('unitTest', {'function': 'importStores', 'store': name, 'NODB': e});
      }
    });
  }
  catch (e) {
    urData.domain.emit('error', e);
    urData = save;
  }
};

//?? can this be called later after on the fly changes to the file???
var importRender = function(urData) {
  urData.render = require('./page/render');
  urData.domain.emit('unitTest', {'function': 'importRender', 'result': urData.render });
};

var importRoutes = function(urData) {
  urData.routes = require('./urRoutes');
  urData.domain.emit('unitTest', {'function': 'importRoutes', 'result': urData.routes});
};

// check for fixed store schema (fixed as described in README.md) - store specific variables 
// belong under the options key.  options is expected only as a top key with no predetermined values inside,  
var verifySchema = function(urData) {
  var verified = true; 
  var actualDomainKeys, actualStoreKeys, actualDriverKeys, actualQueryKeys, actualDocsKeys, actualSourceKeys; 
  var expectedDomainKeys    = ['name','moduleId','store','driver','options','queries','docs','source'];
  var expectedStoreKeys  = ['project','version','setVersion'];
  var expectedDriverKeys = ['project','version'];
  var expectedQueryKeys  = ['read','insert','update','upsert', 'remove', 'readUrData', 'upsertUrData'];
  var expectedDocKeys    = ['store','driver'];
  var expectedSourceKeys = ['store','driver'];

  // expected must be in actual but actual is free to have any additional elements 
  var asExpected = function(array1, expectedElements) {
    expectedElements.forEach( function (element) {
      if (verified & array1.indexOf(element) < 0) {
        verified = false;
      }
    });
    urData.domain.emit('unitTest', {'function': 'asExpected', 
                                    'array': array1, 
                                    'expectedElements': expectedElements, 
                                    'exptd': verified});
    return;    
  };

  urData.storeNames.forEach(function(name) {
    if (verified) {
console.log(name);
console.log(urData.stores.length);
console.log(urData.storeNames.indexOf(name));
console.log(urData.stores[urData.storeNames.indexOf(name)].name);
console.log(Object.keys(urData.stores[urData.storeNames.indexOf(name)]));
      // any false will set verfied to false if expected object keys not there as expected
      asExpected(Object.keys(urData.stores[urData.storeNames.indexOf(name)]), expectedDomainKeys); 
console.log(Object.keys(urData.stores[urData.storeNames.indexOf(name)]).store);
      asExpected(Object.keys(urData.stores[urData.storeNames.indexOf(name)].store), expectedStoreKeys); 
console.log(Object.keys(urData.stores[urData.storeNames.indexOf(name)]).driver);
      asExpected(Object.keys(urData.stores[urData.storeNames.indexOf(name)].driver), expectedDriverKeys); 
console.log(Object.keys(urData.stores[urData.storeNames.indexOf(name)]).queries);
      asExpected(Object.keys(urData.stores[urData.storeNames.indexOf(name)].queries), expectedQueryKeys); 
console.log(Object.keys(urData.stores[urData.storeNames.indexOf(name)]).docs);
      asExpected(Object.keys(urData.stores[urData.storeNames.indexOf(name)].docs), expectedDocKeys); 
console.log(Object.keys(urData.stores[urData.storeNames.indexOf(name)]));
      actualSourceKeys = []; 
      urData.stores[urData.storeNames.indexOf(name)].source.forEach(function (nameValue) {    
        actualSourceKeys.push(Object.keys(nameValue)[0]); 
      });
console.log(actualSourceKeys);
      asExpected(actualSourceKeys, expectedSourceKeys);
console.log(verified);
    }
  }); 
  urData.domain.emit('unitTest', {'function': 'verifySchema', 'verified': verified});
  return verified;
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
  urData.domain.emit('unitTest', {'function': 'getServerIPV4s', 'return': IPs});
  urData.options.IP = IPs;  // [ XXX.XXX.XXX.XXX, ...]
};

//load all stores from urData.db into urData object 
var load= function (urData) {
  // init from files on server if targeting the memory object
  if (urData.db === urData.storeNames[0]) {
    // would be a place to load a snapshot as well
    importStores();
  }
  else { // overload object from urData.db as created at startup with data from this db
    urData.route = 'load';
    urData = urData.routes[urData.route](urData);     
  }
};

//persist current UrData object to current urData.db
//will be out of sync with data stored in other dbs 
//so higher possiblity of data loss if catastrophic runtime failure  
//until commit has been concurred (commit to data pushed across all stored data)
//as transactional as each store is able
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
    unitTest: true, 
    mtailsize: 20
  },
  stores: [],
  methods: {
    importRender: importRender,
    importRoutes: importRoutes,
    importStores: importStores,
    verifySchema: verifySchema,
    getServerIPV4s: getServerIPV4s,  
    load: load,
    commit: commit,                    // object save to urData.db - for scratch is a snapshot to date named file
    concur: concur                     // push save object into all cfg'd stores - including the snapshot
  },
  routes: [],
  render: {},
  contact: {
    name: 'Bill Wunder',
    email: 'bwunder@yahoo.com'
  },  
  version: '0.0.2',
  license: 'MIT',
  domain: {},
  request: {},
  mtail: [],
};

