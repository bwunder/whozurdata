var name = require('path').basename(module.filename, '.js');
//dependencies
var cql = require('node-cassandra-cql');
var util = require('util');

// Cassandra cluster details
var hostArray = ["127.0.0.1:9042"];
var keyspace = "test";

// package will manage connection at exe no explicit open/close req'd
var client = new cql.Client({hosts: hostArray, keyspace: keyspace});

var callback = function (err, result) {
  if (err) {
    util.log([ "Cassandra callback err:", err ].join(":"));
  }
  else {
//    util.log( [ 'Cassandra callback rows', result.rows.length ].join(":") );
//util.log( [ 'results', util.inspect ( result ) ].join(":") );
    return result.rows;
  }
}

var upsertUrData = function (urData) {
    
    
}; 

var readUrData = function (urData) {
  //init urdata obj
  client.execute("SELECT * FROM urData", callback);
  // 

}; 


function getOptions (store) {
  client.execute("SELECT * FROM stores WHERE name = ?", [store.name], callback);
}

function read (store) {
//  client.execute( ["SELECT name, WRITETIME(name),",
//                     "filename, WRITETIME(filename),",
//                     "options[0].hosts, WRITETIME(options[0].hosts),",
//                     "options[0].keyspace, WRITETIME(options[0].keyspace)",
  return client.executeAsPrepared("SELECT * FROM stores", [], callback);
}
/*
upsert or insert?
"...UPDATE does not check the prior existence of the row by default:
 the row is created if none existed before, and updated otherwise.
 Furthermore there is no mean to know which of creation or update happened."
*/
function insert (store) {
/*1-deep only!, options may need to be flattened, and queries serialized
  else each in own keyspace (and options hierarchy unwound until max 2-deep).
*/  
  var options = {};
  var query = {};
  for (var i in store.options) {






  }

  Object.keys(store.options).forEach(
    function (key) {
      var test = {};
      test[key] = util.inspect(store.options[key]);
      options[test[0]] = test;
  //    options[key] = util.inspect(store.options[key]);
    });
  return client.execute(["INSERT INTO stores",
                           "(name, docs, driver, filename, options, query, source)",
                           "VALUES (?, ?, ?, ?, ?, ?, ?)",
                           "IF NOT EXISTS USING TTL 600"].join(" "),
                         [{hint: 'text', value: store.name},
                           {hint: 'map', value: store.docs} ,
                           {hint: 'text', value: store.driver},
                           {hint: 'text', value: store.filename},
                           {hint: 'map', value: options},
                           {hint: 'map', value: query},
                           {hint: 'map', value: store.source}],
                         callback);
}

function updateOptions (store) {
  // to avoid unwanted insert check for existence or include a timestamp
  // this relies on the source of the data as proof enough...
  return client.execute('UPDATE stores SET options = ? WHERE name = ?',
                         [client.options, store.name],
                         callback);
}

function upsert (store) {
  return client.execute(["UPDATE stores",
                           "SET docs = ?, driver = ?, filename = ?,",
                             "options = ?, query = ?, source = ?",
                           "WHERE name = ?"].join(" "),
                         [{value: store.docs, hint: 'map'} ,
                           {value: store.driver, hint: 'text'},
                           {value: store.filename, hint: 'text'},
                           {value: store.options, hint: 'map'},
                           {value: store.query, hint: 'map'},
                           {value: store.source, hint: 'map'},
                           {value: store.name}],
                         callback);
}

function del (store) {
  return client.execute("DELETE FROM stores WHERE name = ?",
                         [store.name],
                         callback);
}

var getEngineVersion = function () {
  return '?';  
};

var getDriverVersion = function () {
  return '??';  
};

var store = {
  engine: {
    project: 'Cassandra',
    version: undefined,
    getEngineVersion: getEngineVersion
  },
  driver: {
    project: 'node-cassandra-cql',
    version: undefined,
    getDriverVersion: getDriverVersion
  },
  options: {
    hosts: hostArray,
    keyspace: keyspace
  },
  query: {
    read: read,  
    log: insert,
    upsert: upsert,
    remove: del,
    upsertUrData: upsertUrData,
    readUrData: readUrData 
  },
  docs: {
    engine: "https://cassandra.apache.org",
    driver: "https://github.com/jorgebay/node-cassandra-cql",
    cql: "http://www.datastax.com/documentation/cql/3.1/cql/cql_intro_c.html"
  },
  source: [
    { engine: "https://cassandra.apache.org/download/" },
    { driver: "https://github.com/jorgebay/node-cassandra-cql" }
  ]
};
  
module.exports = exports = store;

/*
Connected to Test Cluster at localhost:9160.
[cqlsh 4.1.1 | Cassandra 2.0.7 | CQL spec 3.1.1 | Thrift protocol 19.39.0]
Use HELP for help.
cqlsh> use test;
cqlsh:test> CREATE TABLE urData (
  db text,                      
  config map<text text>,
  methods: { 
    verifySchema: verifySchema,        // objects fixed schema key integrity is intact
    getServerIPV4s: getServerIPV4s,    // local IPs where node server is listening for web requests 
    load: load,                        // object load from urData.db
    shoot: shoot,                      // serialize utData buffer object to new file in __dirname+'/snapshots' folder 
    reload: reload,                    // object load from a specified snapshot
    commit: commit,                    // buffer object save to urData.db - for scratch is a snapshot
    concur: concur,                    // syncronize object using specified master, version as distributed
    close: close                       // remove a store from the buffer object  
  },
  license: 'MIT',                      // full text in license.txt
  version: '0.0.4',
  
  ...             docs map<text, text>,
        ...             driver map<text, text>,
        ...             options map<text, text>,
        ...             query map<text, text>,
        ...             source map<text, text>,
        ...             PRIMARY KEY (name));
cqlsh:test> CREATE TABLE stores (
        ...             name text,
        ...             docs map<text, text>,
        ...             driver map<text, text>,
        ...             options map<text, text>,
        ...             query map<text, text>,
        ...             source map<text, text>,
        ...             PRIMARY KEY (name));
cqlsh:test>  
*/  


