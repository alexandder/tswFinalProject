
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
var xmlHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var sessionSecret = '123hbh321h3jHhjj123459900dsad09dad78s';
var sessionKey = 'connect.sid';

var httpServer = require("http").createServer(app);
var io = socketIO.listen(httpServer);
var db = new mongo.Db('tswProject', new mongo.Server('localhost', 27017), {safe: true});
var csv = require('ya-csv');

app.use(express.static("public"));
app.use(express.static("bower_components"));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

db.open(function (err) {
});


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


passport.use(new LocalStrategy(
	function (username, password, done) {
		db.collection("user", function (error, coll) {
			coll.findOne({"username" : username, "password": password}, function (err, result) {
				if (err) {
					return done(null, false);
				}
				if (result) {
					users.push({"username": username, "score": 0});
					return done(null, {
						username: username,
						password: password
					});
				}
				else {
					return done(null, false);
				}
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

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.multipart());
   });


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
    if (users.length === 0) {
		var gameStarted = false;
		var beforeAnswer = false;
		var questionAnswered = false;
		var afterAnswer = false;
	}
    req.logout();
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
	if (req.body.password !== '' && req.body.password === req.body.password2) {
		db.collection('user', function (error, coll) {
			if (error) {
				console.log("error with collection");
			}
			else {
				coll.insert({"username" : req.body.username, "password" : req.body.password}, function (err) {
					if (err) {
						console.log("error with insert");
					}
					else {
						res.redirect('/login');
					}		
				});
			}
		}); 		
	}
	else {
		res.redirect('/register', {errorMsg: "Invalid data. Try again."});
	}        
});

app.post('/game', function (req, res) {
	var reader = csv.createCsvFileReader(req.files.dataFile.path, {
		'separator' : ';',
		'comment' : ''
	});
	var title = req.body.title;
	var quest = req.body.question;
	console.log(req.body);
	db.collection(title, function (error, coll) {
		coll.drop(function (error, reply) {
		});
	});
	db.collection(title, function (error, coll) {
		coll.insert({"toAsk": quest}, function (err, result) {

		});
	});
	reader.addListener('data', function (data) {
		db.collection(title, function (error, coll) {
			coll.insert({"question": data[0], "answer" : data[1]}, function (err, result) {

			});
		});
	});
	res.redirect('/game');
	quizes = [];
	db.collectionNames(function (err, replies) {
		_.each(replies, function (doc) {
			var cname = doc.name;
			cname = cname.replace("tswProject.", "");
			if (cname !== "user" && cname !== "system.indexes") {
				quizes.push(cname);
			}
		});
	});
	io.sockets.emit('updateQuizList', quizes);
});


var onAuthorizeSuccess = function (data, accept) {
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
    key: sessionKey, 
    secret: sessionSecret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

io.set("log level", 0);

var users = [];

var currentQuestion = {question: "",
				answer: ""
	};
var toAsk = "";
var questions = [];

var gameStarted = false;
var beforeAnswer = false;
var questionAnswered = false;
var afterAnswer = false;
var quizes = [];

io.sockets.on('connection', function (socket) {

	db.collectionNames(function (err, replies) {
		quizes = [];
		_.each(replies, function (doc) {
			var cname = doc.name;
			cname = cname.replace("tswProject.", "");
			if (cname !== "user" && cname !== "system.indexes") {
				quizes.push(cname);
			}
		});
		io.sockets.emit('updateView', users, currentQuestion.question, gameStarted, beforeAnswer, questionAnswered, afterAnswer, quizes, toAsk);
	});
	
	

	socket.on('disconnect', function () {
		if (users.length === 0) {
			var gameStarted = false;
			var beforeAnswer = false;
			var questionAnswered = false;
			var afterAnswer = false;
		}
	});

	socket.on('startGame', function (choosenQuiz) {
		gameStarted = true;
		beforeAnswer = true;
		questions = [];
		db.collection(choosenQuiz, function (err, coll) {
			coll.find().toArray(function (error, docs) {
				toAsk = docs[0].toAsk;
				for (var i = 1; i < docs.length; i++) {
					questions.push(docs[i]);
				}
				io.sockets.emit('gameStarted', toAsk);
				currentQuestion = questions[Math.floor(Math.random()*questions.length)];
				questions = removeQuestion(questions, currentQuestion.question);
				io.sockets.emit('giveQuestion', currentQuestion.question, beforeAnswer, toAsk);
			});	
		});
	});

	socket.on('nextQuestion', function() {
		if (questions.length === 0) {
			io.sockets.emit('end');
		}
		else {
			currentQuestion = questions[Math.floor(Math.random()*questions.length)];
			questions = removeQuestion(questions, currentQuestion.question);
			io.sockets.emit('giveQuestion', currentQuestion.question, beforeAnswer, toAsk);
		}		
	});

	socket.on('tryAnswer', function (answer, user) {
		beforeAnswer = false;
		io.sockets.emit('proposedAnswer', user, answer, beforeAnswer);
		var isCorrect = true;
		if (answer !== currentQuestion.answer) {
			isCorrect = false;
		}
		setTimeout(function () {
			io.sockets.emit('giveDots', '.');
			}, 800);
		setTimeout(function () {
			io.sockets.emit('giveDots', '..');
			}, 1600);
		setTimeout(function () {
			io.sockets.emit('giveDots', '...');
			}, 2000);
		setTimeout(function () {
			io.sockets.emit('correctAnswer', currentQuestion.answer, isCorrect, user);
			}, 2500);
		setTimeout(function () {
			if (isCorrect) {
				users = changeScore(users, user, 1)	;
			}
			else {
				users = changeScore(users, user, -1);
			}
			afterAnswer = true;
			users = _.sortBy(users, function (el) { return -el.score; });
			io.sockets.emit('updateUserList', users, currentQuestion.question);
			}, 6000);
	});

	socket.on('updateQuiz', function (label) {
		var films = ["The Social Network", "The Green Mile", "The Godfather", "Schindler's List",
			"Se7en", "Goodfellas","A Beautiful Mind", "Once Upon a Time in America", "Apocalypse Now",
			"The Departed"];
		db.collection(label, function (err, coll) {
			if (coll) {
				coll.drop(function (error, res) {
				});
			}
		});
		var filmQuestion = "Release year of ";
		if (label === "Director") {
			filmQuestion = "Director of";
		}
		db.collection(label, function (err, coll) {
			coll.insert({"toAsk" : filmQuestion}, function (error, res) {
			});
		});
		var xhr = new xmlHttpRequest();
		_.each(films, function (film) {
			xhr.open("GET", "http://www.omdbapi.com/?t=" + film, false);
			xhr.send(null);
			var omdbData = xhr.responseText;
			var omdbJSON = JSON.parse(omdbData);
			db.collection(label, function (err, coll) {
				if (label === "Director") {
					coll.insert({"question" : omdbJSON.Title, "answer" : omdbJSON.Director}, function (error, res) {
					});
				}
				else if (label === "Year") {
					coll.insert({"question" : omdbJSON.Title, "answer" : omdbJSON.Year}, function (error, res) {
					});
				}
			});
		});
		socket.emit("updateMsg", "successful update");
		quizes = [];
		db.collectionNames(function (err, replies) {
			_.each(replies, function (doc) {
				var cname = doc.name;
				cname = cname.replace("tswProject.", "");
				if (cname !== "user" && cname !== "system.indexes") {
					quizes.push(cname);
				}
			});
			io.sockets.emit(updateQuizList, quizes);
		});
	});
});


var changeScore = function (arr, username, points) {
	return _.each(arr, function (el) {
		if (el.username === username) {
			el.score = el.score + points;
		}
	});
};

var removeByUsername = function(arr, username) {
	return _.reject(arr, function (el) {
		return el.username === username;
	});
};

var removeQuestion = function(arr, question) {
	return _.reject(arr, function (el) {
		return el.question === question;
	});
};

httpServer.listen(3000, function() {
	console.log("Server is listening on port 3000...");
});