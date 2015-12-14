// store names map to .js file name of the interface module
// the modules created are built from the fixed schema elements  
// do not include the .js extention
var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    checksum = require('checksum'),
    db = 'cache', // must always be among interfaces imported in initStoreNames()
    license = 'MIT',
    version = '0.0.4',
    config = {
      IP: [],                     
      port: process.env.PORT||8124,  
      storesFolder: 'stores',               // location of data store templates
      governance: 'anarchy'                // data distribution policy
    };                              
/*
  despot          - local snapshot/commit on fixed master then concur pushed to other urData.stores as determined by master. No peering.
  federaton       - local snapshot/commit on any peer then notify governor (urData.db) to concur. Governor applies independant governance policy. 
  republic        - local snapshot/commit on any peer then commit to representative/witness. Representatives share one governance policy.
  majority        - local snapshot/commit on ony peer then majority rule - commit when change accepted by 50%± of enrolled stores.
  equality        - local snapshot/commit on any peer then async commit by all enrolled stores at time change accepted . 
  utopia          - all changes available everywhere and snapshot always updated as changes are saved to any peer. 
  socialism       - local snapshot/commit on any peer then concur when commit success at 20%± of registered peers.
  communism       - local snapshot/commit on any peer then concur once a commit is successfully dispatched to any other peer.
  patriarchy      - patriarch snapshot/commit from all subordinates. patriarch determines what to push to subordinates and what to distribute as peer to other patriarchs
  anarchy         - (default) local snapshot/commit, no distribution or syncronization services
*/

var checksum = function(obj) {
// TODO! - always excludes checksum keys and prefix with date for date order 
  return checksum(obj);      
}

// urData object schema with one properly typed but empty fixed store schema in the stores array
//load all stores from specified snapshot else current urData.db into urData object 
// check for fixed store schema (fixed as described in README.md) - store specific variables 
// belong under the options key.  options is expected only as a top key with no predetermined values inside,  
var verifySchema = function() {
  var verified = true, 
      expectedDomainKeys = ['engine','driver','options','query','docs','source'],
      expectedEngineKeys = ['project','version','getEngineVersion'],
      expectedDriverKeys = ['project','version', 'getDriverVersion'],
      expectedQueryKeys  = ['read','log', 'upsert', 'remove', 'readUrData', 'upsertUrData'],
      expectedDocKeys    = ['engine','driver'],
      expectedSourceKeys = ['engine','driver'];
  var actualSourceKeys; 

  // expected must be in actual but actual is free to have any additional elements 
  var asExpected = function(actualArray, expectedArray) {
    expectedArray.forEach( function (element) {
      if (verified & actualArray.indexOf(element) < 0) {
        verified = false;
      }
    });
    return;    
  };
  for (var store in urData.stores) {
    if (verified) {
      // returns false as soon as keys checked are not as expected
      asExpected(Object.keys(urData.stores[store].engine), expectedEngineKeys); 
      asExpected(Object.keys(urData.stores[store].driver), expectedDriverKeys); 
      asExpected(Object.keys(urData.stores[store].query), expectedQueryKeys); 
      asExpected(Object.keys(urData.stores[store].docs), expectedDocKeys); 
      actualSourceKeys = []; 
      urData.stores[store].source.forEach(function (nameValue) {    
        if (Object.keys(nameValue).length === 1 ) {
          actualSourceKeys.push(Object.keys(nameValue)[0]); 
        }
      });
      asExpected(actualSourceKeys, expectedSourceKeys);
    }
  } 
  return verified;
};

