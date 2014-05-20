var _ = require("underscore");
var express = require("express");
var app = express();

var httpServer = require("http").createServer(app);

var socketIO = require("socket.io");
var io = socketIO.listen(httpServer);

app.use(express.static("public"));
app.use(express.static("bower_components"));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

var users = [];

var questions = [
	{
		question: "France",
		answer: "Paris"
	},
	{
		question: "USA",
		answer: "Washington"
	},
	{
		question: "Poland",
		answer: "Warsaw"
	},
	{
		question: "Germany",
		answer: "Berlin"
	},
	{
		question: "Italy",
		answer: "Rome"
	}
];

io.sockets.on('connection', function (socket) {
	socket.on('login', function (user) {
		socket.user = user;
		users.push(user);
		console.log(users);
		io.sockets.emit('updateUserList', users);
	});

	socket.on('logout', function (user) {
		users = _.without(users, user);
		console.log(users);
		io.sockets.emit('updateUserList', users);
	});

	socket.on('startGame', function() {
		console.log('Game started!');
	});
});


httpServer.listen(3000, function() {
	console.log("Server is listening on port 3000...");
});