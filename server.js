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
app.get('/pullPrivateData', function(req, res) {

	var pull_private_data = `
		SELECT ` +
			decrypt("time_segments.url", req.query.userid) + " AS url," +
			decrypt("datetime", req.query.userid) + " AS datetime, " +			
			decrypt("timespent", req.query.userid) + " AS timespent, " +
			decrypt("exclude", req.query.userid) + " AS exclude, " +
			decrypt("category", req.query.userid) + " AS private_category, " +
			`default_categories.default_category AS default_category,
			up_votes,
			down_votes
 		FROM
 			time_segments 
		LEFT JOIN
		 categories
		ON
			time_segments.url = categories.url
			AND
			time_segments.userid = categories.userid
		LEFT JOIN
			(SELECT url, category AS default_category FROM total_categories WHERE is_default = 'true') AS default_categories
		ON
			time_segments.url = default_categories.url
		LEFT JOIN 
			excluded_urls
		ON
			time_segments.url = excluded_urls.url
		WHERE
			time_segments.userid=` + encrypt(req.query.userid, req.query.userid);
	console.log(pull_private_data);
	connection.query(pull_private_data, function(err, rows, fields) {
	  if (err) throw err;
	  else {
	  	res.header('Access-Control-Allow-Origin', '*');
	  	res.send(rows);
	  }   
	  
	});
});

