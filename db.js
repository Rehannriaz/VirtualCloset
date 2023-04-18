const Pool = require('pg').Pool;

const pool = new Pool({
    user: "adeen",
    host: "localhost",
    database: "closet",
    password: "pgadmin",
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

