package com.example.pulsegym.ui.main.exercises

import android.os.Bundle
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.example.pulsegym.R

import androidx.navigation.fragment.findNavController

class ExerciseDetailFragment : Fragment(R.layout.fragment_exercise_detail) {
    private val viewModel: ExerciseViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val exerciseId = arguments?.getString("exerciseId")
        if (exerciseId != null) {
            viewModel.fetchExerciseDetail(exerciseId)
        } else {
            Toast.makeText(requireContext(), getString(R.string.invalid_exercise_id), Toast.LENGTH_SHORT).show()
        }

        val tvName = view.findViewById<TextView>(R.id.tvDetailExerciseName)
        val tvHeaderTitle = view.findViewById<TextView>(R.id.tvHeaderTitle)
        val chipMuscleGroup = view.findViewById<com.google.android.material.chip.Chip>(R.id.chipDetailMuscleGroup)
        val chipDifficulty = view.findViewById<com.google.android.material.chip.Chip>(R.id.chipDetailDifficulty)
        val chipEquipment = view.findViewById<com.google.android.material.chip.Chip>(R.id.chipDetailEquipment)
        val tvDescription = view.findViewById<TextView>(R.id.tvDetailDescription)
        val ivThumbnail = view.findViewById<android.widget.ImageView>(R.id.ivDetailThumbnail)
        val btnWatchVideo = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnWatchVideo)
        val btnBack = view.findViewById<android.widget.ImageButton>(R.id.btnBack)

        btnBack.setOnClickListener {
            findNavController().popBackStack()
        }

        viewModel.selectedExercise.observe(viewLifecycleOwner) { exercise ->
            tvName.text = exercise.name.orEmpty()
            tvHeaderTitle.text = exercise.name.orEmpty()
            
            chipMuscleGroup.text = exercise.muscleGroup?.uppercase() ?: "N/A"
            chipDifficulty.text = exercise.difficulty?.uppercase() ?: "N/A"
            chipEquipment.text = exercise.equipment?.uppercase() ?: "NONE"
            
            tvDescription.text = exercise.description ?: getString(R.string.description_placeholder)
            
            // Load thumbnail
            if (!exercise.thumbnail.isNullOrEmpty()) {
                com.bumptech.glide.Glide.with(this)
                    .load(exercise.thumbnail)
                    .centerCrop()
                    .into(ivThumbnail)
            }
            
            // Handle video button
            if (!exercise.videoUrl.isNullOrEmpty()) {
                btnWatchVideo.visibility = View.VISIBLE
                btnWatchVideo.setOnClickListener {
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(exercise.videoUrl))
                    startActivity(intent)
                }
            } else {
                btnWatchVideo.visibility = View.GONE
            }
        }

        viewModel.error.observe(viewLifecycleOwner) { errorMsg ->
            errorMsg?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
