var _ = require('underscore');
var removeByUsername = function(arr, username) {
	var i = arr.length;
    while(i--){
       if(arr[i] && arr[i].hasOwnProperty(username) && arr[i][username] === username ) {
           arr.splice(i,1);
           return arr;
       }
    }
    return arr;
}

users= [];
users.push({"username" : "test1", "password" : "123"});
users.push({"username" : "test2", "password" : "124"});

users = removeByUsername(users, "test1");

console.log(users);

users = _.reject(users, function (el) {
	return el.username === "test1";
});

console.log(users);