var getServerIPV4s = function() {
  var IPs = [];
  if (process.env.C9_PID) {
    IPs.push(process.env.IP); 
  }
  else  {
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
  return config.IP = IPs;  // [ XXX.XXX.XXX.XXX, ...]
};

var getPackageVersion = function(driver) {
  if (driver==='node.js') {
    var version = process.version; 
  }
  else {
    if (fs.existsSync('./node_modules/' + driver + '/package.json')) {
      version = JSON.parse(fs.readFileSync('./node_modules/' + driver + '/package.json', 'utf8')).version;
    }
    else {
      console.log(driver, JSON.parse(fs.readFileSync('package.json', 'utf8')));
    }
  }
  return version;
}

/*
load sources in suggested startup reference sequence 
  1. app files - 
  2. last shutdown snapshot (may be uncommitted work in here if not clean shutdown)
     image files are created automatically upon successful server start and flushed to disk at server shutdown 
     if no image server enters ready state: 
        inbound and outbound concurs begin queueing locally 
        image pushed to shutdown file in background 
     if loaded=true and the urData.dbz are equal to file, the server is ready - concur may begin now
     if there is uncommitted, it must commit else rollback and all resulting traffic is queued locally
  3. last known good snapshot 
     contains exactly 0 uncommitted when shut down
     if 
     
  4. 
   
*/
var load = function () {
  if (urData.db === 'cache') {
    importStores();
  }
  else { // overload object from urData.db as created at startup with data from this db
    urData = urData[urData.db].query.readUrData();     
    console.log('db', urData.db, 'load');
  }
  urData.config.IP = urData.methods.getServerIPV4s();
  urData.methods.verifySchema();
  return urData;
};

// give it an id else include the current time in the snapshot name
var shoot = function(snapshotId) {
  //http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
   var hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
  snapshotId = (snapshotId || hashCode(this.urData.db + '__' + new Date().getTime()) + '.snapshot');
  var file = __dirname + '/snapshots/' + snapshotId;
  fs.writeFile(file, urData, function (err) {
    if (err) throw err;
    console.log('db', urData.db, 'snapshot', snapshotId);
  });
}; 

var reload = function(snapshotId) {
  fs.readFile(snapshotId, urData, function (err) {
    if (err) throw err;
    console.log('db', urData.db, 'reload from snapshotId', snapshotId);
  });
}; 

// commit primary storage buffer image to secondary storage at urData.db   
// concur upserts the current buffer object to all other stores (excluding current buffers and the already comitted-to urData.db storage engine)
var commit = function () {
  urData.stores[urData.db].queries.upsertUrData(urData);
};

// version, upsert and verify (syncronize) cluster master designate's aka urData.db storage engine 
// verify target eligible, upsert and verify all stores to stores array in current db in urData.stores order
var concur = function () {
  urData.stores.forEach( function (store) {
    store.queries.upsertUrData(urData);
  });
};

var close = function (store) {
  urData.stores[store]= {};
};

var edit = function () {
  return 'return urdata module file for edit here';
};

var save = function (store) {
  return 'save return from edit as module file here';
};

var urData =  { 
  db: db,                               // primary secondary storage engine - urData buffer source
  config: config,                       // node server
  stores: {},                           // secondary storage cluster
  methods: {
    checksum: checksum,                 // just a wrapper  
    verifySchema: verifySchema,         // is interfaces's semi-fixed structural integrity intact
    getServerIPV4s: getServerIPV4s,     // local IPs where node server is listening for web requests
    getPackageVersion: getPackageVersion, 
    load: load,                         // urData buffer object load
    shoot: shoot,                       // serialize buffer urData object to new file in __dirname+'/snapshots' folder
    reload: reload,                     // urData buffer object load when
    commit: commit,                     // buffer object save to urData.db - cache loads from snapshot if available
    concur: concur,                     // syncronize urData using current urData.db as first peer (eg first publisher)
    close: close,                       // deallocate all namespace buffers - no files are changed activity
    edit: edit,                         // returns utf8 text of urData.js module file to client
    save: save                          // overwrites urData.js module file with utf8 text returned from client edit      
  },
  license: license,                     // full text in license.txt
  version: version,                     // code base version - cache       
};                                      // a checksum token  

// http://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
function ValidURL(str) {
//  var pattern = new RegExp('/^((https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/');
  if(/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(str)) {
    return true;
  } else {
    console.log("invalid URL: ", str);
    return false;
  }
}

/* what opening a store wnould look like With no type checking 
    urData.stores[name] = 
      { engine: {                                //  Open Source NoSQL (e.g., Not only SQL) storage engines       
          project: store.engine.project,         //    github repo name  
          version: store.engine.version,         //    version installed
          getEngineVersion: store.engine.getEngineVersion    // run-time storage engine refresh  
        },                                       //      as tested dbEngine and driver are 1-1 with db instance targeted in options 
        driver: {                                //  node.js storage engine query drivers - try for developed by storage engine developers or better 
          project: store.driver.project,         //    npmjs.org and github name of package
          version: store.driver.version,         //    from os command prompt at project root run - npm view [name of package] version   
          getDriverVersion: store.engine.getDriverVersion    // run-time version refresh  
        },                                       //      run-time version identification is inconsistently exposed through package APIs  
        options: {
          <config options>                       //  instance specific config settings needed to connect and run all queries in library
        },                                         
        query: {                                 //  each store module must include these core queries to support commit() and concur() 
          read: store.query.read,                //    outputs list array of specified key values from list array of specified store objects  
          log: store.query.log,                  //    fast forward writes such as rtc output, event data, audit, etc. 
          upsert: store.query.upsert,            //    update else insert of values as the specified keys of the spefified store objects
          remove: store.query.remove,            //    remove the specified key[s] from the specified store[s] 
          upsertUrData: store.query.upsertUrData,//    update else insert if not found at this store, the current memory image of urData object 
          readUrData: store.query.readUrData     //    load the urData memory image of the current process with the image saved here
        },                                       //      regestister all app queries here too, above are used for peer syncronizations 
        docs: {                                  //  WWW links collection for store and driver website (as unordered set of name/value pairs)   
          engine: store.docs.store,              //    URL to db documentation 
          driver: store.docs.driver              //    URL to driver package documentation 
        },                                       //      can add more name/value key pairs - store and driver are mandatory
        source: [                                //  WWW links collection for source code repository (as indexed array of name/value objects)
          {engine: store.source.store},          //    URL to db source code
          {driver: store.source.driver}          //    URL to package source code here
        ]                                        //      can add more name/value objects - store and driver are mandatory
      };
*/


function openStore(name, store) {
  if (typeof store === 'object') {
    try {
      // other attribs will not be considered here but will be added to the buffer object 
      if (typeof store.engine.project != 'string') {
        throw 'engine failure';
      }
      if (typeof store.driver.project != 'string') {
        throw 'driver error';
      }
      if (typeof store.options != 'object') {
        throw 'bad options'
      }
      if (typeof store.query.read != 'function' || 
          typeof store.query.log != 'function' || 
          typeof store.query.upsert != 'function' || 
          typeof store.query.remove != 'function' || 
          typeof store.query.upsertUrData != 'function' || 
          typeof store.query.readUrData != 'function') {
        throw 'query anomalie';
      }
      for (var doc in store.docs) {
        if (!ValidURL(store.docs[doc])) {
          throw 'missing document';
        }
      }
      for (var i = 0; i < store.source.length; ++i) {
        if (!ValidURL(store.source[i][Object.keys(store.source[i])[0]])) {
          if (Object.keys(store.source[i])[0] === 'engine' || Object.keys(store.source[i])[0] == 'driver') {
            throw 'bogus repo: ' + Object.keys(store.source[i])[0];
          }
          else {
            console.warn(name + ': source link misformed: ' + Object.keys(store.source[i])[0]);
          }
        }
      }  
      store.engine.version = store.engine.getEngineVersion();
      store.driver.version = getPackageVersion(store.driver.project);
      urData.stores[name] = store;
    }
    catch (e) {
      throw(e);
    }
  }
} 

var importStores = function() {
  var name, iface, stores = [];
  fs.readdirSync(__dirname+'/stores').forEach(function (file) {
    if (path.extname(file)==='.js') {
      name = path.basename(file, '.js');
      iface = require('./stores/' + name);
      openStore(name, iface);
      stores.push(name);
    }
  });
};

module.exports = exports = load();  

