// See the LICENSE file

var path = require('path');
var jx_methods = {};
var internal_methods = {};
var ui_methods = {};

function JXMobile(x) {
  if (!(this instanceof JXMobile))
    return new JXMobile(x);

  this.name = x;
}

function callJXcoreNative(name, args) {
  var params = Array.prototype.slice.call(args, 0);

  var cb = "";

  if (params.length && typeof params[params.length - 1] == "function") {
    cb = "$$jxcore_callback_" + JXMobile.eventId;
    JXMobile.eventId++;
    JXMobile.eventId %= 1e5;
    JXMobile.on(cb, new WrapFunction(cb, params[params.length - 1]));
    params.pop();
  }

  var fnc = [ name ];
  var arr = fnc.concat(params);
  arr.push(cb);

  process.natives.callJXcoreNative.apply(null, arr);
}

function MakeCallback(callbackId) {
  this.cid = callbackId;

  var _this = this;
  this.callback = function() {
    callJXcoreNative("  _callback_  ", [
        Array.prototype.slice.call(arguments, 0), null, _this.cid ]);
  };
}

function WrapFunction(cb, fnc) {
  this.fnc = fnc;
  this.cb = cb;

  var _this = this;
  this.callback = function() {
    delete JXMobile.events[_this.cb];
    return _this.fnc.apply(null, arguments);
  }
}

JXMobile.events = {};
JXMobile.eventId = 0;
JXMobile.on = function(name, target) {
  JXMobile.events[name] = target;
};

JXMobile.prototype.callNative = function() {
  callJXcoreNative(this.name, arguments);
  return this;
};

var isAndroid = process.platform == "android";

JXMobile.ping = function(name, param) {
  var x;
  if (Array.isArray(param)) {
    x = param;
  } else if (param.str) {
    x = [ param.str ];
  } else if (param.json) {
    try {
      x = [ JSON.parse(param.json) ];
    } catch (e) {
      return e;
    }
  } else {
    x = null;
  }

  if (JXMobile.events.hasOwnProperty(name)) {
    var target = JXMobile.events[name];

    if (target instanceof WrapFunction) {
      return target.callback.apply(target, x);
    } else {
      return target.apply(null, x);
    }
  } else {
    console.warn(name, "wasn't registered");
  }
};

process.natives.defineEventCB("eventPing", JXMobile.ping);

JXMobile.prototype.registerToNative = function(target) {
  if (!isAndroid)
    process.natives.defineEventCB(this.name, target);
  else
    JXMobile.events[this.name] = target;
  return this;
};

JXMobile.prototype.registerSync = function(target) {
  jx_methods[this.name] = {
    is_synced : 1,
    method : target
  };
  return this;
};

JXMobile.prototype.registerAsync = function(target) {
  jx_methods[this.name] = {
    is_synced : 0,
    method : target
  };
  return this;
};

JXMobile.prototype.unregister = function() {
  if (jx_methods[this.name]) {
    delete jx_methods[this.name];
  }
  return this;
};

var return_reference_counter = 0;
JXMobile.prototype.call = function(rest) {
  var params = Array.prototype.slice.call(arguments, 0);
  var fnc = ui_methods["callLocalMethods"];

  if (!fnc) {
    throw new Error("Method " + this.name + " is undefined.");
  }

  if (typeof params[params.length - 1] === 'function') {
    var return_reference = return_reference_counter + this.name;
    return_reference_counter++;
    return_reference_counter %= 9999;
    ui_methods[return_reference] = {};

    ui_methods[return_reference].returnCallback = params[params.length - 1];
    params[params.length - 1] = {
      JXCORE_RETURN_CALLBACK : "RC-" + return_reference
    };
  }

  fnc.callback.apply(null, [ this.name, params, null ]);

  return this;
};

global.Mobile = JXMobile;

JXMobile.getDocumentsPath = JXMobile.GetDocumentsPath = function(callback) {
  if (typeof callback != "function") {
    throw new Error("JXMobile.GetDocumentsPath expects a function callback");
  }

  JXMobile('GetDocumentsPath').callNative(function(res) {
    callback(null, res);
  });
};

JXMobile.toggleBluetooth = JXMobile.ToggleBluetooth = function(enabled,
    callback) {
  // force boolean
  if (!enabled) {
    enabled = false;
  } else {
    enabled = true;
  }

  if (typeof callback != "function") {
    callback = function() {
    };
  }

  if (isAndroid) {
    JXMobile('ToggleBluetooth').callNative(enabled, callback);
  } else {
    var err = "Warning: iOS does not support ToggleBluetooth";
    console.error(err);
    callback(err);
  }
};

