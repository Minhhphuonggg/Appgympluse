package com.example.pulsegym.ui.main.membership

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.example.pulsegym.R
import com.example.pulsegym.data.model.MembershipPlan
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.button.MaterialButton
import java.text.NumberFormat
import java.util.Locale

class MembershipConfirmationDialog(
    private val plan: MembershipPlan,
    private val onConfirm: () -> Unit
) : BottomSheetDialogFragment() {

    override fun getTheme(): Int = R.style.CustomBottomSheetDialog

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.dialog_membership_confirmation, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<TextView>(R.id.tvConfirmPlanName).text = plan.name
        view.findViewById<TextView>(R.id.tvConfirmDuration).text = getString(R.string.days_count, plan.durationDays.toString())
        
        val price = plan.price?.toDoubleOrNull() ?: 0.0
        val formattedPrice = NumberFormat.getCurrencyInstance(Locale("vi", "VN")).format(price)
        view.findViewById<TextView>(R.id.tvConfirmPrice).text = formattedPrice

        view.findViewById<MaterialButton>(R.id.btnConfirmPurchase).setOnClickListener {
            onConfirm()
            dismiss()
        }

        view.findViewById<MaterialButton>(R.id.btnCancelPurchase).setOnClickListener {
            dismiss()
        }
    }
}
