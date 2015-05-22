whozurdata
==========
query proxy (Javascript stored procedures) and administrative collaboration for your data universe 
impedence free query abstractions for front end developers - who use a JSON object for all queries- with full query power on the node server with storage engines tuned to produce the right answer through the best storage engine for each query among a full variety of storage engine data models 

RDBMS, document collections, name/values, big tables ,graphs, files - SQL or NoSQL, schemas or schemaless, structured or unstructured. They all work here without stifiling development in the complexities.

A development node server is often running in the cloud at https://whozurdata-c9-bwunder.c9.io. Please note that the interfaces are under construction. MongoDB, and OrientDB are active [coming soon: Cassandra, SQLite, Redis, the store you use now, the storage engine you want to use in the future]

```javascript
urData object:

  { 
    db: 'interfaceInUse',           // defaults to storeNames[0], must be 
    storeNames: storeNames,         // array of administrator specified stores   
    options: {                      // web server/socket configuration details for the node instance 
      IP: serverIPv4s,              // obtained at node server instantiation
      port: serverPort,             // provided at startup 
    },
    stores: [],                     // indexed array of conforming interface schemas (see below)
    methods: {                      // associative array: application object scoped functions 
      importStores: importStores,   // load interface schemas using StoreNames array
      verifySchema: verifySchema,   // method to verify that all interface schemas loaded are conforming
      load: load,                   // create or overlay the              
      commit: commit,               // push current db to same db in all storage engines      
      concur: concur                // push urData object to all storage engines 
    },
    routes: require('./urRoutes'),  // stored procedure query proxy map  
    render: require('./render'),    // administrative UI view and controller
    os: require('os'),              // node server's operating platform  
    assert: require('assert'),      // unit test            
    domain:                         // instantiated at node server start-up
    request:                        // parse http request URL as received by http callback
    route:                          // conditioned route as determined in http callback
    contact: {
      name: 'Bill Wunder',
      email: 'bwunder@yahoo.com'
    },  
    version: '0.0.1',
    license: 'MIT'
  };
```

conforming store array element:

```javascript
  {
    name = require('path').basename(module.filename, '.js'),
    moduleId: module.id,        // expecting .filename but not guaranteed 
    store: {                    // properties of the storage engine instance 
      product: 'product name',            
      version: 'x.x.x',         //      
      setVersion: getVersion    // node server async start-up event fetch of product version
    },    
    driver: {                   // API project for this store available thru NPMjs.org 
      name: 'nodePackage',
      version: dvrVersion()     // interface import-time fetch (preferred) or hardwired "NPM package -version" 
    },   
    options: {                  // associative array of attributes used to connect store and driver to interface
       [name : value[,]            // any valid JSON   
       [name : value[,]...]                          
    },
    queries: {                  // associative array: interface array scoped functions
      read: read,                       // store DML uses last image loaded  
      insert: insert,                   // is applied only to buffer space when changed   
      update: update,                    
      upsert: upsert,                   // may then be propogated with a commit 
      remove: remove[,                  
      another1: function () {} [,]...]  // 'stored procedures'
      another2: function () {} [,]...]         
    },
    docs: {                   // associative array of URLs useful online documentation  
      store: 'http://...',              // key expected by administrative UI
      driver: 'https://...'[,           // expected
      another1: URL [,]                 // optional additional or alternative store/driver publications
      another2: URL [,]...]             // optional
    }, 
    source: [                 // indexed object array of links to public source code for libraries used  
      {store: 'http://...'},            // key expected by administrative UI
      {driver: 'https://...'}[,         // expected
      {another: URL}[,]                 // optional additional source code repo
      {another: URL}[,]...]             // optional
    ]  
  } 
  ```

if you don't node your data you don't node nuthin'