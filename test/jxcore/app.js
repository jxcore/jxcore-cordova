console.log("hello app.js");

Mobile('asyncSeverStarted').registerAsync(function(message, callback){

    console.log("asyncSeverStarted called:" + message);

    console.log("require('" + message + "')");

    var app = require(message);

    callback("Pong:" + message);

});

