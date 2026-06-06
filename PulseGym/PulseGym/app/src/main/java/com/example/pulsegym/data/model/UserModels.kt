package com.example.pulsegym.data.model

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("id") val id: Int?,
    @SerializedName("name") val name: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("role") val role: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("avatar") val avatar: String?,
    @SerializedName("status") val status: String?,
    @SerializedName("created_at") val createdAt: String?,
    @SerializedName("updated_at") val updatedAt: String?
)

data class ProfileResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: User?
)

data class UpdateProfileRequest(
    @SerializedName("name") val name: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("avatar") val avatar: String?
)

data class ImageUploadResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: ImageUploadData?
)

data class ImageUploadData(
    @SerializedName("url") val url: String?,
    @SerializedName("publicId") val publicId: String?
)
