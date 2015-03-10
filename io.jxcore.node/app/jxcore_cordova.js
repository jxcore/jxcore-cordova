// See the LICENSE file

var path = require('path');
var fs = require('fs');

var jx_methods = {};
var internal_methods = {};
var ui_methods = {};

function MakeCallback(callbackId) {
  this.cid = callbackId;

  var _this = this;
  this.callback = function () {
    var ret_val = arguments[0];
    var err_val = arguments[1];

    process.natives.asyncCallback(ret_val, err_val, _this.cid);
  };
}

function cordova(x) {
  if (!(this instanceof cordova)) return new cordova(x);

  this.name = x;
}

cordova.prototype.registerSync = function (target) {
  jx_methods[this.name] = {is_synced: 1, method: target};
  return this;
};

cordova.prototype.registerAsync = function (target) {
  jx_methods[this.name] = {is_synced: 0, method: target};
  return this;
};

cordova.prototype.unregister = function () {
  if (jx_methods[this.name]) {
    delete jx_methods[this.name];
  }
  return this;
};

cordova.prototype.call = function (rest) {
  var params = Array.prototype.slice.call(arguments, 0);
  var fnc = ui_methods[this.name];

  if (!fnc) {
    throw new Error("Method " + this.name + " is undefined.");
  }

  fnc.callback.apply(null, params);

  return this;
};

global.cordova = cordova;

internal_methods['registerUIMethod'] = function (methodName, callback_) {
  if (methodName && Array.isArray(methodName)) {
    methodName = methodName[0];
  }

  if (!methodName || !methodName.indexOf) {
    console.error("Couldn't register UI method. '" + methodName + "' is undefined or not string");
    return;
  }

  ui_methods[methodName] = {
    callback: callback_
  };
};

// ugly patching
var base_path = process.cwd();
process.cwd = function() { return base_path + "/jxcore_app/"; };

internal_methods['loadMainFile'] = function (filePath, callback_) {
  if (filePath && Array.isArray(filePath)) {
    filePath = filePath[0];
  }

  console.log("loadMainFile", filePath);
  if (!filePath || !filePath.indexOf) {
    console.error("Couldn't load main file. '" + filePath + "' is undefined or not string");
    return;
  }

  var result = true;
  var err = null;
  try {
    require(path.join(process.cwd(), filePath));
  } catch (e) {
    result = false;
    err = e;
    console.error("loadMainFile", e);
  }
  callback_(result, err);
};

cordova.executeJSON = function (json, callbackId) {
  if (!json.methodName) return; // try throw exception

  var internal = internal_methods[json.methodName];
  var fnc = jx_methods[json.methodName];

  if (!fnc && !internal) {
    console.error("JXcore: Method Doesn't Exist [", json.methodName, "] Did you register it?");
    return;
  }

  if (internal) {
    var cb = new MakeCallback(callbackId).callback
    json.params.push(cb);
    internal.apply(null, json.params);
  }

  if (fnc) {
    if (!fnc.is_synced) {
      if (!json.params || (json.params.length == 1 && json.params[0] === null)) {
        json.params = [];
      }
      json.params[json.params.length] = new MakeCallback(callbackId).callback;
    }

    return fnc.method.apply(null, json.params);
  }
};

console.log("JXcore Cordova Bridge is Ready!");