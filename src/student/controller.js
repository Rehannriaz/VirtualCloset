const pool = require('../../db');
const queries = require('./queries');

function createNewOutfit(req,res){
  console.log(req.body);
  console.log(req.file);


  res.redirect('/outfits');
}

module.exports = {
  createNewOutfit
};