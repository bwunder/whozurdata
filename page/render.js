var fs = require('fs');

module.exports = function(urData) {
  var s = urData.storeNames.indexOf(urData.db);
  var db = urData.stores[s];
  var storeCatalog = function () {
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
                '<label>driver: <b><a href="http://npmjs.com/package/', db.driver.project, '" target="_blank">',
                    db.driver.project, '</a></b>&nbsp;', db.driver.version, '</label>',
              '</fieldset>',
            '</form>'].join('');              
  }; 
  var attributes = function () {
    var hint = 'urData object';
    var selected = urData.route('/urData')? urData.request.query.attribute: '';
    var attributeChoices = [
      '<option selected disabled>', hint, '&hellip;</option>',
      '<option value="file" ', selected === 'file'?'selected':'', '>source file</option>',
      '<option value="urData" ', selected === 'urData'?'selected':'', '>urData object</option>',
      '<optgroup label="keyed attributes...">'].join('');                    
    Object.keys(urData).forEach(function(attribute) {
      attributeChoices += ['<option ', selected === attribute?'selected':'', '>', attribute, '</option>'].join('');
    });
    attributeChoices += '</optgroup>';
//    return ['<select name="attribute" placeholder="', hint,'..." onchange="getObject(this)">',
    return ['<select name="attribute" onchange="getObject(this)">',
              '<datalist>', attributeChoices, '</datalist>',
            '</select>'].join('');
  };
  var module = function () {
    var hint = urData.db + ' interface';
    var selected = urData.route('/module')? urData.request.query.attribute: '';
    var moduleChoices = [
      '<option selected disabled>', hint, '&hellip;</option>',
      '<option value="file" ', selected === 'file'?'selected':'', '>source file</option>',
      '<option value="object" ', selected === 'object'?'selected':'', '>db interface</option>',
      '<optgroup label="object keys...">'].join('');                    
    Object.keys(db).forEach(function(key) {
      moduleChoices += ['<option ', selected === key?'selected':'', '>', key, '</option>'].join('');
    });
    moduleChoices += '</optgroup>';
    return ['<select name="keys" placeholder="', hint,'..." onchange="getModule(this)">',
              '<datalist>', moduleChoices, '</datalist>',
            '</select>'].join('');
  };
  var docs = function () {
    var hint = 'rtfm';
    var docChoices = ['<option selected disabled>', hint,'&hellip;</option>'].join('');
    Object.keys(urData.stores[urData.storeNames.indexOf(urData.db)].docs).forEach( function(doc) {  
      docChoices += ['<option label="', doc, '" value= "', 
                      urData.stores[urData.storeNames.indexOf(urData.db)].docs[doc], '"></option>'].join('');
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
//    return ['<select name="source" onchange="openSource(this)" placeholder="', hint,'&hellip;">',
    return ['<select name="source" onchange="openSource(this)">',
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
               urData.request.query.proc === proc? ' selected>': '>', 
               proc, '</option>'].join("");
      });   
      
      return ['<form id="query" action="/query">',
                '<fieldset id="queryBuilder">',
                  '<legend>query</legend>',
                    '<input type="hidden" name="db" value="', urData.db, '">',
                  '<select id="proc" name="proc" placeholder="proc..." required>',
                    '<datalist>', queries, '</datalist>',
                  '</select>',        
                  '<select id="names" name="names" placeholder="store(s)..." multiple>',
                    '<datalist>', names, '</datalist>',
                  '</select>',
                  '<select id="keys" name="keys" placeholder="key(s)..." multiple>',
                    '<datalist>', keys, '</datalist>',
                  '</select>',
                  '<button>run <span id="runner">&#x25BA;</span></button>',
                  answer(),
                '</fieldset>',
              '</form>'].join(''); 
  };
  var answer = function () {
    var markup = [];
    var reply = urData.route(urData);
    if (Array.isArray(reply) && typeof reply[0] === 'object') {
      for (var row in reply) {  
        markup += toTable(reply[row],0);      
      }
    }
    else {  // singleton but could still be JSON
      markup = toMarkup(reply, 0);        
    }
    return  markup;
//    return  ['<form id="results">',
//                '<fieldset>',  
//                  '<legend>results</legend>',
//                  markup,
//                '</fieldset>',  
//              '</form>'].join('');
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
  var embedFile = function ( relPath ) {
    return fs.existsSync( relPath )? fs.readFileSync(relPath, 'utf8'): 'no file';
  }; 
  var toTextarea = function (value) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    if (typeof value === 'boolean') {
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
  var socketio = function() {
    // accumulates all messages sent/rec'd by each socket at that socket for the current page load  
    // but all socket communication [can be] logged (backdoored) at server
    // refreshing the page updates the list with/to? the [20?] most recent messages seen at the server 
    var socketList = "";

console.log('urData.io.sockets.length in render', urData.io.sockets.sockets.length);

    urData.io.sockets.sockets.forEach(function(socket) {
console.log('urData.io.sockets.sockets['+ urData.io.sockets.sockets.indexOf(socket) + '].id: ', socket.id);
        if (socket.connected && (!socket.disconnected));
        socketList += ['<dl>',
                        '<dt>', 
                          'nickname' || socket.id || socket.remoteAddress, 
                        '</dt>',
                        '<dd>', 
                          '<dl>', 
                            '<dt>nickname</dt>',
                            '<dd>',
                              'sender',
                            '</dd>',
                            '<dt>socket</dt>',
                            '<dd>',
                              socket.id,
                            '</dd>',
                            '<dt>IP</dt>',
                            '<dd>',
                              socket.remoteAddress,
                            '</dd>',
                          '</dl>',
                        '</dd>',
                      '</dl>'].join('');
      });
    var descrsList = "";
    if (urData.messageLog) {
      urData.messageLog.forEach( function(message) {
        // build schema based string of html ddlist elements
        descrsList += ['<dt>', 
                          (message.sender)?message.sender:message.senderAddress, 
                        '</dt>',
                        '<dd>',
                          '<textarea rows="1" cols="40" wrap="soft" readonly="readonly">', 
                            new Date(message.emitDate).toLocaleTimeString() + message.message, 
                          '</textarea>',
                        '</dd>'].join('');  
      });
    }
    return ['<form id="chatform">',
              '<fieldset>',  
                '<legend>',
                  'con-fab',
                '</legend>',
                '<button type="button" title="resize" onClick="resize(this)">&plusmn;</button>',
                '<button type="button" title="disconnect" onClick="disconnect(this)">&empty;</button>',
                '<div id="rtcModes" border="1">',
                  'text<input name="text" type="checkbox" onchange="toggle(this)" checked>',
                  'audio<input name="audio" type="checkbox" onchange="toggle(this)" >',
                  'video<input name="video" type="checkbox" onchange="toggle(this)" >',
                  'draw<input name="draw" type="checkbox" onchange="toggle(this)" >',
                  'screen<input name="display" type="checkbox" onchange="toggle(this)" >',
                '</div>',      
                'available sockets',
                '<div id="socketList" border="1">',
                  socketList,
                '</div>',      
                '<div class="messages" onchange="rollUp()">',
                  '<dl id="messages">', descrsList, '</dl>',
                '</div>',      
                '<label>nickname<br /><input id="nickname" name="nickname" placeholder="use ', urData.options.IP,'"></label>',
                '<textarea id="m" name="m" wrap="soft" placeholder="enter your message\n then hit\"Send\""></textarea>',
                '<button class="send" type="button" onclick="sendMsg()">Send</button>',
              '</fieldset>',
            '</form>'].join('');
  };  
  var toTable = function (valueObject, recursionDepth) {
    var tbl = '';
    tbl += '<table class="resultRow">';
    for (var colKey in valueObject) {
      tbl += ['<tr>',
              '<td valign="top">', colKey,':</td>', 
              '<td>',
                toMarkup(valueObject[colKey], recursionDepth + 1),
              '</td>',
              '</tr>'].join('');
    }
    tbl += '</table>';
    return tbl;
  };
  var toMarkup = function (value, recursionDepth) {
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
            if (recursionDepth > 3) {
              markup = toTextarea(require('util').inspect(value));
            }
            else {
              for (var i in value) {
                markup += toMarkup(value[i], recursionDepth + 1);
              }
            }
          }
        }
        else {
          if (recursionDepth > 3) {
            markup = toTextarea(require('util').inspect(value));
          }
          else {
            markup = toTable(value, recursionDepth + 1);
          }
        }
        break;
      default:                                    
        markup = toTextarea(value);
    }
    return markup;
  };

  var bundle = function() {
    // build the bundle
    
    // use the bundled
    return '<script src="/page/bundle.js"></script>';
  };
  
  return ['<!DOCTYPE html>',
            '<html>',
              '<head>',
                '<meta charset="UTF-8">',
                '<meta name="viewport" content="width=device-width">',
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
                socketio(),
                storeCatalog(), 
                resources(),
                question(),
                bundle(),
              '</body>',
            '</html>'].join(''); 
};
