// License information is available from LICENSE file

package io.jxcore.node;

import io.jxcore.node.jxcore.JXcoreCallback;

import java.util.ArrayList;

import android.annotation.SuppressLint;
import android.util.Log;

public class JXMobile {
  public static void Initialize() {
    jxcore.RegisterMethod("OnError", new JXcoreCallback() {
      @SuppressLint("NewApi")
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        String message = (String) params.get(0);
        String stack = (String) params.get(1);
        
        Log.e("jxcore", "Error!: " + message + "\nStack: " + stack);
      }
    });
    
    jxcore.RegisterMethod("GetDocumentsPath", new JXcoreCallback() {
      @SuppressLint("NewApi")
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        String path = jxcore.activity.getBaseContext().getCacheDir().toString();
        jxcore.CallJSMethod(callbackId, "\"" + path + "\"");
      }
    });
  }
}