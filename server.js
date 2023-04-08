const express = require('express');
const app = express();
const bcrypt= require('bcrypt');
const port = 8080;

const path = require('path');
const mime = require('mime');
const exp = require('constants');

app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(port,() => console.log(`App listening on port ${port}`));
