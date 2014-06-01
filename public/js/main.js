var app = angular.module('app', []);

app.factory('socket', function () {
	var socket = io.connect('http://localhost:3000');
	return socket;
});

app.controller('dataController', ['$scope', 'socket', function(){
	
}]);

app.controller('appController', ['$scope', 'socket', 
	function ($scope, socket) {
	
	$scope.users = [];	
	$scope.gameStarted = false;
	$scope.question = "";
	$scope.currentUserAnswer = "";
	$scope.correctAnswer = "";
	$scope.questionAnswered = false;
	$scope.connected = true;
	$scope.userWhoAnswered = "";
	$scope.currentUser = $('#logoutForm h4 b').text();
	$scope.proposedAnswer = "";
	$scope.dots = "";
	$scope.afterAnswer = false;

	$scope.startGame = function () {
		socket.emit('startGame');
	};

	$scope.tryAnswer = function () {
		socket.emit('tryAnswer', $scope.currentUserAnswer, $scope.currentUser);
	};

	$scope.nextQuestion = function () {
		socket.emit('nextQuestion');
	};

	socket.on('gameStarted', function() {
		$scope.gameStarted = true;
	});

	socket.on('giveQuestion', function (question) {
		$scope.currentUserAnswer = "";
		$scope.correctAnswer = "";
		$scope.userWhoAnswered = "";
		$scope.proposedAnswer = "";
		$scope.dots = "";
		$scope.question = question;
		$scope.questionAnswered = false;
		$scope.afterAnswer = false;
		$scope.$digest();
	});

	socket.on('proposedAnswer', function (user, proposedAnswer) {
		$scope.userWhoAnswered = user;
		$scope.proposedAnswer = proposedAnswer;
		$scope.questionAnswered = true;
		$scope.$digest();
	});

	socket.on('updateUserList', function (users, currentQuestion, gameStarted) {
		$scope.users = users;
		$scope.question = currentQuestion;
		$scope.gameStarted = gameStarted;
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

}]);