var util = require('util');

console.toCordova = function() {
  var msg = util.format.apply(this, arguments);

  cordova('log').call(msg);
};

console.toCordova("JXcore is up and running!");


cordova('getBuffer').registerSync(function() {
  console.log("getBuffer is called!!!");
  var buffer = new Buffer(25000);
  buffer.fill(45);

  // send back a buffer
  return buffer;
});

cordova('asyncPing').registerAsync(function(message, callback){
  setTimeout(function() {
    callback("Pong:" + message);
  }, 500);
});

cordova('fromJXcore').registerToNative(function(param1, param2){
  // this method is reachable from Java or ObjectiveC
  // OBJ-C : [JXcore callEventCallback:@"fromJXcore" withParams:arr_parms];
  // Java  : jxcore.CallJSMethod("fromJXcore", arr_params);
});

// calling this custom native method from JXcoreExtension.m / .java
cordova('ScreenInfo').callNative(function(width, height){
  console.toCordova("Screen Size", width, height);
});

cordova('ScreenBrightness').callNative(function(br){
  console.toCordova("Screen Brightness", br);
});

cordova('TestParams').callNative(function(){
  console.toCordova("TestParams result:")
  for (var i=0; i<arguments.length; i++)
    console.toCordova("args[" + i +"] :", arguments[i].toString());
});