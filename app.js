require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const hbs=require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const session=require('express-session') 
const logger = require('morgan');
const HBS=require('handlebars')
// const dotenv=require('dotenv');

const morgan=require('morgan');
 
 

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

//dotenv.config({path:'./config/config.env'})

const  db=require('./config/config');
db.connect((err)=>{
  if(err) console.log(`Connection Error ${{err}}`)
  else console.log(`connection succeed`);
});

const app = express();  


// view engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialaDir:__dirname+'/views/partials/'}))

HBS.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});
HBS.registerHelper("sum", function(a, b)
{
    return a+b;
});
HBS.registerHelper("mul", function(a, b)
{
    return a*b;
});
HBS.registerHelper("min", function(a, b)
{
    return a-b;
});

HBS.registerHelper( "when",function(operand_1, operator, operand_2, options) {
  var operators = {
   'eq': function(l,r) { return l == r; },
   'noteq': function(l,r) { return l != r; },
   'gt': function(l,r) { return Number(l) > Number(r); },
   'or': function(l,r) { return l || r; },
   'and': function(l,r) { return l && r; },
   '%': function(l,r) { return (l % r) === 0; }
  }
  , result = operators[operator](operand_1,operand_2);

  if (result) return options.fn(this);
  else  return options.inverse(this);
});


HBS.registerHelper('currentDate', function(format) {
  return new Date()
});






app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{ 
  if(!req.user){
    
      res.header('cache-control','private,no-cache,no-store,must revalidate')
      res.header('express','-1')
      res.header('paragrm','no-cache')
  } 
  next();
});





app.use(session({secret:'Key' /* cookie:{maxAge: 6000000}*/}))


   
app.use('/admin', adminRouter);
app.use('/', usersRouter);



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
// const PORT=process.env.PORT||5000
// app.listen(PORT,
//     console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
//     ) 
module.exports = app;
