
// See the LICENSE file

var channel = require('cordova/channel'),
  utils = require('cordova/utils'),
  exec = require('cordova/exec'),
  cordova = require('cordova');

channel.createSticky('onJXcoreReady');
channel.waitForInitialization('onJXcoreReady');

function callNative(name, args, callback) {
  exec(
    function cb(data) {
      if (data == null) return;
      if (callback) callback(data, null);
    },
    function errorHandler(err) {
      if (callback) callback(null, err);
    },
    'JXcore',
    name,
    args
  );
}

channel.onCordovaReady.subscribe(function () {
  callNative("onResume", null, function () {
    channel.onJXcoreReady.fire();
  });
});

function jxcore(x) {
  if (!(this instanceof jxcore)) {
    return new jxcore(x);
  }
  this.name = x;
}

var initialized = false;
jxcore.isReady = function (callback) {
  if (initialized) return;
  callNative("isReady", [], function (ret) {
    if (ret) {
      initialized = true;
      callback();
    } else {
      setTimeout(function () {
        jxcore.isReady(callback);
      }, 5);
    }
  });
};

var isFunction = function (__$) {
  var _$ = {};
  return __$ && _$.toString.call(__$) === '[object Function]';
};

var callFunction = function (name, params, callback) {
  var args = {};
  args.methodName = name;
  args.params = params;

  callNative("Evaluate", ["cordova.executeJSON(" + JSON.stringify(args)], callback);
};

jxcore.prototype.call = function () {
  var ln = arguments.length;
  var methodName = this.name;
  var callback = null;
  var args = [];

  if (ln) {
    ln -= isFunction(arguments[ln - 1]) ? 1 : 0;
    for (var i = 0; i < ln; i++) {
      args[i] = arguments[i];
    }
    if (ln != arguments.length)
      callback = arguments[ln];
  }

  callFunction(methodName, args, callback);
  return this;
};

jxcore.prototype.register = function (callback) {
  if (!isFunction(callback)) {
    throw new TypeError("callback needs to be a function");
  }

  callFunction("registerUIMethod", [this.name], callback);
  return this;
};

jxcore.prototype.loadMainFile = function (callback) {
  callFunction("loadMainFile", [this.name], callback);
  return this;
};

module.exports = jxcore;

function onPause() {
  callNative("onPause");
}
document.addEventListener("pause", onPause, false);

function onResume() {
  callNative("onResume");
}
document.addEventListener("resume", onResume, false);
