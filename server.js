/*
  OpenSSL overwrites private key and certificate during node prestart 
  remove phrase in package.json to be prompted for YOUR passin phrase during create   
  to use you must click thru browser warnings about self-signed certificate 
  
  if you wish to use a CA signed cert, remove entire prestart line
*/
var util= require( 'util' );
var url= require( 'url' );
var fs= require( 'fs' );
var https= require( 'https' );

var favicon= require( 'serve-favicon' );
var Favicon= favicon( './favicon.ico' );             

var httpsPort= 8124;
var options= {
	key: fs.readFileSync( './key.pem' ),
	cert: fs.readFileSync( './cert.pem' )
};

// I think these could be called store libraries?
// npm install --save <each drivername>
//var installedDrivers= ( JSON.parse( fs.readFileSync( './package.json', 'utf8' ) ) ).dependencies;

var stores= {
  Example: require( './example' ),
}
//  Cassandra: require( './cassandra' )
//  MongoDb= require( './mongo' )
//  MSSQL= require( './mssql' )
//  Redis= require( './redis' )
//  Sqlite= require( './sqlite' )

// always pass the JSON object - a bit noisey but enables most data stores as "a possibility"
var selections= {
  '/':        function ( store )  { 
                return [ 'Data Store, NPM Package open in new browser window. Results',
                         'from other selections display here as formatted' ].join(" "); 
              },
  '/options': function ( store )  { 
                return util.inspect( store.options );               
              }, 
  '/docs':    function ( store )  { 
                return util.inspect( store.docs );                  
              }, 
  '/module':  function ( store )  { 
                return fs.readFileSync( store.filename, 'utf8' );   
              },             
  '/object':  function ( store )  { 
                return util.inspect ( store );                      
              },             
  '/source':  function ( store )  { 
                return util.inspect( store.source );                
              },
  '/delete':  function ( store )  { 
                return store.queries.delete( store.name );          
              },  
  '/getOne':  function ( store )  { 
                return store.queries.getByName( store.name );       
              }, 
  '/insert':  function ( store )  { 
                return store.queries.insert( store );               
              }, 
  '/readAll': function ( store )  { 
                return store.queries.readAll( store );              
              }, 
  '/update':  function ( store )  { 
                return store.queries.update( store );               
              },
  '/upsert':  function ( store )  { 
                return store.queries.upsert( store );              
              }
}

https.createServer( options, function ( request, response )  {   
  util.log( util.inspect( request.url ) );    
  Favicon(request, response, function onNext(err) {
    if (err) {
      util.log(err);  
      response.statusCode = 500;
      response.end();
      return;
    }  
    var req= url.parse( request.url, true ); // true=parse the querystring too
    var name= ( req.pathname=== '/'? 'Example': ( req.query=== null? '': req.query.store ) );
    if ( Object.keys( selections ).indexOf( req.pathname )>= 0 && Object.keys( stores ).indexOf( name )>= 0 ) {
      response.statusCode = 200;
      response.end( render( name, req.pathname ) );
    }
  });
}).listen( httpsPort );

util.log( [ 'listening on port ', httpsPort ].join("") );
       
function render( name, path ) {
  var selection= selections[ path ]( stores[ name ] );
//  var store= stores[ name ]; 
  var page= [ 
      '<!DOCTYPE html>',
      '<html>',
        '<head>',
          '<title>WhozUrData?</title>',
          '<style>',
            'th { padding: 4px 10px; }',
            'a,td { padding: 2px 6px; }',
            'textarea { padding: 2px 6px; width: 95%; }',
          '</style>',
        '</head>',
        '<body>',
          '<table border="1" align="center">',
            '<tr>',
              '<th></th>',
              '<th>Data Store</th>',
              '<th><a href="https://www.npmjs.org">NPM Package</a></th>',
              '<th>Configuration</th>',
              '<th>Queries</th>',
              '<th></th>',
            '</tr>' ].join("");    
    Object.keys( stores ).forEach( function( key ) {
      page+= [ 
            '<div id="', stores[key].name, '">',
              '<tr>',            
                '<td>', ( stores[key].name=== name? '<img src="favicon.ico" />': '' ), '</td>',
                '<td><a href="', stores[key].docs.store, '" target="store">', stores[key].name, '</a></td>',  
                '<td><a href="', stores[key].docs.driver, '" target="package">', stores[key].driver, '</a></td>',  
                '<td><a href="./module?store=', stores[key].name, '">module</a>',
                    '<a href="./object?store=', stores[key].name, '">object</a>',
                    '<a href="./options?store=', stores[key].name, '">options</a></td>',
                '<td><a href="./insert?store=', stores[key].name, '">insert</a>',
                    '{ read <a href="./getOne?store=', stores[key].name, '">one</a>',
                          '|<a href="./readAll?store=', stores[key].name, '">all</a>}',
                    '<a href="./update?store=', stores[key].name, '">update</a>',
                    '<a href="./upsert?store=', stores[key].name, '">upsert</a>',
                    '<a href="./delete?store=', stores[key].name, '">delete</a></td>',
                '<td></td>',
              '</tr>',
            '</div>' ].join("");
    } );
    page+= [
            '<div id="resultset">',
              '<tr>',
                '<td></td>',    
                '<td colspan="4">'].join("")
    if ( util.isArray( selection ) && selection.length> 1 )  {
      //rows of shallow columns,
      page+=      '<table border="1">';
      page+= [      '<caption style="color:red">',name ,path, '</caption>' ].join(" ");
      page+=        '<tr>';
      Object.keys( selection[0] ).forEach( function( key ) {
        page+= [      '<th>', key, '</th>' ].join("");
      });
      page+=        '</tr>';
      selection.forEach( function( row ) {
        page+=      '<tr>';
        Object.keys( row ).forEach( function( key ) {
          if (typeof row[key]==='string'&&row[key].length >=40 ) {
            page+= [  '<td><textarea READONLY>', row[key], '</textarea></td>' ].join("");
          }
          else {
            page+= [  '<td>', row[key], '</td>' ].join("");
          }
        });
        page+=      '</tr>';
      });
      page+=    '</table>';
    }  
    else  {
      // enum values if one record, already processed if multiple rows
      selection = ( util.isArray( selection ) ? selection[0] : selection ); 
      if ( typeof selection=== 'object' )  {
        page+=  [ '<table align="center">',
                    '<caption style="color:blue"><left>',name ,path, '</left></caption>' ].join(" "),
        Object.keys( selection ).forEach( function( key ) {
          page+=      '<tr>';
   
          page+=    [   '<td align="right">', key,'</td>',
                        '<td>:</td>' ].join("");
          if ( typeof selection[key]==='string'&&selection[key].length >=40) {
            page+= [    '<td><textarea READONLY>', selection[key], '</textarea></td>' ].join("");
          }
          else {
            page+= [    '<td>', selection[key], '</td>' ].join("");
          }
          page+=      '</tr>';
        });
        page+=      '</table>';
      }
      // stringified or multiline text? 
      else {
        page+= [    '<table align="center">',
                      '<caption style="color:green">',name ," " ,path ,'</caption>',
                      '<tr>',
                        '<td>',
                        '<pre><code>', selection ,'</code></pre>',
//                        '<textarea cols="84" rows="8" READONLY>', selection ,'</textarea>',
                        '</td>',
                      '</tr>' ].join("");   
      }
      page+=        '</table>';
    }
    page+= [    '</td>',    
                '<td></td>',    
              '<tr>',
            '</div>',    
          '</table>',   
        '</body>',
      '</html>' ].join(""); 
  return page;
};



