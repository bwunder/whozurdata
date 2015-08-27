var fs = require('fs');

module.exports = {
  '/': function (urData) {
    return 'whozurdata v. ' + urData['version'];
  },
  '/urData': function (urData) {
    var key = 
      typeof urData.request.query.attribute === 'string'? 
        urData.request.query.attribute: 
        urData.request.query.attribute[0]; 
    if (key === 'urData') {
      return urData;
    }
    else if (key === 'file')  {
      return fs.readFileSync(urData.stores[urData.storeNames.indexOf(urData.db)].moduleId, 'utf8');
    }
    else if (key === 'license') {
      return fs.readFileSync('./license.txt', 'utf8');
    }
    else {
      return urData[key];
    }
  },
  '/module': function (urData) {
    var key = 
      typeof urData.request.query.keys === 'string'? 
        urData.request.query.keys: 
        urData.request.query.keys[0]; 
    if (key === 'file')  {
      return fs.readFileSync(urData.stores[urData.storeNames.indexOf(urData.db)].moduleId, 'utf8');
    }
    else if (key === 'object') {
      return urData.stores[urData.storeNames.indexOf(urData.db)];
    }
    else {
      return urData.stores[urData.storeNames.indexOf(urData.db)][key];
    }
  },
  'read': function (urData)  { 
    return urData.stores[urData.storeNames.indexOf(urData.db)].queries.read(urData);               
  }, 
  'log': function (urData) { 
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.insert(urData);               
  },
  'remove': function(urData) {     
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.remove(urData);
  },  
  'readUrData': function(urData) {
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.load();
  },  
  'upsertUrData': function(urData) { 
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.upsertUrData(urData);              
  }
};
