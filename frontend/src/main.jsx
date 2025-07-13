import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from 'declarations/backend';
import '/index.css';

const App = () => {
  const [chat, setChat] = useState([
    { system: { content: "Aku adalah AI tebak angka 1-100 di Internet Computer. Tekan 'Mulai Game' untuk mulai!" } }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const chatBoxRef = useRef(null);

  // Scroll otomatis ke bawah jika chat berubah
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  // Fungsi untuk mulai game (generate angka random)
  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      await backend.generateAnswer();
      setGameStarted(true);
      setChat((prev) => [
        ...prev,
        { system: { content: "Angka sudah digenerate! Silakan tebak angka antara 1 sampai 100." } }
      ]);
    } catch (e) {
      console.error(e);
      alert("Gagal memulai game!");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi submit tebakan user
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !gameStarted) return;

    const userGuess = inputValue.trim();
    setChat((prev) => [...prev, { user: { content: `Tebakan: ${userGuess}` } }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Pastikan input berupa angka
      const guessNum = parseInt(userGuess, 10);
      if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
        setChat((prev) => [
          ...prev,
          { system: { content: "Masukkan angka valid antara 1 sampai 100." } }
        ]);
      } else {
        const result = await backend.guess(guessNum);
        setChat((prev) => [
          ...prev,
          { system: { content: result } }
        ]);
        if (result.includes("Benar")) {
          setGameStarted(false);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memeriksa jawaban!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-white p-4">
      <div className="flex h-[80vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center bg-blue-600 py-4 text-white text-lg font-semibold">
          Tebak Angka AI
        </div>

        {/* Chat box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatBoxRef}>
          {chat.map((message, idx) => {
            const isUser = 'user' in message;
            const text = isUser ? message.user.content : message.system.content;
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-xl shadow ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleStartGame}
            disabled={isLoading || gameStarted}
            className="w-full rounded-full bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            Mulai Game
          </button>
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan tebakan angka kamu ..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading || !gameStarted}
            />
            <button
              type="submit"
              disabled={isLoading || !gameStarted}
              className="ml-2 rounded-full bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition"
            >
              Kirim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);