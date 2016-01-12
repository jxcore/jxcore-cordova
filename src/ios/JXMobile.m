// See LICENSE file

#import <Foundation/Foundation.h>
#import "JXcore.h"
#import "JXMobile.h"
#import "CDVJXcore.h"
#import "Reachability.h"

@implementation JXMobile
{}

Reachability* reachability;

+ (void)initialize {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(reachabilityChanged:) name:kReachabilityChangedNotification object:nil];
    reachability = [Reachability reachabilityForInternetConnection];
    [reachability startNotifier];
}

+ (void) reachabilityChanged:(NSNotification *)notice
{
    NetworkStatus status =  [reachability currentReachabilityStatus];
    NSString *strStatus = [JXMobile reachabilityStatusString:(status)];
    [JXcore Evaluate:[NSString stringWithFormat:@"process.emit('connectionStatusChanged','%@');",strStatus]];
}

+ (NSString *) reachabilityStatusString:(NetworkStatus)_status {

    NSString *strStatus;
    if(_status == NotReachable)
    {
        //No internet
        strStatus = @"NotConnected";
    }
    else if (_status == ReachableViaWiFi)
    {
        //WiFi
        strStatus = @"WiFi";
    }
    else if (_status == ReachableViaWWAN)
    {
        //3G
        strStatus = @"WWAN";
    }

    return strStatus;
}

+ (void) defineMethods {
  // Listen to Errors on the JS land
  [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
    NSString *errorMessage = (NSString*)[params objectAtIndex:0];
    NSString *errorStack = (NSString*)[params objectAtIndex:1];

    NSLog(@"Error!: %@\nStack:%@\n", errorMessage, errorStack);
  } withName:@"OnError"];
  
  // User documents location
  [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    [JXcore callEventCallback:callbackId withJSON:[NSString stringWithFormat:@"\"%@\"",documentsDirectory]];
  } withName:@"GetDocumentsPath"];

  [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
      NetworkStatus status = [reachability currentReachabilityStatus];
      NSString *strStatus = [JXMobile reachabilityStatusString:(status)];
      [JXcore callEventCallback:callbackId withJSON:[NSString stringWithFormat:@"{\"%@\":1}",strStatus]];
  } withName:@"GetConnectionStatus"];
  
  // Manufacturer - Device Name
  [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
    NSString *deviceName = [[UIDevice currentDevice] name];
    [JXcore callEventCallback:callbackId withJSON:[NSString stringWithFormat:@"\"Apple-%@\"",deviceName]];
  } withName:@"GetDeviceName"];
}
@end