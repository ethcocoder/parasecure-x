package com.parasecure.paree;

import android.graphics.Color;
import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SovereignBrowser")
public class SovereignBrowserPlugin extends Plugin {

    private WebView sovereignView;
    private FrameLayout container;

    @PluginMethod
    public void open(PluginCall call) {
        String url = call.getString("url");
        JSObject rect = call.getObject("rect");

        if (url == null || rect == null) {
            call.reject("URL and Rect (dimensions) are required");
            return;
        }

        getActivity().runOnUiThread(() -> {
            if (sovereignView == null) {
                setupSovereignView();
            }

            updateViewLayout(rect);
            sovereignView.loadUrl(url);
            sovereignView.setVisibility(View.VISIBLE);
            call.resolve();
        });
    }

    @PluginMethod
    public void updateRect(PluginCall call) {
        JSObject rect = call.getObject("rect");
        if (rect == null) {
            call.reject("Rect is required");
            return;
        }

        getActivity().runOnUiThread(() -> {
            if (sovereignView != null) {
                updateViewLayout(rect);
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void close(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (sovereignView != null) {
                sovereignView.setVisibility(View.GONE);
                sovereignView.loadUrl("about:blank");
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void navigate(PluginCall call) {
        String direction = call.getString("direction"); // "back", "forward", "reload"
        getActivity().runOnUiThread(() -> {
            if (sovereignView != null) {
                if ("back".equals(direction)) {
                    if (sovereignView.canGoBack())
                        sovereignView.goBack();
                } else if ("forward".equals(direction)) {
                    if (sovereignView.canGoForward())
                        sovereignView.goForward();
                } else if ("reload".equals(direction)) {
                    sovereignView.reload();
                }
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void syncEngineState(PluginCall call) {
        String threatLevel = call.getString("threatLevel");
        Boolean defenseActive = call.getBoolean("defenseActive");

        getActivity().runOnUiThread(() -> {
            if (sovereignView != null) {
                // Apply visual or logic changes based on engine state
                if ("CRITICAL".equals(threatLevel)) {
                    sovereignView.evaluateJavascript(
                            "document.documentElement.style.filter = 'grayscale(1) brightness(0.8) contrast(1.2)';",
                            null);
                } else if (Boolean.TRUE.equals(defenseActive)) {
                    sovereignView.evaluateJavascript("document.documentElement.style.border = '2px solid #10b981';",
                            null);
                } else {
                    sovereignView.evaluateJavascript(
                            "document.documentElement.style.filter = 'none'; document.documentElement.style.border = 'none';",
                            null);
                }
            }
            call.resolve();
        });
    }

    private void setupSovereignView() {
        sovereignView = new WebView(getContext());
        sovereignView.setWebViewClient(new SovereignClient(this)); // Attach Security Client
        WebSettings settings = sovereignView.getSettings();

        // Sovereign Security Configurations
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);

        // High-Fidelity Masking (Production UA)
        String chromeUA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36";
        settings.setUserAgentString(chromeUA);

        // Production Rendering
        sovereignView.setBackgroundColor(Color.TRANSPARENT);

        // Attach to Bridge Activity
        container = new FrameLayout(getContext());
        getActivity().addContentView(container, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        container.addView(sovereignView);
    }

    public void reportTelemetry(JSObject data) {
        notifyListeners("onBrowserTelemetry", data);
    }

    private void updateViewLayout(JSObject rect) {
        int x = rect.getInteger("x", 0);
        int y = rect.getInteger("y", 0);
        int width = rect.getInteger("width", 0);
        int height = rect.getInteger("height", 0);

        // Convert DP to Pixels for Native Layout
        float density = getContext().getResources().getDisplayMetrics().density;

        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                (int) (width * density),
                (int) (height * density));
        params.leftMargin = (int) (x * density);
        params.topMargin = (int) (y * density);

        sovereignView.setLayoutParams(params);
    }
}
