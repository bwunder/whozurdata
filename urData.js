// store names map to .js file name of the interface module
// the modules created are built from the fixed schema elements  
// do not include the .js extention
var fs = require('fs'),
    path = require('path'),
    db = 'scratch', // presumes will be among interfaces imported in initStoreNames() below
    options = {
      IP: [],                     
      port: process.env.PORT||8124, // 
      peersPort: process.env.PORT? 0 :9000, // running on different ports of same host does work 
      test: false,                  // verbose console  
      mtailsize: 20,                // chat history to re-serve upon each page load
      storesFolder: './stores/',
      democracy: false             // require quorum & audited 'majority rules' vote to concur all committed data changes
    };                             // concur is process to syncronize all stores to current store

var storeTemplate = {                  // one to one with storeNames array and so with interface modules
      name: '',                        // user specified name for the store instance
      moduleId: '',                    // module.id after node server import (seems always same as module.filename) 
      store: {                         // open source data storage engine of instance
        project: '',                   // best known or brand name of storage engine  
        version: '',                   // version of storage in use by this instance
        setVersion: 'function'         // run-time fetch version from engine - used to verify availability at strartup
      },
      driver: {                        // node.js storage engine query drivers - prefer if native to or - better - developed by storage engine developers 
        name: '',                      // name of package
        version: ''                    // should be same as result of: npm view [name of package] version from server command line  
      },
      options: {},                     // all config settings needed to connect to run all queries in library  
      queries: {                       // all store libraries must include these queries to support concurrency efforts among stores 
        read: function(){},            // outputs specified key values from specified stores objects  
        log: function(){},             // fast forward write of chat message objects to this storage engine
        upsert: function(){},          // update else insert of columnar values as the specified keys of the spefified store objects
        remove: function(){},          // remove the specified keys from the specified store as stored here 
        upsertUrData: function(){},    // update else insert if not found at this store, the current memory image of urData 
        readUrData: function(){}       // load the urData memory image of the current process with the image saved here
      },
      docs: {                          // primary world wide web links for store and driver in use   
        store: 'enter URL to db documentation here',
        driver: 'enter URL to driver package documentation here',
      },                               // add as attribs of docs object, other relevant documentary links*
                                       // *a relevant link should further understanding and use of the store interface    a
      source: [                        // world wide web links to open source code repository as object elemementss
        {store: 'enter URL to db source code here'},
        {driver: 'enter URL to package source code here'},
      ]                                // add as name/value objects, other relevant source code links*
    };

// use basename for all .js files in the stores folder
// ?? function output should use emitter ???  
var initStoreNames = function (urData) {
  urData.storeNames = [];
  fs.readdirSync(urData.options.storesFolder).forEach(function (file) {
    urData.storeNames.push(path.basename(file, '.js'));
  });
  urData.domain.emit('test', {'function': 'initStoreNames', 'storeNames': urData.storeNames});
};

// stores, rendering and routing are loaded at startup but file can also be edited on the fly?
var importStores = function(urData) {
  try {
    // revert to existing on error
    var saved = urData;
    initStoreNames(urData);
    urData.stores = [];
    urData.storeNames.forEach(function(name) {
      try {
        urData.stores.push(require('./stores/' + name)); 
        urData.stores[urData.storeNames.indexOf(name)].store.setVersion();
        urData.domain.emit('test', {'function': 'importStores', 'store': name});
      }
      catch (e) {
        urData.domain.emit('test', {'function': 'importStores', 'store': name, 'NODB': e});
      }
    });
  }
  catch (e) {
    urData.domain.emit('error', e);
    urData = saved;  // halleluya
  }
};

// ?? can this be called later after on the fly changes to the file???
var importRender = function(urData) {
  render = require('./page/render');
  urData.domain.emit('test', {'function': 'importRender', 'result': urData.render });
};

var importRoutes = function(urData) {
  routes = require('./urRoutes');
  urData.domain.emit('test', {'function': 'importRoutes', 'result': urData.routes});
};

