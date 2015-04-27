// See the LICENSE file

var path = require('path');
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

console.error("Platform", process.platform);
if (process.platform == "android") {
  process.registerAssets = function () {
    var fs = require('fs');
    var folders = process.natives.assetReadDirSync();
    var root = process.cwd();
    var jxcore_root;

    var prepVirtualDirs = function () {
      var _ = {};
      for (var o in folders) {
        var sp = o.split('/');
        var last = _;
        for (var i in sp) {
          var loc = sp[i];
          if (!last[loc]) last[loc] = {};
          last = last[loc];
        }
        last['!s'] = folders[o];
      }

      folders = {};
      var sp = root.split('/');
      if (sp[0] === '') sp.shift();
      jxcore_root = folders;
      for (var o in sp) {
        jxcore_root[sp[o]] = {};
        jxcore_root = jxcore_root[sp[o]];
      }

      jxcore_root['jxcore'] = _; // assets/jxcore -> /
    };

    prepVirtualDirs();

    var findIn = function (what, where) {
      var last = where;
      for (var o in what) {
        var subject = what[o];
        if (!last[subject]) return;

        last = last[subject];
      }

      return last;
    };

    var getLast = function (location) {
      while (location[0] == '/')
        location = location.substr(1);
      while (location[location.length - 1] == '/')
        location = location.substr(0, location.length - 1);

      var dirs = location.split('/');

      var res = findIn(dirs, folders);
      if (!res) res = findIn(dirs, jxcore_root);

      return res;
    };

    var existssync = function (pathname) {
      var n = pathname.indexOf(root);
      if (n === 0 || n === -1) {
        if (n === 0) {
          pathname = pathname.replace(root, '');
          pathname = path.join('jxcore/', pathname);
        }

        var last = getLast(pathname);
        if (!last) return false;

        var result;
        if (typeof last['!s'] === 'undefined')
          result = {
            size: 0
          };
        else
          result = {
            size: last['!s']
          };

        return result;
      }
    };

    var readfilesync = function (pathname) {
      if (!existssync(pathname)) throw new Error(pathname + " does not exist");

      var n = pathname.indexOf(root);
      if (n === 0) {
        pathname = pathname.replace(root, "");
        pathname = path.join('jxcore/', pathname);
        return process.natives.assetReadSync(pathname);
      }
    };

    var readdirsync = function (pathname) {
      var n = pathname.indexOf(root);
      if (n === 0 || n === -1) {
        var last = getLast(pathname);
        if (!last || typeof last['!s'] !== 'undefined') return null;

        var arr = [];
        for (var o in last) {
          var item = last[o];
          if (item && o != '!s') arr.push(o);
        }
        return arr;
      }
      return null;
    };

    var extension = {
      readFileSync: readfilesync,
      readDirSync: readdirsync,
      existsSync: existssync
    };

    fs.setExtension("jxcore-java", extension);
  };

  process.registerAssets();
} else {
//ugly patching
  var base_path = process.cwd();
  process.cwd = function () {
    return base_path + "/jxcore/";
  };
}

console.log("JXcore Cordova Bridge is Ready!");