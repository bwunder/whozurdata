module.exports= exports= template= {
  name: "Example",
  docs: {
    //a 1-deep object (contains no collections) of documentation web links
    //store and driver links are reserved and required
    //here store is a self reference (opens in store window)
    //and driver refers to node.js home page (opens in driver window)
    //other link pairs may be added at any time
    store: "https://127.0.0.1:8124",
    driver: "http://nodejs.org", 
    npm: "https://www.npmjs.org",
    datamodel: "https://highlyscalable.wordpress.com"
  },
  driver: "npm-package-name",
  filename: module.filename,
  options: { 
    detail1: "data store connection config",
    maybe2: "might be port or url or whatever is",
    orMore: "required for node to access the store"
  },
  queries: {
    delete: function ( name )  { 
      return 'delete complete';
    },
    getByName: function ( name )  { 
      return [ { key: name, 
                 col1: 'list columns in a row', 
                 col2: 'invoke read only textarea when column length>40' } ]; 
    },
    insert: function ( store )  { 
      return 'example insert complete (no-op)';  
    },
    readAll: function  ( store )  { 
      return [ { key: store.name, col1: 1, col2: '2 or more rows' }, 
               { key: store.name, 
                 col1: 2, 
                 col2: 'invoke read only textarea when column length>40' 
               },
               { key: store.name, col1: 3, col2: 'last row' } ] ; 
    },
    update: function ( store )  { 
      return 'example update complete (no-op)'; 
    },
    upsert: function ( store )  { 
      return 'example upsert complete (no-op)'; 
    }
  },
  source: [
    { store: "https://127.0.0.1:8124" },
    { nodejs: "https://github.com/joyent/node" }
  ]
}; 