//pull all public time segment data from the server a JSON object called response with an array element called timeSegments
app.get('/pullPublicData', function(req, res) {

	var pull_public_data = `
		SELECT 
			total_time_segments.url AS url, 
			time_spent as timespent, 
			default_category, 
			up_votes, 
			down_votes
 		FROM
 			total_time_segments 		
		LEFT JOIN
			(SELECT url, category AS default_category FROM total_categories WHERE is_default = 'true') AS default_categories
		ON
			total_time_segments.url = default_categories.url
		LEFT JOIN 
			excluded_urls
		ON
			total_time_segments.url = excluded_urls.url`

	console.log(pull_public_data);

	connection.query(pull_public_data, function(err, rows, fields) {
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
	connection.query("INSERT IGNORE INTO time_segments (url, datetime, userid, timespent) VALUES (" + encrypt(req.query.url, req.query.userid) + ", " + encrypt(req.query.datetime, req.query.userid) + ", " + encrypt(req.query.userid, req.query.userid) + ", " + encrypt(req.query.timespent, req.query.userid) + ");", function(err) {
	  if (err) throw err;	  	 
	});

	res.header('Access-Control-Allow-Origin', '*');
	res.sendStatus(200);
});

//Increments the sent url by the sent timespent (if url doesn't currently exist in the database adds it)
app.get('/incrementPublicURL', function(req, res) {
	
	connection.query("SELECT time_spent FROM total_time_segments WHERE url='" + req.query.url +"' LIMIT 1;", function(err, rows) {				
		if (rows.length === 0) {
			connection.query("INSERT INTO total_time_segments (url, time_spent) VALUES ('" + req.query.url + "', " + req.query.timespent + ");", function(err) {
				if (err) throw err;
			});
		}
		else {			
			connection.query("UPDATE total_time_segments SET time_spent=" + (Number(rows[0].time_spent) + Number(req.query.timespent)) + " WHERE url='" + req.query.url + "' LIMIT 1;", function(err) {
				if (err) throw err;
			});
		}
	});

	res.header('Access-Control-Allow-Origin', '*');
	res.sendStatus(200);
});

//updates the category of the url in the users private table and ajusts the votes in the public table
app.get('/updateCategory', function(req, res) {		
	
	url = decodeURIComponent(req.query.url);
	userid = decodeURIComponent(req.query.userid);
	newCategory = decodeURIComponent(req.query.newCategory);
	oldCategory = decodeURIComponent(req.query.oldCategory);

	//Updates the category of the private url
	var select_current_category = `
		SELECT ` +
			decrypt("category", req.query.userid) +
		`FROM
			categories
		WHERE 
			url='` + url + "' LIMIT 1";
	console.log(select_current_category);
	connection.query(select_current_category, function(err, rows) {				
		if (rows.length === 0) {
			connection.query("INSERT INTO categories (url, category, userid) VALUES (" + encrypt(url, userid) + ", " + encrypt(newCategory, userid) + ", " + encrypt(userid, userid) + ");", function(err) {
				if (err) throw err;
			});
		}
		else {			
			connection.query("UPDATE categories SET category=" + encrypt(newCategory, userid) + " WHERE url=" + encrypt(url, userid) + " AND userid=" + encrypt(userid, userid) + " LIMIT 1;", function(err) {
				if (err) throw err;
			});
		}
	});

	//Updates the total categories table, adding or increasing the new category vote for that url
	if (newCategory !== "") {			
		connection.query("SELECT votes FROM total_categories WHERE url='" + url +"' AND category='" + newCategory + "' LIMIT 1;", function(err, rows) {
			if (rows.length === 0) {
				connection.query("INSERT INTO total_categories (url, category, votes) VALUES ('" + url + "', '" + newCategory + "', 1);", function(err) {
					if (err) throw err;						
				});
			}
			else {
				connection.query("UPDATE total_categories SET votes=" + (Number(rows[0].votes) + 1) + " WHERE url='" + url + "' AND category='" + newCategory + "' LIMIT 1;")
			}
		});
	}	

	//Updates the total categories table, decreasing the old category vote for that url
	if (oldCategory !== "") {
		connection.query("SELECT votes FROM total_categories WHERE url='" + url +"' AND category='" + oldCategory + "' LIMIT 1;", function(err, rows) {
			if (rows.length === 0) {
				console.log("Old Category should never have zero rows");
			}
			else {
				connection.query("UPDATE total_categories SET votes=" + (Number(rows[0].votes) - 1) + " WHERE url='" + url + "' AND category='" + oldCategory + "' LIMIT 1;");
			}
		});
	}

	res.header('Access-Control-Allow-Origin', '*');
	res.sendStatus(200);
});

//updates the exclude field of the url in the users private table and ajusts the votes in the public table
app.get('/excludeURL', function(req, res) {		
	
	var url = decodeURIComponent(req.query.url);
	var userid = decodeURIComponent(req.query.userid);
	var exclude = decodeURIComponent(req.query.exclude);

	//Updates the exclude field in the private category table of the url
	connection.query("UPDATE categories SET exclude=" + encrypt(exclude, userid) + " WHERE url=" + encrypt(url, userid) + " AND userid=" + encrypt(userid, userid) + " LIMIT 1;", function(err) {
	  if (err) throw err;
	});

	//Updates the excluded urls table
	connection.query("SELECT up_votes, down_votes FROM excluded_urls WHERE url='" + url + "' LIMIT 1;", function(err, rows) {
		if (rows.length === 0) {
			connection.query("INSERT INTO excluded_urls (url, up_votes, down_votes) VALUES ('" + url + "', 1, 0);", function(err) {
				if (err) throw err;						
			});
		}
		else {
			console.log("Exclude is: ", exclude);
			var new_up_votes = Number(rows[0].up_votes);
			var new_down_votes = Number(rows[0].down_votes);
 
			if (exclude === "true") {
				new_up_votes += 1;
			} else {
				new_down_votes += 1;
			}

			console.log("UPDATE excluded_urls SET up_votes=" + new_up_votes + ", down_votes=" + new_down_votes + " WHERE url='" + url + "' LIMIT 1;");
			connection.query("UPDATE excluded_urls SET up_votes=" + new_up_votes + ", down_votes=" + new_down_votes + " WHERE url='" + url + "' LIMIT 1;");
		}
	});	

	res.header('Access-Control-Allow-Origin', '*');
	res.sendStatus(200);
});

//removes the url in the users private table
app.get('/removeURL', function(req, res) {		
	
	var url = decodeURIComponent(req.query.url);
	var userid = decodeURIComponent(req.query.userid);

	//Removes all time segements with the url from the private table
	connection.query("DELETE FROM time_segments WHERE url=" + encrypt(url, userid) + " AND userid=" + encrypt(userid, userid) + ";", function(err) {
	  if (err) throw err;
	});

	res.header('Access-Control-Allow-Origin', '*');
	res.sendStatus(200);
});

//Updates the total categories table - indicating for each url, category combination whether or not it is default
app.get('/updateDefaultCategories', function(req, res) {		

	var allFalse = `
		UPDATE 
			total_categories 
		SET 
			is_default='false'
		WHERE
			is_default='true'
	`;

	console.log(allFalse);
	connection.query(allFalse, function(err) {
		if (err) throw err;
	})

	var setMaxToTrue = `
		UPDATE
			total_categories
		JOIN (
			SELECT 
				MAX(votes) AS votes, url
			FROM
				total_categories
			GROUP BY url
			) as max_table
		ON
			total_categories.url=max_table.url
			AND
			total_categories.votes=max_table.votes
		SET
			is_default='true'		
	`;

	console.log(setMaxToTrue);
	connection.query(setMaxToTrue, function(err) {
		if (err) throw err;
	})

	res.header('Access-Control-Allow-Origin', '*');
	res.sendStatus(200);
});


app.listen(8081, function () {
  console.log('Example app listening on port 8081!');
});


