var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const passport = require('passport');
const config = require('./config');


var app = express();

app.use(passport.initialize());
// app.use(passport.session());

// function auth(req, res, next) {
//   console.log(req.user);

//   if (!req.user) {
//     const err = new Error('You are not authenticated!');
//     err.status = 401;
//     return next(err);
//   } else {
//     return next();
//   }
// }


var indexRouter = require('./routes/index');
var findRouter = require('./routes/find');
var viewRouter = require('./routes/view');
var joinRouter = require('./routes/join');
//var loginRouter = require('./routes/login');
//var dashRouter = require('./routes/dash');

/// DB CONECTION BP
const mongoose = require('mongoose');
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(
  () => console.log('Connected correctly to server'),
  err => console.log(err)
);
///


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/find', findRouter);
app.use('/view', viewRouter);
app.use('/join', joinRouter);
// app.use(auth);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
