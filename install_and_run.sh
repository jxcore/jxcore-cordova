#!/bin/bash

# The script automates creating cordova project and running on **posix** platforms:
# See https://github.com/jxcore/jxcore-cordova/blob/master/install_and_run.md

# Save it into an empty folder and run.

# create project
cordova create hello com.example.hello HelloWorld
cd hello

# get small downloader tool
jx install download-cli

# get plugin
echo Downloading the file. Please wait...
jx node_modules/download-cli/cli.js http://jxcordova.cloudapp.net/0.0.8/io.jxcore.node.jx

# downloader tool not needed any more
rm -rf ./node_modules

# unpack plugin
jx io.jxcore.node.jx

# replace original sample if given
if [[ "$1" != "" ]]; then
    DIR="./io.jxcore.node/sample/$1/www"

    if [[ -e $DIR/jxcore/package.json ]]; then
        # installing node modules if sample needs it
        cd $DIR/jxcore/
        jx install --autoremove ".*,*.md,*.MD"
        cd ../../../../../
    fi

    if [[ -d $DIR ]]; then
        # escaping spaces in sample folder names
        DIR=$(printf %q "$DIR")
        eval cp -rf "${DIR}/*" ./www/ && echo "Copied '${DIR}' sample successfully."
    else
        echo "Incorrect sample folder '${DIR}'."
        read -p "Continue with default sample? [y/n] " answer
        if [[ $answer != "y" ]]; then exit; fi
    fi
fi

# add plugin to the project
cordova plugins add io.jxcore.node

# run on android
cordova platforms add android
cordova run android

# or run on ios
#cordova platforms add ios
#cordova run ios
