cordova('log').call("JXcore is up and running!");

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

// calling this custom native method from JXcoreExtension.m / .java
cordova('ScreenInfo').callNative(function(width, height){
  console.log("Size", width, height);
});

cordova('fromJXcore').registerToNative(function(param1, param2){
  // this method is reachable from Java or ObjectiveC
  // OBJ-C : [JXcore callEventCallback:@"fromJXcore" withParams:arr_parms];
  // Java  : jxcore.CallJSMethod("fromJXcore", arr_params);
});
