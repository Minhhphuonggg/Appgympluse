package com.example.pulsegym.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pulsegym.data.model.LoginRequest
import com.example.pulsegym.data.model.RegisterRequest
import com.example.pulsegym.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val message: String?, val token: String? = null) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel(private val repo: AuthRepository = AuthRepository()) : ViewModel() {
    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state: StateFlow<AuthState> = _state

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            try {
                val resp = repo.login(LoginRequest(email, password))
                if (resp.isSuccessful) {
                    val body = resp.body()
                    _state.value = AuthState.Success(body?.message ?: "Logged in", body?.data?.token)
                } else {
                    _state.value = AuthState.Error("Login failed: ${resp.code()}")
                }
            } catch (e: Exception) {
                _state.value = AuthState.Error(e.localizedMessage ?: "Unknown error")
            }
        }
    }

    fun register(name: String, email: String, password: String, phone: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            try {
                val resp = repo.register(RegisterRequest(name, email, password, phone))
                if (resp.isSuccessful) {
                    val body = resp.body()
                    _state.value = AuthState.Success(body?.message ?: "Registered", body?.data?.token)
                } else {
                    _state.value = AuthState.Error("Register failed: ${resp.code()}")
                }
            } catch (e: Exception) {
                _state.value = AuthState.Error(e.localizedMessage ?: "Unknown error")
            }
        }
    }
}

