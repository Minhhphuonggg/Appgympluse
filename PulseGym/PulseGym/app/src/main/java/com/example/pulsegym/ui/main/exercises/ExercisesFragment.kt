package com.example.pulsegym.ui.main.exercises

import android.text.Editable
import android.text.TextWatcher
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.pulsegym.R
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.textfield.TextInputEditText

class ExercisesFragment : Fragment(R.layout.fragment_exercises) {
    private val viewModel: ExerciseViewModel by viewModels()
    private lateinit var adapter: ExerciseAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView(view)
        setupSearch(view)
        setupFilters(view)
        observeViewModel()
        
        viewModel.fetchExercises()
    }

    private fun setupRecyclerView(view: View) {
        val rvExercises = view.findViewById<RecyclerView>(R.id.rvExercises)
        adapter = ExerciseAdapter { exercise ->
            val bundle = Bundle().apply {
                putString("exerciseId", exercise.id?.toString())
            }
            findNavController().navigate(R.id.action_nav_exercises_to_nav_exercise_detail, bundle)
        }
        rvExercises.layoutManager = LinearLayoutManager(requireContext())
        rvExercises.adapter = adapter
    }

    private fun setupSearch(view: View) {
        val etSearch = view.findViewById<TextInputEditText>(R.id.etSearchExercise)
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.setKeyword(s?.toString())
                viewModel.fetchExercises()
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun setupFilters(view: View) {
        val difficultyGroup = view.findViewById<ChipGroup>(R.id.cgDifficulty)

        val difficultyMap = mapOf(
            R.id.chipAllDifficulty to null,
            R.id.chipEasy to "easy",
            R.id.chipMedium to "medium",
            R.id.chipHard to "hard"
        )

        difficultyGroup.setOnCheckedStateChangeListener { _, checkedIds ->
            viewModel.setDifficulty(checkedIds.firstOrNull()?.let { difficultyMap[it] })
            viewModel.fetchExercises()
        }

        val cvChest = view.findViewById<com.google.android.material.card.MaterialCardView>(R.id.cvCategoryChest)
        val cvBack = view.findViewById<com.google.android.material.card.MaterialCardView>(R.id.cvCategoryBack)
        val cvLegs = view.findViewById<com.google.android.material.card.MaterialCardView>(R.id.cvCategoryLegs)

        var selectedCategory: String? = null
        
        val strokeWidthPx = (2 * resources.displayMetrics.density).toInt()

        val updateCategorySelection = { category: String? ->
            selectedCategory = if (selectedCategory == category) null else category
            
            viewModel.setMuscleGroup(selectedCategory)
            viewModel.fetchExercises()
            
            cvChest.strokeWidth = if (selectedCategory == "chest") strokeWidthPx else 0
            cvBack.strokeWidth = if (selectedCategory == "back") strokeWidthPx else 0
            cvLegs.strokeWidth = if (selectedCategory == "legs") strokeWidthPx else 0
            
            // Revert alpha in case it was previously modified
            cvChest.alpha = 1.0f
            cvBack.alpha = 1.0f
            cvLegs.alpha = 1.0f
        }

        cvChest.setOnClickListener { updateCategorySelection("chest") }
        cvBack.setOnClickListener { updateCategorySelection("back") }
        cvLegs.setOnClickListener { updateCategorySelection("legs") }
    }

    private fun observeViewModel() {
        viewModel.exercises.observe(viewLifecycleOwner) { exercises ->
            adapter.submitExercises(exercises)
        }
        viewModel.error.observe(viewLifecycleOwner) { errorMsg ->
            errorMsg?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
            }
        }
    }
}