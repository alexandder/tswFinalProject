var app = angular.module('app', []);

app.factory('socket', function () {
	var socket = io.connect('http://localhost:3000');
	return socket;
});

app.controller('dataController', ['$scope', 'socket', function ($scope, socket){
	$scope.quizes = [];
	$scope.msg = "";

	socket.on('updateQuizesList', function (quizes) {
		$scope.quizes = quizes;
		$scope.$digest();
	});

	socket.on('updateMsg', function (msg) {
		$scope.msg = msg;
		$scope.$digest();
	});

	$scope.updateQuiz = function (label) {
		socket.emit('updateQuiz', label);
	};
}]);

app.controller('appController', ['$scope', 'socket', 
	function ($scope, socket) {
	
	$scope.quizes = [];
	$scope.choosenQuiz = "";
	$scope.users = [];	
	$scope.gameStarted = false;
	$scope.question = "";
	$scope.toAsk = "";
	$scope.currentUserAnswer = "";
	$scope.correctAnswer = "";
	$scope.questionAnswered = false;
	$scope.beforeAnswer = false;
	$scope.connected = true;
	$scope.userWhoAnswered = "";
	$scope.currentUser = $('#logoutForm h4 b').text();
	$scope.proposedAnswer = "";
	$scope.dots = "";
	$scope.afterAnswer = false;

	$scope.startGame = function () {
		socket.emit('startGame', $scope.choosenQuiz);
	};

	$scope.tryAnswer = function () {
		socket.emit('tryAnswer', $scope.currentUserAnswer, $scope.currentUser);
	};

	$scope.nextQuestion = function () {
		socket.emit('nextQuestion');
	};

	socket.on('gameStarted', function (toAsk) {
		$scope.gameStarted = true;
		$scope.toAsk = toAsk;
	});

	socket.on('updateView', function (users, currentQuestion, gameStarted, beforeAnswer, questionAnswered, afterAnswer, quizes) {
		$scope.users = users;
		$scope.currentQuestion = currentQuestion;
		$scope.beforeAnswer = beforeAnswer;
		$scope.gameStarted = gameStarted;
		$scope.questionAnswered = questionAnswered;
		$scope.afterAnswer = afterAnswer;
		$scope.quizes = quizes;
		$scope.$digest();
	});

	socket.on('giveQuestion', function (question, beforeAnswer) {
		$scope.currentUserAnswer = "";
		$scope.correctAnswer = "";
		$scope.userWhoAnswered = "";
		$scope.proposedAnswer = "";
		$scope.dots = "";
		$scope.question = question;
		$scope.beforeAnswer = beforeAnswer;
		$scope.questionAnswered = false;
		$scope.afterAnswer = false;
		$scope.$digest();
	});

	socket.on('proposedAnswer', function (user, proposedAnswer, beforeAnswer) {
		$scope.beforeAnswer = beforeAnswer;
		$scope.userWhoAnswered = user;
		$scope.proposedAnswer = proposedAnswer;
		$scope.questionAnswered = true;
		$scope.$digest();
	});

	socket.on('updateUserList', function (users, currentQuestion, gameStarted) {
		$scope.users = users;
		$scope.question = currentQuestion;
		$scope.$digest();
	});

	socket.on('giveDots', function (dots) {
		$scope.dots = dots;
		$scope.$digest();
	});

	socket.on('correctAnswer', function (correctAnswer) {
		$scope.correctAnswer = correctAnswer;
		$scope.afterAnswer = true;
		$scope.$digest();
	});

	socket.on('updateQuizList', function (quizes) {
		$scope.quizes = quizes;
		$scope.$digest();
	});

}]);