var util = require('util');

if (process.subThread && !jxcore.store.shared.exists("THREAD_KEEP_ALIVE")) {
  jxcore.store.shared.set("THREAD_KEEP_ALIVE", 1);

  // keep main thread tasker rolling.
  process.keepAlive();
}

// this log method is designed to work also under a jxcore sub task
exports.log = function() {
  var msg = util.format.apply(this, arguments);

  if (!process.subThread)
    Mobile('log').call(msg);
  else
    process.sendToMain({JXC_SUB:1, method:'log', argv:[msg]});
};

if (!process.subThread) {
  // catch the messages from other threads
  jxcore.tasks.on('message', function (threadId, param) {

    // check if we sent this message
    if(param.JXC_SUB) {
      var m = Mobile(param.method);
      m.call.apply(m, param.argv);
    }
  });
}