// See the LICENSE file

#include <sys/types.h>
#include <sys/sysctl.h>

// ugly but takes care of XCODE 6 i386 compile bug
size_t fwrite$UNIX2003(const void *a, size_t b, size_t c, FILE *d) {
  return fwrite(a, b, c, d);
}
char *strerror$UNIX2003(int errnum) { return strerror(errnum); }
time_t mktime$UNIX2003(struct tm *a) { return mktime(a); }
double strtod$UNIX2003(const char *a, char **b) { return strtod(a, b); }
void fputs$UNIX2003(const char *restrict c, FILE *restrict f) { fputs(c, f); }

#include "jx.h"

#import <Cordova/CDV.h>
#import "CDVJXcore.h"
#import "JXcoreExtension.h"


static CDVJXcore *activeDevice = nil;

void ConvertResult(NSObject *result, CDVPluginResult **to_result) {
  CDVPluginResult *ret_val = nil;

  CDVCommandStatus status = CDVCommandStatus_OK;
  
  if ([result isKindOfClass:[JXNull class]]) {
    ret_val = [CDVPluginResult resultWithStatus:status];
  } else if ([result isKindOfClass:[NSString class]]) {
    NSString *str_result = (NSString*) result;
    ret_val = [CDVPluginResult resultWithStatus:status messageAsString:str_result];
  } else if ([result isKindOfClass:[JXBoolean class]]) {
    ret_val = [CDVPluginResult resultWithStatus:status messageAsBool:[(JXBoolean*)result getBoolean]];
  } else if ([result isKindOfClass:[NSNumber class]]) {
    NSNumber *nmr_result = (NSNumber*) result;
    ret_val = [CDVPluginResult resultWithStatus:status messageAsDouble:[nmr_result doubleValue]];
  } else if ([result isKindOfClass:[NSData class]]) {
    ret_val = [CDVPluginResult resultWithStatus:status messageAsArrayBuffer:(NSData*)result];
  } else if ([result isKindOfClass:[JXJSON class]]) {
    NSString *str_result = [(JXJSON*)result getString];
    NSArray *arr = [NSArray arrayWithObjects:str_result, nil];
    ret_val = [CDVPluginResult resultWithStatus:status messageAsArray:arr];
  }

  // TODO(obastemur) fix me! detect when we can remove a callback
  [ret_val setKeepCallback:[NSNumber numberWithBool:YES]];
 
  *to_result = ret_val;
}

static void callback(NSArray *arr, NSString *_callbackId) {
  if (arr.count != 4) {
    NSLog(@"JXcore-Cordova: Unexpected callback received");
    return;
  }

  if (![[arr objectAtIndex:2] isKindOfClass:[NSString class]]) {
    NSLog(@"JXcore-Cordova: Unexpected callback received. Third parameter must "
           "be a String");
    return;
  }
  
  if (activeDevice == nil) {
    NSLog(@"There is no active instance for JXcore plugin");
    return;
  }
  
  NSString *callbackId = (NSString*)[arr objectAtIndex:2];

  CDVPluginResult *pluginResult = nil;

  if (![[arr objectAtIndex:1] isKindOfClass:[JXNull class]])
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:(NSString*)[arr objectAtIndex:1]];
  else
    ConvertResult([arr objectAtIndex:0], &pluginResult);

  [pluginResult setKeepCallbackAsBool:TRUE];

  [activeDevice.commandDelegate sendPluginResult:pluginResult
                                      callbackId:callbackId];

}


@implementation CDVJXcore

+ (CDVJXcore*) activeInstance {
  return activeDevice;
}

- (void)pluginInitialize {
  if (activeDevice != nil) {
    activeDevice = self;
    return;
  }
  
  NSLog(@"JXcore Cordova plugin initializing");
  
  [JXcore useSubThreading];
  [JXcore startEngine:@"jxcore_cordova" withCallback:callback namedAs:@"  _callback_  "];

  activeDevice = self;
  
  Class extensionClass = NSClassFromString(@"JXcoreExtension");
  if (extensionClass != nil) {
    id extension = [[extensionClass alloc] init];
    [extension defineMethods];
  }
}

- (void)Evaluate:(CDVInvokedUrlCommand *)command {
  CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [result setKeepCallbackAsBool:TRUE];
  
  NSString *script = [command.arguments objectAtIndex:0];

  if (script != nil) {
    NSString *scriptWithCallbackId =
        [NSString stringWithFormat:@"%@, '%@')", script, command.callbackId];
    
    [JXcore Evaluate:scriptWithCallbackId];
    [result setKeepCallbackAsBool:TRUE];
  } else {
    result = [CDVPluginResult
        resultWithStatus:CDVCommandStatus_ERROR
         messageAsString:@"First argument must be a script string"];
  }
  [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)onPause:(CDVInvokedUrlCommand *)command {
  NSLog(@"Application On Pause");

  [JXcore Evaluate:@"jxcore.tasks.unloadThreads()"];
}

- (void)onResume:(CDVInvokedUrlCommand *)command {
  // has no effect
  NSLog(@"Application On Resume");
}

- (void)isReady:(CDVInvokedUrlCommand *)command {
  bool ready = activeDevice != nil;
  NSLog(@"Is Ready %d\n", ready);
  CDVPluginResult *result =
      [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                          messageAsBool:ready];
  [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

+ (NSString *)cordovaVersion {
  return CDV_VERSION;
}

@end