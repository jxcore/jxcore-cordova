jxcore.utils.
  console.log('Extracting the binaries', 'yellow');

if (process.argv[2] == "EXTRACT") {
  var AdmZip = require('adm-zip');

  var zip = new AdmZip("./io.jxcore.node/bin/ios.zip");
  zip.extractAllTo("./io.jxcore.node/bin/", true);
} else {

  require("child_process").execFile(process.execPath, ["io.jxcore.node/index.js", "EXTRACT"],
    {cwd: process.cwd()}, function (error, stdout, stderr) {

      if (error) {
        console.error("Something bad happened with the extraction:\n", stdout, "\n", stderr);
        process.exit(1);
      }

      jxcore.utils.
        console.log('DONE\n\nJXcore Cordova Plugin is available under io.jxcore.node/ folder.', 'green');

      jxcore.utils.
        console.log('type: ', 'yellow');

      jxcore.utils.
        console.log('cordova plugins add io.jxcore.node/');

      jxcore.utils.
        console.log('to install the plugin', 'yellow');

      require('fs').unlinkSync("io.jxcore.node.jx");
      require('fs').unlinkSync("io.jxcore.node/bin/ios.zip");
    });
}
