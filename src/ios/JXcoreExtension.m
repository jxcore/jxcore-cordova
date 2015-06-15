// See LICENSE file

#import <Foundation/Foundation.h>
#import "JXcore.h"
#import "JXcoreExtension.h"
#import "CDVJXcore.h"

static void screenInfo(NSArray *arr_, NSString *callbackId) {
  assert ([CDVJXcore activeInstance] != nil && "JXcore instance is not ready!");
  
  CGRect screenRect = [[UIScreen mainScreen] bounds];
  CGFloat screenWidth = screenRect.size.width;
  CGFloat screenHeight = screenRect.size.height;
  
  NSMutableArray *arr = [[NSMutableArray alloc] init];
  
  [arr addObject:[NSNumber numberWithDouble:screenWidth]];
  [arr addObject:[NSNumber numberWithDouble:screenHeight]];
  
  [JXcore callEventCallback:callbackId withParams:arr];
}

@implementation JXcoreExtension
{}

- (void) defineMethods {
  [JXcore addNativeMethod:screenInfo withName:@"ScreenInfo"];
  
  [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
    CGFloat br = [[UIScreen mainScreen] brightness];
    
    [JXcore callEventCallback:callbackId withJSON:[NSString stringWithFormat:@"%f", (float)br]];
  } withName:@"ScreenBrightness"];
  
  [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
    NSMutableArray *arr = [[NSMutableArray alloc] init];
    
    [arr addObject:[NSNumber numberWithInt:100]];
    [arr addObject:[NSNumber numberWithInt:-1]];
    [arr addObject:[NSNumber numberWithDouble:4.5]];
    
    JXBoolean *blval = [[JXBoolean alloc] init];
    [blval setBoolean:TRUE];
    [arr addObject:blval];
    
    [arr addObject:[NSString stringWithFormat:@"Hello World"]];
    
    NSString* nstr = @"Test Buffer";
    NSData* data = [nstr dataUsingEncoding:NSUTF8StringEncoding];
    [arr addObject:data];
    
    [arr addObject:[NSString stringWithFormat:@"Another String with UTF8 中國"]];
    
    [JXcore callEventCallback:callbackId withParams:arr];
  } withName:@"TestParams"];
}
@end