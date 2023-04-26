const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// const session = require('express-session');
const pool = require('./db');


function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      console.log('Received login request:', { email, password });

      // Check if email and password are valid strings
      if (typeof email !== 'string' || typeof password !== 'string') {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Query the database for the user with the given email
      const query = 'SELECT * FROM users WHERE email = $1';
      const { rows } = await pool.query(query, [email]);

      // If the user doesn't exist, return an error message
      if (rows.length === 0) {
        return done(null, false, { message: 'Email is not registered' });
      }

      // Otherwise, retrieve the user from the result
      const user = rows[0];

      // Compare the input password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(password, user.password);

      // If the passwords don't match, return an error message
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }

      // If everything is valid, return the user
      // req.session.user = {userid: rows.userid,email:rows.email };
      // req.session.isMatch = true;
      // req.session.save(function(){
      //   res.redirect('/outfits');       
      // })



      return done(null, user);
    } catch (error) {
      console.error('Error authenticating user:', error);
      return done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

  passport.serializeUser((user, done) => {
    done(null, user.userid);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const query = 'SELECT * FROM users WHERE userid = $1';
      const { rows } = await pool.query(query, [id]);

      if (rows.length === 0) {
        return done(null, false, { message: 'User not found' });
      }

      const user = rows[0];
      return done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      return done(error);
    }
  });
}

module.exports = initialize;
