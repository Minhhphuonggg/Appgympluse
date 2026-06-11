package com.example.pulsegym.data.network

import android.util.Log
import com.google.gson.GsonBuilder
import com.example.pulsegym.data.storage.TokenManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // Sửa lại thành URL của bạn trên Render
    private const val BASE_URL = "https://appgympluse.onrender.com/"

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    // Interceptor that attaches Authorization header when token is available
    private val authInterceptor = Interceptor { chain ->
        val original = chain.request()
        val token = TokenManager.getToken()
        Log.d("RetrofitClient", "Intercepting request: ${original.url}. Token found: ${token != null}")

        val request = if (token != null && original.header("Authorization") == null) {
            Log.d("RetrofitClient", "Attaching Bearer token to request")
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            original
        }
        
        chain.proceed(request)
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(logging)
        // Increase timeouts to reduce SocketTimeoutException for slow networks / long responses
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .writeTimeout(120, TimeUnit.SECONDS)
        // allow OkHttp to retry on connection failures
        .retryOnConnectionFailure(true)
        .build()

    private val gson = GsonBuilder().setLenient().create()

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(ApiService::class.java)
    }
}

