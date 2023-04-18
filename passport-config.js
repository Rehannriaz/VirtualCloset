const { Strategy: LocalStrategy } = require('passport-local');
const { pool } = require('./db');
const bcrypt = require('bcrypt');

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      if (typeof email !== 'string' || typeof password !== 'string') {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const query = 'SELECT * FROM users WHERE email = $1';
      const { rows } = await pool.query(query, [email]);

      if (rows.length === 0) {
        return done(null, false, { message: 'Email is not registered' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (error) {
      console.error('Error authenticating user:', error);
      return done(error);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, authenticateUser)
  );

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