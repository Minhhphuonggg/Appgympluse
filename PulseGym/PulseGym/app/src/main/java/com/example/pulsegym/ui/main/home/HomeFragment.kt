package com.example.pulsegym.ui.main.home

import androidx.fragment.app.Fragment
import com.example.pulsegym.R

import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.google.android.material.card.MaterialCardView

class HomeFragment : Fragment(R.layout.fragment_home) {
    private val viewModel: HomeViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val llActiveMembership = view.findViewById<LinearLayout>(R.id.llActiveMembership)
        val tvPlanName = view.findViewById<TextView>(R.id.tvActivePlanName)
        val tvExpiryDate = view.findViewById<TextView>(R.id.tvActiveExpiryDate)
        
        val cardPlans = view.findViewById<MaterialCardView>(R.id.cardPlans)
        val cardWorkouts = view.findViewById<MaterialCardView>(R.id.cardWorkouts)

        cardPlans.setOnClickListener {
            findNavController().navigate(R.id.nav_membership)
        }

        cardWorkouts.setOnClickListener {
            findNavController().navigate(R.id.nav_exercises)
        }

        viewModel.memberships.observe(viewLifecycleOwner) { memberships ->
            val activeMembership = memberships.find { it.status == "active" }
            if (activeMembership != null) {
                llActiveMembership.visibility = View.VISIBLE
                tvPlanName.text = activeMembership.planName
                
                // Format the end date (assuming it's an ISO string, just taking the date part for simplicity)
                val expiryDateStr = activeMembership.endDate?.split("T")?.firstOrNull() ?: "N/A"
                tvExpiryDate.text = getString(R.string.expires_on, expiryDateStr)
            } else {
                llActiveMembership.visibility = View.GONE
            }
        }

        viewModel.fetchMyMemberships()
    }
}

