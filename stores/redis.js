var name = require('path').basename(module.filename, '.js');

var read = function (urData) {
  try {
    var result= [];                                      
    return result; 
  }
  catch (e) {
    throw("read","names", urData.names, "keys", urData.keys, "error", e);
  }
};

var insert = function (urData) {   
  try {
    for (var i in urData.stores) {
      if (1==2) {
        throw ['duplicate name', urData.stores[i].name].join(":"); 
      }      
      // the insert
    }
  }
  catch (e) {
    throw ("insert", "names", Object.keys(urData.stores[i].name), "error", e);
  }
};

var update = function (urData) {          
  try {
    var action = 'no-op'; 
    for (var name in urData.request.query.names) {
      Object.keys(urData.stores).forEach( function(key) {
        
      });
    }  
    return action; 
  }
  catch (e) {
    throw("update","error", e);
  }
};

var upsert = function (urData) { 
  try {

  }
  catch (e) {
    throw("upsert", "error", e);
  }
};

var remove = function (urData) { 
  try {
  }
  catch (e) {
  }
};

var readUrData = function () {
  return '?';  
};

var upsertUrData = function () {
  return '?';  
};

var getEngineVersion = function () {
  return 'TODO';  
};

var getDriverVersion = function () {
  return 'ALSO';  
};

var store = {
  engine: {
    project: 'redis',
    version: undefined,
    getEngineVersion: getEngineVersion
  },
  driver: {
    project: 'redis',
    version: undefined,
    getDriverVersion: getDriverVersion
  },
  options: {},
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
    engine: 'http://redis.org/',
    driver: 'http://nodejs.org/',
  },
  source: [
    { engine: 'https://github.com/antirez/redis/' },
    { driver: 'https://github.com/joyent/node' },
  ]
}; 

module.exports = exports = store;
