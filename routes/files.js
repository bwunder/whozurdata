var express = require('express'),
    url = require('url'),
    router = express.Router(),
    path = require('path'),
    fs = require('fs');


router.get('/files', function(req, res, next) {
    var result = {"urData": module.parent.exports.settings.data, 
                  "request": parseRequest(req)};
console.log('result.request.query',result.request.query);
    fs.readdir(result.request.query.path, function (err, files) {
        if (err) {
        throw err;
        }
        var data = [];
        files
        forEach(function (file) {
            try {
                //console.log("processing ", file);
                var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
                if (isDirectory) {
                    data.push({ Name : file, IsDirectory: true, Path : path.join(query, file)  });
                } 
                else {
                    var ext = path.extname(file);
                    if(program.exclude && _.contains(program.exclude, ext)) {
                    console.log("excluding file ", file);
                    return;
                    }       
                    data.push({ Name : file, Ext : ext, IsDirectory: false, Path : path.join(query, file) });
                }
            } 
            catch(e) {
                throw(e); 
            }        
      });
      result.reply = _.sortBy(data, function(f) { return f.Name });
  });
    res.render('index', result);
});

module.exports = router;

