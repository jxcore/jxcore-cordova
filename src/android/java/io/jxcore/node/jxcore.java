// License information is available from LICENSE file

package io.jxcore.node;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetManager;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

public class jxcore extends CordovaPlugin {

  public enum JXType {
    RT_Int32(1), RT_Double(2), RT_Boolean(3), RT_String(4), RT_Object(5), RT_Buffer(
        6), RT_Undefined(7), RT_Null(8), RT_Error(9), RT_Function(10), RT_Unsupported(11);

    int val;

    private JXType(int n) {
      val = n;
    }

    public static JXType fromInt(int n) {
      switch (n) {
      case 1:
        return RT_Int32;
      case 2:
        return RT_Double;
      case 3:
        return RT_Boolean;
      case 4:
        return RT_String;
      case 5:
        return RT_Object;
      case 6:
        return RT_Buffer;
      case 7:
        return RT_Undefined;
      case 8:
        return RT_Null;
      case 9:
        return RT_Error;
      default:
        return RT_Unsupported;
      }
    }
  }

  static {
    System.loadLibrary("jxcore");
  }

  public native void setNativeContext(final Context context,
      final AssetManager assetManager);

  public native int loopOnce();

  public native void startEngine();

  public native void prepareEngine(String home, String fileTree);

  public native void stopEngine();

  public native void defineMainFile(String content);

  public native long evalEngine(String script);

  public native int getType(long id);

  public native double getDouble(long id);

  public native String getString(long id);

  public native byte[] getBuffer(long id);

  public native int getInt32(long id);

  public native int getBoolean(long id);

  public native String convertToString(long id);

  public native long callCBString(String event_name, String param, int is_json);

  public native long callCBArray(String event_name, Object[] arr, int size);

  public static String LOGTAG = "JX-Cordova";
  public static Activity activity = null;
  public static jxcore addon;

  Map<String, CallbackContext> callbacks;
  static Map<String, JXcoreCallback> java_callbacks;
  public static Handler handler = null;
  public static boolean app_paused = false;

  public class CoreRunable implements Runnable {
    @Override
    public void run() {
      // TODO Auto-generated method stub
    }

    public String callback_id_;
    public PluginResult result_;
    public Object[] params_;
    public String str_param_;

    public CoreRunable(String callback_id, PluginResult result) {
      callback_id_ = callback_id;
      result_ = result;
    }

    public CoreRunable(String callback_id, String str_param) {
      callback_id_ = callback_id;
      str_param_ = str_param;
    }

    public CoreRunable(String callback_id, Object[] params) {
      callback_id_ = callback_id;
      params_ = params;
    }
  }

  public static void CreateResult(Object value, String callback_id,
      boolean async, boolean is_error) {
    PluginResult result;

    if (value == null) {
      result = new PluginResult(is_error ? Status.ERROR : Status.OK, 0);
    } else if (is_error) {
      result = new PluginResult(Status.ERROR, (String) value);
    } else if (value.getClass().equals(Integer.class)) {
      result = new PluginResult(Status.OK, (Integer) value);
    } else if (value.getClass().equals(Boolean.class)) {
      result = new PluginResult(Status.OK, (Boolean) value);
    } else if (value.getClass().equals(Double.class)) {
      result = new PluginResult(Status.OK, (Float) value);
    } else if (value.getClass().equals(String.class)) {
      result = new PluginResult(Status.OK, (String) value);
    } else if (value.getClass().equals(byte[].class)) {
      result = new PluginResult(Status.OK, ((byte[]) value));
    } else if (value.getClass().equals(String[].class)) {
      String[] arr = (String[]) value;
      try {
        result = new PluginResult(Status.OK, new JSONArray(arr[0]));
      } catch (JSONException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        return;
      }
    } else {
      result = new PluginResult(Status.OK, value.toString());
    }

    if (async) {
      result.setKeepCallback(true);
      if (addon.callbacks.containsKey(callback_id)) {
        activity.runOnUiThread(addon.new CoreRunable(callback_id, result) {
          @Override
          public void run() {
            CallbackContext ctx = addon.callbacks.get(callback_id_);
            ctx.sendPluginResult(result_);
          }
        });
      }
    } else {
      CallbackContext ctx = addon.callbacks.remove(callback_id);
      ctx.sendPluginResult(result);
    }
  }

  public static void callback(long is_error) {
    Log.e(LOGTAG, "WTF?");
  }

  public interface JXcoreCallback {
    public void Receiver(ArrayList<Object> params, String callbackId);
  }

  public static void jx_callback(Object value, Object error, String callbackId) {
    CreateResult(error == null ? value : error, callbackId, true, error != null);
  }

  @Override
  protected void pluginInitialize() {
    final boolean new_instance = activity == null;
    activity = cordova.getActivity();
    if (!new_instance) {
      setNativeContext(activity.getBaseContext(), activity.getAssets());
    } else {
      Log.d(LOGTAG, "jxcore cordova android initializing");
    }
    addon = this;

    callbacks = new HashMap<String, CallbackContext>();
    java_callbacks = new HashMap<String, JXcoreCallback>();

    RegisterMethod("  _callback_  ", new JXcoreCallback() {
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        if (params.size() < 3 || !params.get(2).getClass().equals(String.class)) {
          Log.e(LOGTAG, "Unkown _callback_ received");
          return;
        }
        jxcore.jx_callback(params.get(0), params.get(1), params.get(2)
            .toString());
      }
    });

    JXcoreExtension.LoadExtensions();

