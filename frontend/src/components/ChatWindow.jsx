import React, { useState, useEffect, useRef, useContext } from 'react'; // Added useContext
import { Send, X } from 'lucide-react';
import { apiClient } from '../api/client';
import { UserContext } from '../App'; // Import UserContext

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://127.0.0.1:8000';

export default function ChatWindow({ rentalId, userId, onClose }) {
  const { user } = useContext(UserContext); // Get user from context
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!rentalId || !userId) return;

    apiClient.get(`/chat/history/${rentalId}`)
      .then(history => setMessages(history))
      .catch(err => console.error("Failed to fetch chat history:", err));

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("Authentication token not found.");
      return;
    }

    const ws = new WebSocket(`${WEBSOCKET_URL}/api/chat/ws/${rentalId}?token=${token}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log(`WebSocket connected for rental room: ${rentalId}`);
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data); // Added log
      const receivedMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, receivedMessage]);
    };

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected from rental room: ${rentalId}`, event.reason);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      ws.close();
    };
  }, [rentalId, userId]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    
    const messageToSend = {
      message: input.trim()
    };
    
    socket.send(JSON.stringify(messageToSend));
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      <div className="p-4 bg-gray-800 text-white font-bold flex items-center justify-between shrink-0">
        <span>대여 채팅 (ID: {rentalId})</span>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => ( // Use index as a fallback key
          <div key={msg.id || idx} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-end gap-2 max-w-[80%]">
              {msg.sender_id !== userId && (
                 <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold shrink-0">{msg.sender?.name?.[0] || 'U'}</div>
              )}
              <div className={`p-3 rounded-2xl text-sm ${
                msg.sender_id === userId 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}>
                <div className="font-bold mb-1">{msg.sender?.name}</div>
                <p>{msg.message}</p>
                <div className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-600"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          onClick={handleSend}
          className="bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-purple-700 transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}