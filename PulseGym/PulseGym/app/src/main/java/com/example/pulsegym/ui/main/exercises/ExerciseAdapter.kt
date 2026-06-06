package com.example.pulsegym.ui.main.exercises

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pulsegym.R
import com.example.pulsegym.data.model.Exercise

class ExerciseAdapter(
    private val onItemClick: (Exercise) -> Unit
) : ListAdapter<Exercise, ExerciseAdapter.ExerciseViewHolder>(DiffCallback) {

    private var exercises: List<Exercise> = emptyList()

    fun submitExercises(newExercises: List<Exercise>) {
        exercises = newExercises
        super.submitList(newExercises.toList())
    }

    fun filter(query: String) {
        val filtered = if (query.isEmpty()) {
            exercises
        } else {
            exercises.filter {
                (it.name?.contains(query, ignoreCase = true) == true) ||
                (it.muscleGroup?.contains(query, ignoreCase = true) == true)
            }
        }
        super.submitList(filtered.toList())
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ExerciseViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_exercise, parent, false)
        return ExerciseViewHolder(view)
    }

    override fun onBindViewHolder(holder: ExerciseViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ExerciseViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivThumbnail: ImageView = itemView.findViewById(R.id.ivExerciseImage)
        private val tvName: TextView = itemView.findViewById(R.id.tvExerciseName)
        private val tvMuscleGroup: TextView = itemView.findViewById(R.id.tvMuscleGroup)
        private val tvDesc: TextView = itemView.findViewById(R.id.tvExerciseDesc)

        fun bind(exercise: Exercise) {
            tvName.text = exercise.name.orEmpty()
            tvMuscleGroup.text = exercise.muscleGroup ?: "General"
            tvDesc.text = exercise.description ?: ""

            Glide.with(itemView)
                .load(exercise.thumbnail)
                .placeholder(R.drawable.ic_logo)
                .error(R.drawable.ic_logo)
                .centerCrop()
                .into(ivThumbnail)

            itemView.setOnClickListener {
                onItemClick(exercise)
            }
        }
    }

    private object DiffCallback : DiffUtil.ItemCallback<Exercise>() {
        override fun areItemsTheSame(oldItem: Exercise, newItem: Exercise): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: Exercise, newItem: Exercise): Boolean =
            oldItem == newItem
    }
}
