package com.example.pulsegym

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.example.pulsegym.data.storage.TokenManager

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize TokenManager with application context so Retrofit interceptor can access token
        com.example.pulsegym.data.storage.TokenManager.init(this)

//        val token = TokenManager.getToken(this)
//        if (token == null) {
//            startActivity(android.content.Intent(this, com.example.pulsegym.ui.auth.LoginActivity::class.java))
//            finish()
//            return
//        }

        // Setup NavHostFragment and BottomNavigationView
        val navHostFragment = supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as? NavHostFragment
        val navController = navHostFragment?.navController
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottom_nav)

        if (navController != null) {
            bottomNav.setupWithNavController(navController)
            
            navController.addOnDestinationChangedListener { _, destination, _ ->
                if (destination.id == R.id.nav_exercise_detail || destination.id == R.id.nav_vn_pay) {
                    bottomNav.visibility = android.view.View.GONE
                } else {
                    bottomNav.visibility = android.view.View.VISIBLE
                }
            }
        }
    }
}