    if (!new_instance)
      return;

    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        setNativeContext(activity.getBaseContext(), activity.getAssets());
        startProgress();
      }
    });
  }

  private static void startProgress() {
    addon.Initialize(activity.getBaseContext().getFilesDir().getAbsolutePath());

    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        int active = addon.loopOnce();
        final int wait_long = app_paused ? 50 : 5;
        if (active == 0)
          handler.postDelayed(this, wait_long);
        else
          handler.postDelayed(this, 1);
      }
    };

    if (handler != null) {
      handler.getLooper().quit();
    }

    handler = new Handler(activity.getMainLooper());
    handler.postDelayed(runnable, 5);
  }

  public static void javaCall(ArrayList<Object> params) {
    if (params.size() < 2 || params.get(0).getClass() != String.class
        || params.get(params.size() - 1).getClass() != String.class) {
      Log.e(LOGTAG, "JavaCall recevied an unknown call");
      return;
    }

    String receiver = params.remove(0).toString();
    String callId = params.remove(params.size() - 1).toString();

    if (!java_callbacks.containsKey(receiver)) {
      Log.e(LOGTAG, "JavaCall recevied a call for unknown method " + receiver);
      return;
    }

    java_callbacks.get(receiver).Receiver(params, callId);
  }

  public static void RegisterMethod(String name, JXcoreCallback callback) {
    java_callbacks.put(name, callback);
  }

  private static void callJSMethod(String id, Object[] args) {
    long ret = addon.callCBArray(id, args, args.length);
    int tp = addon.getType(ret);
    JXType ret_tp = JXType.fromInt(tp);

    if (ret_tp == JXType.RT_Object || ret_tp == JXType.RT_String
        || ret_tp == JXType.RT_Error) {
      Log.e(LOGTAG, "jxcore.CallJSMethod :" + addon.getString(ret));
    }
  }

  private static void callJSMethod(String id, String args) {
    long ret = addon.callCBString(id, args, 1);
    int tp = addon.getType(ret);
    JXType ret_tp = JXType.fromInt(tp);

    if (ret_tp == JXType.RT_Object || ret_tp == JXType.RT_String
        || ret_tp == JXType.RT_Error) {
      Log.e(LOGTAG, "jxcore.CallJSMethod :" + addon.getString(ret));
    }
  }

  public static boolean CallJSMethod(String id, Object[] args) {
    if (jxcore.handler == null) {
      Log.e(LOGTAG, "JXcore wasn't initialized yet");
      return false;
    }

    if (Looper.myLooper() != Looper.getMainLooper()) {
      activity.runOnUiThread(jxcore.addon.new CoreRunable(id, args) {
        @Override
        public void run() {
          callJSMethod(callback_id_, params_);
        }
      });
    } else {
      callJSMethod(id, args);
    }

    return true;
  }

  public static boolean CallJSMethod(String id, String json) {
    if (jxcore.handler == null) {
      Log.e(LOGTAG, "JXcore wasn't initialized yet");
      return false;
    }

    if (Looper.myLooper() != Looper.getMainLooper()) {
      activity.runOnUiThread(jxcore.addon.new CoreRunable(id, json) {
        @Override
        public void run() {
          callJSMethod(callback_id_, str_param_);
        }
      });
    } else {
      callJSMethod(id, json);
    }

    return true;
  }

  @Override
  public boolean execute(final String action, final JSONArray data,
      final CallbackContext callbackContext) {

    PluginResult result = null;
    try {
      if (action.equals("isReady")) {
        result = new PluginResult(Status.OK, handler != null);
      } else if (action.equals("Evaluate")) {
        final String json = data.get(0).toString() + ", '"
            + callbackContext.getCallbackId() + "')";
        callbacks.put(callbackContext.getCallbackId(), callbackContext);

        result = new PluginResult(Status.NO_RESULT);
        result.setKeepCallback(true);

        activity.runOnUiThread(new CoreRunable(callbackContext.getCallbackId(),
            json) {
          @Override
          public void run() {
            long res = evalEngine(str_param_);
            if (res >= 0) {
              String str_err = getString(res);

              CreateResult(str_err, callback_id_, true, true);
            }
          }
        });

      } else {
        result = new PluginResult(Status.OK);
      }
    } catch (Exception ex) {
      result = new PluginResult(Status.ERROR, ex.toString());
    }

    if (result != null)
      callbackContext.sendPluginResult(result);

    return true;
  }

  @Override
  public void onPause(boolean multitasking) {
    super.onPause(multitasking);
    app_paused = true;
  }

  @Override
  public void onResume(boolean multitasking) {
    super.onResume(multitasking);
    app_paused = false;
  }

  private void Initialize(String home) {
    // assets.list is terribly slow, below trick is literally 100 times faster
    StringBuilder assets = new StringBuilder();
    assets.append("{");
    boolean first_entry = true;
    try {
      ZipFile zf = new ZipFile(
          activity.getBaseContext().getApplicationInfo().sourceDir);
      try {
        for (Enumeration<? extends ZipEntry> e = zf.entries(); e
            .hasMoreElements();) {
          ZipEntry ze = e.nextElement();
          String name = ze.getName();
          if (name.startsWith("assets/www/jxcore/")) {
            if (first_entry)
              first_entry = false;
            else
              assets.append(",");
            int size = FileManager.aproxFileSize(name.substring(7));
            assets.append("\"" + name.substring(18) + "\":" + size);
          }
        }
      } finally {
        zf.close();
      }
    } catch (Exception e) {
    }
    assets.append("}");

    prepareEngine(home + "/www", assets.toString());

    String mainFile = FileManager.readFile("jxcore_cordova.js");

    String data = "process.cwd = function(){ return '" + home
        + "/www/jxcore';};\n" 
        + "process.userPath ='" + activity.getBaseContext().getCacheDir().toString() + "';\n"
        + mainFile;
    
    defineMainFile(data);

    startEngine();
  }
}