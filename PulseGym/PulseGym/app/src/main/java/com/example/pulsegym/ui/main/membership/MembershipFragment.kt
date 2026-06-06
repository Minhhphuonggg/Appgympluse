package com.example.pulsegym.ui.main.membership
import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import android.widget.Toast
import androidx.fragment.app.viewModels
// ...existing code...
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.pulsegym.R

import androidx.navigation.fragment.findNavController

class MembershipFragment : Fragment(R.layout.fragment_membership) {
    private val viewModel: MembershipViewModel by viewModels()
    private lateinit var adapter: MembershipAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView(view)
        observeViewModel()
        
        viewModel.fetchMembershipPlans()
    }

    private fun setupRecyclerView(view: View) {
        val rvMembership = view.findViewById<RecyclerView>(R.id.rvMembership)
        adapter = MembershipAdapter { plan ->
            val dialog = MembershipConfirmationDialog(plan) {
                plan.id?.let { viewModel.purchaseMembership(it) }
            }
            dialog.show(childFragmentManager, "MembershipConfirmationDialog")
        }
        rvMembership.layoutManager = LinearLayoutManager(requireContext())
        rvMembership.adapter = adapter
    }

    private fun observeViewModel() {
        viewModel.plans.observe(viewLifecycleOwner) { plans ->
            adapter.submitList(plans)
        }
        
        viewModel.purchaseData.observe(viewLifecycleOwner) { data ->
            data?.let {
                val bundle = Bundle().apply {
                    putString("paymentUrl", it.paymentUrl)
                }
                findNavController().navigate(R.id.nav_vn_pay, bundle)
                viewModel.clearPurchaseData()
            }
        }

        viewModel.error.observe(viewLifecycleOwner) { errorMsg ->
            errorMsg?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
