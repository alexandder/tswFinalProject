var app = angular.module('app', []);

app.factory('socket', function () {
	var socket = io.connect('http://localhost:3000');
	return socket;
});

app.controller('appController', ['$scope', 'socket', 
	function ($scope, socket) {
	
	$scope.users = [];	

	$scope.login = function () {
		if ($scope.username !== null) {
			$scope.connected = true;
			socket.emit('login', $scope.username);
		}
	};

	$scope.logout = function () {
		socket.emit('logout', $scope.username);
		$scope.connected = false;
		$scope.$digest();
	};

	socket.on('updateUserList', function (data) {
		$scope.users = data;
		$scope.$digest();
	});
}]);