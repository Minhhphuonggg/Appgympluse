package com.example.pulsegym.ui.auth

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pulsegym.R
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {
    private lateinit var etName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etPhone: EditText
    private lateinit var btnRegister: Button
    private lateinit var progress: ProgressBar

    private val viewModel = AuthViewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        etName = findViewById(R.id.etName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        etPhone = findViewById(R.id.etPhone)
        btnRegister = findViewById(R.id.btnRegister)
        progress = findViewById(R.id.progress)
        val tvBackToLogin = findViewById<android.widget.TextView>(R.id.tvBackToLogin)

        tvBackToLogin.setOnClickListener {
            finish()
        }

        btnRegister.setOnClickListener {
            val name = etName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val pass = etPassword.text.toString()
            val phone = etPhone.text.toString().trim()
            if (name.isEmpty() || email.isEmpty() || pass.isEmpty() || phone.isEmpty()) {
                Toast.makeText(this, getString(R.string.fill_all_fields), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.register(name, email, pass, phone)
        }

        lifecycleScope.launch {
            viewModel.state.collectLatest { state ->
                when (state) {
                    is AuthState.Idle -> progress.visibility = View.GONE
                    is AuthState.Loading -> progress.visibility = View.VISIBLE
                    is AuthState.Success -> {
                        progress.visibility = View.GONE
                        Toast.makeText(this@RegisterActivity, state.message ?: getString(R.string.registered), Toast.LENGTH_SHORT).show()
                        finish()
                    }
                    is AuthState.Error -> {
                        progress.visibility = View.GONE
                        Toast.makeText(this@RegisterActivity, state.message, Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}

