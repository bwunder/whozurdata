// very low usage frequencies so close connection at end of each task
var name = require('path').basename(module.filename, '.js'),
    mongoDb = require('mongodb'),
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
      db.close();
//      urData.domain.emit('query', {module: module.id, query: query, projection: projection, result: result});
    }
    return result;
  });
};  

// 
var insert = function (urData) {  
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    urData.stores.forEach( function (store) {
      db.collection(options.urCollection).insert([store], function(result) {
//        urData.domain.emit('query', {module: module.id, 
//                                     db: options.configDb, 
//                                     collection: options.configCollection, 
//                                     insert: urData});
        return result;
      });
    });
  });
};  

var load = function (urData) {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    var collection = db.collection(options.urCollection);
    // should only ever be one doc in collection
    collection.find({}).toArray(function(err, docs) {
      if (err)  {
        throw(err);
//        urData.domain.emit('error', err); 
      }
      if (docs.length > 1) {
        throw('too many documents! count=' + docs.length);
//        urData.domain.emit('error', 'too many documents! count=' + docs.length);
      }
      urData = docs[0];
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
//      urData.domain.emit('query', {module: module.id, update: urData.stores[s]});
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
//      urData.domain.emit('query', {module: module.id, upsert: store});
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
//      urData.domain.emit('query', {module: module.id, query: query, options: options, remove: store});
    }
    db.close();
    });  
  }
};  

var readUrData = function (urData) {
  MongoClient.connect(uri, function(db) {
    var result = db.collection('urData').findOne().toArray();
    db.close();
//    urData.domain.emit('query', {module: module.id, result: result});
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

var getVersion = function() {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    var adminDb = db.admin();
    adminDb.buildInfo(function(err, info) {
      if (err) throw err;
      db.close();
      module.parent.exports.stores[module.parent.exports.storeNames.indexOf(name)].store.version = info.version;
//      module.parent.exports.domain.emit('test', {'function': 'getVersion', store: name, 'result': info.version});
    });
  });
};
/* try this - see if it works with the intercep
  MongoClient.connect(uri, function(db) {
    var adminDb = db.admin();
    adminDb.buildInfo(function(info) {
      db.close();
      module.parent.exports.stores[module.parent.exports.storeNames.indexOf(name)].store.version = info.version;
      module.parent.exports.domain.emit('test', {'function': 'getVersion', store: name, 'result': info.version});
    });
  });
};
*/
module.exports = {
  name: name,
  moduleId: module.id,
  store: { 
    project: 'MongoDb',
    version: undefined,
    setVersion: getVersion
  },    
  driver: {
    project: 'mongodb',
    version: mongoDb.version
  },   
  options: options,
  queries: {
    read: read,
    log: insert,  
    upsert: upsert,  
    remove: remove,
    upsertUrData: upsertUrData,
    readUrData: readUrData    
  },
  docs: {
    store: 'http://docs.mongodb.org/manual',
    driver: 'http://mongodb.github.io/node-mongodb-native/2.0', 
    BSON: 'http://bsonspec.org/'
  }, 
  source: [  
    {store: 'http://www.mongodb.org/about/source-code'},
    {driver: 'http://mongodb.github.io/node-mongodb-native'}
  ]  
}; 

