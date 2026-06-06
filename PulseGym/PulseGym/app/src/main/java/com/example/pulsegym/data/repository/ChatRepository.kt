package com.example.pulsegym.data.repository

import com.example.pulsegym.data.model.ChatRequest
import com.example.pulsegym.data.model.ChatResponse
import com.example.pulsegym.data.network.RetrofitClient

class ChatRepository {
    suspend fun sendChatMessage(message: String): Result<ChatResponse> {
        return try {
            val response = RetrofitClient.apiService.sendChatMessage(ChatRequest(message))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Result.success(body)
                } else {
                    Result.failure(Exception(body.message ?: "AI service error"))
                }
            } else {
                Result.failure(Exception("Network error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
