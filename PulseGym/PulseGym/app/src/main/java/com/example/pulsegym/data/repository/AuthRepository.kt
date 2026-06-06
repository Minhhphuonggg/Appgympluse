package com.example.pulsegym.data.repository

import com.example.pulsegym.data.model.AuthResponse
import com.example.pulsegym.data.model.LoginRequest
import com.example.pulsegym.data.model.RegisterRequest
import com.example.pulsegym.data.network.RetrofitClient
import retrofit2.Response

class AuthRepository {
    private val api = RetrofitClient.apiService

    suspend fun login(request: LoginRequest): Response<AuthResponse> = api.login(request)

    suspend fun register(request: RegisterRequest): Response<AuthResponse> = api.register(request)
}

