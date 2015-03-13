// See the LICENSE file

#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>

@interface CDVJXcore : CDVPlugin
{}

+ (NSString*)cordovaVersion;

+ (int)jxcoreLoopOnce;

- (void)isReady:(CDVInvokedUrlCommand*)command;

- (void)Evaluate:(CDVInvokedUrlCommand*)command;

- (void)onPause:(CDVInvokedUrlCommand*)command;

- (void)onResume:(CDVInvokedUrlCommand*)command;

- (void)pluginInitialize;

- (void)jxcoreLoop:(NSNumber*) n;

@end
