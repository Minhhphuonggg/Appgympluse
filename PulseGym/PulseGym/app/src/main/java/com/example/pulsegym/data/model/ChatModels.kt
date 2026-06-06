package com.example.pulsegym.data.model

import com.google.gson.annotations.SerializedName

data class ChatRequest(
    @SerializedName("message") val message: String
)

data class ChatResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: ChatData? = null,
    @SerializedName("details") val details: ChatErrorDetails? = null
)

data class ChatData(
    @SerializedName("answer") val answer: String?
)

data class ChatErrorDetails(
    @SerializedName("model") val model: String?,
    @SerializedName("providerStatus") val providerStatus: Int?,
    @SerializedName("providerMessage") val providerMessage: String?
)

data class ChatMessage(
    val content: String,
    val isFromUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)
