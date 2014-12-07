var util = require('util');
var fs = require('fs');

var urRoutes = {
  '/': function (urData) {return urData;},
  '/info': function (urData) {return urData['info'];
  },
  '/interface': function (urData) {
    var key = typeof urData.req.query.keys === 'string'?urData.req.query.keys: urData.req.query.keys[0]; 
    if (key === 'file')  {
      return fs.readFileSync(urData.stores[urData.req.query.db].filename, 'utf8');
    }
    else if (key === 'object') {
      return urData.stores[urData.req.query.db];
    }
    else {
      return urData.stores[urData.req.query.db][key];
    }
  },
  'read': function (urData)  { 
    return urData.stores[urData.req.query.db].queries.read(urData.names, urData.keys);               
  }, 
  'update': function (urData) { 
    urData.stores[urData.req.query.db].queries.update(urData.names, urData.keys);               
    return 'updated';
  },
  'insert': function (urData) {     
    urData.stores[urData.req.query.db].queries.insert(urData.names, urData.keys);               
    return 'inserted';
  }, 
  'upsert': function(urData) { 
    urData.stores[urData.req.query.db].queries.upsert(urData.names, urData.keys);              
    return 'upserted';
  },
  'remove': function(urData) {     
    urData.stores[urData.req.query.db].queries.remove(urData.names, urData.keys);
    return 'removed';          
  }  
}

var header = function (storenames, db) {
  var choices = new String;
  storenames.forEach(function (name) {        
                          choices += ['<option', name===db? ' selected>': '>', name].join("");
                        });
  return [ '<form action="/">',              
             '<label for="db">',
               '<a href="/"><img src="favicon.ico"  alt="WhozUrData" /></a>',  
               '<select id="db" name="db" class="dropdown" onchange="submit()">',
                 choices,
               '</select>',
             '</label>',
             '<a href="/info">?</a>',  
           '</form>'].join("\n")              
}  

//          '[', storeName, '](', storeURL,' "', storeName, ' home page")<br />',

var name = function (storeName, storeURL, storeVer) {
  return ['<label>data source</label>',
          ['<a href="', storeURL, '>', storeName, '</a>'].join(""),  
          ['<label class="version">v.', storeVer, '</label>'].join("")].join("\n"); 
}  

var driver = function (driverName, driverURL, driverVer) {
  return ['<label>', 
           ['<a href="https://npmjs.org/', driverName, '"',
              ' alt="package page at npm web site">NPM</a>', 
              ' package<br /></label>'].join(""),
          ['<a href="', driverURL, '">', driverName, '</a>'].join(""), 
          ['<label>v.', driverVer, '</label>'].join("")].join("\n");
}

var filename = function (keynames, storeName) {
  var choices = ['<option value= "" selected disabled>view&nbsp;&hellip;',
                 '<option>file',
                 '<option>object'].join("\n");                    
  keynames.forEach(function(key) {
                      choices += ['<option>', key,'\n'].join("");
                   });
  return ['<form action="/module">',                    
            ['<input type="hidden" name="db" value="', storeName,'">'].join(""),
            '<label for="keys">module', 
              '<select id="keys" class="dropdown" onchange="submit()">',
                  choices,  
              '</select>',
            '</label>',
          '</form>'].join("\n");
}

var docs = function (storeName, docs) {
  var choices = '<option value= "" selected disabled>rtfm&hellip;';
  for (doc in docs) {  
    choices += ['<option value= "', docs[doc], '">', doc ,'  &rarr; ', docs[doc], '\n'].join("");
  }
  return ['<form action="/docs">\n',                    
            '<input type="hidden" name="db" value="', storeName,'">\n',
            '<label for="docs">docs',
              '<select id="docs" class="dropdown" onchange="window.location= this.value">',
                choices, 
              '</select>',
            '</label>',
          '</form>'].join("\n");
}

