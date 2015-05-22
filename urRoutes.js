module.exports = {
  '/': function (urData) {
    return 'v. ' + urData['version'];
  },
  '/message' : function() {
  },
  '/urData': function (urData) {
    var key = 
      typeof urData.request.query.attributes === 'string'? 
        urData.request.query.attributes: 
        urData.request.query.attributes[0]; 
    if (key === 'urData') {
      return urData;
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
      return require('fs').readFileSync(urData.stores[urData.storeNames.indexOf(urData.db)].id, 'utf8');
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
  'update': function (urData) { 
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.update(urData);               
  },
  'insert': function (urData) {     
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.insert(urData);               
  }, 
  'upsert': function(urData) { 
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.upsert(urData);              
  },
  'remove': function(urData) {     
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.remove(urData);
  },  
  'dbVersion': function(urData) {     
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.dbVersion();
  },  
  'dvrVersion': function(urData) {     
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.dvrVersion();
  },
  'load': function(urData) {
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.load();
  },  


  'upsertUrData': function(urData) { 
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.upsertUrData(urData);              
  },
  'commit': function(urData) {
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.commit();
  },  
  'concur': function(urData) {
    urData.stores[urData.storeNames.indexOf(urData.db)].queries.concur();
  },  
};
