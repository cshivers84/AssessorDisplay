
/*
 * GET home page.
 */
var mysql = require('mysql');
exports.index = function(req, res){
  res.render('index', { mysql: mysql});
};