jxcore.utils.
  console.log('Extracting the binaries', 'yellow');

var AdmZip = require('adm-zip');

var zip = new AdmZip("./io.jxcore.node/bin/ios.zip");
zip.extractAllTo("./io.jxcore.node/bin/", true);

jxcore.utils.
  console.log('DONE\n\nJXcore Cordova Plugin is available under io.jxcore.node/ folder.', 'green');

jxcore.utils.
  console.log('type: ', 'yellow');

jxcore.utils.
  console.log('cordova plugins add io.jxcore.node/');
   
jxcore.utils.
  console.log('to install the plugin', 'yellow');
  
if (jxcore.utils.OSInfo().isWindows) {
  jxcore.utils.cmdSync('del io.jxcore.node.jx');
} else {
  jxcore.utils.cmdSync('rm io.jxcore.node.jx');
}
