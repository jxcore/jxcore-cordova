#!/bin/bash

NORMAL_COLOR='\033[0m'
RED_COLOR='\033[0;31m'
GREEN_COLOR='\033[0;32m'
GRAY_COLOR='\033[0;37m'

LOG() {
    COLOR="$1"
    TEXT="$2"
    echo -e "${COLOR}$TEXT ${NORMAL_COLOR}"
}

cp jni/Android.mk.default jni/Android.mk

if [ $# -eq 1 ]
then
  cp -R $1/ jxcore-binaries/
  rm jxcore-binaries/*_mipsel.a
	rm jxcore-binaries/*_x64.a	
fi

ndk-build

# try to update android project
$(cp libs/armeabi/* ../../../platforms/android/libs/armeabi/)
$(cp libs/armeabi-v7a/* ../../../platforms/android/libs/armeabi-v7a/)
$(cp libs/x86/* ../../../platforms/android/libs/x86/)
