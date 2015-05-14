[Node.JS](https://nodejs.org) plugin for Apache Cordova (built on [JXcore](https://github.com/jxcore/jxcore))

### Goals
This project is intended to ;
 - create an easy to use node.js plugin for Apache Cordova (Android, iOS)
 - show JXcore's embedding interface in details.

### Installation

If you don't have **Cordova** is installed, follow the steps from [this link](https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html) to install Apache Cordova.

Assuming your first Cordova JXcore application is located under `/hello` folder;

Go under `/hello` folder.

Get the latest `jxcore-cordova`

```
hello / > git clone https://github.com/jxcore/jxcore-cordova
```

Now you have the plugin source codes are located under `/hello/jxcore-cordova/io.jxcore.node`

Feel free to edit app.js file under `jxcore-cordova/io.jxcore.node/app/jxcore`. (app.js) is your entry point to JXcore's JS.
Besides, this is the folder you should put all the necessary node modules etc.

Under the `samples` folder, you will find `index.html`. This sample file shows how to integrate JXcore interface into Cordova client side.
Prior to installing JXcore plugin, you should update Cordova's index.html as shown from this sample file.

In order to add JXcore plugin into your Android, iOS 'hello' project, use the command line given below;

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


### Usage

**JavaScript on UI side works on top of Cordova's webUI. JXcore's JavaScript is a separate instance.**

So you need an API to communicate between Cordova JS to JXcore JS.

#### Cordova to JXcore
Use the methods below under Cordova JS side (i.e. index.html)

**Share a Cordova method to JXcore**
  jxcore(name_of_the_method).register(method_itself);

  sample: jxcore('alert').register(function(msg) { alert(msg; });

**Call a JXcore JS method from Cordova JS**
  jxcore(name_of_the_method).call(params_to_send..., callback_function);

  sample: jxcore('asyncPing').call('Hello', function(p1, p2, p3...) { });

#### JXcore to Cordova
Methods below are suitable for JXcore JS side (i.e. app.js)

**Share a JXcore method to Cordova**
  cordova(name_of_the_method).registerSync(method_to_register);

  OR

  cordova(name_of_the_method).registerAsync(method_to_register);

  Only difference between the two above is that one of them expects you to send the result via `function return`

  sample:
    cordova('syncPing').registerSync(function(msg) { return msg + ' pong'; });

    cordova('asyncPing').registerAsync(function(msg, callback) { callback(msg + ' pong') });

**Call a Cordova JS method from JXcore JS**
  cordova(name_of_the_method).call(params...);

  sample: cordova('log').call(msg);

#### JXcore to JAVA / Objective-C (vice versa)
You may also define JXcore JS side methods those you want to call from Java / Obj-C.

If you need a JS side method that you want to call multiple times use below approach instead depending on a method callback id.
JXcore cordova interface doesn't keep the reference for a callback id once it's used.

```
  cordova('fromJXcore').registerToNative(function(param1, param2){
    // this method is reachable from Java or ObjectiveC
    // OBJ-C : [JXcore callEventCallback:@"fromJXcore" withParams:arr_parms];
    // Java  : jxcore.CallJSMethod("fromJXcore", arr_params);
  });
```

See JXcoreExtension.java / JXcoreExtension.m / .h for sample Java/Obj-C definitions.

### Contribution
If you see a mistake / bug or you think there is a better way to do the things, feel free to contribute. This project considers the
contributions under MIT licese.
