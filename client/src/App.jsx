import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [roomCode, setRoomCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(`User-${Math.random().toString(36).substring(2, 7)}`);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    socket.on('roomCreated', (code) => {
      setRoomCode(code);
      joinRoom(code);
    });

    socket.on('joinedRoom', (code) => {
      setJoined(true);
    });

    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('joinedRoom');
      socket.off('message');
    };
  }, []);

  const createRoom = () => {
    socket.emit('createRoom');
  };

  const joinRoom = (code) => {
    if (code) {
      socket.emit('joinRoom', code);
    }
  };

  const sendMessage = () => {
    if (message) {
      socket.emit('sendMessage', { roomCode, message, user });
      setMessage('');
    }
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      {!joined ? (
        showAbout ? (
          <div className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">About Me</h1>
            <p className="text-center text-gray-400 mb-6">
              I'm Nazrul Islam Sajib . A dedicated Computer Science undergraduate with proven expertise in software development and advanced problemsolving. Proficient in full-stack development using React.js, Node.js, Express.js, and MongoDB. Experienced in
collaborating within teams and delivering efficient solutions.
            </p>
            <button onClick={toggleAbout} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Back
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">CodeChat</h1>
            <div className="space-y-4">
              <button onClick={createRoom} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                Create Chat Room
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter Room Code"
                  className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={() => joinRoom(roomCode)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                  Join
                </button>
              </div>
              <button onClick={toggleAbout} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mt-4">
                About Me
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-blue-400">Room: {roomCode}</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="mb-4">
                <p className="text-gray-400 text-sm">{msg.user} - {new Date(msg.timestamp).toLocaleTimeString()}</p>
                <p className="text-lg">{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-700 flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={sendMessage} className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
