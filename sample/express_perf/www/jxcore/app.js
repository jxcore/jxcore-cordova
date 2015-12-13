// This JavaScript file runs on JXcore

var fs = require('fs');
var clog = require('./utilities').log;
clog("JXcore is up and running!");

Mobile('getBuffer').registerSync(function() {
  clog("getBuffer is called!!!");
  var buffer = new Buffer(25000);
  buffer.fill(45);

  // send back a buffer
  return buffer;
});

Mobile('asyncPing').registerAsync(function(message, callback){
  setTimeout(function() {
    callback(null, "Pong:" + message);
  }, 500);
});

// get and share the IP addresses
var os = require('os');
var net = os.networkInterfaces();

for (var ifc in net) {
  var addrs = net[ifc];
  for (var a in addrs) {
    if (addrs[a].family == "IPv4") {
      Mobile('addIp').call(addrs[a].address);
    }
  }
}

if (!fs.existsSync(__dirname + "/node_modules")) {
  clog("The node_modules folder not found. Please refer to www/jxcore/Install_modules.md");
  return;
}

// run express server under a sub thread
jxcore.tasks.addTask(function() {
  // requiring utilities again. This function doesn't share any
  // variable from the above thread code.
  var clog = require('./utilities').log;
  var express = require('express');
  var app = express();

  app.get('/', function (req, res) {
    res.send('Hello World! (' + Date.now() + ")");
    clog("Request", req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress, new Date());
  });

  var server = app.listen(3000, function () {
    clog("Express server is started. (port: 3000)");
  });
});