// See the LICENSE file

var path = require('path');
var jx_methods = {};
var internal_methods = {};
var ui_methods = {};
var node_module = require('module');

function cordova(x) {
  if (!(this instanceof cordova)) return new cordova(x);

  this.name = x;
}

function callJXcoreNative(name, args) {
  var params = Array.prototype.slice.call(args, 0);

  var cb = "";

  if (params.length && typeof params[params.length - 1] == "function") {
    cb = "$$jxcore_callback_" + cordova.eventId;
    cordova.eventId++;
    cordova.eventId %= 1e5;
    cordova.on(cb, new WrapFunction(cb, params[params.length - 1]));
    params.pop();
  }

  var fnc = [name];
  var arr = fnc.concat(params);
  arr.push(cb);

  process.natives.callJXcoreNative.apply(null, arr);
}

function MakeCallback(callbackId) {
  this.cid = callbackId;

  var _this = this;
  this.callback = function () {
    callJXcoreNative("  _callback_  ", [Array.prototype.slice.call(arguments, 0),
      null,
      _this.cid]);
  };
}

function WrapFunction(cb, fnc) {
  this.fnc = fnc;
  this.cb = cb;

  var _this = this;
  this.callback = function () {
    delete cordova.events[_this.cb];
    return _this.fnc.apply(null, arguments);
  }
}

cordova.events = {};
cordova.eventId = 0;
cordova.on = function (name, target) {
  cordova.events[name] = target;
};

cordova.prototype.callNative = function () {
  callJXcoreNative(this.name, arguments);
  return this;
};

var isAndroid = process.platform == "android";

cordova.ping = function (name, param) {
  var x;
  if (Array.isArray(param)) {
    x = param;
  } else if (param.str) {
    x = [param.str];
  } else if (param.json) {
    try {
      x = [JSON.parse(param.json)];
    } catch (e) {
      return e;
    }
  } else {
    x = null;
  }

  if (cordova.events.hasOwnProperty(name)) {
    var target = cordova.events[name];

    if (target instanceof WrapFunction) {
      return target.callback.apply(target, x);
    } else {
      return target.apply(null, x);
    }
  } else {
    console.warn(name, "wasn't registered");
  }
};

process.natives.defineEventCB("eventPing", cordova.ping);

cordova.prototype.registerToNative = function (target) {
  if (!isAndroid)
    process.natives.defineEventCB(this.name, target);
  else
    cordova.events[this.name] = target;
  return this;
};

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

var return_reference_counter = 0;
cordova.prototype.call = function (rest) {
  var params = Array.prototype.slice.call(arguments, 0);
  var fnc = ui_methods["callLocalMethods"];

  if (!fnc) {
    throw new Error("Method " + this.name + " is undefined.");
  }

  if (typeof params[params.length-1] === 'function') {
    var return_reference = return_reference_counter + this.name;
    return_reference_counter ++;
    return_reference_counter %= 9999;
    ui_methods[return_reference] = {};

    ui_methods[return_reference].returnCallback = params[params.length-1];
    params[params.length-1] = { JXCORE_RETURN_CALLBACK:"RC-" + return_reference };
  }

  fnc.callback.apply(null, [this.name, params, null]);

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
    Error.captureStackTrace(err);
    console.error("loadMainFile", e);
  }
  callback_(result, !err ? null : err.message + "\n" + err.stack);
};

cordova.executeJSON = function (json, callbackId) {
  if (!json.methodName) return; // try throw exception

  var internal = internal_methods[json.methodName];
  var fnc = jx_methods[json.methodName];

  if (internal) {
    var cb = new MakeCallback(callbackId).callback
    json.params.push(cb);
    internal.apply(null, json.params);
    return;
  } else if (fnc) {
    if (!fnc.is_synced) {
      if (!json.params || (json.params.length == 1 && json.params[0] === null)) {
        json.params = [];
      }
      json.params[json.params.length] = new MakeCallback(callbackId).callback;
    }

    var ret_val = fnc.method.apply(null, json.params);
    if (fnc.is_synced && callbackId) {
      new MakeCallback(callbackId).callback(ret_val);
    } else {
      return ret_val;
    }
    return;
  } else if (json.methodName && json.methodName.length>3 && json.methodName.substr(0,3) === "RC-") {
    var cb = new MakeCallback(callbackId).callback
    json.params.push(cb);
    fnc = ui_methods[json.methodName.substr(3)];
    if (fnc && fnc.returnCallback) {
      fnc.returnCallback.apply(null, json.params);
      delete ui_methods[json.methodName.substr(3)];
      return;
    }
  }

  console.error("JXcore: Method Doesn't Exist [", json.methodName, "] Did you register it?");
};

