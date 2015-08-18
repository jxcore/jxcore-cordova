// See LICENSE file

#import <Foundation/Foundation.h>
#import "JXcore.h"
#import "JXMobile.h"
#import "CDVJXcore.h"
#import "Reachability.h"

@implementation JXMobile
{}

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
    Reachability *reachability = [Reachability reachabilityForInternetConnection];
    [reachability startNotifier];

    NetworkStatus status = [reachability currentReachabilityStatus];

    NSString *strStatus;
    if(status == NotReachable) 
    {
        //No internet
        strStatus = @"{\"NotConnected\":1}";
    }
    else if (status == ReachableViaWiFi)
    {
        //WiFi
        strStatus = @"{\"WiFi\":1}";
    }
    else if (status == ReachableViaWWAN) 
    {
        //3G
        strStatus = @"{\"WWAN\":1}";
    }
    [JXcore callEventCallback:callbackId withJSON:strStatus];
  } withName:@"GetConnectionStatus"];
  
  // Manufacturer - Device Name
  [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
    NSString *deviceName = [[UIDevice currentDevice] name];
    [JXcore callEventCallback:callbackId withJSON:[NSString stringWithFormat:@"\"Apple-%@\"",deviceName]];
  } withName:@"GetDeviceName"];
}
@end