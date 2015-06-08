var name = require('path').basename(module.filename, '.js');
var descr = ['This is the collection of JSON objects in node server\'s process space.',
             'The definitions come from javascript modules required by server.js',
             'html npm help also in local npm installations: cmd "npm help npm"'];

var util = require('util');
var fs = require('fs');

var read = function (urData) {
  try {
    var result= [];                                      
    return result; 
  }
  catch (e) {
    throw("read","names", names, "keys", keys, "error", e);
    return;  
  }
};

var insert = function (urData) {   
  try {
    for (i in urData.stores) {
      if (1==2) {
        throw ['duplicate name', urData.stores[i].name].join(":"); 
      }      
      // the insert
    }
  }
  catch (e) {
    throw ("insert", "names", Object.keys(urData.stores[i].name), "error", e);
    return;  
  }
};

var update = function (urData) {          
  try {
    var action = 'no-op'; 
    for (var name in urData.request.query.names) {
      for (var key in urData.stores[urData.storeNames.indexOf(name)]) {                                 
      }  
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
    project: 'redis',
    version: undefined,
    setVersion: getVersion
  },
  driver: {
    project: 'node',
    version: dvrVersion()
  },
  options: {},
  queries: {
    read: read,
    insert: insert,
    update: update,
    upsert: upsert,
    remove: remove,
    upsertUrData: upsertUrData,
    readUrData: readUrData
  },
  docs: {
    store: 'http://redis.org/',
    driver: 'http://nodejs.org/',
  },
  source: [
    { store: 'http://?' },
    { driver: 'https://github.com/joyent/node' },
  ]
} 
