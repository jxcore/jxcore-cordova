[Node.JS](https://nodejs.org) plugin for Apache Cordova (built on [JXcore](https://github.com/jxcore/jxcore))

### Goals
This project is intended to ;
 - create an easy to use node.js plugin for Apache Cordova (Android, iOS)
 - show JXcore's embedding interface in details.

### Installation

If you are on Visual Studio 2015, see [this](https://github.com/jxcore/jxcore-cordova/issues/29#issuecomment-106006938) comment for easy installation.

If you don't have **Cordova** installed, follow the steps from [this link](https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html) to install Apache Cordova.

Assuming your first Cordova JXcore application is located under `/hello` folder;

Go under `/hello` folder.

In order to add JXcore plugin into your Android, iOS 'hello' project, use the command line given below;

```bash
cordova plugin add https://github.com/jxcore/jxcore-cordova.git
```

`www/jxcore/app.js` is your entry point to JXcore's JS.

Node modules should go in the `www/jxcore/node_modules` folder.

**Important Steps for the First Timers**  
Under the sample folder you will find `express sample` application. There you have the entire `www` folder that you can use instead of the `www` folder under cordova project root folder. Replace `www` folder from the project's root to the one under the `sample/express sample`. 

Are you are looking for a minimalistic sample? follow the steps below;  
 1. Under the `sample/www` folder of this repo, you will find `index.html`. This sample file shows how to integrate JXcore interface into Cordova client side. Prior to installing JXcore plugin, you should update Cordova's index.html as shown from this sample file.

 2. This plugin expects you to have a folder named `jxcore` under `www` folder. The sample `index.html` tries to load `app.js` from this folder. You can copy `sample/www/` folder into `www` to run the basic demo.


!In case you have a problem with installing the plugin. You may follow the steps below;
(be careful though since this trick removes the existing platforms and installs them back)

```bash
cordova platform remove ios
cordova platform remove android
cordova plugin remove io.jxcore.node
cordova plugin add https://github.com/jxcore/jxcore-cordova.git
cordova platform add ios
cordova platform add android
```

Now you can visit `platforms/ios` or `platforms/android` folders and open Xcode project file or import the android project from Eclipse.

### Updating JXcore binaries [optional]

Below are the steps to be taken if you want to update JXcore binaries in your Cordova JXcore application.
They all should be called prior to `cordova plugin add` command. This step is optional. We keep the core binaries are updated. 

1. Rebuild JXcore binaries: [Compile as a Static Library](https://github.com/jxcore/jxcore/blob/master/doc/Android_Compile.md#compile-as-a-static-library)
2. Refresh `jxcore-cordova/src/android/jxcore-binaries` folder contents:

    ```bash
    $ cd /my/cordova/app
    $ git clone https://github.com/jxcore/jxcore-cordova.git
    $ rm -f ./jxcore-cordova/src/android/jxcore-binaries/*
    $ cp -f /jxcore/repo/out_android/android/bin/* jxcore-cordova/src/android/jxcore-binaries/
    ```

3. Recompile .so files

    ```bash
    $ cd jxcore-cordova/src/android/jni
    $ ~/android-ndk-path/ndk-build
    ```

4. Add/re-add the plugin/platform

    ```bash
    $ cd ../../../../
    $ cordova plugin add jxcore-cordova/
    $ cordova platforms add android
    ```

5. You may run the app now

    ```bash
    $ cordova run
    ```

### Usage

**JavaScript on UI side works on top of Cordova's webUI. JXcore's JavaScript is a separate instance.**

So you need an API to communicate between Cordova JS to JXcore JS.

#### Cordova to JXcore
These API methods are used on the side of Apache Cordova (for example, in the main `index.html` of your Cordova application).

##### Sharing a JavaScript function from Cordova to JXcore
```js
jxcore(name_of_the_function).register(a_function_to_register);
```
Example:
```js
jxcore('alert').register(function(msg){ alert(msg); });
```

##### Calling a JavaScript function (shared on JXcore side) from Cordova
```js
jxcore(name_of_the_function).call(params_to_send..., callback);
```
Example:
```js
jxcore('asyncPing').call('Hello', function(p1, p2, p3...){ });
```

#### JXcore to Cordova
These API methods are used on the side of JXcore (for example, in the main `app.js` of your application based on Node API).

##### Sharing a synchronous JavaScript function from JXcore to Cordova
```js
cordova(name_of_the_function).registerSync(a_function_to_register);
```
This method expects the registered function to be synchronous (i.e. to immediately return a value). Example:
```js
cordova('syncPing').registerSync(function(msg){ return msg + ' pong'; });
```

##### Sharing an asynchronous JavaScript function from JXcore to Cordova
```js
cordova(name_of_the_function).registerAsync(a_function_to_register);
```
This method expects the registered function to be asynchronous (i.e. to return some value using a callback). Example:
```js
cordova('asyncPing').registerAsync(function(msg, callback){ callback(msg + ' pong') });
```

##### Calling a JavaScript function (shared on Cordova side) from JXcore

```js
cordova(name_of_the_function).call(params...);
```
Example:
```js
cordova('log').call(msg);
```

#### JXcore to JAVA / Objective-C (vice versa)
You may also define JXcore JS side methods those you want to call from Java / Obj-C.

If you need a JS side method that you want to call multiple times use below approach instead depending on a method callback id.

#### Where To Save your Files (Write access on mobile targets) EROFS error ?
Consider using either `process.userPath` or `require('os').tmpdir()` to get the Documents (on ios) or a folder you have the write access. `process.cwd()` or `__dirname` may not target a folder that you have the write access!

#### How to Install Node Modules
Visit www/jxcore folder and install the node modules there. It's adviced to use 'jx install' command to install node modules from npm.

For example
```
// UNIX
www/jxcore > sudo jx install jxm --autoremove "*.gz" 

// Windows
www/jxcore > jx install jxm --autoremove "*.gz"
```

'--autoremove "*.gz"' will be removing the gz files from modules folder. Android APK doesn't allow you to put .gz files into application's assets.

**Remarks**
  - JXcore cordova interface doesn't keep the reference for a callback id once it's used.
  - JavaScript is a single threaded language. Don't call the referenced JS methods from other threads. 

```
  cordova('fromJXcore').registerToNative(function(param1, param2){
    // this method is reachable from Java or ObjectiveC
    // OBJ-C : [JXcore callEventCallback:@"fromJXcore" withParams:arr_parms];
    // Java  : jxcore.CallJSMethod("fromJXcore", arr_params);
  });
```

See JXcoreExtension.java / JXcoreExtension.m / .h for sample Java/Obj-C definitions.

### Contribution
If you see a mistake / bug or you think there is a better way to do the things, feel free to contribute. This project considers the contributions under MIT license.
