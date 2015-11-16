# JXcore Cordova - Node API tests

## Running the tests on mobile devices

The following steps allows you to run the tests on mobile devices.
You need to have Cordova and JXcore installed and available in $PATH.

#### Create cordova application

```sh
cordova create jxcore-cordova-tests org.jxcore.jxcorecordovatests jxcore-cordova-tests
cd jxcore-cordova-tests
```

#### Download and unpack jxcore-cordova plugin

```sh
wget http://jxcordova.cloudapp.net/0.0.8/io.jxcore.node.jx
jx io.jxcore.node.jx
```

#### Prepare the test application

```sh
rm -rf www/*
cp -r io.jxcore.node/test/* www/
cd www/jxcore
jx install --autoremove "*.gz,*.md,.*"
cd ../../
```

**For iOS 9** you need to do an extra step and add the following block to *plugin.xml* into `<platform name="ios">` tag:


```xml
<platform name="ios">
    ...
    <config-file target="*-Info.plist" parent="NSAppTransportSecurity">
        <dict>
            <key>NSAllowsArbitraryLoads</key>
            <true/>
        </dict>
    </config-file>
</platform>
```

**or** you can just overwrite *plugin.xml* with *test/plugin.xml*:

```sh
cp www/plugin.xml ./
```

#### Add the plugin and run the tests

```sh
cordova platforms add android
cordova plugins add io.jxcore.node
cordova run android
```


## Running the tests on native node (as desktop application)

```bash
git clone https://github.com/jxcore/jxcore-cordova
cd test/jxcore/
jx install
mocha
```

#Notes

If running cordova 5.0.0 check that your not affected by this error
http://stackoverflow.com/questions/30048429/cordova-does-not-actually-install-app-on-android-device

#Contributions

Tests from the [superagent](https://github.com/visionmedia/superagent) project have been incorporated into this project.
