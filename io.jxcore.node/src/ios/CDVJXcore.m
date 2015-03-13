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

static CDVJXcore *activeDevice = nil;

void ConvertResult(JXResult *result, CDVPluginResult **to_result,
                   bool is_error) {
  CDVPluginResult *ret_val;

  CDVCommandStatus status = CDVCommandStatus_OK;
  if (is_error) {
    status = CDVCommandStatus_ERROR;
  }

  switch (result->type_) {
    case RT_Null:
      ret_val = [CDVPluginResult resultWithStatus:status];
      break;
    case RT_Undefined:
      ret_val = [CDVPluginResult resultWithStatus:status];
      break;
    case RT_Boolean:
      ret_val = [CDVPluginResult resultWithStatus:status
                                    messageAsBool:JX_GetBoolean(result)];
      break;
    case RT_Int32:
      ret_val = [CDVPluginResult resultWithStatus:status
                                     messageAsInt:JX_GetInt32(result)];
      break;
    case RT_Double:
      ret_val = [CDVPluginResult resultWithStatus:status
                                  messageAsDouble:JX_GetDouble(result)];
      break;
    case RT_Buffer: {
      char *data = JX_GetString(result);
      int32_t len = JX_GetDataLength(result);
      NSData *ns_data =
          [NSData dataWithBytes:(const void *)data length:sizeof(char) * len];
      ret_val = [CDVPluginResult resultWithStatus:status
                             messageAsArrayBuffer:ns_data];
    } break;
    case RT_JSON:
    case RT_String: {
      NSString *eval_str = [NSString stringWithUTF8String:JX_GetString(result)];
      ret_val =
          [CDVPluginResult resultWithStatus:status messageAsString:eval_str];
    } break;
    case RT_Error: {
      NSString *eval_str = [NSString stringWithUTF8String:JX_GetString(result)];
      ret_val = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                  messageAsString:eval_str];
    } break;
    default:
      *to_result = nil;
      return;
  }

  // TODO(obastemur) fix me! detect when we can remove a callback
  [ret_val setKeepCallback:[NSNumber numberWithBool:YES]];
 
  *to_result = ret_val;
}

void callback(JXResult *results, int argc) {
  if (argc != 3) {
    NSLog(@"JXcore-Cordova: Unexpected callback received");
    return;
  }

  JXResult retval = results[0];
  JXResult errval = results[1];
  JXResult cid = results[2];

  if (!JX_ResultIsString(&cid)) {
    NSLog(@"JXcore-Cordova: Unexpected callback received. Third parameter must "
           "be a String");
    return;
  }

  if (activeDevice == nil) {
    NSLog(@"There is no active instance for JXcore plugin");
    return;
  }

  NSString *callbackId = [NSString stringWithUTF8String:JX_GetString(&cid)];
  CDVPluginResult *pluginResult = nil;

  if (JX_ResultIsUndefined(&errval) || JX_ResultIsNull(&errval))
    ConvertResult(&retval, &pluginResult, false);
  else
    ConvertResult(&errval, &pluginResult, true);

  [activeDevice.commandDelegate sendPluginResult:pluginResult
                                      callbackId:callbackId];
}

@interface CDVJXcore () {
}
@end

@implementation CDVJXcore

- (void)pluginInitialize {
  NSLog(@"JXcore Cordova plugin initializing");
  NSString *sandboxPath = NSHomeDirectory();

  NSString *filePath =
      [[NSBundle mainBundle] pathForResource:@"jxcore_cordova" ofType:@"js"];

  NSError *error;
  NSString *fileContents =
      [NSString stringWithContentsOfFile:filePath
                                encoding:NSUTF8StringEncoding
                                   error:&error];

  if (error) {
    NSLog(@"Error reading jxcore_cordova.js file: %@",
          error.localizedDescription);
    assert(0);
  }

  JX_Initialize([sandboxPath UTF8String], callback);
  JX_InitializeNewEngine();
  JX_DefineMainFile([fileContents UTF8String]);
  JX_StartEngine();
  [self jxcoreLoop:[NSNumber numberWithInt:0]];

  activeDevice = self;
}

float delay = 0;

- (void)jxcoreLoop:(NSNumber *)n {
  int result = JX_LoopOnce();
  if (result == 0)
    [self performSelector:@selector(jxcoreLoop:)
               withObject:[NSNumber numberWithInt:0]
               afterDelay:0.05 + delay];
  else
    [self performSelector:@selector(jxcoreLoop:)
               withObject:[NSNumber numberWithInt:0]
               afterDelay:0.01 + delay];
}

+ (int)jxcoreLoopOnce {
  return JX_LoopOnce();
}

- (void)Evaluate:(CDVInvokedUrlCommand *)command {
  CDVPluginResult *result = nil;
  NSString *script = [command.arguments objectAtIndex:0];
  activeDevice = self;

  if (script != nil) {
    NSString *scriptWithCallbackId =
        [NSString stringWithFormat:@"%@, '%@')", script, command.callbackId];
    const char *str = [scriptWithCallbackId UTF8String];
    JXResult jxresult;
    JX_Evaluate(str, 0, &jxresult);
    ConvertResult(&jxresult, &result, false);
  } else {
    result = [CDVPluginResult
        resultWithStatus:CDVCommandStatus_ERROR
         messageAsString:@"First argument must be a script string"];
  }
  [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)onPause:(CDVInvokedUrlCommand *)command {
  // has no effect
  delay = 0.50;
  NSLog(@"Application On Pause");

  // unload sub threads
  // when app resumes, jxcore will be reloading them back
  JXResult result;
  JX_Evaluate("jxcore.tasks.unloadThreads()", "ios_on_pause.js", &result);
}

- (void)onResume:(CDVInvokedUrlCommand *)command {
  // has no effect
  delay = 0;
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