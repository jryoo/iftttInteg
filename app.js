var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var webhook = require('express-ifttt-webhook');
var url = require('url');
var http = require('http');
var request = require('request');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

var hardCodedMatrixUrl = 'https://ingestion-seward.dev.sfdc-matrix.net/streams/input001/event';

var hardCodedMatrixAuth = 'Basic dGVzdDoxMjM0';

app.use(webhook(function(json, done) {

    var jsonString = JSON.stringify(json.description);

    console.log('JSON DATA: ' + jsonString);

    var parsed = url.parse(hardCodedMatrixUrl);
    var opts = {
        hostname : parsed.hostname,
        port     : parsed.port,
        path     : parsed.path,
        method   : 'POST',
        auth     : hardCodedMatrixAuth,
        headers  : {
          'Content-Type': 'application/json',
          'Content-Length': jsonString.length,
          'Authorization': hardCodedMatrixAuth
        }
    };

    var request = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            console.log('RESPONSE: ' + data);
        });
    });

    request.write(jsonString);
    request.end();

    done();

}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
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
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
