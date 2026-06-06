package com.example.pulsegym.ui.main.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pulsegym.data.model.UserMembership
import com.example.pulsegym.data.repository.MembershipRepository
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {
    private val repository = MembershipRepository()

    private val _memberships = MutableLiveData<List<UserMembership>>()
    val memberships: LiveData<List<UserMembership>> = _memberships

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun fetchMyMemberships() {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.getMyMemberships()
            result.onSuccess {
                _memberships.value = it
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }
}
