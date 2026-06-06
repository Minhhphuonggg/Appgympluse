package com.example.pulsegym.data.network

import com.example.pulsegym.data.model.AuthResponse
import com.example.pulsegym.data.model.LoginRequest
import com.example.pulsegym.data.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import com.example.pulsegym.data.model.MembershipPlanListResponse
import com.example.pulsegym.data.model.MembershipPlanDetailResponse
import com.example.pulsegym.data.model.ExerciseListResponse
import com.example.pulsegym.data.model.ExerciseDetailResponse

interface ApiService {
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("/api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("/api/membership-plans")
    suspend fun getMembershipPlans(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<MembershipPlanListResponse>

    @GET("/api/membership-plans/{planId}")
    suspend fun getMembershipPlanDetail(
        @Path("planId") planId: String
    ): Response<MembershipPlanDetailResponse>

    @GET("/api/exercises")
    suspend fun getExercises(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("keyword") keyword: String? = null,
        @Query("muscle_group") muscleGroup: String? = null,
        @Query("difficulty") difficulty: String? = null
    ): Response<ExerciseListResponse>

    @GET("/api/exercises/{exerciseId}")
    suspend fun getExerciseDetail(
        @Path("exerciseId") exerciseId: String
    ): Response<ExerciseDetailResponse>

    @GET("/api/me")
    suspend fun getProfile(): Response<com.example.pulsegym.data.model.ProfileResponse>

    @retrofit2.http.PATCH("/api/me")
    suspend fun updateProfile(@Body request: com.example.pulsegym.data.model.UpdateProfileRequest): Response<com.example.pulsegym.data.model.ProfileResponse>

    @retrofit2.http.Multipart
    @POST("/api/uploads/image")
    suspend fun uploadImage(
        @retrofit2.http.Part image: okhttp3.MultipartBody.Part
    ): Response<com.example.pulsegym.data.model.ImageUploadResponse>

    @GET("/api/memberships/me")
    suspend fun getMyMemberships(): Response<com.example.pulsegym.data.model.UserMembershipListResponse>

    @POST("/api/memberships/purchase/{planId}")
    suspend fun purchaseMembership(
        @Path("planId") planId: Int
    ): Response<com.example.pulsegym.data.model.PurchaseResponse>

    @POST("/api/ai/chat")
    suspend fun sendChatMessage(@Body request: com.example.pulsegym.data.model.ChatRequest): Response<com.example.pulsegym.data.model.ChatResponse>
}

