const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'proj1',
  password: 'mypass',
  port: 5432
});

pool.connect((err, client) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
    return;
  }

  console.log('Connected to database with process id:', client.processID);
});

module.exports = pool;
