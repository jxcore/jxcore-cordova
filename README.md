[Node.JS](https://nodejs.org) plugin for Apache Cordova (built with [JXcore](https://github.com/jxcore/jxcore))

### Status

IOS - Works
Android - Under development


### Goals
This project is intended to ;
 - create an easy to use node.js plugin for Apache Cordova
 - show JXcore's embedding interface in details.


### Remark
I'm not an Apache Cordova expert, certainly all sorts of contributions are welcome!

### How to Install

First, you should [compile JXcore for iOS](https://github.com/jxcore/jxcore/blob/master/doc/iOS_Compile.md).

Assuming your Cordova app is located under `/YourCordovaApp` folder;

Get the latest `jxcore-cordova`

```
YourCordovaApp / > git clone https://github.com/obastemur/jxcore-cordova
```

Now you have the plugin source codes are located under `/YourCordovaApp/jxcore-cordova/io.jxcore.node`
The next step is to put `bin` folder from `out_ios` into `io.jxcore.node` folder.

We are almost done. It's time to add this plugin into your project. Go back to the root folder `/YourCordovaApp`

```
cordova plugin add jxcore-cordova/io.jxcore.node/
```

!In case you have a problem with installing the plugin. You may follow the steps below;
(be careful though since this trick removes the existing platforms and installs them back)

```
cordova platform remove ios
cordova plugin remove jxcore-cordova/io.jxcore.node
cordova plugin add jxcore-cordova/io.jxcore.node/
cordova platform add ios
```

Now you can visit `platforms/ios` folder and open Xcode project file.


### How to Use

Assuming you have JXcore plugin installed and XCode is up and running on front of you.

Under the `Resources` folder you will see the `jxcore_app` folder and a JavaScript file (app.js) inside.
This is the location where the node.js part of your solution is located.

For the UI side usage, visit `sample` folder of this repository.
