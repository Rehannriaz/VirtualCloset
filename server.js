const express = require('express');
const app = express();
const bcrypt= require('bcrypt'); 
const port = 3025;
const pool = require('./db');
const path = require('path');
const mime = require('mime');
const flash = require('connect-flash');
const passport = require("passport");
const initializePassport = require("./passport-config");
const session = require('express-session');

initializePassport(passport);

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport initialization 
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.post('/loginform', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));



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
app.get('/outfits', (req, res) => {
  res.render("outfits.ejs",{
    css: [ '/css/shared.css', '/css/outfits.css','/css/outfits2.css'],
    scripts: ['/app/outfit.js']
  });
});



app.listen(port,() => console.log(`App listening on port ${port}`));
