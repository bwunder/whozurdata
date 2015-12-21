var debug = require('debug')('*');
var name = require('path').basename(module.filename, '.js');
// dependencies
var mongoDb = require('mongodb'),
    assert = require('assert'),
    options = {
      server: process.env.IP || 'localhost',
      port: 27017,
      urDb: 'whozUrData',
      urCollection: 'urData'
    },
    uri = ['mongodb://', options.server, ':', options.port, '/', options.urDb].join(''),
    MongoClient = mongoDb.MongoClient;  

//mongo is JSON to BSON, so no data remodel or creepy object mapper needed  

var callback = function(db) {
  db.close();
};

var read = function (urData) {
  MongoClient.connect(uri, function(db) {
    if (typeof urData.names === 'undefined' && typeof urData.keys === 'undefined') {
      var result = db.collection(options.collection).findOne().toArray();
    }
    else {
      if (typeof urData.names === 'undefined' || urData.names.length === 0) { 
        urData.names = urData.storeNames(); 
      } 
      if (typeof urData.keys === 'undefined' || urData.keys.length === 0) { 
        urData.keys = Object.keys(db);  
      } 
      var query = {'stores.store.name': {$in: urData.names}};
      var projection = {'store._id': 1};
      for (var i in urData.keys) {
        projection[urData.keys[i]] = 1;  
      }  
      result = db.collection(options.collection).find(query, projection).toArray();
    }
    db.close();
    return result;
  });
};  

// 
var insert = function (urData) {  
  MongoClient.connect(uri, function(err, db) {
    assert.equal(null, err);
    urData.stores.forEach( function (store) {
      db.collection(options.urCollection).insert([store], function(result) {
        return result;
      });
    });
  });
};  

var load = function () {
  MongoClient.connect(uri, function(err, db) {
    assert.equal(null, err);
    var collection = db.collection(options.urCollection);
    // return a unique doc from the collection 
    collection.find({}).toArray(function(err, docs) {
      assert.equal(null, err);
      assert.ok(docs.length===1); 
      docs[0];
    });      
  });
};  

var update = function (urData) {  
  MongoClient.connect(uri, function(db) {
    for (var s in urData.stores) {
      var query = {'names': urData.store[s].name};
      for (var i in urData.keys) {
      urData.projection[urData.keys[i]]= 1;  
      }  
      // read to emit a backup before image into log stream
      var options = {'upsert': false , 'multi': false };
      db.collection(options.collection).update(query, urData.store[s], options);
      db.close();
    }
  });
};  

var upsert = function (urData) {  
  MongoClient.connect(uri, function(db) {
    urData.mods.forEach(function(store){
      var query = {'names': store.name};
      var options = {'upsert': true , 'multi': false };
      db.collection(options.collection).update(query, store, options);
    });
    db.close();
  });
};  

var remove = function (urData) {  
if (urData.keys.length) {
  update(urData);
}
else
{
  MongoClient.connect(uri, function(db) {
    for (var s in urData.names) {
      var store = urData.stores[s];
      var query = {'names': store.name};
      var options = {justOne: true};
      db.collection(db.store.options.collection).remove(query, options);
    }
    db.close();
    });  
  }
};  

var readUrData = function () {
  MongoClient.connect(uri, function(db) {
    var result = db.collection('urData').findOne().toArray();
    db.close();
    return result;
  });
};

var upsertUrData = function (urData) {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    var query = {};
    var options = {'upsert': true , 'multi': false };
    db.collection('urData').update(query, urData, options);
      db.close();
    });
};  

var getEngineVersion = function() {
  MongoClient.connect(uri, function(err, db) {
    assert.equal(null, err);
    var adminDb = db.admin();
    // Retrive the build information for the MongoDB instance
    adminDb.buildInfo(function(err, info) {
      assert.equal(null, err);
      assert.ok(info);
      db.close();
      debug('mongoClient admin.info.version', info.version);
    });
  });
}

var getDriverVersion = function() {
// how about a function to get the driver versions in udData?
// or build a file of versions in prestart shell script? 
// a list of versions for all top level node_modules
  return mongoDb.version;
};

var store = {
  engine: { 
    project: 'MongoDb',
    version: undefined,
    getEngineVersion: getEngineVersion
  },    
  driver: {
    project: 'mongodb',
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
    engine: 'http://docs.mongodb.org/manual',
    driver: 'http://mongodb.github.io/node-mongodb-native/2.0', 
    BSON: 'http://bsonspec.org/'
  }, 
  source: [  
    {engine: 'http://www.mongodb.org/about/source-code'},
    {driver: 'http://mongodb.github.io/node-mongodb-native'}
  ]
}; 

module.exports = exports = store;
