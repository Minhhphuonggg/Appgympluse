package com.example.pulsegym.data.repository

import com.example.pulsegym.data.model.MembershipPlan
import com.example.pulsegym.data.network.RetrofitClient

class MembershipRepository {
    suspend fun getMembershipPlans(page: Int = 1, limit: Int = 20): Result<List<MembershipPlan>> {
        return try {
            val response = RetrofitClient.apiService.getMembershipPlans(page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data?.items ?: emptyList())
            } else {
                Result.failure(Exception(response.body()?.message ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMembershipPlanDetail(planId: String): Result<MembershipPlan> {
        return try {
            val response = RetrofitClient.apiService.getMembershipPlanDetail(planId)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Plan not found"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getMyMemberships(): Result<List<com.example.pulsegym.data.model.UserMembership>> {
        return try {
            val response = RetrofitClient.apiService.getMyMemberships()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data ?: emptyList())
            } else {
                Result.failure(Exception(response.body()?.message ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun purchaseMembership(planId: Int): Result<com.example.pulsegym.data.model.PurchaseData?> {
        return try {
            val response = RetrofitClient.apiService.purchaseMembership(planId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
