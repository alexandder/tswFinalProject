var _ = require("underscore");
var express = require("express");
var app = express();
var mongo = require('mongodb');
var connect = require('connect');

var passport = require('passport');
var socketIO = require("socket.io");
var passportSocketIo = require('passport.socketio');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes');
var sessionStore = new connect.session.MemoryStore();

var sessionSecret = '123hbh321h3jHhjj123459900dsad09dad78s';
var sessionKey = 'connect.sid';

var httpServer = require("http").createServer(app);
var io = socketIO.listen(httpServer);
var db = new mongo.Db('test', new mongo.Server('localhost', 27017), {safe: true});
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


app.use(express.static("public"));
app.use(express.static("bower_components"));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

passport.use(new LocalStrategy(
    function (username, password, done) {
    rClient.get(username, function (err, reply) {
    if (reply && password === reply.toString()) {
            console.log("Udane logowanie...");
            return done(null, {
                username: username,
                password: password
            });
	} 	
	else {
		return done(null, false);
	}
});

        
    }
));

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
	
	socket.on('login', function (data) {
		var user = data;
		users.push(user);
		console.log(socket);
		console.log(user.sessionid);
		console.log(users);
		io.sockets.emit('updateUserList', users);
	});

	socket.on('disconnect', function () {
		users = _.without(users, socket);
		console.log(users);
		io.sockets.emit('updateUserList', users);
	});

	socket.on('logout', function (user) {
		var i = users.indexOf(socket);
		console.log(users);
		io.sockets.emit('updateUserList', users);
	});

	socket.on('startGame', function() {
		console.log('Game started!');
		var question = questions[Math.floor(Math.random()*questions.length)];
		io.sockets.emit('giveQuestion', question);
	});

	socket.on('tryAnswer', function (answer) {

	});
});


httpServer.listen(3000, function() {
	console.log("Server is listening on port 3000...");
});