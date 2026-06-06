package com.example.pulsegym.ui.main.chatai

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pulsegym.data.model.ChatMessage
import com.example.pulsegym.data.repository.ChatRepository
import kotlinx.coroutines.launch

class ChatViewModel : ViewModel() {
    private val repository = ChatRepository()

    private val _messages = MutableLiveData<MutableList<ChatMessage>>(mutableListOf())
    val messages: LiveData<MutableList<ChatMessage>> = _messages

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun sendMessage(content: String) {
        if (content.isBlank()) return

        val userMessage = ChatMessage(content, true)
        _messages.value?.add(userMessage)
        _messages.value = _messages.value // Trigger observer

        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            val result = repository.sendChatMessage(content)
            result.onSuccess { response ->
                val aiAnswer = response.data?.answer
                if (!aiAnswer.isNullOrEmpty()) {
                    val aiMessage = ChatMessage(aiAnswer, false)
                    _messages.value?.add(aiMessage)
                    _messages.value = _messages.value
                }
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }
}
