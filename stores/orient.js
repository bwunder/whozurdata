var name = require('path').basename(module.filename, '.js');
// dependencies
var oriento = require('oriento'),
    options = { forOpen: {host: 'localhost',
                          port: 2424,
                          username: 'orientdb',
                          password: 'orientdb'},
                urDatabase: 'whozurdata',
                urClass: 'urData'
    },
    dependsVersion = JSON.parse(require('fs').readFileSync('./package.json','UTF8')).dependencies['orientdb'],
    server = oriento(options.forOpen),
    db = server.use(options.urDatabase); 

// crud synchonizes the memory object and the orientdb store's persistent state 
var read = function (urData) {
  db.query('select from urData', {
    params: {
    },
    limit: 1
  }).then(function (results){
    urData.results = results;
    return results;
  });
};

var insert = function (urData) {   
  db.insert().into('urData').set(urData).one().then(function (record) {
//    urData.domain.emit('query', {store: name, insert: record});
  });
};

var update = function (names, keys) {          
};

var upsert = function (newstores) { 
};

var remove = function (names, keys) { 
};

var readUrData = function () {
  db.class.get(options.urClass)
    .then(function (urClass) {
      urClass.list()
      .then(function (records) {
//console.log('Found ' + records.length + ' records in ' + urClass.name);
        return records
    });
  });
};

var upsertUrData = function () {
  var dbix, cix;
  server.list()
  .then(function (dbs) {
    dbs.forEach( function (d) {
      if (d.name === options.urDatabase) dbix = dbs.indexOf(d);
    });
    if (typeof dbix === 'undefined') {
      server.create({
        name: options.urDatabase,
        type: 'graph',
        storage: 'plocal'
      })
      .then(function (db) {
//        module.parent.exports.domain.emit('test', {'function': 'upsertUrData', store: name, createDb: options.urDatabase});
      });
    }
    var db = server.use(options.urDatabase);
    db.class.list()
    .then(function (classes) {
      classes.forEach( function (c) {
        if (c.name === options.urClass) cix = classes.indexOf(c);
      });
      if (typeof cix === 'undefined') {
        db.class.create('urData')
        .then(function (urClass) {
        });
      }
// insert or update?

      db.class.get(options.urClass)
      .then(function (urClass) {
        urClass.list()
        .then(function (records) {
        });
      });
    });
  });
};

// no version thru API but we connect now anyway 
// to make sure everything is ready before giving back
// a hardwired version obtained from orientdb console
var getEngineVersion = function () {
  // no version in API so using a manually maintained - by you! - hardcoded value.
  return '2.0-rc2';  
};

var getDriverVersion = function() {
  // don't see version in the npm_module 
      return 'get the oriento package version somewhere';
};

var store = {
    engine: { 
      project: 'OrientDb',
      version: undefined,
      getEngineVersion: getEngineVersion
    },    
    driver: {
      project: 'oriento',
      version: undefined,
      getDriverVersion: getDriverVersion
    },   
    options: options,
    query: {
      read: read,
      insert: insert,
      update: update,
      upsert: upsert,
      remove: remove,
      upsertUrData: upsertUrData,
      readUrData: readUrData
    },
    docs: {
      engine: 'http://orientdb.com/docs/last/index.html',
      driver: 'https://github.com/codemix/oriento'
    }, 
    source: [  
      { engine: 'https://github.com/orientechnologies/orientdb' },
      { driver: 'https://github.com/codemix/oriento'}
    ]  
}; 

module.exports = exports = store;
