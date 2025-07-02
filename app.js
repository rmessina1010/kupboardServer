var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

const cookieParser = require('cookie-parser');


const passport = require('passport');
const config = require('./config');

var app = express();
// app.all('*', (req, res, next) => {
//   if (req.secure) { return next(); }
//   res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`); // Using 307 instead of 301 to preserve redirection method
// })

app.use(passport.initialize());
app.use(passport.session());

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


const indexRouter = require('./routes/index');
const findRouter = require('./routes/find');
const viewRouter = require('./routes/view');
const joinRouter = require('./routes/join');
const signinRouter = require('./routes/signin').signinRouter;
const signoutRouter = require('./routes/signin').signoutRouter;
const dashRouter = require('./routes/dash');
const uploadRouter = require('./routes/upload');


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
app.use('/signin', signinRouter);
app.use('/signout', signoutRouter);
app.use('/dash', dashRouter);
app.use('/uploads', uploadRouter);

//app.use(auth);

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
