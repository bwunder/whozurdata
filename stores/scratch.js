var name = require('path').basename(module.filename, '.js');
var fs = require('fs');
// urData query parameter attributes:
//    added 
//      at startup:
//        urData.domain - core node lib
//      when the urData.db is changed
//        urData.storeNames item index matches urData.stores item with same store.name
//      at each request callback:
//        urData.db
//      urData.request
//        .query (url parse returns following keys (.query is 1 deep object, all others are primitives)  
//                'protocol','slashes', 'auth', 'host', 'port', 'hostname', 'hash', 'search', 'query', 'pathname','path', and 'href'
//          added by callback (should move code into this module)              
//          .names      - subset of urData.storeNames indicating interesting urData.stores
//          .keys       - urData.stores[] object or top level subkey(s) of
//          .attributes - urData object or top level subkey(s) of
//          
//        .pathname  
var read = function (urData) {
  var result= [];
  if (urData.request.query.attributes) {
    var row = {};
    urData.request.query.attributes.forEach(function(attrib) {
      row[attrib] = urData[attrib];
    });
    result.push(row);
  }
  else {
    urData.request.query.names.forEach( function(name) {
      var store = urData.stores[urData.storeNames.indexOf(name)];
      var row = {id: store.id};
      urData.request.query.keys.forEach(function(key) {
        row[key] = store[key];
      });
      result.push(row);
    });
  }
//  urData.domain.emit('query', {db: urData.db, read: {stores: urData.request.query.names, keys: urData.request.query.keys}});
  return result;
};

// upsertUrData - persists urData image from process buffers into all configured and synchronizes the data in
// scratch to all available dbs and in all DBs other than the scratch environment -

//TODO!  if another store is set as urData.db in urData.js then data from that store must be load over the scratch image 
//TODO!  if scratch is selected, the data will be reloaded from file and overwrite the current iamge
//TODO!  commit to move the data from memory into urData.db, concur to save urData.db image to other stores


var upsertUrData = function (urData) {
  //only for the scratch object we create a snapshot of the urData object
  // datastamp'd filename
  var snapshotName = './snapshots/' + Date.now();  
  fs.writeFile(snapshotName, JSON.stringify(urData), function (data) {
//    urData.domain.emit('query', {db: name, snapshot: snapshotName});
  });
}; 

var readUrData = function (urData) {
  // latest snapshot else reload from the files
// this may allow use by copy of snapshot without the files later?
// is this in the domain, will fs errors even be seen?
// will the domain be a problem during snapshot?
  fs.readdir('./snapshots', function (files) {
console.dir(files);
        
  }) 

//    urData.domain.emit('query', {db: name, readUrData: { source: name }});
}; 


// insert a store
// in scratch this means adding it to UrData.storeNames[] and UrData.stores[] in urData.js
var insert = function (urData) {
//  urData.domain.emit('query', {db: name, insert: 'no-op'});
};

// scratch updates are made by edit of the module files
var update = function (urData) {
//  urData.domain.emit('query', {db: name, update: 'no-op'});
};

// a conditional no-op but shows the intent of an upsert in persistent stores
var upsert = function (urData) { 
  urData.modStores.forEach( function(store) {
    if (urData.stores[store.name]) {
      update(store);
    }
    else {
      insert(store);
    }
//    urData.domain.emit('query', {db: name, upsert: { store: store }});
  });
};

// not persistent
var remove = function (urData) {
  urData.req.query.names.forEach( function(name) {
    var store = urData.stores[urData.storeNames.indexOf(name)];
    if (urData.request.query.keys) {
      urData.keys.forEach( function(key) {
        urData.stores[store][key] = undefined;
//        urData.domain.emit('query', {db: name, remove: { store: name, key: key}});
      });
    }
    else {
      urData.stores.splice(store);
//      urData.domain.emit('query', {db: name, remove: {store: store}});
    }
  });
};

// every store must implement setVersion - fetch from configured instance
// to verify runtime connectivity  - done at import during domain startup - see urData.js
var getVersion = function () {
  module.parent.exports.stores[module.parent.exports.storeNames.indexOf(name)].store.version = module.parent.exports.version;
//  module.parent.exports.domain.emit('test', {'function': 'getVersion', store: name, 'return': module.parent.exports.version});
};

var dvrVersion = function () {
  return process.version;
};

// every store must implement this schema at top key level
// a product can be used by multiple stores
// drivers should be available on npmjs.org
// options object can vary according to connection needs
// queries can include different or overlapping functions according to requirements
//   urRoutes will need to be conformed to query functions called
// docs - and source if need be - can include any useful links - "store" and "driver" items at a minimum
module.exports= {
  name: name,
  moduleId: module.id,
  store: {
    project: 'JSON',
    version: undefined,
    setVersion: getVersion
  },
  driver: {
    project: 'node.js',
    version: undefined,
    setVersion: dvrVersion()
  },
  options: {},
  queries: {
    read: read,
    log: insert,
    upsert: upsert,
    remove: remove,
    upsertUrData: upsertUrData,
    readUrData: readUrData
  },
  docs: {
    store: 'http://json.org/',
    driver: 'https://nodejs.org/',
    NPM: 'https://www.npmjs.org/doc/',
    javascript: 'http://javascript.crockford.com/'
  },
  source: [
    {store: 'https://github.com/douglascrockford/JSON-js'},
    {driver: 'https://github.com/joyent/node'},
    {V8: 'https://code.google.com/p/v8/'},
    {whozurdata: 'https://github.com/bwunder/whozurdata'}
  ]
} 