var queries = function (storenames, keynames, querynames, storeName) {
  var queries = new String;
  var names = new String;
  var keyCols = new String;
  storenames.forEach(function (name) {  
                        names += ['<option', 
                                   name === storeName? ' selected>': '>', 
                                   name, '\n'].join("");
                      });  
  keynames.forEach(function (key) {
    keyCols += ['<option selected>', key, '\n'].join("");
  });
  querynames.forEach(function (query) {
    queries += ['<option>',query, '\n'].join("");
  });
  return [  '<form name="query" action="/query">\n',                  
              '<label for="db" class="query">query<br />', 
                '<input type="hidden" name="db" value="', storeName,'">',
                '<select name="path">',        
                  queries, 
                '</select>',        
              '</label>',    
              '<label for="names"> stores<br />',  
                '<select name="names" multiple>',   
                  names,
                '</select>',
              '</label>',
              '<label for="keys"> keys<br />',
                '<select name="keys" multiple>', 
                  keyCols,        
                '</select>',
              '<button title="run the query" onfocus="submit()">&#x25BA;</button>',
              '</label>',    
            '</form>'].join('\n'); 
}

var source = function (storeName, source) {
  var choices = '<option value="" selected disabled>review&hellip;';
  source.forEach(function (nameValue) {    
    choices += ['<option value= ',
                '"', Object.keys(nameValue)[0], '">',
                Object.keys(nameValue)[0],
                '&nbsp;&rarr;&nbsp;',  nameValue[Object.keys(nameValue)[0]], '\n'].join(""); });  
  return ['<form action="/source">',                    
            '<input type="hidden" name="db" value="', storeName,'">',
            '<label>source',
              '<select name="source" class="dropdown" onchange="window.location= this.value">',
                choices, 
              '</select>',
            '</label>',
          '</form>'].join('\n');
}      
 
var footer = function (version, email) {
  return [
    '<span id="footer">whozurdata v. ', version,
    '&nbsp;&sect;&nbsp;',
    '<mailto:',  email, '>', '</span>' ].join("");  
}

var textarea = function (value) {
  return ['<textarea  class="result">',
            value ,
          '</textarea>'].join(""); 
}

var toTable = function (rowObject) {
  try  {
    var tbl = new String;
    tbl += '<table class="result">';
    for (colKey in rowObject) {
      tbl += ['<tr>',
              '<td valign="top">', colKey,':</td>', 
              '<td>' ].join("");
      if (util.isArray(rowObject[colKey])) {
        for (i in rowObject[colKey]) {
          tbl += [urRenderer.toMarkup(rowObject[colKey][i]), '<br />'].join("");                 
        }
      }
      else {
        if (typeof rowObject[colKey]==='object') {
          tbl += '<table>';
          for (childKey in rowObject[colKey]) {  
            tbl += ['<tr>',
                      '<td valign="top">', childKey,':</td>', 
                      '<td>', 
                        toMarkup(rowObject[colKey][childKey]), 
                      '</td>',
                    '</tr>'].join("");
          }
          tbl += '</table>';
        } 
        else { 
          tbl += rowObject[colKey];
        }     
      }
      tbl += '</td>';
      tbl += '</tr>';
    }
    tbl += '</table>';
    return tbl;
  }
  catch (e) {
    throw ["toTable error", e].join(":");
  }
}

var toMarkup = function (value) {
  try  {
    var markup;
    switch (typeof value) {  
      case ('undefined'):
        markup = 'undefined'; 
        break;
      case ('function'):
              textarea(value.toString().split('\n'));
        break;
      case ('object'):
        if (util.isArray(value)) {  
          for (i in value) {
            markup += toMarkup(value[i]);
          }
        }
        else {
          markup = textarea(util.inspect(value));
        }
        break;
      case('string'):
        if (value.search( /http[s:]/i) === 0) {
          markup = '<a href="', value,'">', value,'</a>';
        }   
        else {
          markup = textarea( value.split('\n'));
        }
        break;
      case('number'):
        markup = value;
        break;
      default:                                    
        markup = textarea(value.toString());
    }
    return markup;
  }
  catch (e)  {
    throw ["toMarkup error", e].join(":");
  }
}

