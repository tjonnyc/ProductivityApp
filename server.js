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

	connection.query('SELECT * FROM time_segments', function(err, rows, fields) {
	  if (err) throw err;	  
	  console.log('Data pulled from server: ', rows);
	  res.send(rows);
	});

});

//inserts a new timesegment into the database based on the url and datetime passed in the request
app.get('/addTimeSegment', function(req, res) {
	
	console.log(req.query.datetime);
	
	connection.query("INSERT INTO time_segments (url, datetime) VALUES ('" + req.query.url + "', '" + req.query.datetime + "');", function(err) {
	  if (err) throw err;	 
	});

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

