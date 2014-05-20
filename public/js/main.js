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


	$scope.login = function () {
		if ($scope.username !== null) {
			$scope.connected = true;
			socket.emit('login', $scope.username);
		}
	};

	$scope.logout = function () {
		$scope.connected = false;
		socket.emit('logout', $scope.username);
	};

	$scope.startGame = function () {
		$scope.gameStarted = true;
		socket.emit('startGame');
		$scope.digest;
	};

	$scope.tryAnswer = function () {

	};
	socket.on('updateUserList', function (data) {
		$scope.users = data;
		$scope.$digest();
	});
}]);