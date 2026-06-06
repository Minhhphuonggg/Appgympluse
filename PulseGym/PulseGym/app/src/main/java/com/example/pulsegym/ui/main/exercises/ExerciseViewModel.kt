package com.example.pulsegym.ui.main.exercises

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pulsegym.data.model.Exercise
import com.example.pulsegym.data.repository.ExerciseRepository
import kotlinx.coroutines.launch

class ExerciseViewModel : ViewModel() {
    private val repository = ExerciseRepository()

    private val _exercises = MutableLiveData<List<Exercise>>()
    val exercises: LiveData<List<Exercise>> = _exercises

    private val _selectedExercise = MutableLiveData<Exercise>()
    val selectedExercise: LiveData<Exercise> = _selectedExercise

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _keyword = MutableLiveData<String?>()
    private val _muscleGroup = MutableLiveData<String?>()
    private val _difficulty = MutableLiveData<String?>()

    fun setKeyword(keyword: String?) {
        _keyword.value = keyword.takeIf { !it.isNullOrBlank() }
    }

    fun setMuscleGroup(muscleGroup: String?) {
        _muscleGroup.value = muscleGroup.takeIf { !it.isNullOrBlank() }
    }

    fun setDifficulty(difficulty: String?) {
        _difficulty.value = difficulty.takeIf { !it.isNullOrBlank() }
    }

    fun fetchExercises(page: Int = 1, limit: Int = 20) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val result = repository.getExercises(
                page,
                limit,
                keyword = _keyword.value,
                muscleGroup = _muscleGroup.value,
                difficulty = _difficulty.value
            )
            result.onSuccess {
                _exercises.value = it
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }

    fun fetchExerciseDetail(exerciseId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val result = repository.getExerciseDetail(exerciseId)
            result.onSuccess {
                _selectedExercise.value = it
            }.onFailure {
                _error.value = it.message
            }
            _isLoading.value = false
        }
    }
}
