package com.example.pulsegym.ui.main.membership
import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import android.widget.Toast
import androidx.fragment.app.viewModels
import com.example.pulsegym.R

import android.annotation.SuppressLint
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import androidx.navigation.fragment.findNavController

class VNPayFragment : Fragment(R.layout.fragment_vn_pay) {
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var isResultHandled = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        webView = view.findViewById(R.id.webView)
        progressBar = view.findViewById(R.id.progressBar)
        val btnBack = view.findViewById<android.widget.ImageButton>(R.id.btnBack)

        btnBack.setOnClickListener {
            findNavController().popBackStack()
        }

        val paymentUrl = arguments?.getString("paymentUrl") ?: return

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
                
                // Detect the return URL here but don't block it
                url?.let {
                    if (!isResultHandled && (it.contains("vnpay-return") || it.contains("vnp_ResponseCode"))) {
                        isResultHandled = true
                        handlePaymentResult(it)
                    }
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                
                // Return false to allow the WebView to actually load the URL 
                // so your backend can process the payment status
                if (url.contains("vnpay-return")) {
                    return false 
                }
                return false
            }
        }

        webView.loadUrl(paymentUrl)
    }

    private fun handlePaymentResult(url: String) {
        if (url.contains("vnp_ResponseCode=00")) {
            Toast.makeText(requireContext(), getString(R.string.payment_success), Toast.LENGTH_LONG).show()
        } else {
            Toast.makeText(requireContext(), getString(R.string.payment_failed), Toast.LENGTH_LONG).show()
        }
        findNavController().popBackStack()
    }
}
