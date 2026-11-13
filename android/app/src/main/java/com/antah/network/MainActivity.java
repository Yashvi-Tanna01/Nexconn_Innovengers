package com.antah.network;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
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
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
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
        Button signIn = button("Sign in");
        ProgressBar progress = new ProgressBar(this);
        progress.setVisibility(View.GONE);

        content.addView(title("ANTAH"));
        content.addView(subtitle("The Unheard Signals Network"));
        content.addView(email);
        content.addView(password);
        content.addView(signIn);
        content.addView(progress);
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
                        toast(error.getMessage() == null ? "Unable to sign in." : error.getMessage());
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
        content.addView(title(dashboardTitle));
        content.addView(subtitle(user.optString("full_name", "ANTAH user")));
        TextView role = subtitle("Role: " + (roleName.isEmpty() ? "unknown" : roleName));
        role.setPadding(0, 0, 0, 32);
        content.addView(role);
        if ("admin".equals(roleName) || "coordinator".equals(roleName)) {
            content.addView(button("Manage reports"));
        } else if ("responder".equals(roleName)) {
            content.addView(button("Assigned incidents"));
        } else {
            content.addView(button("Report an incident"));
        }
        content.addView(button("Messages"));
        content.addView(button("Profile"));
        Button logout = button("Log out");
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
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(48, 96, 48, 48);
        layout.setBackgroundColor(Color.rgb(245, 246, 244));
        return layout;
    }

    private TextView title(String text) {
        TextView view = subtitle(text);
        view.setTextSize(28);
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
        input.setLayoutParams(new LinearLayout.LayoutParams(-1, -2));
        return input;
    }

    private Button button(String text) {
        Button button = new Button(this);
        button.setText(text);
        button.setAllCaps(false);
        button.setTextColor(Color.WHITE);
        button.setBackgroundColor(Color.rgb(40, 107, 86));
        button.setLayoutParams(new LinearLayout.LayoutParams(-1, -2));
        return button;
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
