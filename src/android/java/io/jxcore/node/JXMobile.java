// License information is available from LICENSE file

package io.jxcore.node;

import io.jxcore.node.jxcore.JXcoreCallback;

import java.util.ArrayList;

import android.annotation.SuppressLint;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
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

    jxcore.RegisterMethod("GetConnectionStatus", new JXcoreCallback() {
      @SuppressLint("NewApi")
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        ConnectivityManager cm = (ConnectivityManager) jxcore.activity
            .getBaseContext().getSystemService(Context.CONNECTIVITY_SERVICE);

        String info = "{\"NotConnected\":1}";
        NetworkInfo[] netInfo = cm.getAllNetworkInfo();
        for (NetworkInfo ni : netInfo) {
          if (ni.getTypeName().equalsIgnoreCase("WIFI"))
            if (ni.isConnected()) {
              info = "{\"WiFi\":1}";
              break;
            }
          if (ni.getTypeName().equalsIgnoreCase("MOBILE"))
            if (ni.isConnected()) {
              info = "{\"WWAN\":1}";
              break;
            }
        }

        jxcore.CallJSMethod(callbackId, info);
      }
    });
  }
}