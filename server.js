const express = require('express');
const app = express();
const bcrypt= require('bcrypt'); 
const port = 3033;
const pool = require('./db');
const path = require('path');
const mime = require('mime');
const flash = require('connect-flash');
const passport = require("passport");
const initializePassport = require("./passport-config");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
// const fileUpload = require("express-fileupload");
const multer = require('multer');



initializePassport(passport);

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'uNb2G9tkhb',
  resave: false,
  saveUninitialized: false,
  store: new pgSession({
    pool: pool,
    tableName: 'sessions'

  }) 
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/upload', upload.single('image'), (req, res) => {
  const imageData = req.file.buffer;
  const query = 'INSERT INTO image (imagedata) VALUES ($1)';
  console.log("WEEEEEEEEEEEEEEEEEEE");
  pool.query(query, [imageData], (error) => {
    if (error) {
      console.error(error);
      res.sendStatus(500);
    } else {
      res.send('Image uploaded successfully!');
    }
  });
});




// Passport initialization 
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

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

app.post('/insertclothes', async (req, res) => {
  // const byteaFile = uploadedFile.toString("hex");

  const { color, size, fabric, category, season, Occasion, colorCode } = req.body;
  const userid = req.session.user.userid; // retrieve userid from session object

  const imageQuery = 'SELECT imagedata FROM image ORDER BY id DESC LIMIT 1';
  const imageResult = await pool.query(imageQuery);
  const imageData = imageResult.rows[0].data;


  const itemQuery = `INSERT INTO ClothingItem (userid,imageupload,colorName,colorCode,ClothesSize,FabricType,ClothingType) VALUES ($1, $2,$3,$4,$5,$6,$7) RETURNING *`;
  const itemValues = [userid,imageData,color,colorCode, size, fabric, category];

  const categoryQuery = `INSERT INTO category (clothingtype,clothingseason) VALUES ($1, $2) RETURNING *`;
  const categoryValues = [category, season];

  const occasionQuery = `INSERT INTO occasion (occasionname,colorName) VALUES ($1, $2) RETURNING *`;
  const occasionValues = [Occasion, color];

  // const colorQuery = `INSERT INTO color (colorName,colorCode) VALUES ($1, $2) RETURNING *`;
  // const colorValues = [color, colorCode];

  const queries = [   pool.query(categoryQuery, categoryValues) ,pool.query(itemQuery, itemValues),    pool.query(occasionQuery, occasionValues)];

  try {
    const results = await Promise.all(queries);  // all queries run in parallel
    console.log(results);
    console.log("reached end");
    console.log(imageData);
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


app.listen(port,() => console.log(`App listening on port ${port}`));
