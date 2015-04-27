// License information is available from LICENSE file

package io.jxcore.node;

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
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetManager;
import android.os.Handler;
import android.util.Log;

public class jxcore extends CordovaPlugin {

  public enum JXType {
    RT_Int32(1), RT_Double(2), RT_Boolean(3), RT_String(4), RT_JSON(5), RT_Buffer(
        6), RT_Undefined(7), RT_Null(8), RT_Error(9), RT_Function(10), RT_Object(
        11), RT_Unsupported(12);

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
        return RT_JSON;
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

  private static String LOGTAG = "JX-Cordova";
  public static Activity activity;
  public static jxcore addon;

  private final static int CB_VALUE = -3;
  private final static int ERR_VALUE = -2;
  private final static int CB_ID = -1;
  
  public class CoreRunable implements Runnable {
    @Override
    public void run() {
      // TODO Auto-generated method stub
    }
    
    public String callback_id_;
    public PluginResult result_;
    
    public CoreRunable(String callback_id, PluginResult result) {
      callback_id_ = callback_id;
      result_ = result;
    }
  }
  
  public static void CreateResult(long id, String callback_id, boolean async) {
    jxcore.JXType tp = jxcore.JXType.fromInt(addon.getType(id));

    PluginResult result;
    switch (tp) {
    case RT_Int32:
      result = new PluginResult(Status.OK, addon.getInt32(id));
      break;
    case RT_Double:
      // FIX THIS! 
      result = new PluginResult(Status.OK, (float)addon.getDouble(id));
      break;
    case RT_Boolean:
      result = new PluginResult(Status.OK, addon.getBoolean(id) == 1);
      break;
    case RT_String:
      result = new PluginResult(Status.OK, addon.getString(id));
      break;
    case RT_JSON:
      result = new PluginResult(Status.OK, addon.getString(id));
      break;
    case RT_Buffer:
      result = new PluginResult(Status.OK, addon.getBuffer(id));
      break;
    case RT_Undefined:
      result = new PluginResult(Status.OK, 0);
      break;
    case RT_Null:
      result = new PluginResult(Status.OK, 0);
      break;
    case RT_Error:
      result = new PluginResult(Status.ERROR, addon.getString(id));
      break;
    default:
      result = new PluginResult(Status.OK, addon.getString(id));
    }

    if (async) {
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
    int id = is_error == 0 ? CB_VALUE : ERR_VALUE;
    final String cid = addon.getString(CB_ID);
    CreateResult(id, cid, true);
  }

  @Override
  protected void pluginInitialize() {
    Log.d(LOGTAG, "jxcore cordova android initializing");
    activity = cordova.getActivity();
    addon = this;

    callbacks = new HashMap<String, CallbackContext>();

    setNativeContext(activity.getBaseContext(), activity.getAssets());
    startProgress();
  }

  private Handler handler = null;
  public static boolean app_paused = false;

  public void startProgress() {
    Initialize(activity.getBaseContext().getFilesDir().getAbsolutePath());

    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        int active = loopOnce();
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
    
    handler = new Handler();
    handler.postDelayed(runnable, 5);
  }

  Map<String, CallbackContext> callbacks;

  @Override
  public boolean execute(final String action, final JSONArray data,
      final CallbackContext callbackContext) {

    PluginResult result = null;
    try {
      if (action.equals("isReady")) {
        result = new PluginResult(Status.OK);
      } else if (action.equals("Evaluate")) {
        String json = data.get(0).toString() + ", '"
            + callbackContext.getCallbackId() + "')";
        callbacks.put(callbackContext.getCallbackId(), callbackContext);
        long res = evalEngine(json);
        if (res >= 0) {
          CreateResult(res, callbackContext.getCallbackId(), false);
          return true;
        } else {
          result = new PluginResult(Status.NO_RESULT);
          result.setKeepCallback(true);
        }
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

  public boolean isReady(final String action, final JSONArray data,
      final CallbackContext callbackContext) {
    Log.d(LOGTAG, "Plugin Called: " + action);

    PluginResult result = new PluginResult(Status.OK);

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

  public void Initialize(String home) {
    // we could proxy it by request (over NDK) but NDK doesn't support reading
    // directory names.
    // we do not read the file contents here. just the name tree.
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
          if (name.startsWith("assets/jxcore/")) {
            if (first_entry)
              first_entry = false;
            else 
              assets.append(",");
            int size = FileManager.aproxFileSize(name.substring(7));
            assets.append("\"" + name.substring(14) + "\":" + size);
          }
        }
      } finally {
        zf.close();
      }
    } catch (Exception e) {
    }
    assets.append("}");

    prepareEngine(home, assets.toString());

    String mainFile = FileManager.readFile("jxcore_cordova.js");
    Log.d("XX-1", assets.toString());
    Log.d("XX-2", home);
    
    String data = "process.cwd = function(){ return '" + home + "';};\n"
        + mainFile;
    defineMainFile(data);

    startEngine();
  }
}