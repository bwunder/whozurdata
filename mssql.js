/*
    npm install --save edge
    npm install --save edge-sql
    edge ONLY WORKS ON WINDOWS! - newer builds seem to support mono - need to test

! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !
    expects ADO connection string in environment variable
    SET EDGE_SQL_CONNECTION_STRING=Data Source=localhost;Initial Catalog=test;Integrated Security=True  
! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! 

*/
var edge= require('edge');
var sys= require('sys');

// check for the environment variable on load

module.exports= {
  name: "Microsoft SQL Server",
  version: '0.0.1',
  docs: {
    store: "http://www.microsoft.com/sqlserver",
    driver: "https://github.com/tjanczuk/edge" 
  }, 
  driver: "edge-sql",
  filename: module.filename,
  options: {
    EDGE_SQL_CONNECTION_STRING: process.env.EDGE_SQL_CONNECTION_STRING
  }, 
  queries: {
    read: read,
    insert: insert,  
    update: update,         
    upsert: upsert,  
    remove: remove    
  },
  source: [{edge: "https://github.com/tjanczuk/edge"}] 
}; 

/*  DDL: {
    create: function ()  {  
              return "USE test; \
                      CREATE TABLE store \
                        ( _id NVARCHAR(30) PRIMARY KEY \
                        , descr NVARCHAR(256) \
                        , downloadURL NVARCHAR(128) \
                        , driver NVARCHAR(128) ); \
                      CREATE TABLE keypair \
                        ( [key] NVARCHAR(128) \
                        , cat NVARCHAR(128) \
                        , store_id NVARCHAR(30) \ 
                        , value NVARCHAR(MAX) \
                        , CONSTRAINT pk__keypair \
                        PRIMARY KEY ( kee, cat, store_id ) \
                        , CONSTRAINT fk__keypair__to__store___id \
                        FOREIGN KEY ( store_id ) REFERENCES store ( _id ) );";
            },
    alter: function ()  {  
             return "not specified";   
           },
    drop: function ()  {  
            return 'USE test; \
                    DROP TABLE keypair; \
                    DROP TABLE store;';
          }            
 }
*/

var read = function (names, keys) {
  // need here strings for query building????
  return edge.func('sql', function () {/*
  SELECT * FROM store WHERE name = '?'
*/});
};
    
var insert = function (newstores) {   
  return edge.func('sql', function () {/*
  INSERT INTO store ( name, description, downloadURL, driver, options, DQL, DML, DDL )
  VALUES (?, ?, ?, ?, ?, ?, ?, ? ) IF NOT EXISTS"
*/});
};

var update = function (names, keys) {          
  return edge.func('sql', function () {/*
  UPDATE store SET name= '?', description= '?', downloadURL= '?', driver= '?', options, DQL, DML, DDL"
*/});
};

var upsert = function (newstores) { 
//MERGE and conditionals won't work - driver looking for SELECT,  
};

var remove = function (names, keys) { 
  return  edge.func('sql', function () {/*
  DELETE store WHERE name = '?'
*/});
};

/*
exports.read= function( response ) {  
  sqlFind( null, function( error, result ) {
    if ( error ) throw error; 
    if ( result ) {
      response.write('<table border="1">');
      if ( sys.isArray( result ) && result.length>=2 )  {
        response.write('<tr>');
        Object.keys( result[0] ).forEach( function( key ) {
          response.write('<th>' + key + '</th>');
        });
        response.write('</tr>');
        result.forEach( function( row ) {
          response.write('<tr>')
          Object.keys( row ).forEach( function( key ) {
            if ( typeof row[key]==='string' && row[key].length>=40 ) {
              response.write('<td><textarea DISABLED>' + row[key] + '</textarea></td>');
            }
            else {
              response.write( '<td>' + row[key] + '</td>' );
            }
          });
          response.write('</tr>');
        });
      }
      else  {
        Object.keys( result[0] ).forEach( function( key ) {
          response.write( '<tr><td>' + key + '</td><td>' + result[0][key] + '</tr>');
        });
      }
      response.write( '</table>' );
    }
    sys.log("rows returned " + result.length)
  });
}
*/

