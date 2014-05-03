var app = angular.module('app', []);

app.factory('socket', ['', function(){
	var socket = io.connect('http://' + location.host);
	return socket;
}]);