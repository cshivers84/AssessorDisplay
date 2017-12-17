
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mysql = require('mysql');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.post("/addressLookup", function (req, res){
	var queryParam = '';
	queryParam = req.body;
//	var connection = mysql.createConnection({
//		host: 'localhost',
//		user : 'root',
//		password : 'utl4hp2w',
//		database : 'assessor'
//	});
	var connection = mysql.createConnection({
		host: 'ec2-52-14-64-216.us-east-2.compute.amazonaws.com',
		port: '3306',
		user: 'cshivers84',
		password: 'utl4hp2w',
		database: 'assessor'
	})
	connection.connect(function(err) {
	  if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
	  }
	  console.log('connected as id ' + connection.threadId);
	});
	var sql = mysql.format('SELECT * FROM polk_county WHERE full_street = \"' + queryParam.address + '\" ');
	connection.query(sql, function(err, rows, fields) {
		if (err) {
			throw err;
		}
		res.json({result: rows});
	});
});