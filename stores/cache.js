var name = require('path').basename(module.filename, '.js');

var read = function (names, keys) {
console.log(names, keys);
  var reply= [];
  names.forEach( function(name) {
    var store = module.parent.exports.stores[name];
    var row = {};
    keys.forEach(function(key) {
      row[key] = store[key];
    });
    reply.push(row);
  });
  return reply;
};

//TODO?  commit() upserts the buffered urData object into urData.db (generates version token, no-op returns prev token, collions mediated)
//TODO?  concur() commits the buffered urData object into every other store in collection (uses single version token of the commit)

// cache inserts create a store module file
var insert = function (store) {
  console.log('insert store %s here', store);  
};

// cache updates are store module file edits
var update = function (names, keys) {
  console.log('update keys %s in stores %s here', keys, names);  
};

// cache updates are store module file edits
var upsert = function (names, keys) { 
  names.forEach( function(name) {
    if (module.parent.exports.stores[name]) {
      update(name, keys);
    }
    else {
      insert(name);
    }
  });
};

// cache deletes move store modules to the deleted folderme
var remove = function (names) {
  console.log('move module files for store(s) %s to deleted folder', names)
};

// only provide if engine instance is available  
var getEngineVersion = function () {
  return process.versions.v8;
};

var getDriverVersion = function () {
  return process.version;
};

var readUrData = function() {
  return module.parent.exports
}

var upsertUrData = function() {
console.log('upsert urData attributes in cache now');  
  return; 
}

// every store must minimally implement this schema
// any product can be used by multiple stores 
// drivers must come from npmjs.org
// options objects will vary according to connection needs but no object attribs allowed
// queries can include different or overlapping functions according to requirements
// docs - and source if need be - can include any useful links - "store" and "driver" items at a minimum
var store = {
  engine: {
    project: 'v8',
    version: undefined,
    getEngineVersion: getEngineVersion
  },
  driver: {
    project: 'node.js',
    version: undefined,
    getDriverVersion: getDriverVersion
  },
  options: {},
  query: {
    read: read,
    log: insert,
    upsert: upsert,
    remove: remove,
    upsertUrData: upsertUrData,
    readUrData: readUrData
  },
  docs: {
    engine: 'https://developers.google.com/v8/intro',
    driver: 'https://nodejs.org/',
    JSON: 'http://json.org/',
    NPM: 'https://www.npmjs.org/doc/',
    javascript: 'http://javascript.crockford.com/',
    devdocs: 'http://devdocs.io/'
  },
  source: [
    {engine: 'https://code.google.com/p/v8/'},
    {driver: 'https://github.com/nodejs/node'},
    {JSON: 'https://github.com/douglascrockford/JSON-js'},
    {whozurdata: 'https://github.com/bwunder/whozurdata'}
  ]
}; 

module.exports = exports = store;
