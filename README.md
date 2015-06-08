whozurdata v0.0.2
===
"The bedrock of every data rich user experience" - fred [local quarry operator]   
---
* use different stores   
* always developer friendly 

store configurations included
---
* a relational database: SQLite 
* collections of documents: MongoDB
* graph: OrientDB
* keyed pair: Redis, 
* column store: Cassandra,

redis and SQLite configurable as memory only stores with numerous advantages of recall and an advantage of persistence

"Why even watch the temperature gauge? They can look at any remote replica later to figure out what happened..." homer (local utility worker) 
---
SQL or NoSQL, schemas or schemaless, structured or unstructured. It don't matter. They all work here - and without stifiling development in complexity. 

A person or small crew dedicated to server side development is recommended. Other development will query the store by query name and parameter and always be handed results as an array of JSON objects.  

A development node server is often running in the cloud at https://whozurdata-c9-bwunder.c9.io. Please note that the interfaces are under construction. MongoDB, and OrientDB are active [coming soon: Cassandra, SQLite, Redis, the store you use now, the storage engine you want to use in the future]

```javascript
urData object fixed schema:

module.exports = { 
  db: 'scratch',                       // store interface currently in use
  storeNames: [],                      // name index to stores[] array- first set as urData.js loads 
  options: {                           //  
    IP: [],                            // result of getServerIPV4s - first set as  urData.js loads
    port: serverPort,                  // first set as  urData.js loads
  },                                   //
  stores: [],                          // array of interfaces - first set as urData.js loads   
  methods: {                           // assoc array of reusable object initilization routines
    importRender: importRender,        // administrative UI
    importRoutes: importRoutes,        // associative array of user configured functions  
    importStores: importStores,        // set storeNames array from directory contents and then requires each file  
    getServerIPV4s: getServerIPV4s,    // enumrate the configured IPV4s where the node server is listening 
    verifySchema: verifySchema,        // check that each store is built upon the fixed schema
    load: load,                        // init the memory urData object using configuration  
    commit: commit,                    // save the memory urData object into the urData.db persistent image
    concur: concur                     // save memory urData object to every store in urData.stores[] 
  },                                   
  routes: [],                          // set at each htp request
  render: {},                          // first set as urData.js loads
  domain: {}                           // set once as urData.js loads just after server.js runs the domain 
  request: {}                          // set at each htp request
  contact: {
    name: 'Bill Wunder',
    email: 'bwunder@yahoo.com'
  },  
  version: '0.0.2',                    
  license: 'MIT'
};


store array element fixed schema:

```javascript
module.exports= {
  name: name,                // parsed from module.filename    
  moduleId: module.id,       // taken from the module used at last node server start-up
  store: {                   // assoc array data store properties to include 'product' and 'version'
    product: '',             // the brand name of the storage engine product         
    version: undefined,      // the currently running version of the storage engine product
    setVersion: getVersion   // method to populate version with info from the run-time
    [other: properties[,]]
  },
  driver: {                  // assoc array of driver properties to include 'name' and 'version'
    name: 'node',
    version: undefined,
    setVersion: dvrVersion()
    [other: properties[,...]]
  },
  options: {},
  queries: {                  // object or assoc array of queries
    read: read,              
    insert: insert,
    update: update,
    upsert: upsert,
    remove: remove
    [other: queries[,...]]   // user extended queries
  },
  docs: {                    // assoc array of name/value objects 
    store: valid URL to store documentation,
    driver: valid URL to driver documentation ,
    [other: named web links[,...]]
  source: [                  // indexed array of name/value objects
    {store: valid URL to source},
    {driver: valid URL to source},
    {other: named web links}[,...]]
  ]...
}  


relational

 -----------     ------------     -------------
|  stores   |   |  drivers   |   |  queries    |
 -----------     ------------     -------------
|   name    |   |   name     |   |   
 -----------     ------------
|  product  |   |  version   |
|  options  |    ------------
|  version  |
 -----------