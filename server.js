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

//pull all time segment data from the server and pass back as a JSON object called response with an array element called timeSegments
app.get('/data', function(req, res) {

	connection.query("SELECT time_segments.url, datetime, category FROM time_segments JOIN categories ON (time_segments.url = categories.url AND time_segments.userid = categories.userid) WHERE time_segments.userid = '" + req.query.userid + "';", function(err, rows, fields) {
	  if (err) throw err;	  
	  console.log('Data pulled from server: ', rows);
	  res.send(rows);
	});

});

//inserts a new timesegment into the database based on the url and datetime passed in the request
app.get('/addTimeSegment', function(req, res) {
	
	console.log(req.query.datetime);
	
	connection.query("INSERT INTO time_segments (url, datetime, userid) VALUES ('" + req.query.url + "', '" + req.query.datetime + "', '" + req.query.userid + "');", function(err) {
	  if (err) throw err;	 
	});
	
	connection.query("INSERT INTO categories (url, category, userid) VALUES ('" + req.query.url + "', 'Click to Categorize', '" + req.query.userid + "');", function(err) {
	  if (err) {console.log(err.code);}	 
	});

	res.status(200).end();
});

//updaets the category of the url based on the drop down selection
app.get('/updateCategory', function(req, res) {		
	console.log("UPDATE categories SET category='" + req.query.category + "' WHERE url='" + req.query.url + "' AND userid= '" + req.query.userid + "';");
	connection.query("UPDATE categories SET category='" + req.query.category + "' WHERE url='" + req.query.url + "' AND userid='" + req.query.userid + "';", function(err) {
	  if (err) throw err;	 
	});
});

app.listen(8081, function () {
  console.log('Example app listening on port 8081!');
});


