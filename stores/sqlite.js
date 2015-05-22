var name = require('path').basename(module.filename, '.js');
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

var getVersion = function () {
  return '?';  
}

var dvrVersion = function () {
  return '??';  
}

module.exports= {
  fred: 'wilma',
  name: name,
  moduleId: module.id,
  store: {
    product: 'SQLite',
    version: undefined,
    setVersion: getVersion
  },
  driver: {
    name: 'node',
    version: dvrVersion()
  },
  options: {
    dbfile: dbfile
  },
  queries: {
    read: read,
    insert: insert,
    update: update,
    upsert: upsert,
    remove: remove
  },
  docs: {
    home: "https://sqlite.org",
    driver: "http://github.com/mapbox/node-sqlite3"
  },
  source: [
    {SQLite: "http://system.data.sqlite.org/index.html/tree?ci=trunk"},
    {sqlite3: "http://github.com/mapbox/node-sqlite3"}
  ]
} 

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