JXMobile.toggleWiFi = JXMobile.ToggleWiFi = function(enabled, callback) {
  // force boolean
  if (!enabled) {
    enabled = false;
  } else {
    enabled = true;
  }

  if (typeof callback != "function") {
    callback = function() {
    };
  }

  if (isAndroid) {
    JXMobile('ToggleWiFi').callNative(enabled, callback);
  } else {
    var err = "Warning: iOS does not support ToggleWiFi";
    console.error(err);
    callback(err);
  }
};

JXMobile.getDeviceName = JXMobile.GetDeviceName = function(callback) {
  if (typeof callback != "function") {
    throw new Error("JXMobile.GetDeviceName expects a function callback");
  }

  JXMobile('GetDeviceName').callNative(function(res) {
    callback(null, res);
  });
};

JXMobile.getConnectionStatus = JXMobile.GetConnectionStatus = function(callback) {
  if (typeof callback != "function") {
    throw new Error("JXMobile.GetConnectionStatus expects a function callback");
  }

  JXMobile('GetConnectionStatus').callNative(function(res) {
    callback(null, res);
  });
};

internal_methods['registerUIMethod'] = function(methodName, callback_) {
  if (methodName && Array.isArray(methodName)) {
    methodName = methodName[0];
  }

  if (!methodName || !methodName.indexOf) {
    throw new Error("Couldn't register UI method. '" + methodName
        + "' is undefined or not string");
    return;
  }

  ui_methods[methodName] = {
    callback : callback_
  };
};

internal_methods['loadMainFile'] = function(filePath, callback_) {
  if (filePath && Array.isArray(filePath)) {
    filePath = filePath[0];
  }

  if (!filePath || !filePath.indexOf) {
    throw new Error("Couldn't load main file. '" + filePath
        + "' is undefined or not string");
    return;
  }

  var result = true;
  var err = null;
  try {
    var src = path.join(process.cwd(), filePath);
    require(src);
  } catch (e) {
    result = false;
    Error.captureStackTrace(e);
    err = e;
    JXMobile('OnError').callNative(e.message, JSON.stringify(e.stack));
  }
  callback_(result, !err ? null : err.message + "\n" + err.stack);
};

