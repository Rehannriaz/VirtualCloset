const express = require('express'); // import express module
const app = express(); // create an instance of express
const bcrypt = require('bcrypt'); // import bcrypt module for password hashing
const port = 3033; // set the port number for the server
const pool = require('./db'); // import the pool object from db.js file which contains database connection settings
const path = require('path'); // import path module to work with file and directory paths
const mime = require('mime'); // import mime module to get MIME type of a file
const flash = require('connect-flash'); // import connect-flash module for flash messages
const passport = require('passport'); // import passport module for authentication
const initializePassport = require('./passport-config'); // import initializePassport function from passport-config.js
const session = require('express-session'); // import express-session module for session management
const pgSession = require('connect-pg-simple')(session); // import connect-pg-simple module to store session data in PostgreSQL database
const multer = require('multer'); // import multer module to handle file uploads
const uuid = require('uuid').v4; // import uuid module to generate unique IDs
const bodyParser = require('body-parser');

initializePassport(passport); // initialize Passport with the passport-config.js settings

app.set('view engine', 'ejs'); // set the view engine to ejs


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false })); // use the urlencoded middleware to parse incoming requests with urlencoded payloads
app.use(express.static(path.join(__dirname, 'public'))); // serve static files from the public folder

app.use(
  session({
    secret: 'uNb2G9tkhb', // set the secret used to sign the session ID cookie
    resave: false, // do not save the session if it is not modified
    saveUninitialized: false, // do not create a session until something is stored
    store: new pgSession({
      pool: pool, // specify the database connection pool to use for storing sessions
      tableName: 'sessions' // specify the name of the table to store session data
    })
  })
);

const storage = multer.diskStorage({
  destination: 'outfit_images/images', // specify the destination folder for uploaded images
  filename: (req, file, cb) => {
    console.log(file); // log the uploaded file details to the console
    cb(null, Date.now() + path.extname(file.originalname)); // specify the filename for the uploaded file
  }
});

const upload = multer({ storage: storage }); // create a multer object to handle file uploads

// Passport initialization
app.use(flash()); // use the connect-flash middleware for flash messages
app.use(passport.initialize()); // use the passport middleware for authentication
app.use(passport.session()); // use the passport middleware for session management


const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    
    return next();
  } else {
    res.redirect('/login');
  }
};


app.post('/loginform', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), async (req, res) => {
  try {
    const query = `SELECT userid, email FROM users WHERE email = $1`;
    const values = [req.body.email];
    const { rows } = await pool.query(query, values);
    
    req.session.isAuthenticated = true;
    req.session.user = { userid: rows[0].userid, email: rows[0].email };
    req.session.save(function(){
      
      res.redirect('/outfits');
    });
  } catch (error) {
    console.error('Error finding user:', error);
    res.redirect('/login');
  }
});



app.post('/uploadclothes',upload.single('image'), async (req, res) => {
  
  console.log(req.file);
  const { color, size, fabric, category, season, Occasion, colorCode } = req.body;
  const userid = req.session.user.userid; 

    const imageName = req.file.filename;

  const itemQuery = `INSERT INTO ClothingItem (userid,imageupload,colorName,colorCode,ClothesSize,FabricType,ClothingType) VALUES ($1, $2,$3,$4,$5,$6,$7) RETURNING *`;
  const itemValues = [userid,imageName,color,colorCode, size, fabric, category];
  
  const categoryQuery = `INSERT INTO category (clothingtype,clothingseason) VALUES ($1, $2) RETURNING *`;
  const categoryValues = [category, season];

  const occasionQuery = `INSERT INTO occasion (occasionname,colorName) VALUES ($1, $2) RETURNING *`;
  const occasionValues = [Occasion, color];

  

  const queries = [   pool.query(categoryQuery, categoryValues) ,pool.query(itemQuery, itemValues),    pool.query(occasionQuery, occasionValues)];

  try {
    const results = await Promise.all(queries);  // all queries run in parallel


    res.redirect('/outfits');
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});







app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.passwordInput, 10);
    if(req.body.passwordInput!=req.body.confirmPasswordInput)
    {
      console.log("Passwords do not match.");
      return res.redirect('/signup');

    }

    const id= Date.now().toString();
    const query = `INSERT INTO users (userid,username, email, password) VALUES ($1, $2, $3,$4) RETURNING *`;
    const values = [id,req.body.usernameInput, req.body.emailInput, hashedPassword];
    const { rows } = await pool.query(query, values);
    console.log('User created:', rows[0]);
    res.redirect('/login');
  } catch (error) {
    console.error('Error creating user:', error);
    res.redirect('/register');
  }
});

app.get('/', function(req, res) {
  res.render('index', {
    css: ['/css/shared.css', '/css/style.css', '/css/signupStyles.css']
  });
});

app.get(['/css/shared.css', '/css/style.css', '/css/signupStyles.css'], function(req, res) {
  res.setHeader('Content-Type', mime.getType('css'));
  res.sendFile(path.join(__dirname, 'public', 'css', path.basename(req.url)));
});

app.use(express.json());

app.get('/signup', (req, res) => {
  res.render("signup.ejs",{
    css: [ '/css/style.css', '/css/signupStyles.css']
  });
});

app.get('/login', (req, res) => {
  res.render("login.ejs",{
    css: [ '/css/shared.css', '/css/loginStyles.css']
  });
});



app.get('/outfits', function (req, res) {
  if(!req.session.isAuthenticated){
    return res.status(401).render('/401');
  }
  
  res.render("outfits.ejs",{
    css: [ '/css/shared.css', '/css/outfits.css','/css/outfits2.css'],
    scripts: ['/app/outfit.js']
  });
});

app.get('/clothes', isAuthenticated, async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const query = 'SELECT * FROM ClothingItem WHERE userid = $1';
    const { rows } = await pool.query(query, [userid]);
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});



app.listen(port,() => console.log(`App listening on port ${port}`));
