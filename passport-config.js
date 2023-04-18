const localStrategy = require("passport-local").Strategy;
const { pool } = require('./db.js');
const bcrypt = require("bcrypt");

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const { rows } = await pool.query(query, [username]);
      if (rows.length > 0) {
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } else {
        return done(null, false, { message: "Email is not registered" });
      }
    } catch (error) {
      console.error('Error fetching user from database:', error);
      return done(error);
    }
  }

  passport.use(new localStrategy({
    usernameField: "email",
    passwordField: "password"
  }, authenticateUser));

  passport.serializeUser((user, done) => {
    done(null, user.userid);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const query = 'SELECT * FROM users WHERE userid = $1';
      const { rows } = await pool.query(query, [id]);
      if (rows.length > 0) {
        const user = rows[0];
        return done(null, user);
      } else {
        return done(null, false, { message: "User not found" });
      }
    } catch (error) {
      console.error('Error fetching user from database:', error);
      return done(error);
    }
  });
}

module.exports = initialize;
