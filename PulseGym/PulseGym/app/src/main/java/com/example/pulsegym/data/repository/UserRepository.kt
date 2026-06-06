package com.example.pulsegym.data.repository

import com.example.pulsegym.data.model.*
import com.example.pulsegym.data.network.RetrofitClient
import okhttp3.MultipartBody
import retrofit2.Response

class UserRepository {
    private val api = RetrofitClient.apiService

    suspend fun getProfile(): Result<User?> {
        return try {
            val response = api.getProfile()
            if (response.isSuccessful) {
                Result.success(response.body()?.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateProfile(name: String?, phone: String?, avatar: String?): Result<User?> {
        return try {
            val request = UpdateProfileRequest(name, phone, avatar)
            val response = api.updateProfile(request)
            if (response.isSuccessful) {
                Result.success(response.body()?.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uploadImage(imagePart: MultipartBody.Part): Result<String?> {
        return try {
            val response = api.uploadImage(imagePart)
            if (response.isSuccessful) {
                Result.success(response.body()?.data?.url)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
