// License information is available from LICENSE file

package io.jxcore.node;

import io.jxcore.node.jxcore.JXcoreCallback;
import java.util.ArrayList;
import android.content.Context;
import android.graphics.Point;
import android.view.Display;
import android.view.WindowManager;

public class JXcoreExtension
{
  public static void LoadExtensions() {
    jxcore.RegisterMethod("ScreenInfo", new JXcoreCallback() {
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        Context context = jxcore.activity.getBaseContext();
        WindowManager wm = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        Display display = wm.getDefaultDisplay();
        
        Point outSize = new Point();
        display.getSize(outSize);
        
        // we can deliver the size in 2 ways (array of arguments OR JSON string)
        // lets send it as arguments
        ArrayList<Object> args = new ArrayList<Object>();
        args.add(outSize.x);
        args.add(outSize.y);
        
        jxcore.CallJSMethod(callbackId, args.toArray());
      }
    });
  }
}