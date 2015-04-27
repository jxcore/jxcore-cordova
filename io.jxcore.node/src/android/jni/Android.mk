LOCAL_PATH := $(call my-dir)
JXCORE_OUT_ANDROID := ../jxcore-binaries/

include $(CLEAR_VARS)
LOCAL_MODULE := cares
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libcares_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libcares_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := chrome_zlib
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libchrome_zlib_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libchrome_zlib_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := http_parser
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libhttp_parser_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libhttp_parser_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := openssl
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libopenssl_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libopenssl_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := sqlite3
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libsqlite3_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libsqlite3_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libuv
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libuv_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libuv_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libmozjs
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libmozjs_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libmozjs_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := jxcore_native
ifeq ($(TARGET_ARCH),x86)
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libjx_ia32.a
else
LOCAL_SRC_FILES := $(JXCORE_OUT_ANDROID)libjx_arm.a
endif
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
NDK_TOOLCHAIN_VERSION := 4.8
LOCAL_CFLAGS := -std=gnu++11 
APP_STL := gnustl_static
LOCAL_MODULE    := jxcore
LOCAL_C_INCLUDES := $(JXCORE_OUT_ANDROID)
LOCAL_SRC_FILES := JniHelper.cpp jxcore.cpp
LOCAL_LDLIBS := -llog \
                -lz \
                -ldl \
                -landroid
LOCAL_STATIC_LIBRARIES := cares openssl
LOCAL_WHOLE_STATIC_LIBRARIES := chrome_zlib http_parser sqlite3 libuv libmozjs jxcore_native
include $(BUILD_SHARED_LIBRARY)