var toPage = function (urData) {  
  try { 
    // could also fetch the stylesheet and js once per server start  
    // -- as coded, the css and js files are reloaded at each page request 
    // -- easier dev - can be modified without need to restart node server 
    // be sure to prefix the css - try http://pleeease.io/play/ (uses Autoprefixer)
    var page = [
      '<!DOCTYPE html>',
        '<html>',
          '<head>',
            '<meta charset="utf-8">',
            '<title>WhozUrData?</title>',
            '<style type="text/css">',
            '<!--',
              fs.existsSync('./style.css')? fs.readFileSync('./style.css', 'utf8'): 'no file',
            '-->',
            '</style>',  
            '<script type="text/javascript">',
            '<!--',
              fs.existsSync('./head.js') ? fs.readFileSync('./head.js', 'utf8') : 'no file',
            '-->',
            '</script>',
          '</head>',
          '<body>',
            '<div id="mall">',
              '<div id="logo">',
                header(Object.keys(urData.stores), urData.db), 
              '</div>',
              '<div id="store">',       
                ['<div class="name">',  
                    name(urData.db, 
                         urData.stores[urData.db].docs.store,
                         urData.stores[urData.db].version), 
                  '</div>'].join('\n'),  
                ['<div class="driver">',  
                    driver(urData.stores[urData.db].driver, 
                           urData.stores[urData.db].docs.driver,
                           process.versions[urData.stores[urData.db].driver]), 
                  '</div>'].join('\n'),  
                ['<div class="manual">',  
                    filename(Object.keys(urData.stores[urData.db]), urData.db), 
                    docs(urData.db, urData.stores[urData.db].docs),
                    source(urData.db, urData.stores[urData.db].source),     
                 '</div>'].join('\n'),
                ['<div id="foot">',    
                   footer(urData.version, urData.email),
                 '</div>'].join('\n'),  
                ['<div class="queries">',  
                  queries(Object.keys(urData.stores),
                          Object.keys(urData.stores[urData.db]),
                          Object.keys(urData.stores[urData.db].queries),
                          urData.db), 
                 '</div>'].join('\n'),  
              '</div>',
              '<div id="results">',
                '<label>Query Results<br />'].join("\n");
    ( function (results) {
        if (util.isArray(results)) {
          for (row in results) {  
            page+= toTable(results[row]);      
          }
        }
        else {
          page+= toMarkup(results);        
        }
      })(urRoutes[urData.route](urData));
    page+= [    '</label>',
              '</div>',  
            '</div>',
            '<script type="text/javascript">',
            '<!--\n',
              fs.existsSync('./body.js')? fs.readFileSync('./body.js', 'utf8'): 'no file',
            '\n-->',
            '</script>',
          '</body>',
        '</html>' ].join("\n"); 
    return page;
  }
  catch (e)  {
    throw ["toPage error", e].join(":");
  }
} 
         
// expose urData storage configuration for review, query, test/validation & changes    
module.exports = function () {
  try { 
    // expecting to find ONE collection in server.js 
    var urData = require.main.exports; 
    // get the server's data source collection
    urData.route = (urData.req.pathname === '/query')? urData.req.query.path: urData.req.pathname;
    // backfill search args if not provided         
    if (typeof urData.req.query.names==='undefined') {
      // all configured data stores
      urData.req.query.names = Object.keys(urData.stores);
    }  
    if (typeof urData.req.query.keys==='undefined') {
      // all top level keys from current urData.db schema  
      // schema should all be same except in options object.   
      urData.req.query.keys = Object.keys(urData.stores[urData.db]);
    }    
    //paint the page with the requested query result(s) 
    return toPage(urData);
  }
  catch (e) {
    urData.error = e;
    util.error(util.inspect(urData));
    return 'unable to render page';  
  }
}