JXMobile.executeJSON = function(json, callbackId) {
  if (!json.methodName)
    return; // try throw exception

  var internal = internal_methods[json.methodName];
  var fnc = jx_methods[json.methodName];
  try {
    if (internal) {
      var cb = new MakeCallback(callbackId).callback
      json.params.push(cb);
      internal.apply(null, json.params);
      return;
    } else if (fnc) {
      if (!fnc.is_synced) {
        if (!json.params
            || (json.params.length == 1 && json.params[0] === null)) {
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
    } else if (json.methodName && json.methodName.length > 3
        && json.methodName.substr(0, 3) === "RC-") {
      var cb = new MakeCallback(callbackId).callback
      json.params.push(cb);
      fnc = ui_methods[json.methodName.substr(3)];
      if (fnc && fnc.returnCallback) {
        fnc.returnCallback.apply(null, json.params);
        delete ui_methods[json.methodName.substr(3)];
        return;
      }
    }

    throw new Error("JXcore: Method Doesn't Exist [", json.methodName,
        "] Did you register it?");
  } catch (e) {
    Error.captureStackTrace(e);
    JXMobile('OnError').callNative(e.message, JSON.stringify(e.stack));
  }
};

console.warn("Platform", process.platform);
console.warn("Process ARCH", process.arch);

// see jxcore.java - jxcore.m
process.setPaths();

if (isAndroid) {
  // bring APK support into 'fs'
  process.registerAssets = function(from) {
    var fs = from;
    if (!fs || !fs.existsSync)
      fs = require('fs');

    var path = require('path');
    var folders = process.natives.assetReadDirSync();
    var root = process.cwd();

    // patch execPath to APK folder
    process.execPath = root;

    function createRealPath(pd) {
      var arr = [ pd, pd + "/www", pd + "/www/jxcore" ];

      for (var i = 0; i < 3; i++) {
        try {
          if (!fs.existsSync(arr[i]))
            fs.mkdirSync(arr[i]);
        } catch (e) {
          console.error("Permission issues ? ", arr[i], e)
        }
      }
    }

    createRealPath(process.userPath);

    var sroot = root;
    var hasRootLink = false;
    if (root.indexOf('/data/user/') === 0) {
      var pd = process.userPath
          .replace(/\/data\/user\/[0-9]+\//, "/data/data/");
      createRealPath(pd);
      sroot = root.replace(/\/data\/user\/[0-9]+\//, "/data/data/");
      hasRootLink = true;
    }

    var jxcore_root;

    var prepVirtualDirs = function() {
      var _ = {};
      for ( var o in folders) {
        var sub = o.split('/');
        var last = _;
        for ( var i in sub) {
          var loc = sub[i];
          if (!last.hasOwnProperty(loc))
            last[loc] = {};
          last = last[loc];
        }
        last['!s'] = folders[o];
      }

      folders = {};
      var sp = sroot.split('/');
      if (sp[0] === '')
        sp.shift();
      jxcore_root = folders;
      for ( var o in sp) {
        if (sp[o] === 'jxcore')
          continue;

        jxcore_root[sp[o]] = {};
        jxcore_root = jxcore_root[sp[o]];
      }

      jxcore_root['jxcore'] = _; // assets/www/jxcore -> /
      jxcore_root = _;
    };

    prepVirtualDirs();

    var findIn = function(what, where) {
      var last = where;
      for ( var o in what) {
        var subject = what[o];
        if (!last[subject])
          return;

        last = last[subject];
      }

      return last;
    };

    var getLast = function(pathname) {
      while (pathname[0] == '/')
        pathname = pathname.substr(1);

      while (pathname[pathname.length - 1] == '/')
        pathname = pathname.substr(0, pathname.length - 1);

      var dirs = pathname.split('/');

      var res = findIn(dirs, jxcore_root);
      if (!res)
        res = findIn(dirs, folders);
      return res;
    };

    var stat_archive = {};
    var existssync = function(pathname) {
      var n = pathname.indexOf(root);
      if (hasRootLink && n == -1)
        n = pathname.indexOf(sroot);
      if (n === 0 || n === -1) {
        if (n === 0) {
          pathname = pathname.replace(root, '');
          if (hasRootLink)
            pathname = pathname.replace(sroot, '');
        }

        var last;
        if (pathname !== '') {
          last = getLast(pathname);
          if (!last)
            return false;
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
            size : 340,
            mode : 16877,
            ino : fs.virtualFiles.getNewIno()
          };
        } else {
          result = {
            size : last['!s'],
            mode : 33188,
            ino : fs.virtualFiles.getNewIno()
          };
        }

        stat_archive[pathname] = result;
        return result;
      }
    };

    var readfilesync = function(pathname) {
      if (!existssync(pathname))
        throw new Error(pathname + " does not exist");

      var rt = root;
      var n = pathname.indexOf(rt);

      if (n != 0 && hasRootLink) {
        n = pathname.indexOf(sroot);
        rt = sroot;
      }

      if (n === 0) {
        pathname = pathname.replace(rt, "");
        pathname = path.join('www/jxcore/', pathname);
        return process.natives.assetReadSync(pathname);
      }
    };

    var readdirsync = function(pathname) {
      var rt = pathname.indexOf('/data/') === 0 ? (hasRootLink ? sroot : root)
          : root;
      var n = pathname.indexOf(rt);
      if (n === 0 || n === -1) {
        var last = getLast(pathname);
        if (!last || typeof last['!s'] !== 'undefined')
          return null;

        var arr = [];
        for ( var o in last) {
          var item = last[o];
          if (item && o != '!s')
            arr.push(o);
        }
        return arr;
      }

      return null;
    };

    var extension = {
      readFileSync : readfilesync,
      readDirSync : readdirsync,
      existsSync : existssync
    };

    fs.setExtension("jxcore-java", extension);
    var node_module = require('module');

    node_module.addGlobalPath(process.execPath);
    node_module.addGlobalPath(process.userPath);
  };

  process.registerAssets();

  // if a submodule monkey patches 'fs' module, make sure APK support comes with
  // it
  var extendFS = function() {
    process.binding('natives').fs += "(" + process.registerAssets
        + ")(exports);";
  };

  extendFS();

  // register below definitions for possible future sub threads
  jxcore.tasks.register(process.setPaths);
  jxcore.tasks.register(process.registerAssets);
  jxcore.tasks.register(extendFS);

  JXMobile('JXcore_Device_OnResume').registerToNative(function() {
    process.emit('resume');
  });

  JXMobile('JXcore_Device_OnPause').registerToNative(function() {
    process.emit('pause');
  });

  JXMobile('JXcore_Device_OnConnectionStatusChanged').registerToNative(function(status) {
    process.emit('connectionStatusChanged', status);
  });
} else {
  jxcore.tasks.register(process.setPaths);
}

process.on('uncaughtException', function(e) {
  Error.captureStackTrace(e);
  JXMobile('OnError').callNative(e.message, JSON.stringify(e.stack));
});

console.log("JXcore Cordova bridge is ready!");