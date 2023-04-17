

const express = require('express');
const app = express();
const bcrypt= require('bcrypt');  //left
const port = 3000;
const pool = require('./db');
const path = require('path');
const mime = require('mime');
const exp = require('constants');

// initializePassport(
//   passport,
//   async (username) => {
//     try {
//       const query = 'SELECT * FROM users WHERE username = $1';
//       const { rows } = await pool.query(query, [username]);
//       return rows[0]; // Assuming that username is a unique field, so we only need the first row
//     } catch (error) {
//       console.error('Error fetching user from database:', error);
//       return null; // Return null if user not found or there's an error
//     }
//   }
// );

app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(flash())
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false, // not resaving session variable
//   saveUninitialized:false
// }))


// app.use(passport.initialize())
// app.use(passport.session())


// app.post('/login',passport.authenticate("local",{
//     successRedirect:"/",
//     successRedirect: "/login",
//     failureflash: true
// }))




app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.passwordInput, 10);
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


app.listen(port,() => console.log(`App listening on port ${port}`));
