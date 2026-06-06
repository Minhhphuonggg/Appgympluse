package com.example.pulsegym.ui.main.profile

import android.content.Intent
import android.os.Bundle
import android.view.View

import androidx.fragment.app.Fragment
import com.example.pulsegym.R
import com.example.pulsegym.data.storage.TokenManager
import com.example.pulsegym.ui.auth.LoginActivity

import android.app.Activity
import android.net.Uri
import android.provider.MediaStore
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.viewModels
import com.bumptech.glide.Glide
import com.google.android.material.button.MaterialButton
import com.google.android.material.floatingactionbutton.FloatingActionButton
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

class ProfileFragment : Fragment(R.layout.fragment_profile) {
    private val viewModel: ProfileViewModel by viewModels()

    private lateinit var ivAvatar: ImageView
    private lateinit var etName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhone: EditText
    private lateinit var btnSave: MaterialButton
    private lateinit var btnLogout: MaterialButton
    private lateinit var fabEditAvatar: FloatingActionButton
    private lateinit var progressBar: android.widget.ProgressBar

    private val imagePickerLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val imageUri: Uri? = result.data?.data
            imageUri?.let { uploadAvatar(it) }
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        ivAvatar = view.findViewById(R.id.ivAvatar)
        etName = view.findViewById(R.id.etName)
        etEmail = view.findViewById(R.id.etEmail)
        etPhone = view.findViewById(R.id.etPhone)
        btnSave = view.findViewById(R.id.btnSave)
        btnLogout = view.findViewById(R.id.btnLogout)
        fabEditAvatar = view.findViewById(R.id.fabEditAvatar)
        progressBar = view.findViewById(R.id.progressBar)

        observeViewModel()
        
        viewModel.fetchProfile()

        fabEditAvatar.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            imagePickerLauncher.launch(intent)
        }

        btnSave.setOnClickListener {
            val name = etName.text.toString().trim()
            val phone = etPhone.text.toString().trim()
            if (name.isNotEmpty()) {
                viewModel.updateProfile(name, phone)
            } else {
                Toast.makeText(requireContext(), getString(R.string.name_empty_error), Toast.LENGTH_SHORT).show()
            }
        }

        btnLogout.setOnClickListener {
            TokenManager.clear()
            startActivity(Intent(requireContext(), LoginActivity::class.java))
            activity?.finish()
        }
    }

    private fun observeViewModel() {
        viewModel.user.observe(viewLifecycleOwner) { user ->
            user?.let {
                etName.setText(it.name)
                etEmail.setText(it.email)
                etPhone.setText(it.phone)
                Glide.with(this).load(it.avatar).placeholder(R.drawable.ic_logo).into(ivAvatar)
            }
        }

        viewModel.avatarUrl.observe(viewLifecycleOwner) { url ->
            Glide.with(this).load(url).placeholder(R.drawable.ic_logo).into(ivAvatar)
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            btnSave.isEnabled = !isLoading
            btnLogout.isEnabled = !isLoading
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
        }

        viewModel.updateSuccess.observe(viewLifecycleOwner) { success ->
            if (success) {
                Toast.makeText(requireContext(), getString(R.string.profile_update_success), Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun uploadAvatar(uri: Uri) {
        val file = compressImage(uri) ?: return
        val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("image", file.name, requestFile)
        viewModel.uploadImage(body)
    }

    private fun compressImage(uri: Uri): File? {
        return try {
            val context = requireContext()
            val inputStream = context.contentResolver.openInputStream(uri) ?: return null
            val originalBitmap = android.graphics.BitmapFactory.decodeStream(inputStream)
            inputStream.close()

            // Resize if too large (Max 1024px)
            val maxSize = 1024
            var width = originalBitmap.width
            var height = originalBitmap.height
            if (width > maxSize || height > maxSize) {
                val ratio = width.toFloat() / height.toFloat()
                if (width > height) {
                    width = maxSize
                    height = (maxSize / ratio).toInt()
                } else {
                    height = maxSize
                    width = (maxSize * ratio).toInt()
                }
            }
            val scaledBitmap = android.graphics.Bitmap.createScaledBitmap(originalBitmap, width, height, true)

            val file = File(context.cacheDir, "compressed_avatar_${System.currentTimeMillis()}.jpg")
            val out = java.io.FileOutputStream(file)
            scaledBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, out)
            out.flush()
            out.close()
            file
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}