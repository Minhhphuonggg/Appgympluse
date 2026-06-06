package com.example.pulsegym.data.storage

import android.content.Context

object TokenManager {
    private const val PREFS = "pulsegym_prefs"
    private const val KEY_TOKEN = "auth_token"

    // Application context (initialized from Activity/Application on startup)
    private var appContext: Context? = null

    // In-memory cache to make token available from static context (no need to pass Context everywhere)
    @Volatile
    private var cachedToken: String? = null

    // Initialize with application context. Call once early (e.g. MainActivity.onCreate).
    fun init(context: Context) {
        appContext = context.applicationContext
        // load token from prefs into cache
        val prefs = appContext!!.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        cachedToken = prefs.getString(KEY_TOKEN, null)
    }

    fun saveToken(token: String) {
        appContext?.let { ctx ->
            val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_TOKEN, token).apply()
            cachedToken = token
        }
    }

    // Returns cached token (may be null). Falls back to SharedPreferences if cache is null but appContext is available.
    fun getToken(): String? {
        if (cachedToken == null) {
            appContext?.let { ctx ->
                val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                cachedToken = prefs.getString(KEY_TOKEN, null)
            }
        }
        return cachedToken
    }

    // Backwards compatible method that reads from provided context and updates cache
    fun getToken(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val token = prefs.getString(KEY_TOKEN, null)
        cachedToken = token
        return token
    }

    fun clear() {
        appContext?.let { ctx ->
            val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            prefs.edit().remove(KEY_TOKEN).apply()
        }
        cachedToken = null
    }
}

