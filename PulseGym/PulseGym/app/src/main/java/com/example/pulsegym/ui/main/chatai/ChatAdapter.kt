package com.example.pulsegym.ui.main.chatai

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.pulsegym.R
import com.example.pulsegym.data.model.ChatMessage

class ChatAdapter(private val messages: List<ChatMessage>) :
    RecyclerView.Adapter<ChatAdapter.ChatViewHolder>() {

    class ChatViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val llAi: LinearLayout = view.findViewById(R.id.llAiMessage)
        val tvAi: TextView = view.findViewById(R.id.tvAiMessage)
        val llUser: LinearLayout = view.findViewById(R.id.llUserMessage)
        val tvUser: TextView = view.findViewById(R.id.tvUserMessage)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_chat_message, parent, false)
        return ChatViewHolder(view)
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
        val message = messages[position]
        if (message.isFromUser) {
            holder.llUser.visibility = View.VISIBLE
            holder.llAi.visibility = View.GONE
            holder.tvUser.text = message.content
        } else {
            holder.llUser.visibility = View.GONE
            holder.llAi.visibility = View.VISIBLE
            holder.tvAi.text = message.content
        }
    }

    override fun getItemCount() = messages.size
}
