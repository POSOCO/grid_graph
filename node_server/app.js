var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var cors = require('./project/config/cors');
var favicon = require('serve-favicon');
// var passport = require('./project/config/passport').get();
var flash = require('connect-flash');

var app = express();
var port = process.env.PORT || 3000;

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.urlencoded({limit: '5mb', extended: false}));
app.use(bodyParser.json({limit: '5mb'}));

app.use(session({
    secret: 'anystringoftext',
    saveUninitialized: true,
    resave: true
}));

// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(express.static(__dirname + '/project/views'));
app.set('views', __dirname + '/project/views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));

app.set('json spaces', 1);

app.use(favicon(__dirname + '/project/public/img/favicon.ico'));

//use for authentication of post requests
//app.use('/', require('./project/controllers/auth'));

app.use('/api/elements', require('./project/controllers/element'));
app.use('/api/lines', require('./project/controllers/line'));
app.use('/api/regions', require('./project/controllers/region'));
app.use('/api/voltages', require('./project/controllers/voltage'));
app.use('/', require('./project/controllers/general'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/*
 // error handlers
 //CHECK OUT ERROR HANDLERS HERE https://derickbailey.com/2014/09/06/proper-error-handling-in-expressjs-route-handlers/
 // development error handler
 // will print stacktrace
 if (app.get('env') === 'development') {
 app.use(function (err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
 message: err.message,
 Error: err.message,
 error: err
 });
 });
 }
 */

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    //db.disconnect();
    //console.log(err);
    res.render('error', {
        message: err.message,
        Error: err.message,
        error: err
    });
});

// Start the app
app.listen(port, function () {
		console.log('Listening on port ' + port + ' ...');
		//throw new Error("Custom Test Error");
	});

function exitHandler(options, err) {
    console.log("inside the exit handler...");
    process.exit(1);
	/*db.disconnect(function (err) {
        if (options.exit) {
            console.log("Exiting the app...");
            process.exit(1);
        }
    });*/
	
    //if (options.cleanup) console.log('cleanUp');
    //if (err) console.log(err.stack);
    //if (options.exit) process.exit(1);
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));