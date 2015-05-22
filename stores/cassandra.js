var cql = require('node-cassandra-cql');
var util = require('util');
var name = require('path').basename(module.filename, '.js');

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

function getOptions (store) {
  client.execute("SELECT * FROM stores WHERE name = ?", [store.name], callback);
}

function readAll (store) {
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
  var queries = {};
  for (var i in store.options) {






  }

  Object.keys(store.options).forEach(
    function (key) {
      var test = {};
      test[key] = util.inspect(store.options[key]);
util.log(util.inspect(test));
      options[test[0]] = test;
  //    options[key] = util.inspect(store.options[key]);
    });
util.log(util.inspect(options));
  return client.execute(["INSERT INTO stores",
                           "(name, docs, driver, filename, options, queries, source)",
                           "VALUES (?, ?, ?, ?, ?, ?, ?)",
                           "IF NOT EXISTS USING TTL 600"].join(" "),
                         [{hint: 'text', value: store.name},
                           {hint: 'map', value: store.docs} ,
                           {hint: 'text', value: store.driver},
                           {hint: 'text', value: store.filename},
                           {hint: 'map', value: options},
                           {hint: 'map', value: queries},
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
                             "options = ?, queries = ?, source = ?",
                           "WHERE name = ?"].join(" "),
                         [{value: store.docs, hint: 'map'} ,
                           {value: store.driver, hint: 'text'},
                           {value: store.filename, hint: 'text'},
                           {value: store.options, hint: 'map'},
                           {value: store.queries, hint: 'map'},
                           {value: store.source, hint: 'map'},
                           {value: store.name}],
                         callback);
}

function del (store) {
  return client.execute("DELETE FROM stores WHERE name = ?",
                         [store.name],
                         callback);
}

var getVersion = function () {
  return '?';  
};

var dvrVersion = function () {
  return '??';  
};

module.exports= {
  name: name,
  moduleId: module.id,
  store: {
    product: 'Cassandra',
    version: undefined,
    setVersion: getVersion
  },
  driver: {
    name: 'node',
    version: dvrVersion()
  },
  options: {
    hosts: hostArray,
    keyspace: keyspace
  },
  queries: {

    getOne: getOptions,

    read: readAll,  // rename functions to standard
    insert: insert,
    update: updateOptions,
    upsert: upsert,
    remove: del 
  },
  docs: {
    store: "https://cassandra.apache.org",
    driver: "https://github.com/jorgebay/node-cassandra-cql",
    cql: "http://www.datastax.com/documentation/cql/3.1/cql/cql_intro_c.html"
  },
  source: [
    {store: "https://cassandra.apache.org/download/"},
    {driver: "https://github.com/jorgebay/node-cassandra-cql"}
  ]
}

/*
Connected to Test Cluster at localhost:9160.
[cqlsh 4.1.1 | Cassandra 2.0.7 | CQL spec 3.1.1 | Thrift protocol 19.39.0]
Use HELP for help.
cqlsh> use test;
cqlsh:test> CREATE TABLE stores (
        ...             name text,
        ...             docs map<text, text>,
        ...             driver text,
        ...             filename text,
        ...             options map<text, text>,
        ...             queries map<text, text>,
        ...             source map<text, text>,
        ...             PRIMARY KEY (name));
cqlsh:test>  
*/  