console.warn("Platform", process.platform);
console.warn("Process ARCH", process.arch);

if (isAndroid) {
  process.registerAssets = function (from) {
    var fs = from || require('fs');
    var path = require('path');
    var folders = process.natives.assetReadDirSync();
    var root = process.cwd();

    // patch execPath to userPath
    process.execPath = root;

    try {
      // force create www/jxcore sub folder so we can write into cwd
      if (!fs.existsSync(process.userPath)) {
        fs.mkdir(process.userPath);
        if (!fs.existsSync(root)) {
          fs.mkdir(root);
        }
      }
    } catch (e) {
      console.error("Problem creating assets root at ", root);
      console.error("You may have a problem with writing files");
      console.error("Original error was", e);
    }

    var jxcore_root;

    var prepVirtualDirs = function () {
      var _ = {};
      for (var o in folders) {
        var sub = o.split('/');
        var last = _;
        for (var i in sub) {
          var loc = sub[i];
          if (!last.hasOwnProperty(loc)) last[loc] = {};
          last = last[loc];
        }
        last['!s'] = folders[o];
      }

      folders = {};
      var sp = root.split('/');
      if (sp[0] === '') sp.shift();
      jxcore_root = folders;
      for (var o in sp) {
        if (sp[o] === 'jxcore')
          continue;

        jxcore_root[sp[o]] = {};
        jxcore_root = jxcore_root[sp[o]];
      }

      jxcore_root['jxcore'] = _; // assets/www/jxcore -> /
      jxcore_root = _;
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

    var getLast = function (pathname) {
      while (pathname[0] == '/')
        pathname = pathname.substr(1);

      while (pathname[pathname.length - 1] == '/')
        pathname = pathname.substr(0, pathname.length - 1);

      var dirs = pathname.split('/');

      var res = findIn(dirs, jxcore_root);
      if (!res) res = findIn(dirs, folders);
      return res;
    };

    var stat_archive = {};
    var existssync = function (pathname) {
      var n = pathname.indexOf(root);
      if (n === 0 || n === -1) {
        if (n === 0) {
          pathname = pathname.replace(root, '');
        }

        var last;
        if (pathname !== '') {
          last = getLast(pathname);
          if (!last) return false;
        } else {
          last = jxcore_root;
        }

        var result;
        // cache result and send the same again
        // to keep same ino number for each file
        // a node module may use caching for dev:ino
        // combinations
        if (stat_archive.hasOwnProperty(pathname))
          return stat_archive[pathname];

        if (typeof last['!s'] === 'undefined') {
          result = { // mark as a folder
            size: 340,
            mode: 16877,
            ino: fs.virtualFiles.getNewIno()
          };
        } else {
          result = {
            size: last['!s'],
            mode: 33188,
            ino: fs.virtualFiles.getNewIno()
          };
        }

        stat_archive[pathname] = result;
        return result;
      }
    };

    var readfilesync = function (pathname) {
      if (!existssync(pathname)) throw new Error(pathname + " does not exist");

      var n = pathname.indexOf(root);
      if (n === 0) {
        pathname = pathname.replace(root, "");
        pathname = path.join('www/jxcore/', pathname);
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
    node_module.addGlobalPath(process.execPath);
    node_module.addGlobalPath(process.userPath);
  };

  process.registerAssets();
  process.binding('natives').fs += "(" + process.registerAssets + ")(exports);";
} else {
  // ugly patching
  var base_path = path.join(process.cwd(), "www/jxcore/");
  process.cwd = function () {
    if (arguments.length) {
      // or we should throw this as an exception ?
      // Who knows how many node modules would break..
      console.error("You are on iOS. This platform doesn't support setting cwd");
    }
    return base_path;
  };

  node_module.addGlobalPath(process.cwd());
  node_module.addGlobalPath(process.userPath);
}

console.log("JXcore Cordova Bridge is Ready!");