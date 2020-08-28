const express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var MySQLEvents = require('mysql-events');
var deferred = require('deferred');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const path= require('path');
const app = express();
var adbs = require("ad-bs-converter");
var cors= require('cors');
var session= require('express-session');

var MySQLStore = require('express-mysql-session')(session);
// reload(app);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));


var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
    database: 'license',
    multipleStatements: true
});

var options= {
    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
    database: 'license',
    clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 900000,
    // The maximum age of a valid session; milliseconds:
    expiration: 864000,
    // Whether or not to create the sessions database table, if one does not already exist:
    createDatabaseTable: true,
    // Number of connections when creating a connection pool:
    connectionLimit: 1,
    // Whether or not to end the database connection when the store is closed.
    // The default value of this option depends on whether or not a connection was passed to the constructor.
    // If a connection object is passed to the constructor, the default value for this option is false.
    endConnectionOnClose: true,
    charset: 'utf8mb4_bin',
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};
var sessionStore = new MySQLStore(options);

app.use(session({
    secret: 'cookie_secret',
    resave: true,
    store: sessionStore,
    saveUninitialized: true
}));
// app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.use(express.static(path.join(__dirname, 'public/')));

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });

  var checkuser= function(req,res,next)
  {
      var checksessionid="SELECT * from sessions where session_id=?";
      con.query(checksessionid,[req.sessionID],function(err,result)
      {
          if(result.length===1)
          {
              console.log("Gone through session table")
              next();
          }
          else
          {
              res.redirect('/login');
          }
      });
  };

  app.get('/login',function(req,res)
  {
      res.send("First login");
  });
  app.get('/',checkuser,function(req,res)
  {
      console.log(req.sessionID);
      res.send("HEllo");
  });
  app.listen(3002,()=>{
   console.log("Running on port 3002");
  });
  