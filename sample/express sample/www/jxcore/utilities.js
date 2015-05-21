var util = require('util');

exports.log = function() {
  var msg = util.format.apply(this, arguments);
  
  cordova('log').call(msg);
};


