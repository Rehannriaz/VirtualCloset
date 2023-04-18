const Pool = require('pg').Pool;

const pool = new Pool({
    user: "myuser",
    host: "localhost",
    database: "proj1",
    password: "mypass",
    port: 5432,
}
);

pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error connecting to database:', err.stack);
    }
  
    console.log('Connected to database with process id:', client.processID);
  
    release(); // release the client back to the pool
  });

module.exports = pool;

