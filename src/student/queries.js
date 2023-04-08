const getStudents = "SELECT * FROM users";
const getId= "SELECT * FROM users where userid=$1";
const addUser="insert into users(username,email,password) values($1,$2,$3)";
const checkEmailExists="SELECT s from users s where s.email=$1";
const deleteUser="delete from users where userid=$1";
const findID="select userid from users where userid=$1";

module.exports = {
    getStudents,
    getId,
    addUser,
    checkEmailExists,
    deleteUser,
    findID,
    
};