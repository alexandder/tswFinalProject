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
});


httpServer.listen(3000, function() {
	console.log("Server is listening on port 3000...");
});