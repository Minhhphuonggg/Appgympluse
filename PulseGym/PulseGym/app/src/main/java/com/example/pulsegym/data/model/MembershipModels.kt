package com.example.pulsegym.data.model

import com.google.gson.annotations.SerializedName

data class MembershipPlan(
    @SerializedName(value = "id", alternate = ["_id"])
    val id: Int?,
    @SerializedName("name") val name: String?,
    @SerializedName("description") val description: String?,
    @SerializedName(value = "image_url", alternate = ["imageUrl"])
    val imageUrl: String?,
    @SerializedName("price") val price: String?,
    @SerializedName(value = "duration_days", alternate = ["durationDays"])
    val durationDays: Int?,
    @SerializedName("status") val status: String?,
    @SerializedName(value = "created_by", alternate = ["createdBy"])
    val createdBy: Int?,
    @SerializedName("created_at") val createdAt: String?,
    @SerializedName("updated_at") val updatedAt: String?,
    @SerializedName(value = "created_by_name", alternate = ["createdByName"])
    val createdByName: String?
)

data class MembershipPlanListResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("data") val data: MembershipPlanListData?,
    @SerializedName("message") val message: String?
)

data class MembershipPlanListData(
    @SerializedName("items") val items: List<MembershipPlan>?,
    @SerializedName("pagination") val pagination: MembershipPlanPagination?
)

data class MembershipPlanPagination(
    @SerializedName("page") val page: Int?,
    @SerializedName("limit") val limit: Int?,
    @SerializedName("total") val total: Int?,
    @SerializedName("totalPages") val totalPages: Int?
)

data class MembershipPlanDetailResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("data") val data: MembershipPlan?,
    @SerializedName("message") val message: String?
)

data class UserMembership(
    @SerializedName("id") val id: Int?,
    @SerializedName("user_id") val userId: Int?,
    @SerializedName("plan_id") val planId: Int?,
    @SerializedName("start_date") val startDate: String?,
    @SerializedName("end_date") val endDate: String?,
    @SerializedName("price") val price: String?,
    @SerializedName("qr_code") val qrCode: String?,
    @SerializedName("status") val status: String?,
    @SerializedName("created_at") val createdAt: String?,
    @SerializedName("plan_name") val planName: String?,
    @SerializedName("duration_days") val durationDays: Int?
)

data class UserMembershipListResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: List<UserMembership>?
)

data class PurchaseResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: PurchaseData?
)

data class PurchaseData(
    @SerializedName("orderRef") val orderRef: String?,
    @SerializedName("paymentUrl") val paymentUrl: String?,
    @SerializedName("amount") val amount: String?
)
