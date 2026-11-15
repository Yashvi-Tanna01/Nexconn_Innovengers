package com.antah.network;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.os.Bundle;
import android.text.InputType;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.UnknownHostException;
import java.security.KeyStore;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

public class MainActivity extends AppCompatActivity {
    private static final String PREFS = "antah_session";
    private static final String TOKEN = "access_token";
    private static final String REFRESH_TOKEN = "refresh_token";
    private final ExecutorService network = Executors.newSingleThreadExecutor();
    private SharedPreferences session;
    private LinearLayout content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        session = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        loadDashboard();
    }

    private void showLogin() {
        content = baseLayout();
        EditText email = input("Email", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        EditText password = input("Password", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        Button signIn = button("Sign in", true);
        ProgressBar progress = new ProgressBar(this);
        progress.setVisibility(View.GONE);

        content.addView(brandHeader());
        content.addView(sectionTitle("Welcome back"));
        content.addView(subtitle("Sign in to see the signals that matter in your community."));
        LinearLayout form = card();
        form.addView(fieldLabel("EMAIL ADDRESS"));
        form.addView(email);
        form.addView(fieldLabel("PASSWORD"));
        form.addView(password);
        form.addView(signIn);
        form.addView(progress);
        content.addView(form);
        content.addView(connectionNote());
        setContentView(content);

        signIn.setOnClickListener(v -> {
            String emailValue = email.getText().toString().trim();
            String passwordValue = password.getText().toString();
            if (emailValue.isEmpty() || passwordValue.isEmpty()) {
                toast("Enter your email and password.");
                return;
            }
            signIn.setEnabled(false);
            progress.setVisibility(View.VISIBLE);
            network.execute(() -> {
                try {
                    JSONObject response = request("/auth/login", "POST",
                            new JSONObject().put("email", emailValue).put("password", passwordValue), null);
                    String accessToken = response.getString("access_token");
                    saveToken(accessToken, response.getString("refresh_token"));
                    runOnUiThread(this::loadDashboard);
                } catch (Exception error) {
                    runOnUiThread(() -> {
                        signIn.setEnabled(true);
                        progress.setVisibility(View.GONE);
                        toast(connectionMessage(error));
                    });
                }
            });
        });
    }

    private void loadDashboard() {
        String token;
        try {
            token = readToken();
        } catch (Exception error) {
            clearToken();
            showLogin();
            return;
        }
        if (token == null) {
            showLogin();
            return;
        }
        network.execute(() -> {
            try {
                JSONObject user = request("/auth/me", "GET", null, token);
                runOnUiThread(() -> showDashboard(user));
            } catch (ApiException error) {
                if (error.status == 401 && refreshSession()) {
                    loadDashboard();
                    return;
                }
                clearToken();
                runOnUiThread(() -> {
                    toast("Your session has expired.");
                    showLogin();
                });
            } catch (Exception error) {
                clearToken();
                runOnUiThread(() -> {
                    toast("Your session has expired.");
                    showLogin();
                });
            }
        });
    }

    private void showDashboard(JSONObject user) {
        content = baseLayout();
        String roleName = user.optString("role", "");
        String dashboardTitle;
        if ("admin".equals(roleName)) {
            dashboardTitle = "Admin Dashboard";
        } else if ("coordinator".equals(roleName)) {
            dashboardTitle = "Coordinator Dashboard";
        } else if ("responder".equals(roleName)) {
            dashboardTitle = "Responder Dashboard";
        } else {
            dashboardTitle = "Resident Dashboard";
        }
        content.addView(topBar(user.optString("full_name", "ANTAH user")));
        content.addView(sectionTitle(dashboardTitle));
        content.addView(subtitle("Your community workspace is ready."));
        LinearLayout identity = card();
        TextView role = subtitle("ACTIVE ACCOUNT\n" + (roleName.isEmpty() ? "unknown" : roleName.toUpperCase()));
        role.setTextColor(Color.rgb(40, 107, 86));
        role.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        role.setPadding(dp(18), dp(14), dp(18), dp(14));
        identity.addView(role);
        content.addView(identity);
        if ("admin".equals(roleName) || "coordinator".equals(roleName)) {
            content.addView(actionCard("Manage reports", "Review incidents and coordinate action", "REPORTS"));
        } else if ("responder".equals(roleName)) {
            content.addView(actionCard("Assigned incidents", "View response work assigned to you", "MISSIONS"));
        } else {
            content.addView(actionCard("Report an incident", "Share a signal with your community", "NEW REPORT"));
        }
        content.addView(actionCard("Messages", "Stay connected with your coordination network", "NEXCONN"));
        content.addView(actionCard("Profile", "Manage your account and preferences", "ACCOUNT"));
        Button logout = button("Log out", false);
        logout.setTextColor(Color.rgb(176, 67, 67));
        logout.setBackground(rounded(Color.WHITE, Color.rgb(238, 210, 210), 16));
        LinearLayout.LayoutParams logoutParams = new LinearLayout.LayoutParams(-1, dp(52));
        logoutParams.setMargins(0, dp(18), 0, dp(24));
        logout.setLayoutParams(logoutParams);
        content.addView(logout);
        logout.setOnClickListener(v -> {
            clearToken();
            showLogin();
        });
        setContentView(content);
    }

    private JSONObject request(String path, String method, JSONObject body, String token) throws Exception {
        URL url = new URL(BuildConfig.ANTAH_API_BASE_URL + path);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);
        connection.setRequestProperty("Accept", "application/json");
        if (token != null) connection.setRequestProperty("Authorization", "Bearer " + token);
        if (body != null) {
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            try (OutputStream output = connection.getOutputStream()) {
                output.write(body.toString().getBytes(StandardCharsets.UTF_8));
            }
        }
        int status = connection.getResponseCode();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
                status >= 400 ? connection.getErrorStream() : connection.getInputStream(),
                StandardCharsets.UTF_8));
        StringBuilder responseBody = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) responseBody.append(line);
        if (status >= 400) {
            String detail = new JSONObject(responseBody.toString()).optString("detail", "Request failed.");
            throw new ApiException(status, detail);
        }
        return new JSONObject(responseBody.toString());
    }

    private boolean refreshSession() {
        try {
            String refreshToken = readSecret(REFRESH_TOKEN);
            if (refreshToken == null) return false;
            JSONObject response = request("/auth/refresh", "POST",
                    new JSONObject().put("refresh_token", refreshToken), null);
            saveToken(response.getString("access_token"), response.getString("refresh_token"));
            return true;
        } catch (Exception error) {
            return false;
        }
    }

    private LinearLayout baseLayout() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(dp(22), dp(28), dp(22), dp(28));
        layout.setBackground(rounded(Color.rgb(246, 249, 247), Color.TRANSPARENT, 0));
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.addView(layout);
        setContentView(scroll);
        return layout;
    }

    private TextView title(String text) {
        TextView view = subtitle(text);
        view.setTextSize(32);
        view.setTextColor(Color.rgb(27, 78, 62));
        view.setPadding(0, 0, 0, 12);
        return view;
    }

    private TextView subtitle(String text) {
        TextView view = new TextView(this);
        view.setText(text);
        view.setTextSize(16);
        view.setTextColor(Color.rgb(32, 40, 39));
        view.setGravity(Gravity.CENTER);
        view.setPadding(0, 0, 0, 24);
        return view;
    }

    private EditText input(String hint, int inputType) {
        EditText input = new EditText(this);
        input.setHint(hint);
        input.setInputType(inputType);
        input.setSingleLine(true);
        input.setTextSize(16);
        input.setPadding(dp(16), 0, dp(16), 0);
        input.setBackground(rounded(Color.rgb(247, 250, 248), Color.rgb(215, 228, 220), 14));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, dp(54));
        params.setMargins(0, 0, 0, dp(16));
        input.setLayoutParams(params);
        return input;
    }

    private Button button(String text, boolean primary) {
        Button button = new Button(this);
        button.setText(text);
        button.setAllCaps(false);
        button.setTextSize(16);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setTextColor(primary ? Color.WHITE : Color.rgb(40, 107, 86));
        button.setBackground(rounded(primary ? Color.rgb(40, 107, 86) : Color.WHITE,
                primary ? Color.TRANSPARENT : Color.rgb(215, 228, 220), 14));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, dp(54));
        params.setMargins(0, dp(6), 0, dp(4));
        button.setLayoutParams(params);
        return button;
    }

    private TextView sectionTitle(String text) {
        TextView view = title(text);
        view.setTextSize(24);
        view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        view.setPadding(0, dp(16), 0, dp(4));
        return view;
    }

    private LinearLayout brandHeader() {
        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(0, 0, 0, dp(28));
        TextView mark = title("A");
        mark.setGravity(Gravity.CENTER);
        mark.setTextColor(Color.WHITE);
        mark.setTextSize(25);
        mark.setBackground(rounded(Color.rgb(40, 107, 86), Color.TRANSPARENT, 18));
        mark.setLayoutParams(new LinearLayout.LayoutParams(dp(54), dp(54)));
        header.addView(mark);
        LinearLayout names = new LinearLayout(this);
        names.setOrientation(LinearLayout.VERTICAL);
        names.setPadding(dp(14), 0, 0, 0);
        TextView name = title("ANTAH");
        name.setTextSize(24);
        name.setPadding(0, 0, 0, 0);
        names.addView(name);
        TextView tagline = subtitle("THE UNHEARD SIGNALS NETWORK");
        tagline.setTextSize(10);
        tagline.setGravity(Gravity.LEFT);
        tagline.setLetterSpacing(0.08f);
        tagline.setPadding(0, dp(3), 0, 0);
        names.addView(tagline);
        header.addView(names);
        return header;
    }

    private LinearLayout topBar(String name) {
        LinearLayout bar = brandHeader();
        TextView welcome = subtitle("Hello, " + name);
        welcome.setTextSize(13);
        welcome.setTextColor(Color.rgb(93, 113, 103));
        bar.addView(welcome);
        return bar;
    }

    private LinearLayout card() {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(18), dp(18), dp(18), dp(18));
        card.setBackground(rounded(Color.WHITE, Color.rgb(224, 235, 227), 20));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, -2);
        params.setMargins(0, dp(10), 0, dp(10));
        card.setLayoutParams(params);
        return card;
    }

    private TextView fieldLabel(String text) {
        TextView label = subtitle(text);
        label.setTextSize(11);
        label.setGravity(Gravity.LEFT);
        label.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        label.setTextColor(Color.rgb(93, 113, 103));
        label.setPadding(0, dp(4), 0, dp(7));
        return label;
    }

    private TextView connectionNote() {
        TextView note = subtitle("SECURE CONNECTION  •  ANTAH CORE API");
        note.setTextSize(11);
        note.setTextColor(Color.rgb(93, 113, 103));
        note.setPadding(0, dp(18), 0, 0);
        return note;
    }

    private LinearLayout actionCard(String heading, String detail, String label) {
        LinearLayout action = card();
        TextView tag = fieldLabel(label);
        tag.setTextColor(Color.rgb(207, 135, 57));
        action.addView(tag);
        TextView title = subtitle(heading);
        title.setGravity(Gravity.LEFT);
        title.setTextSize(18);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setTextColor(Color.rgb(27, 78, 62));
        title.setPadding(0, 0, 0, dp(4));
        action.addView(title);
        TextView body = subtitle(detail);
        body.setGravity(Gravity.LEFT);
        body.setTextSize(13);
        body.setPadding(0, 0, 0, 0);
        action.addView(body);
        return action;
    }

    private GradientDrawable rounded(int fill, int stroke, int radius) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(fill);
        if (stroke != Color.TRANSPARENT && radius > 0) drawable.setStroke(dp(1), stroke);
        drawable.setCornerRadius(dp(radius));
        return drawable;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private String connectionMessage(Exception error) {
        if (error instanceof UnknownHostException || error.getCause() instanceof UnknownHostException) {
            return "ANTAH Core API is unreachable. Connect to the configured network or use a staging API URL.";
        }
        if (error instanceof ApiException) return error.getMessage();
        return "Unable to connect right now. Check your internet connection and try again.";
    }

    private void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private void saveToken(String token, String refreshToken) throws Exception {
        saveSecret(TOKEN, token);
        saveSecret(REFRESH_TOKEN, refreshToken);
    }

    private void saveSecret(String name, String value) throws Exception {
        SecretKey key = getOrCreateKey();
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        session.edit()
                .putString(name, Base64.encodeToString(cipher.doFinal(value.getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP))
                .putString(name + "_iv", Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
                .apply();
    }

    private String readToken() throws Exception {
        return readSecret(TOKEN);
    }

    private String readSecret(String name) throws Exception {
        String encoded = session.getString(name, null);
        String encodedIv = session.getString(name + "_iv", null);
        if (encoded == null || encodedIv == null) return null;
        SecretKey key = getOrCreateKey();
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, Base64.decode(encodedIv, Base64.DEFAULT)));
        return new String(cipher.doFinal(Base64.decode(encoded, Base64.DEFAULT)), StandardCharsets.UTF_8);
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore");
        store.load(null);
        if (store.containsAlias("antah_session_key")) {
            return (SecretKey) store.getKey("antah_session_key", null);
        }
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder("antah_session_key",
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build());
        return generator.generateKey();
    }

    private void clearToken() {
        session.edit().clear().apply();
    }

    private static final class ApiException extends Exception {
        private final int status;

        private ApiException(int status, String message) {
            super(message);
            this.status = status;
        }
    }

    @Override
    protected void onDestroy() {
        network.shutdownNow();
        super.onDestroy();
    }
}
