package com.example.pulsegym.ui.main.profile

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pulsegym.data.model.User
import com.example.pulsegym.data.repository.UserRepository
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

class ProfileViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _user = MutableLiveData<User?>()
    val user: LiveData<User?> = _user

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _updateSuccess = MutableLiveData<Boolean>()
    val updateSuccess: LiveData<Boolean> = _updateSuccess

    private val _avatarUrl = MutableLiveData<String?>()
    val avatarUrl: LiveData<String?> = _avatarUrl

    fun fetchProfile() {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.getProfile()
            result.onSuccess {
                _user.value = it
                _avatarUrl.value = it?.avatar
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }

    fun updateProfile(name: String, phone: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.updateProfile(name, phone, _avatarUrl.value)
            result.onSuccess {
                _user.value = it
                _updateSuccess.value = true
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }

    fun uploadImage(imagePart: MultipartBody.Part) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.uploadImage(imagePart)
            result.onSuccess {
                _avatarUrl.value = it
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }
}
