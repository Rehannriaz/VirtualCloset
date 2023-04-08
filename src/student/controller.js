const pool = require('../../db');
const queries = require('./queries');

const getStudents = (req,res)=>{
    pool.query(queries.getStudents,(error,results)=>{
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const getid = (req,res)=>{
   const id=parseInt(req.params.id);
   pool.query(queries.getId,[id],(error,results)=>{
    if(error) throw error;
    res.status(200).json(results.rows);
});
};

const addUser= (req,res)=>{
    const {username,email,password} = req.body;
    // checking email exists
pool.query(queries.checkEmailExists,[email],(error,results)=>{
    if(results.rows.length){
        res.send("Email already in use.");
    }
    // add student to db
    pool.query(queries.addUser,[username,email,password],(error,results)=>{
        if(error) throw error;
        res.status(201).send("User Added Successfully.");
        console.log ("user created");
    })
}
)
};
    
const delUser = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.findID, [id], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows.length) {
        pool.query(queries.deleteUser, [id], (error, results) => {
          if (error) {
            throw error;
          }
          res.status(201).send("User deleted Successfully");
        });
      } else {
        res.send("No user found with this ID.");
      }
    });
  };
  

module.exports = {
    getStudents,
    getid,
    addUser,
    delUser,
};