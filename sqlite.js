var util = require('util');
var sqlite = require('sqlite3');
var dbfile = "whozurdata.sqlite"; // also supports ":memory:"

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
var read = function (names, keys) {
  try {
    // consider allow arrays of store names and/or column keys e.g. ([store1, store3], [name, options, filename]) 
    var result = 'no-op'; 
    for (name in names) {  
      for (column in columns) {
        result += stores[name][column];
      }
    }
    return result; 
  }
  catch (err) {
    util.log(err);
    return 'read failed';  
  }
};

var insert= function(newstores)  {


  try {
    if (!stores[store.name]) {
      stores.push(store);
      util.log(["insert:", store.name].join(":") );
      return;
    }
    else throw ['duplicate name error', store.name].join(":"); 
  }
  catch (err) {
    util.log(err);
    return 'insert failed';  
  }
};

var update = function (store, column) { 
  try {
    var action= 'no-op'; 
    for (key in store) {                                 
      if (typeof column === 'undefined' || column === key) {
        if (stores[store.name][key]) {
          if (store[key] != stores[store.name][key]) {
            stores[store.name][key] = store[key];           
            action += ["update", key] .join(":");
          }          
        }
        else {
          stores[store.name].push(store[key]);
          action += ["insert", key].join(":");
        } 
      }
      if (column === key)  break;
    }  
    return action; 
  }
  catch (err) {
    util.log(err);
    return 'update failed';  
  }
};

var upsert = function (store) { 
  try {
    if (stores[store.name]) {                                    
      return update (store); 
      }
    else {
      return insert (store.name);
    } 
  }
  catch (err) {
    util.log(err);
    return 'upsert failed';  
  }
};

var remove = function (name) { 
  try {
    if (name === appCache) throw "cannot delete appCache..."
    stores.splice(stores[name]);
    return ["delete", name].join(":");
  }
  catch (err) {
    util.log(err);
    return 'delete failed';  
  }
};

module.exports = {
  name: 'SQLite', 
  descr: 'desktop or in-memory RDBMS',
  version: '0.0.0',
  docs: {
    home: "https://sqlite.org",
    driver: "http://github.com/mapbox/node-sqlite3"
  }, 
  driver: 'sqlite3',   
  filename: module.filename,
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
