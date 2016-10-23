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

	connection.query("SELECT " + decrypt("time_segments.url", req.query.userid) + " AS url, " + decrypt("datetime", req.query.userid) + " AS datetime, " + decrypt("category", req.query.userid) + " AS category FROM time_segments JOIN categories ON (time_segments.url = categories.url AND time_segments.userid = categories.userid) WHERE time_segments.userid = " + encrypt(req.query.userid, req.query.userid) + ";", function(err, rows, fields) {
	  if (err) throw err;
	  else {
	  	res.header('Access-Control-Allow-Origin', '*');
	  	res.send(rows);
	  }   
	  
	});
});

//inserts a new 'private' timesegment into the database based on the url, datetime, and userid passed in the request
app.get('/addPrivateTimeSegment', function(req, res) {

	//INSERT TIMESEGMENT
	connection.query("INSERT INTO time_segments (url, datetime, userid) VALUES (" + encrypt(req.query.url, req.query.userid) + ", " + encrypt(req.query.datetime, req.query.userid) + ", " + encrypt(req.query.userid, req.query.userid) + ");", function(err) {
	  if (err) throw err;	  	 
	});
	
	//INSERT CATEGORY
	connection.query("INSERT INTO categories (url, category, userid) VALUES (" + encrypt(req.query.url, req.query.userid) + ", " + encrypt('Click to Categorize', req.query.userid) + ", " + encrypt(req.query.userid, req.query.userid) + ");", function(err) {
	  if (err && err.code !== "ER_DUP_ENTRY") {console.log(err.code);}
	});

	res.header('Access-Control-Allow-Origin', '*');
	res.send(200);
});

//Increments the sent url by the sent timespent (if url doesn't currently exist in the database adds it)
app.get('/incrementPublicURL', function(req, res) {
	
	connection.query("SELECT time_spent FROM total_time_segments WHERE url='" + req.query.url +"';", function(err, rows) {				
		if (rows.length === 0) {
			connection.query("INSERT INTO total_time_segments (url, time_spent) VALUES ('" + req.query.url + "', " + req.query.timespent + ");", function(err) {
				if (err) throw err;
			});
		}
		else {			
			connection.query("UPDATE total_time_segments SET time_spent=" + (Number(rows[0].time_spent) + Number(req.query.timespent)) + " WHERE url='" + req.query.url + "';", function(err) {
				if (err) throw err;
			});
		}
	});

	res.header('Access-Control-Allow-Origin', '*');
	res.send(200);
});

//updates the category of the url in the users private table and ajusts the votes in the public table
app.get('/updateCategory', function(req, res) {		
	
	req.query.url = decodeURIComponent(req.query.url);
	req.query.userid = decodeURIComponent(req.query.userid);
	req.query.newCategory = decodeURIComponent(req.query.newCategory);
	req.query.oldCategory = decodeURIComponent(req.query.oldCategory);

	if (req.query.newCategory === "") {
		req.query.newCategory = "Click to Categorize";
	}
	
	if (req.query.oldCategory === "") {
		req.query.oldCategory = "Click to Categorize";
	}

	if (req.query.newCategory !== req.query.oldCategory) {

		//Updates the category of the private url
		connection.query("UPDATE categories SET category=" + encrypt(req.query.newCategory, req.query.userid) + " WHERE url=" + encrypt(req.query.url, req.query.userid) + " AND userid=" + encrypt(req.query.userid, req.query.userid) + ";", function(err) {
		  if (err) throw err;
		});

		//UPDATE TOTAL_CATEGORIES - NEW CATEGORY
		if (req.query.newCategory !== "Click to Categorize") {			
			connection.query("SELECT votes FROM total_categories WHERE url='" + req.query.url +"' AND category='" + req.query.newCategory + "';", function(err, rows) {
				if (rows.length === 0) {
					console.log("INSERT INTO total_categories (url, category, votes) VALUES ('" + req.query.url + "', '" + req.query.newCategory + "', 1);");
					connection.query("INSERT INTO total_categories (url, category, votes) VALUES ('" + req.query.url + "', '" + req.query.newCategory + "', 1);", function(err) {
						if (err) throw err;						
					});
				}
				else {
					console.log("UPDATE total_categories SET votes=" + (Number(rows[0].votes) + 1) + " WHERE url='" + req.query.url + "' AND category='" + req.query.newCategory + "';");
					connection.query("UPDATE total_categories SET votes=" + (Number(rows[0].votes) + 1) + " WHERE url='" + req.query.url + "' AND category='" + req.query.newCategory + "';")
				}
			});
		}	

		//UPDATE TOTAL_CATEGORIES - OLD CATEGORY
		if (req.query.oldCategory !== "Click to Categorize") {
			connection.query("SELECT votes FROM total_categories WHERE url='" + req.query.url +"' AND category='" + req.query.oldCategory + "';", function(err, rows) {
				if (rows.length === 0) {
					console.log("Old Category should never have zero rows");
				}
				else {
					console.log("UPDATE total_categories SET votes=" + (Number(rows[0].votes) - 1) + " WHERE url='" + req.query.url + "' AND category='" + req.query.oldCategory + "';");
					connection.query("UPDATE total_categories SET votes=" + (Number(rows[0].votes) - 1) + " WHERE url='" + req.query.url + "' AND category='" + req.query.oldCategory + "';");
				}
			});
		}
	}

	res.header('Access-Control-Allow-Origin', '*');
	res.sendStatus(200);
});

app.listen(8081, function () {
  console.log('Example app listening on port 8081!');
});


