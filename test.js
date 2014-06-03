var _ = require('underscore');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var mongo = require('mongodb');

var db = new mongo.Db('tswProject', new mongo.Server('localhost', 27017), {safe: true});

db.open(function (err) {
	db.collection("omdb", function (error, coll) {
		var xhr = new XMLHttpRequest();
		var t = "The Social Network";
		xhr.open("GET", "http://www.omdbapi.com/?t=" + t, false);
		xhr.send(null);
		var omdbData = xhr.responseText;
		var omdbJSON = eval("(" + omdbData + ")");
		console.log(omdbJSON.Title);
		console.log(omdbJSON.Director);
		/*coll.insert(omdbJSON, function (err, res) {
			console.log(res);

		});*/
	});
	db.close();
});