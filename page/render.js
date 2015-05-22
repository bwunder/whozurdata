var fs = require('fs');

module.exports = function(urData) {
  var s = urData.storeNames.indexOf(urData.db);
  var db = urData.stores[s];
  var catalog = function () {
    var choices = ['<option ', db.name, ' selected disabled>',
                      db.name,
                  '</option>'].join(''); 
    urData.stores.forEach( function(store) {
      if (store.name != db.name) {
        choices += ['<option>',
                      store.name, 
                    '</option>'].join(''); 
      }
    });
    return ['<form id="store" action="/">',
              '<fieldset>',
                '<legend>data store</legend>',
                '<select id="db" name="db" onchange="submit()" title="source of urData" required >',
                  '<datalist id="dbChoices">', choices, '</datalist>',
                '</select>',
                '<label>engine: <b>', db.store.product, '</b>&nbsp;', db.store.version, '</label>', 
                '<label>driver: <b><a href="http://npmjs.com/package/', db.driver.name, '" target="_blank">',
                    db.driver.name, '</a></b>&nbsp;', db.driver.version, '</label>',
              '</fieldset>',
            '</form>'].join('');              
  }; 
  var attributes = function () {
    var hint = 'inspect urData';
    var attributeChoices = [
      '<option selected disabled>', hint, '&hellip;</option>',
      '<option value="urData">urData object</option>',
      '<optgroup label="key attributes...">'].join('');                    
    Object.keys(urData).forEach(function(attributes) {
      attributeChoices += ['<option value="', attributes ,'">', attributes, '</option>'].join('');
    });
    attributeChoices += '</optgroup>';
    return ['<select name="attributes" placeholder="', hint,'..." onchange="getObject(this)">',
              '<datalist>', attributeChoices, '</datalist>',
            '</select>'].join('');
  };
  var module = function () {
    var hint = 'inspect ' + urData.db;
    var moduleChoices = [
      '<option selected disabled>', hint, '&hellip;</option>',
      '<option value="file">source file</option>',
      '<option value="object">db interface</option>',
      '<optgroup label="object keys...">'].join('');                    
    Object.keys(db).forEach(function(key) {
      moduleChoices += ['<option>', key, '</option>'].join('');
    });
    moduleChoices += '</optgroup>';
    return ['<select name="keys" placeholder="', hint,'..." onchange="getModule(this)">',
              '<datalist>', moduleChoices, '</datalist>',
            '</select>'].join('');
  };
  var docs = function () {
    var hint = 'read documents';
    var docChoices = ['<option selected disabled>', hint,'&hellip;</option>'].join('');
    Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)].docs).forEach( function(doc) {  
      docChoices += ['<option label="', doc, , '" value= "', 
                      urData.stores[urData.storeNames.indexOf(urData.db)].docs[doc], '">'].join('');
    });
    return ['<select name="docs" onchange="openDoc(this)" title="Internet documents"',
                    'placeholder="', hint, '...">',
              '<datalist>', docChoices, '</datalist>',
            '</select>'].join('');
  };
  var source = function () {
    var hint = 'review code';
    var sourceChoices = ['<option value="" selected disabled>', hint,'&hellip;</option>'].join('');
        urData.stores[urData.storeNames.indexOf(urData.db)].source.forEach(function (nameValue) {    
          sourceChoices += ['<option label="', Object.keys(nameValue)[0], 
                            '" value="', nameValue[Object.keys(nameValue)[0]], '">'].join(''); 
    });
    return ['<select name="source" onchange="openSource(this)"',
                    'placeholder="', hint,'&hellip;">',
              '<datalist>', sourceChoices, '</datalist>',
            '</select>'].join('');
  };      
  var question = function () {
    var queries = '<option value="" selected disabled>proc&hellip;</option>';
    var names = '<option value="" disabled>store(s)</option>';
    var keys = '<option value="" disabled>key(s)</option>';
    urData.storeNames.forEach(function (name) {  
      names += ['<option',
               urData.request.query.names.indexOf(name) >= 0? ' selected>': '>', 
               name, '</option>'].join("");
    });
    Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)]).forEach(function (key) {
      keys += ['<option',
               !urData.request.query.keys || urData.request.query.keys.indexOf(key) >= 0? ' selected>': '>', 
               key, '</option>'].join("");
    });
    Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)].queries).forEach(function (proc) {
      queries += ['<option',
               urData.request.query.path === proc? ' selected>': '>', 
               proc, '</option>'].join("");
      });
      return ['<form id="query" action="/query">',
                '<fieldset>',
                  '<legend>query</legend>',
                  '<input type="hidden" name="db" value="', urData.db, '">',
                  '<select id="proc" name="proc" required>',
                    '<datalist>', queries, '</datalist>',
                  '</select>',        
                  '<select id="names" name="names" multiple>',
                    '<datalist>', names, '</datalist>',
                  '</select>',
                  '<select id="keys" name="keys" multiple>',
                    '<datalist>', keys, '</datalist>',
                  '</select>',
                  '<button>run <span id="runner">&#x25BA;</span></button>',
                '</fieldset>',
              '</form>'].join(''); 
  };
  var answer = function () {
    var markup = [];
    var reply = urData.routes[urData.route](urData);
    if (Array.isArray(reply) && typeof reply[0] === 'object') {
      for (var row in reply) {  
        markup += toTable(reply[row]);      
      }
    }
    else {
      markup = toMarkup(reply);        
    }
    return  ['<form id="results">',
                '<fieldset>',  
                  '<legend>results</legend>',
                  markup,
                '</fieldset>',  
              '</form>'].join('');
  };
  var resources = function() {
    return ['<form id="resources">',
              '<fieldset>',  
                '<legend>resources</legend>',
                  attributes(), 
                  module(), 
                  docs(),
                  source(),     
                '</fieldset>',
              '</form>'].join('');
  };  
  var mall = function () {
    return [catalog(), 
            resources(),
            yo(),
            question(),
            answer()].join('');  
  };
  var yo = function() {
    return ['<form id="chatform" action="/message">',
              '<fieldset>',  
                '<legend>',
                  'chat',
                '</legend>',
                '<input id="m" autocomplete="off" /><button>Send</button>',
              '</fieldset>',
            '</form>'].join('');
  };  
  var embedFile = function ( relPath ) {
    return fs.existsSync( relPath )? fs.readFileSync(relPath, 'utf8'): 'no file';
  }; 
  var toTextarea = function (value) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    return ['<textarea  class="resultItem" onfocus="openTextarea(this)" onblur="closeTextarea(this)">',
              value.replace(/[<!="'\/>&]/g, 
                 function(char) {
                    return {
                       "<":"&lt;",
                       "!":"&#033;",
                        "=":"&#061;",
                        '"':"&quot;",
                        "'":"&apos;",
                        "/":"&#047;",
                        ">":"&gt;",
                        "&":"&amp;"
                    }[char];
                 }),
            '</textarea>'].join(''); 
  };
  var toTable = function (valueObject) {
    var tbl = '';
    tbl += '<table class="resultRow">';
    for (var colKey in valueObject) {
      tbl += ['<tr>',
              '<td valign="top">', colKey,':</td>', 
              '<td>',
                toMarkup(valueObject[colKey]),
              '</td>',
              '</tr>'].join('');
    }
    tbl += '</table>';
    return tbl;
  };
  var toMarkup = function (value) {
    var markup = '';
    switch (typeof value) {  
      case ('undefined'):
        markup = 'undefined'; 
        break;
      case ('function'):
        markup =  toTextarea(value.toString());
        break;
      case ('object'):
        if (Array.isArray(value)) {  
          if (value.every(function(element, index, array) {return (typeof element === 'string');})) {
            markup = toTextarea(value.toString());
          }
          else {  
            for (var i in value) {
              markup += toMarkup(value[i]);
            }
          }
        }
        else {
          markup = toTable(value);
        }
        break;
      default:                                    
        markup = toTextarea(value);
    }
    return markup;
  };

  return ['<!DOCTYPE html>',
            '<html>',
              '<head>',
                '<meta charset="UTF-8">',
                '<title>whozUrData</title>',
                '<style type="text/css">',
                '<!--\n',
                  embedFile('./page/style.css'),
                '\n-->',
                '</style>',  
                '<script>',
                '<!--',
                  embedFile('./page/head.js'),
                '-->',
                '</script>',
              '</head>',
              '<body>',
                mall(),
                '<script>',
                '<!--',
                  embedFile('./page/body.js'),
                '-->',
                '</script>',
              '</body>',
            '</html>'].join(''); 
};

