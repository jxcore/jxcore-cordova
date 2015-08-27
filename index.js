jxcore.utils.
  console.log('JXcore Cordova Plugin is available under io.jxcore.node/ folder.', 'green');

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