package com.example.pulsegym.ui.main.membership

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pulsegym.data.model.MembershipPlan
import com.example.pulsegym.data.repository.MembershipRepository
import kotlinx.coroutines.launch

class MembershipViewModel : ViewModel() {
    private val repository = MembershipRepository()

    private val _plans = MutableLiveData<List<MembershipPlan>>()
    val plans: LiveData<List<MembershipPlan>> = _plans

    private val _selectedPlan = MutableLiveData<MembershipPlan>()
    val selectedPlan: LiveData<MembershipPlan> = _selectedPlan

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _purchaseData = MutableLiveData<com.example.pulsegym.data.model.PurchaseData?>()
    val purchaseData: LiveData<com.example.pulsegym.data.model.PurchaseData?> = _purchaseData

    fun fetchMembershipPlans(page: Int = 1, limit: Int = 20) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val result = repository.getMembershipPlans(page, limit)
            result.onSuccess {
                _plans.value = it
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }

    fun purchaseMembership(planId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val result = repository.purchaseMembership(planId)
            result.onSuccess {
                _purchaseData.value = it
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }

    fun fetchMembershipPlanDetail(planId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val result = repository.getMembershipPlanDetail(planId)
            result.onSuccess {
                _selectedPlan.value = it
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }

    fun clearPurchaseData() {
        _purchaseData.value = null
    }
}
