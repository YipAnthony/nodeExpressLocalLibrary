var createError = require('http-errors');
var express = require('express');

// Set up mongoose connection
const mongoose = require('mongoose')
const mongoDB = 'mongodb+srv://Testuser1:123123123@cluster0.vf8fj.mongodb.net/local_library?retryWrites=true&w=majority'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))


var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// We use a router to simplify the app.js file

// I added this in so would reroute to catalog 
app.use('/', indexRouter)

// This is part of tutorial
app.use('/index', indexRouter)
// IndexRouter is technically unnecessary, it just redirects to catalogRouter. we Could rewrite as below:
// app.get('/',  function(req, res, next) {
//   res.redirect('/catalog')
// });

// usersRouter is also unnecessary, simply for learning purposes
app.use('/users', usersRouter);

// catalogRouter is the main router of the project
app.use('/catalog', catalogRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
