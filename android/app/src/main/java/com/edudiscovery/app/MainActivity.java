package com.edudiscovery.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.graphics.Color;
import android.view.View;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.setBackgroundColor(Color.parseColor("#0F172A"));
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
    }
}
