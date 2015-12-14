whozurdata v0.0.4
===

---
* interstitial data storage middleware 
* NOSE stack (Node, Open Data, Socket.io, Express) 
* urData object - config and stored query meta-object  

NOSE
+ seemless interation of any data targets
+ requires no 
+ superset of LAMP and MEAN stacks
+ supports ACID and BASE concurrency models 
* interstitial run-time data repli-grator
+ integrate any data store 
* conformed javascript named query API 

"The bedrock of every data rich user experience! I dig it!" - Fred [local brontosaurus operator]   
"Its Uge, just install it and it will be tremendous!" - Don [very rich guy]
---

### What's it do?



### How's it work?




sample store configurations included
---
* a JSON memory object: scratch
* a relational database: SQLite 
* a collections of documents: MongoDB
* a graph database: OrientDB
* keyed values: Redis 
* a column store: Cassandra


Compatable with 
many stores, of note Redis on the server and SQLite on the desktop, are reliably configurable as in memory stores 
with numerous advantages of recall while maintaining most advantages of persistence

"Why watch the temperature gauge or even bother looking at the dashboard?" 
"If something goes wrong they can look at any remote replica later to figure out what happened..." - Homer (local nuclear safety inspector) 
---
SQL or NoSQL, schemas or schema-less, structured or unstructured. It doesn't matter. They 
all work here - and without stifiling development in complexity. 

A person or small crew dedicated to server side development is recommended. Other development will query the store by query name and parameter and always be handed results as an array of JSON objects.  

A development connection only node server is occassionally running in the cloud at https://whozurdata-c9-bwunder.c9.io. Please note that the interfaces are under construction. MongoDB, and OrientDB are active [coming soon: Cassandra, SQLite, Redis, the store you use now, the storage engine you want to use in the future]

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
      routes: {},                          // selector object queried at each htp request - urRoutes.js
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


store interface array element fixed schema:

    {
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


Relational representation of urData object 

        -------------------  
       |        urData     |  
        - - - - - - - - - - 
       | db        char    |
       | version   char    |                
       | render    text    |           
  domain: {},                         
  socket: {},                         
  request: {},                      
  route: '/',                       
  chattail: [],                     
  license: 'MIT',                   
  version: '0.0.3
       | message   char    |  
        -------------------   
        
        -------------------  
       |    storeNames     |  
        ------------------- 
       | id        int     |
       | name      char-fk |
        -------------------   
        
        -------------------  
       |      methods      |  
        ------------------- 
       | name      char    |
       | source    text    |
        -------------------   
        
        --------------------  
       |        mtail      |  
        ------------------- 
       | name      char-fk |
       | address   char    |
       | alias     char    |
       | message   char    |  
        -------------------   

normalized store 

       -------------------
      |      stores       | 
       - - - - - - - - - -  
      | id           int  |    -------------------
       - - - - - - - - - -    |      queries      |
      | name         char |    - - - - - - - - - -
        -------------------     - - - - - - - - - -    | id           int  |  
       |      drivers      |   | product      char |    - - - - - - - - - -
        - - - - - - - - - -    | optionsId    int  |   | storeId      int  |
       | id           int  |   | id           int  |   | name         char |   
        -------------------    | driverId     int  |    -------------------
       | name         char |   | docLinkId    int  |   | function     char |  
       | version      char |   | sourceLinkId int  |    -------------------
       | docLinkId    int  |    -------------------     
       | name         char |                           
       | version      char |                           
        -------------------                             
                                                       
        -------------------                               
       |      links        |
        -------------------     -------------------     -------------------     
       | id        int-pk  |   |       mtail       |   |      options      |
        -------------------     -------------------     -------------------  
       | storeId   int-fk  |   | name      char-fk |   | id        int-pk  |
       | name      char    |   | address   char    |    -------------------
       | type      char    |   | alias     char    |   | storeId   int-fk  |
       | url       char    |   | message   char    |   | name      char    |
        -------------------     -------------------    | value     char    |
                                                        -------------------

 
 
 urData snapshots will always include additional state related data (e.g. domain,  that is not needed for 
 
 
 
 
 
 
 ###&Xi;oT
