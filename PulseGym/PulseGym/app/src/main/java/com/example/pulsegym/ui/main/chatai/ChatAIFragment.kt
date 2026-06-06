package com.example.pulsegym.ui.main.chatai

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import com.example.pulsegym.R
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton

class ChatAIFragment : Fragment(R.layout.fragment_chat) {
    private val viewModel: ChatViewModel by viewModels()
    private lateinit var adapter: ChatAdapter
    private lateinit var rvMessages: RecyclerView
    private lateinit var etMessage: EditText
    private lateinit var btnSend: FloatingActionButton
    private lateinit var progressBar: ProgressBar
    private lateinit var loadingOverlay: View
    private lateinit var llSuggestions: android.view.View

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        rvMessages = view.findViewById(R.id.rvMessages)
        etMessage = view.findViewById(R.id.etChatMessage)
        btnSend = view.findViewById(R.id.btnSendMessage)
        progressBar = view.findViewById(R.id.progressBar)
        loadingOverlay = view.findViewById(R.id.loadingOverlay)
        llSuggestions = view.findViewById(R.id.llSuggestions)

        setupRecyclerView()
        setupSuggestions(view)

        btnSend.setOnClickListener {
            val content = etMessage.text.toString()
            if (content.isNotEmpty()) {
                viewModel.sendMessage(content)
                etMessage.text.clear()
            }
        }

        observeViewModel()
    }

    private fun setupRecyclerView() {
        adapter = ChatAdapter(viewModel.messages.value ?: mutableListOf())
        rvMessages.adapter = adapter
        rvMessages.layoutManager = LinearLayoutManager(requireContext()).apply {
            stackFromEnd = true
        }
    }

    private fun setupSuggestions(view: View) {
        val suggests = listOf(
            view.findViewById<TextView>(R.id.tvSuggest1),
            view.findViewById<TextView>(R.id.tvSuggest2),
            view.findViewById<TextView>(R.id.tvSuggest3)
        )

        suggests.forEach { tv ->
            tv.setOnClickListener {
                viewModel.sendMessage(tv.text.toString())
            }
        }
    }

    private fun observeViewModel() {
        viewModel.messages.observe(viewLifecycleOwner) {
            adapter.notifyDataSetChanged()
            if (it.isNotEmpty()) {
                rvMessages.smoothScrollToPosition(it.size - 1)
                llSuggestions.visibility = View.GONE
            } else {
                llSuggestions.visibility = View.VISIBLE
            }
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            loadingOverlay.visibility = if (isLoading) View.VISIBLE else View.GONE
            btnSend.isEnabled = !isLoading
            etMessage.isEnabled = !isLoading
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
            }
        }
    }
}