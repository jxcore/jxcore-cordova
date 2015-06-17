// This JavaScript files runs on Cordova UI

function ctrl_log() {
  return document.getElementById('logs');
}

function log(x) {
  ctrl_log().innerHTML += x + "<BR/>";
  ctrl_log().parentNode.scrollTop = ctrl_log().clientHeight;
}

var inter = setInterval(function() {
  if (typeof jxcore == 'undefined')
    return;

  clearInterval(inter);
  
  document.getElementById('clrbtn').onclick = function() {
    ctrl_log().innerHTML = "";
  }

  var addIp = function(addr) {
    document.getElementById('ipaddrs').innerHTML += "<li>" + addr + "</li>";
  }
  
  jxcore.isReady(function() {
    log('READY');
    // register log method from UI to jxcore instance
    jxcore('log').register(log);
    jxcore('addIp').register(addIp);

    jxcore('app.js').loadMainFile(function(ret, err) {
      if (err) {
        alert(JSON.stringify(err));
      } else {
        log('Loaded');
        jxcore_ready();
      }
    });
  });
}, 5);

function jxcore_ready() {
  // calling a method from JXcore (app.js)
  jxcore('asyncPing').call('Hello', function(ret, err) {
    // register getTime method from jxcore (app.js)
    var getBuffer = jxcore("getBuffer");

    getBuffer.call(function(bf, err) {
      var arr = new Uint8Array(bf);
      log("Buffer size:" + arr.length + " - first item: " + arr[0]);
    });
  });
}