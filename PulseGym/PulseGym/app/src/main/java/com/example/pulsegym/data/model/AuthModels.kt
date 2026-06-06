package com.example.pulsegym.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String
)

data class AuthResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: AuthData? = null
)

data class AuthData(
    @SerializedName("token") val token: String? = null,
    @SerializedName("user") val user: User? = null
)

