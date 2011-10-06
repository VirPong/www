package virpong.pong.android;

import android.os.Bundle;
import com.phonegap.*;
import com.strumsoft.websocket.phonegap.WebSocketFactory;

public class PongActivity extends DroidGap {
    /** Called when the activity is first created. */
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
        // attach websocket factory
		appView.addJavascriptInterface(new WebSocketFactory(appView), "WebSocketFactory");
    }
}
