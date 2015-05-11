// See the LICENSE file

#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>
#import "JXcore.h"

@interface CDVJXcore : CDVPlugin
{}

+ (NSString*)cordovaVersion;

+ (CDVJXcore*) activeInstance;

- (void)isReady:(CDVInvokedUrlCommand*)command;

- (void)Evaluate:(CDVInvokedUrlCommand*)command;

- (void)onPause:(CDVInvokedUrlCommand*)command;

- (void)onResume:(CDVInvokedUrlCommand*)command;

- (void)pluginInitialize;

@end
