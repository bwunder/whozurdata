var descr = ['This is the collection of JSON objects in node server\'s process space.',
             'The definitions come from javascript modules required by server.js',
             'html npm help also in local npm installations: cmd "npm help npm"'];

var util = require('util');
var fs = require('fs');
var emit = require('events').EventEmitter;

var read = function (names, keys) {
  try {
    var result= [];                                      
    for (n in names) {
      result.push( {} );  
      for (k in keys) {
        result[n][keys[k]] = stores[names[n]][keys[k]];
      }
    }
    return result; 
  }
  catch (e) {
    throw("read","names", names, "keys", keys, "error", e);
    return;  
  }
};

var insert = function (newstores) {   
  try {
    for (i in newstores) {
      if (stores[newstores[i].name]) {
        throw ['duplicate name', store.name].join(":"); 
      }      
      stores[newstores[i].name] = newstores[i];
      //hello... is anybody in there....  
      this.emit(["insert", store.name]);
      return (["insert", store.name].join(":"));
    }
  }
  catch (e) {
    throw ("insert", "names", Object.keys(newstores), "error", e);
    return;  
  }
};

var update = function (names, keys) {          
  try {
    var action = 'no-op'; 
    for (name in names) {
      for (key in stores[name]) {                                 
        if (typeof column === 'undefined'||column === key) {
          if (stores[name][key]) {
            if (store[name][key] != stores[store.name][key]) {
              stores[store.name][key] = store[key];           
              action += ["update", key].join(":");
            }          
          }
          else {
            stores[store.name].push(store[key]);
            action += ["insert", key].join(":");
          } 
        }
        if (column === key) break;
      }  
    }  
    return action; 
  }
  catch (e) {
    throw("update","names", names, "keys", keys, "error", e);
    return;  
  }
};

var upsert = function (newstores) { 
  try {
    for (store in newstores)
    if (stores[store.name]) {                                    
      return update (store); 
      }
    else {
      return insert(store);
    } 
  }
  catch (e) {
    throw("upsert", "error", e);
    return;  
  }
};

var remove = function (names, keys) { 
  try {
    // cache  
    names = util.isArray(names)? names: Object.keys(stores);
    keys= util.isArray(keys)? keys: Object.keys(this.store);   
    for (name in names)  {      
      stores.splice(stores[name]);
    }        
    // event to help propagate delete to secondary storage  
    this.emit(['delete',  name]);
    return ["store ", name, " is deleted from cache"].join("");
  }
  catch (e) {
    throw("remove","names", names, "keys", keys, "error", e);
    return;  
  }
};

module.exports= {
  name: 'redis', 
  version: '0.0.0',
  docs: {
    home: 'http://redis.org/',
    driver: 'http://nodejs.org/',
  }, 
  driver: 'node',   
  filename: module.filename,
  options: {},
  queries: {
    read: read,
    insert: insert,  
    update: update,         
    upsert: upsert,  
    remove: remove    
  },
  source: [  
    { redis: 'http://?' },
    { node: 'https://github.com/joyent/node' },
  ]  
} 


