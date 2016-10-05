var express = require('express');
var mysql   = require('mysql');
var app = express();

var connection = mysql.createConnection({
  host     : 'productivityappdb.cxlpdgsg6r9w.us-west-2.rds.amazonaws.com',
  user     : 'root',
  password : 'buechelejedi16',
  port     : '3306',
  database : 'productivityappdb'
});

connection.connect();

app.use(express.static('public'));

function encrypt(value, key) {
	return "AES_ENCRYPT('" + value + "', UNHEX(SHA2('" + key + "',512)))";
}

function decrypt(value, key) {
	return "CAST(AES_DECRYPT(" + value + ", UNHEX(SHA2('" + key + "',512))) AS CHAR(50))";
}

//pull all time segment data from the server and pass back as a JSON object called response with an array element called timeSegments
app.get('/data', function(req, res) {

	console.log("SELECT " + decrypt("time_segments.url", req.query.userid) + " AS url, " + decrypt("datetime", req.query.userid) + " AS datetime, " + decrypt("category", req.query.userid) + " AS category FROM time_segments JOIN categories ON (time_segments.url = categories.url AND time_segments.userid = categories.userid) WHERE time_segments.userid = " + encrypt(req.query.userid, req.query.userid) + ";");
	connection.query("SELECT " + decrypt("time_segments.url", req.query.userid) + " AS url, " + decrypt("datetime", req.query.userid) + " AS datetime, " + decrypt("category", req.query.userid) + " AS category FROM time_segments JOIN categories ON (time_segments.url = categories.url AND time_segments.userid = categories.userid) WHERE time_segments.userid = " + encrypt(req.query.userid, req.query.userid) + ";", function(err, rows, fields) {
	  if (err) throw err;	   
	  console.log('Data pulled from server: ', rows);
	  res.send(rows);
	});

});

//inserts a new timesegment into the database based on the url and datetime passed in the request
app.get('/addTimeSegment', function(req, res) {
	
	console.log(req.query.url);

	connection.query("INSERT INTO time_segments (url, datetime, userid) VALUES (" + encrypt(req.query.url, req.query.userid) + ", " + encrypt(req.query.datetime, req.query.userid) + ", " + encrypt(req.query.userid, req.query.userid) + ");", function(err) {
	  if (err) throw err;	 
	});
	
	connection.query("INSERT INTO categories (url, category, userid) VALUES (" + encrypt(req.query.url, req.query.userid) + ", " + encrypt('Click to Categorize', req.query.userid) + ", " + encrypt(req.query.userid, req.query.userid) + ");", function(err) {
	  if (err) {console.log(err.code);}	 
	});

	res.status(200).end();
});

//updaets the category of the url based on the drop down selection
app.get('/updateCategory', function(req, res) {		
	
	connection.query("UPDATE categories SET category=" + encrypt(req.query.category, req.query.userid) + " WHERE url=" + encrypt(req.query.url, req.query.userid) + " AND userid=" + encrypt(req.query.userid, req.query.userid) + ";", function(err) {
	  if (err) throw err;	 
	});

});

app.listen(8081, function () {
  console.log('Example app listening on port 8081!');
});


