package com.example.pulsegym.ui.main.membership

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.pulsegym.R
import com.example.pulsegym.data.model.MembershipPlan

class MembershipAdapter(
    private val onBuyClick: (MembershipPlan) -> Unit
) : RecyclerView.Adapter<MembershipAdapter.MembershipViewHolder>() {

    private var plans: List<MembershipPlan> = emptyList()

    fun submitList(newPlans: List<MembershipPlan>) {
        plans = newPlans
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MembershipViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_membership_plan, parent, false)
        return MembershipViewHolder(view)
    }

    override fun onBindViewHolder(holder: MembershipViewHolder, position: Int) {
        holder.bind(plans[position])
    }

    override fun getItemCount(): Int = plans.size

    inner class MembershipViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tvPlanName)
        private val tvPrice: TextView = itemView.findViewById(R.id.tvPlanPrice)
        private val tvDescription: TextView = itemView.findViewById(R.id.tvPlanDescription)
        private val ivPlanImage: android.widget.ImageView = itemView.findViewById(R.id.ivPlanImage)
        private val btnBuy: android.widget.Button = itemView.findViewById(R.id.btnBuy)

        fun bind(plan: MembershipPlan) {
            tvName.text = plan.name.orEmpty().uppercase()
            // price from API is string, show integer/cleaned
            val priceText = plan.price ?: "0"
            tvPrice.text = "\$${priceText.split('.').firstOrNull() ?: priceText}"
            tvDescription.text = plan.description ?: ""
            
            // Load image with Glide
            com.bumptech.glide.Glide.with(itemView.context)
                .load(plan.imageUrl)
                .centerCrop()
                .into(ivPlanImage)

            btnBuy.setOnClickListener {
                onBuyClick(plan)
            }
        }
    }
}
