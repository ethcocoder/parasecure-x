package com.parasecure.paree;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(SovereignBrowserPlugin.class); // Register Custom Native Engine
        super.onCreate(savedInstanceState);

        // SOVEREIGN UA MASKING: Override the Android WebView User-Agent to match
        // real Chrome for Android. This removes the telltale "wv" (WebView) marker
        // that Google, DuckDuckGo, and others use to detect app-embedded browsers
        // and serve CAPTCHA challenges.
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();

        String chromeUA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) "
                + "AppleWebKit/537.36 (KHTML, like Gecko) "
                + "Chrome/120.0.6099.144 Mobile Safari/537.36";

        settings.setUserAgentString(chromeUA);

        // Core WebSettings for a premium experience
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        // IMPORTANT: We do NOT set a custom WebViewClient here anymore.
        // Doing so overwrites Capacitor's internal BridgeWebViewClient,
        // which handles asset loading and the localhost server, breaking the app.
    }
}
