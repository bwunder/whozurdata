var name = require('path').basename(module.filename, '.js');
// dependencies
var sqlite = require('sqlite3');
var dbfile = "./data/whozurdata.sqlite"; // also supports ":memory:"

var db = new sqlite.Database(dbfile);
var version = db.version;

/*
var test = db.open(dbfile, 
  function (error) {
    if (error) throw error;
    db.prepare('SELECT name FROM stores', 
      function (error, statement) {
        if (error) throw error;
        statement.fetchAll(function (error, rows) {
          statement.finalize(function (error) {
            console.log("All done!");
          });
        });
      });
  });
*/
 
// queries
var upsertUrData = function (urData) {
    
    
  urData.domain.emit('query', {db: name, upsertUrData: { target: name }});
}; 

var readUrData = function (urData) {
  

  urData.domain.emit('query', {db: name, readUrData: { source: name }});
}; 

var read = function (urData) {
  return []; 
};

var insert= function(urData)  {
};

var update = function (store, column) { 
};

var upsert = function (store) { 
};

var remove = function (name) { 
};

var getEngineVersion = function () {
  return '?';  
};

var getDriverVersion = function () {
  return sqlite.VERSION;  
};

var store = {
  engine: {
    project: 'SQLite',
    version: undefined,
    getEngineVersion: getEngineVersion
  },
  driver: {
    project: 'sqlite3',
    version: undefined,
    getDriverVersion: getDriverVersion
  },
  options: {
    dbfile: dbfile
  },
  query: {
    read: read,
    log: insert,
    upsert: upsert,
    remove: remove,
    upsertUrData: upsertUrData,
    readUrData: readUrData
  },
  docs: {
    engine: "https://sqlite.org",
    driver: "http://github.com/mapbox/node-sqlite3"
  },
  source: [
    {engine: "http://system.data.sqlite.org/index.html/tree?ci=trunk"},
    {driver: "http://github.com/mapbox/node-sqlite3"}
  ]
}; 

module.exports = exports = store;


/*
    read: read,               // name(s) optional, column(s) optional
    insert: insert,           // name req'd, column(s) NA  
    update: update,           // name req'd, column(s) optional       
    upsert: upsert,           // name req'd, column(s) NA                
    delete: deleteStore       // name req'd, column(s) NA

//    getOne: "SELECT * FROM stores WHERE name = '?'", 
//    readAll: read,  "SELECT * FROM test.stores"
    // "INSERT INTO store ( name, description, version, url, options, npmPackage, CRUD, script ) \
    //  VALUES (store.name, store.description, store.version, store.url, store.options, store.npmPackage, store.CRUD, store.script ) \
    //  IF NOT EXISTS",
    update: update, //"UPDATE store SET description = ?, version = ?, urlscript = ? WHERE name = '?'"                 
    upsert: upsert,                      
    delete: delete // "DELETE store WHERE name = '?'"
*/

