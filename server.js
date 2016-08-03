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

app.use(express.static('public'));

//pull all time segment data from the server and pass back as a JSON object called response with an array element called timeSegments
app.get('/data', function(req, res) {
	connection.connect();

	connection.query('SELECT * FROM time_segments', function(err, rows, fields) {
	  if (err) throw err;	  
	  console.log('Data pulled from server: ', rows);
	  res.send(rows);
	});

	connection.end();	
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


