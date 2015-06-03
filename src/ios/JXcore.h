/*
JXcore Objective-C bindings
The MIT License (MIT)

Copyright (c) 2015 Oguz Bastemur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

#ifndef JXcordova_JXcore_h
#define JXcordova_JXcore_h

#import <Foundation/Foundation.h>
#include "jx.h"

typedef void (*JXcoreNative)(NSArray *params, NSString *callbackId);

@interface JXcore : NSObject
{}
+ (void)startEngine:(NSString*)fileName withCallback:(JXcoreNative)jxCallback namedAs:(NSString*)name;

+ (void)addNativeMethod:(JXcoreNative)nativeMethod withName:(NSString*)name;

+ (void)callEventCallback:(NSString*)eventName withParams:(NSArray*)params;

+ (void)callEventCallback:(NSString*)eventName withJSON:(NSString*)json;

+ (void)Evaluate:(NSString *)script;

+ (void)addNativeBlock:(void(^)(NSArray *params, NSString *callbackId))code_block withName:(NSString*)name;

+ (void)useSubThreading;
@end

@interface JXNull : NSObject
{}
- (id) init;
- (BOOL) isNull;
@end

@interface JXBoolean : NSObject
{}
- (id) init;
- (void) setBoolean:(BOOL) value;
- (BOOL) getBoolean;
@end

@interface JXJSON : NSObject
{}
- (id) init;
- (void) setString:(NSString*) value;
- (NSString*) getString;
@end


#endif
