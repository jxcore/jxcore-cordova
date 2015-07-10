// See LICENSE file

#import <Foundation/Foundation.h>
#import "JXcore.h"
#import "JXMobile.h"
#import "CDVJXcore.h"

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
}
@end