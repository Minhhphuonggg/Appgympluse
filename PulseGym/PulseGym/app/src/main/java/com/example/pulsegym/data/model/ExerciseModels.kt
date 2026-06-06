package com.example.pulsegym.data.model

import com.google.gson.annotations.SerializedName

data class Exercise(
    @SerializedName(value = "id", alternate = ["_id"])
    val id: Int?,
    @SerializedName("name") val name: String?,
    @SerializedName("description") val description: String?,
    @SerializedName(value = "muscle_group", alternate = ["muscleGroup"])
    val muscleGroup: String?,
    @SerializedName("difficulty") val difficulty: String?,
    @SerializedName("equipment") val equipment: String?,
    @SerializedName(value = "video_url", alternate = ["videoUrl"])
    val videoUrl: String?,
    @SerializedName("thumbnail") val thumbnail: String?,
    @SerializedName(value = "created_by", alternate = ["createdBy"])
    val createdBy: Int?,
    @SerializedName("created_at") val createdAt: String?,
    @SerializedName("updated_at") val updatedAt: String?,
    @SerializedName(value = "created_by_name", alternate = ["createdByName"])
    val createdByName: String?
)

data class ExerciseListResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("data") val data: ExerciseListData?,
    @SerializedName("message") val message: String?
)

data class ExerciseListData(
    @SerializedName("items") val items: List<Exercise>?,
    @SerializedName("pagination") val pagination: ExercisePagination?
)

data class ExercisePagination(
    @SerializedName("page") val page: Int?,
    @SerializedName("limit") val limit: Int?,
    @SerializedName("total") val total: Int?,
    @SerializedName("totalPages") val totalPages: Int?
)

data class ExerciseDetailResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("data") val data: Exercise?,
    @SerializedName("message") val message: String?
)
