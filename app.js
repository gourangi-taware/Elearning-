var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local'),Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/elearning');
var db = mongoose.connection;
async = require('async');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var classes = require('./routes/classes');
var students = require('./routes/students');
var instructors = require('./routes/instructors');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:'secret',
  saveUninitialized:true,
  resave:true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter : function(param,msg,value) {
      var namespace=param.split('.'),
      root= namespace.shift(),
      formParam= root;

      while(namespace.length){
        formParam+= '['+ namespace.shift()+']';
      }
      return {
        param:formParam,
        msg:msg,
        value:value
      };
    }
}));

app.use(flash());


app.get('*', function(req,res,next){
  //put user into res.locals for easy access from templates
  res.locals.user = req.user || null;
  if(req.user){
    res.locals.type=req.user.type;
  }
  next();
});


app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error_msg = req.flash('error');
  next();
});





app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/classes', classes);
app.use('/students',students);
app.use('/instructors',instructors);

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
