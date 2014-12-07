
var util = require('util');
var fs = require('fs');
var emit = require('events').EventEmitter;

// raise event for each touch of scratch space  

// unless a another store is the designated master e.g., 
// when user originated change requires stateful knowledge from 
// the server such as in financial transactions where a store
// with ACID txns may be the preferred master or user profiles, 
// surveys and signups where sharding and replication may be more 
// important to user experience and input validation or messaging 
// where data expiry is available to the user.

// no dependencies between persistent stores
// ap(s) is/are responsible for own mashups and schema expectations    
// no dynamic or rolling changes of the connection manager    
//

var read = function (names, keys) {
  try {
    var result= [];                                      
    for (n in names) {
      result.push( {} );  
      for (k in keys) {
        result[n][keys[k]] = stores[names[n]][keys[k]];
      }
    }
    this.emit({"read": {"names": names, "keys": keys}});
    return result; 
  }
  catch (e) {
    this.emit({"error": e, "read": {"names": names, "keys": keys}});
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
      this.emit({"insert": newstores});
      return;
    }
  }
  catch (e) {
    this.emit({"err": e, "insert": newstores});
    return;  
  }
};

var update = function (names, keys) {          
  try {
    for (name in names) {
      for (key in stores[name]) {                                 
        if (typeof column === 'undefined'||column === key) {
          if (stores[name][key]) {
            if (store[name][key] != stores[store.name][key]) {
              stores[store.name][key] = store[key];           
            }          
          }
          else {
            stores[store.name].push(store[key]);
          } 
        }
        if (column === key) break;
      }  
    }  
    this.emit({"update": {"names": names, "keys": keys}});
    return action; 
  }
  catch (e) {
    this.emit({"err": e, "update": {"names": names, "keys": keys}});
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
      return insert (store);
    } 
  }
  catch (e) {
    // some redundancies with internal emitters 
    this.emit({"err": e, "upsert": newstores});
    return;  
  }
};

var remove = function (names, keys) { 
  try {
    names = util.isArray(names)? names: Object.keys(stores);
    keys= util.isArray(keys)? keys: Object.keys(this.store);   
    for (name in names)  {      
      if (keys) {
        for (key in keys) {
          stores[name][keys[key]] = undefined;
        }
      }
      else {
        stores.splice(stores[name]);
      }
    }        
    // event to help propagate delete to secondary storage  
    this.emit({"remove": {"names": names, "keys": keys}});
    return;
  }
  catch (e) {
    this.emit({"err": e, "remove": {"names": names, "keys": keys}});
    return;  
  }
};

module.exports= {
  name: 'scratch', 
  descr: 'JSON', 
  version: '0.0.1',
  docs: {
    store: 'http://json.org/',
    driver: 'http://nodejs.org/',
    NPM: 'https://www.npmjs.org/doc/',
    javascript: 'http://javascript.crockford.com/',
    whozurdata: 'https://github.com/bwunder/whozurdata'
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
    { v8: 'https://code.google.com/p/v8/' },
    { node: 'https://github.com/joyent/node' },
    { JSON: 'https://github.com/douglascrockford/JSON-js' }, 
    { whozurdata: 'https://github.com/bwunder/whozurdata' },
  ]  
} 


