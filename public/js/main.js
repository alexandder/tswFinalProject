var app = angular.module('app', []);

app.factory('socket', function () {
	var socket = io.connect('http://localhost:3000');
	return socket;
});

app.controller('appController', ['$scope', 'socket', 
	function ($scope, socket) {
	
	$scope.users = [];	
	$scope.gameStarted = false;
	$scope.question = "";
	$scope.userAnswer = "";
	$scope.correctAnswer = "";
	$scope.questionAnswered = false;


	$scope.login = function () {
		if ($scope.username !== null) {
			$scope.connected = true;

			socket.emit('login', {username: $scope.username, sockedId: socket.socket.sessionid, score: 0});
		}
	};

	$scope.logout = function () {
		$scope.connected = false;
		socket.emit('logout', $scope.username);
	};

	$scope.startGame = function () {
		socket.emit('startGame');
		$scope.digest;
	};

	$scope.tryAnswer = function () {
		$('#answerButton').attr('disabled', 'disabled');
		socket.emit('tryAnswer', $scope.userAnswer);
	};

	socket.on('authenticate', function (data) {

	});

	socket.on('updateUserList', function (data) {
		$scope.users = data;
		$scope.$digest();
	});

	socket.on('giveQuestion', function (data) {
		$scope.gameStarted = true;
		$scope.question = data.question;
		$scope.$digest();
	});

	socket.on('giveAnswer', function (data) {
		$scope.correctAnswer = data;
		$scope.questionAnswered = true;
		$scope.$digest();
	});

}]);