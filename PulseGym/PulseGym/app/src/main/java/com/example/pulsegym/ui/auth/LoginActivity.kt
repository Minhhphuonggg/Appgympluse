package com.example.pulsegym.ui.auth

import android.content.Intent
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

class LoginActivity : AppCompatActivity() {
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var btnRegister: Button
    private lateinit var progress: ProgressBar

    private val viewModel = AuthViewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Ensure TokenManager has application context available (so saveToken works even before MainActivity)
        com.example.pulsegym.data.storage.TokenManager.init(this)

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        btnRegister = findViewById(R.id.btnRegister)
        progress = findViewById(R.id.progress)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val pass = etPassword.text.toString()
            if (email.isEmpty() || pass.isEmpty()) {
                Toast.makeText(this, getString(R.string.enter_email_password), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.login(email, pass)
        }

        btnRegister.setOnClickListener {
            startActivity(Intent(this, com.example.pulsegym.ui.auth.RegisterActivity::class.java))
        }

        lifecycleScope.launch {
            viewModel.state.collectLatest { state ->
                when (state) {
                    is AuthState.Idle -> {
                        progress.visibility = View.GONE
                    }
                    is AuthState.Loading -> {
                        progress.visibility = View.VISIBLE
                    }
                    is AuthState.Success -> {
                        progress.visibility = View.GONE
                        Toast.makeText(this@LoginActivity, state.message ?: getString(R.string.success), Toast.LENGTH_SHORT).show()
                        // Save token (if provided) and navigate to main/home screen
                        state.token?.let { token ->
                            com.example.pulsegym.data.storage.TokenManager.saveToken(token)
                        }
                        startActivity(android.content.Intent(this@LoginActivity, com.example.pulsegym.MainActivity::class.java))
                        finish()
                    }
                    is AuthState.Error -> {
                        progress.visibility = View.GONE
                        Toast.makeText(this@LoginActivity, state.message, Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}


