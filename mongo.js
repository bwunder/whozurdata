var mongoClient = require('mongodb').MongoClient;

var host = '127.0.0.1';
var port = 27017;
var database = 'test';  

var uri = ['mongodb://', host, ':', port, '/', database].join('');

function read (names, keys) {
  mongoClient.connect(uri, function(err, db) {
    if (err) {
      throw err;
    }
    else {
      if (typeof names === 'undefined' || names.length === 0) { 
        names = Object.keys(this.stores); 
      } 
      if (typeof keys === 'undefined' || keys.length === 0) { 
        keys = Object.keys(store);  
      } 
      var query = {'name': {$in: names}};
      var projection = {'_id': 0};
      for (i in keys) {
        projection[keys[i]] = 1;  
      }  
      return db.collection('stores').find().toArray(callback);
    }  
  });
}

function insert (stores) {  
  mongoClient.connect(uri, function(err, db) {
    if (err) {
      throw err;
    }
    else {
      db.collection('stores').insert(stores, callback);
    }
  });
}

function update (stores, keys) {  
  var query = {'name': store.name};
  var options = {'upsert': false};
  mongoClient.connect(uri, function(err, db) {
    if (err) {
      throw err;
    }
    else {
      db.collection('stores').update(query, store, options, callback);
    }
  });
}

function upsert (stores) {  
  var query = {'name': store.name};
  var options = {'upsert' : true};
  mongoClient.connect(uri, function(err, db) {
    if (err) {
      throw err;
    }
    else {
      db.collection('stores').update(query, store, options, callback);
    }
  });
}

function remove (names, keys) {  
  mongoClient.connect(uri, function(err, db) {
    if (err) {
      throw err;
    }
    else {
      db.collection(store.options.collection).remove({'name' : name}, callback);
    }
  });
} 

module.exports= {
  name: 'MongoDb',
  descr: 'collections of documents',
  version: '0.0.0',
  docs: {    
    store: 'http://docs.mongodb.org/manual/',
    driver: 'http://mongodb.github.io/node-mongodb-native/', 
  }, 
  driver: 'mongodb',
  filename: module.filename, // system value
  options: {
    host: host,
    port: port,
    database: database  
  }, 
  queries: {
    read: read, 
    insert: insert,
    update: update,                  
    upsert: upsert,                      
    remove: remove
  },                    
  source: [
    {store: 'http://www.mongodb.org/about/source-code/'},
    {driver: 'http://mongodb.github.io/node-mongodb-native/'}
 ]            
};


