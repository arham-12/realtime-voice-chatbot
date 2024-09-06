import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [chatActive, setChatActive] = useState(false); // Track if the chat is ongoing
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  const startListening = () => {
    SpeechRecognition.startListening({ language: 'ur-PK' });
    setChatActive(true);
  };

  const stopChat = () => {
    SpeechRecognition.stopListening();
    setChatActive(false);
  };

  useEffect(() => {
    if (transcript && !listening && chatActive) {
      // Add the user's message to the chat
      setMessages((prevMessages) => [...prevMessages, { text: transcript, sender: 'user' }]);
      sendToBackend(transcript);
      resetTranscript();
    }
  }, [transcript, listening, chatActive]);

  const sendToBackend = async (text) => {
    try {
      // Send user's message to backend
      const response = await axios.post('http://localhost:8000/text_input', { question: text });

      // Append bot's reply to the messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { text, sender: 'user' },
        { text: response.data.response, sender: 'bot' },
      ]);

      // Fetch and play the response audio
      const audioResponse = await axios.get('http://localhost:8000/get_audio', { responseType: 'blob' });
      const audioURL = URL.createObjectURL(audioResponse.data);
      const audio = new Audio(audioURL);
      audio.play();

      // Automatically start listening again after bot response
      if (chatActive) {
        startListening();
      }
    } catch (error) {
      console.error('Error sending message to backend:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 p-4 rounded-lg shadow-lg">
      <div className="flex flex-col space-y-4 overflow-y-auto mb-4 h-5/6">
        {messages.map((msg, index) => (
          <div key={index} className={`p-4 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black self-start'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {!chatActive ? (
          <button
            onClick={startListening}
            className="w-full p-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-800 transition-all"
          >
            Start Chat
          </button>
        ) : (
          <>
            <button
              onClick={stopChat}
              className="w-1/3 p-4 rounded-lg bg-red-500 text-white font-bold text-lg hover:bg-red-700 transition-all mr-2"
            >
              End Chat
            </button>
            <button
              disabled={listening}
              onClick={startListening}
              className={`w-2/3 p-4 rounded-lg text-white font-bold text-lg ${listening ? 'bg-green-400' : 'bg-green-600 hover:bg-green-800'} transition-all`}
            >
              {listening ? 'Listening...' : 'Continue Chat'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
