#!/bin/bash

# The script automates creating cordova project and running on **posix** platforms:
# See https://github.com/jxcore/jxcore-cordova/blob/master/install_and_run.md

# Save it into an empty folder and run.

# create project
cordova create hello com.example.hello HelloWorld
cd hello

# get plugin
git clone https://github.com/jxcore/jxcore-cordova

# replace original sample if given
if [[ "$1" != "" ]]; then
    DIR="./jxcore-cordova/sample/$1/www"
    if [[ -d $DIR ]]; then
        # escaping spaces in sample folder names
        DIR=$(printf %q "$DIR")
        eval cp -rf "${DIR}/*" ./www/ && echo "Copied '${DIR}' sample succesfully."
    else
        echo "Incorrect sample folder '${DIR}'."
        read -p "Continue with default sample? [y/n] " answer
        if [[ $answer != "y" ]]; then exit; fi
    fi
fi

# add plugin to the project
cordova plugin add jxcore-cordova

# run on android
cordova platforms add android
cordova run android

# or run on ios
#cordova platforms add ios
#cordova run ios