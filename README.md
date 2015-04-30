[Node.JS](https://nodejs.org) plugin for Apache Cordova (built with [JXcore](https://github.com/jxcore/jxcore))

### Status

IOS - Works  
Android - Works


### Goals
This project is intended to ;
 - create an easy to use node.js plugin for Apache Cordova
 - show JXcore's embedding interface in details.


### Remark
I'm not an Apache Cordova expert, certainly all sorts of contributions are welcome!

### How to Install

Assuming your Cordova app is located under `/YourCordovaApp` folder;

Get the latest `jxcore-cordova`

```
YourCordovaApp / > git clone https://github.com/obastemur/jxcore-cordova
```

Now you have the plugin source codes are located under `/YourCordovaApp/jxcore-cordova/io.jxcore.node`

For Android, everything just works without any additional binaries.

iOS; You need iOS binaries from JXcore. If you want to compile latest JXcore, follow the below steps;
 - Visit both [compile JXcore](https://github.com/jxcore/jxcore/blob/master/doc/HOW_TO_COMPILE.md), and [compile JXcore for iOS](https://github.com/jxcore/jxcore/blob/master/doc/iOS_Compile.md)
 - put `bin` folder from `out_ios` into `io.jxcore.node` folder.

Alternatively you can download the [ios.tar.gz](https://mega.co.nz/#!q0chybbD!Bbk8cWS0Hj2Lf7aWGt-fBLRnmJ8TzHZr1hDy9nBy6qc) (430Mb!) file and extract it into `io.jxcore.node` folder. (shasum b3ed64c6c1429b9ddb90109f215e93feab5f0385)

You are almost done. It's time to add this plugin into your project. Go back to the root folder `/YourCordovaApp`

```
cordova plugin add jxcore-cordova/io.jxcore.node/
```

!In case you have a problem with installing the plugin. You may follow the steps below;
(be careful though since this trick removes the existing platforms and installs them back)

```
cordova platform remove ios
cordova platform remove android
cordova plugin remove io.jxcore.node
cordova plugin add jxcore-cordova/io.jxcore.node/
cordova platform add ios
cordova platform add android
```

Now you can visit `platforms/ios` or `platforms/android` folders and open Xcode project file or import the android project from Eclipse.


### How to use 

Edit the app.js file under `jxcore-cordova/io.jxcore.node/app/jxcore` 
This is the folder you should put all the necessary node modules etc. 

`sample` folder includes both index.html and sample node app.