// check for fixed store schema (fixed as described in README.md) - store specific variables 
// belong under the options key.  options is expected only as a top key with no predetermined values inside,  
var verifySchema = function(urData) {
  var verified = true, 
      expectedDomainKeys = ['name','moduleId','store','driver','options','queries','docs','source'],
      expectedStoreKeys  = ['project','version','setVersion'],
      expectedDriverKeys = ['project','version'],
      expectedQueryKeys  = ['read','log', 'upsert', 'remove', 'readUrData', 'upsertUrData'],
      expectedDocKeys    = ['store','driver'],
      expectedSourceKeys = ['store','driver'];
  var actualSourceKeys; 

  // expected must be in actual but actual is free to have any additional elements 
  var asExpected = function(actualArray, expectedArray) {
    expectedArray.forEach( function (element) {
      if (verified & actualArray.indexOf(element) < 0) {
        verified = false;
        urData.domain.emit('app', {'function': 'asExpected', 
                                        'array': actualArray, 
                                        'expectedElements': expectedArray, 
                                        'exptd': verified});
      }
    });
    return;    
  };
  urData.stores.forEach(function(store) {
    if (verified) {
      // returns false as soon as keys checked are not as expected
      asExpected(Object.keys(store), expectedDomainKeys); 
      asExpected(Object.keys(store.store), expectedStoreKeys); 
      asExpected(Object.keys(store.driver), expectedDriverKeys); 
      asExpected(Object.keys(store.queries), expectedQueryKeys); 
      asExpected(Object.keys(store.docs), expectedDocKeys); 
      actualSourceKeys = []; 
      store.source.forEach(function (nameValue) {    
        if (Object.keys(nameValue).length === 1 ) {
          actualSourceKeys.push(Object.keys(nameValue)[0]); 
        }
      });
      asExpected(actualSourceKeys, expectedSourceKeys);
    }
  }); 
  urData.domain.emit('app', {'function': 'verifySchema', 'result': verified});
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
            if (iface.address != '127.0.0.1') {
              IPs.push(iface.address); 
            }
          }   
        });  
      });
  }
  urData.domain.emit('test', {'function': 'getServerIPV4s', 'return': IPs});
  urData.options.IP = IPs;  // [ XXX.XXX.XXX.XXX, ...]
};

//load all stores from urData.db into urData object 
var load= function (urData) {
  // init by re-import of .js files on server ONLY if targeting the memory object
  // other DBs are expected to expose the readurData query
  if (urData.db === urData.storeNames[urData.storeNames.indexOf('scratch')]) {
    // would be a place to load a snapshot as well
    importStores();
  }
  else { // overload object from urData.db as created at startup with data from this db
    urData.route = 'load';
    urData = urData.routes[urData.route](urData);     
  }
};

// two options for commit (primary storage to secondary storage or secondary storage to primary storage)
// primary being all - almost always volatile - data buffers attached to the process of execution and 
// secondary being other, usually persistent but never directly addressable in process space, bit resevoirs 
// (e.g. spinning disks, SSDs, SD cards, etc)  
// when the app is starting up, the secondary bits should be loaded to primary storage
// likewise when urData.db is changed, the secondary bits should be loaded into primary storage
// changes made to all other keys of the urData object, including any changes in the urData.stores[] collection
// are committed by saving the user updated primary storage image to secondary storage   
// commit  should be as transactional as the secondary store is able
// concur upserts the current buffer object to all other stores (excluding current buffers and the already comitted-to urData.db storage engine)
var commit = function (urData) {
  urData.stores.forEach( function (store) {
    if (urData.db != store.name) {
      urData.route = 'upsert';






    } 
  });
};

// version, upsert and verify (syncronize) cluster master designate's aka urData.db storage engine 
// 1. the cluster master designate is first committed to resolve the JSON udData object in memory 
//    with the urData object attributes serialized to the storage engine    
// 2. any changed cluster master urData object attribute are upserted to all other storage engine in master's UrData.stores array
//    (for this reason a store should never be shared by multiple clusters)
// 3. upsert and verify all stores to stores array in current db in urData.stores order
var concur = function (urData) {
  urData.stores.forEach( function (store) {
    if (urData.db != store.name) {
      urData.stores[urData.storeNames.indexOf(urData.db)].queries.upsertUrData(urData);
    }
  });
};

// urData object schema with one properly typed but empty fixed store schema in the stores array
module.exports = { 
  db: db,                              // store last used to load memory image    
  storeNames: [''],                    // ordered as created memory array of store interface module file names
  options: options,
  stores: [                            // ordered as created memory array of store interface objects
   storeTemplate,                      // 
  ],
  methods: {
    importRender: importRender,        // loads the rendering callback from the node server's file system
    importRoutes: importRoutes,        // loads the routing oject from the node server's file system
    importStores: importStores,        // load the available stores from the node server's file system
    verifySchema: verifySchema,        // objects fixed schema key integrity is intact
    getServerIPV4s: getServerIPV4s,    // local IPs where node server is listening for web requests 
    load: load,                        // object load from this storage engine
    commit: commit,                    // object save to urData.db - for scratch is a snapshot backup to a new file
    concur: concur                     // version row, syncronize and verify other stores to the row in current store
  },
  license: 'MIT',                      // full text in license.txt
  version: '0.0.3',                    // code base version - scratch       
  domain: undefined,                   // server's event handler/emitter - defined at server startup  
  // added in each request callback
  route: undefined,                    // name is functional element from urRoutes object 
  render: undefined,                   // imported at startup from .js file in node server folder
  socket: undefined,                   // administrator communications (T-A-V-O)via socket.io libraries at node server startup  
  request: undefined                   // url is parsed to an object and slightly augmented upon server receipt of a web request
};                 

