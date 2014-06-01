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
var db = new mongo.Db('tswProject', new mongo.Server('localhost', 27017), {safe: true});

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
    	db.open(function (err) {
	    	db.collection("user", function (error, coll) {
	    		coll.findOne({"username" : username, "password": password}, function (err, result) {
	    			if (err) {
	    				db.close();
	    				return done(null, false);
	    			}
	    			if (result) {
	    				console.log("Udane logowanie...");
	    				db.close();
	    				users.push({"username": username, "score": 0});
	           			return done(null, {
	                		username: username,
	                		password: password
	            		});
	    			}
	    			else {
	    				db.close();
	    				return done(null, false);
	    			}
	    		});
	    	});
    	});        
    }
));

app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.session({
    store: sessionStore,
    key: sessionKey,
    secret: sessionSecret
}));
app.use(passport.initialize());
app.use(passport.session());

//Konfiguracja expressa
app.use(express.static("public"));
app.use(express.static("bower_components"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Routing
app.get('/', routes.index);
app.get('/register', routes.register);
app.get('/game', routes.game);
app.get('/login', routes.login);
app.get('/', routes.index);
app.get('/logout', function (req, res) {
    users = removeByUsername(users, req.user.username);
    req.logout();
    console.log("logout: ")
	console.log(users);
	io.sockets.emit('updateUserList', users);
    res.redirect('/login');
});

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.redirect('/game');
    }
);

app.post('/register', function (req, res) {
	console.log("register try");
	if (req.body.password !== '' && req.body.password === req.body.password2) {
		db.open(function (err) {
			db.collection('user', function (error, coll) {
				if (error) {
					db.close();
					console.log("error with collection");
				}
				else {
					coll.insert({"username" : req.body.username, "password" : req.body.password}, function (err) {
						if (err) {
							console.log("error with insert");
							db.close();
						}
						else {
							db.close();
							res.redirect('/login', {successMsg: "Account succesfully added!"});
						}		
					});
				}
			});
 		});
 	}
  	else {
 	 	res.redirect('/register', {errorMsg: "Invalid data. Try again."});
  	}        
});


var onAuthorizeSuccess = function (data, accept) {
    console.log('Udane połączenie z socket.io');
    accept(null, true);
};

var onAuthorizeFail = function (data, message, error, accept) {
    if (error) {
        throw new Error(message);
    }
    console.log('Nieudane połączenie z socket.io:', message);
    accept(null, false);
};

io.set('authorization', passportSocketIo.authorize({
    passport: passport,
    cookieParser: express.cookieParser,
    key: sessionKey, // nazwa ciasteczka, w którym express/connect przechowuje identyfikator sesji
    secret: sessionSecret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

io.set('log level', 0);

var users = [];

var currentQuestion = {question: "",
				answer: ""
	};
var gameStarted = false;

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
	io.sockets.emit('updateUserList', users, currentQuestion.question, gameStarted);

	socket.on('disconnect', function () {
		console.log("disconnect: ")
		console.log(users);
		//io.sockets.emit('updateUserList', users);
	});

	socket.on('startGame', function() {
		console.log(socket);
		io.sockets.emit('gameStarted');
		gameStarted = true;
		currentQuestion = questions[Math.floor(Math.random()*questions.length)];
		questions = removeQuestion(questions, currentQuestion.question);
		io.sockets.emit('giveQuestion', currentQuestion.question);
	});

	socket.on('nextQuestion', function() {
		if (questions.length === 0) {
			io.sockets.emit('end');
		}
		else {
			currentQuestion = questions[Math.floor(Math.random()*questions.length)];
			questions = removeQuestion(questions, currentQuestion.question);
			console.log(questions);
			io.sockets.emit('giveQuestion', currentQuestion.question);
		}		
	});

	socket.on('tryAnswer', function (answer, user) {
		io.sockets.emit('proposedAnswer', user, answer);
		var isCorrect = true;
		if (answer !== currentQuestion.answer) {
			isCorrect = false;
		}
		setTimeout(function () {
			io.sockets.emit('giveDots', '.')
			}, 1500);
		setTimeout(function () {
			io.sockets.emit('giveDots', '..')
			}, 3000);
		setTimeout(function () {
			io.sockets.emit('giveDots', '...')
			}, 4500);
		setTimeout(function () {
			io.sockets.emit('correctAnswer', currentQuestion.answer, isCorrect);
			}, 6000);
	});
});


var removeByUsername = function(arr, username) {
	return _.reject(arr, function (el) {
		return el.username === username;
	});
}

var removeQuestion = function(arr, question) {
	return _.reject(arr, function (el) {
		return el.question === question;
	});
}

httpServer.listen(3000, function() {
	console.log("Server is listening on port 3000...");
});