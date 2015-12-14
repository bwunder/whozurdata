var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//var users = require('./routes/users');

// amorphous data namespace
var urData = require('./urData');

var app = express();

//  ???? how can I make use it instead of setting it ????
app.set('data', urData);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.set('public', path.join('cwd', __dirname))

app.use(favicon(path.join(__dirname, 'public/images', 'twohead.ico')));
//combined (long) 'common' 'dev' (concise) 'short' 'tiny' 
app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname)));
app.use('/files', express.static(__dirname));
app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
console.log('error', err, 'req', req.url);
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      stack: err.stack
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  
  console.log('error', err, 'req', req.url);
  
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
