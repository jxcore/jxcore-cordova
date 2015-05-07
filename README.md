[Node.JS](https://nodejs.org) plugin for Apache Cordova (built with [JXcore](https://github.com/jxcore/jxcore))

### Status

IOS - Works  
Android - Works


### Goals
This project is intended to ;
 - create an easy to use node.js plugin for Apache Cordova
 - show JXcore's embedding interface in details.

### How to Install

Assuming your Cordova app is located under `/YourCordovaApp` folder;

Go under `/YourCordovaApp` folder.

Get the latest `jxcore-cordova`

```
YourCordovaApp / > git clone https://github.com/obastemur/jxcore-cordova
```

Now you have the plugin source codes are located under `/YourCordovaApp/jxcore-cordova/io.jxcore.node`

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

Use the `index.html` from samples folder

Edit the app.js file under `jxcore-cordova/io.jxcore.node/app/jxcore` 
This is the folder you should put all the necessary node modules etc. 

`sample` folder includes both index.html and sample node app.
