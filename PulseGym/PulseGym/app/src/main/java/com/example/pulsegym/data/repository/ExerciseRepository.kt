package com.example.pulsegym.data.repository

import com.example.pulsegym.data.model.Exercise
import com.example.pulsegym.data.network.RetrofitClient

class ExerciseRepository {
    suspend fun getExercises(
        page: Int = 1,
        limit: Int = 20,
        keyword: String? = null,
        muscleGroup: String? = null,
        difficulty: String? = null
    ): Result<List<Exercise>> {
        return try {
            val response = RetrofitClient.apiService.getExercises(page, limit, keyword, muscleGroup, difficulty)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data?.items ?: emptyList())
            } else {
                Result.failure(Exception(response.body()?.message ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getExerciseDetail(exerciseId: String): Result<Exercise> {
        return try {
            val response = RetrofitClient.apiService.getExerciseDetail(exerciseId)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Exercise not found"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
