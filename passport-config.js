// const localStrategy = require ("passport-local").Strategy
// const bcrypt =require ('bcrypt')

// function initialize(passport,getUserByUsername){
//     // function to authenticate users
//     const authenticateUsers=async(username,password, done) => {
//         // get users by username
//         const user1=getUserByUsername(username)
//         if(user1== null){
//             return done(null,false,{message: "User/Pass incorrect"})
//         }
//         try{
//             if(await bcrypt.compare(password,user1.password)){
//                 return done(null,user1)
//             }
//             else{
//                 return done(null,false,{message:"User/Pass incorrect"})
//             }
//         } catch(e) {
//             console.log(e);
//             return done(e);
//         }

//     }
//     passport.use(new localStrategy({usernameField: 'username'},authenticateUsers))
// }
// module.exports = initialize