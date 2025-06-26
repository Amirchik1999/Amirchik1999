import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMatches: 0,
    dailyViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Simulated stats for demo
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          activeMatches: 89,
          dailyViews: 2341
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💕</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Tanshuv Bot</h1>
            </div>
            <div className="text-white/80 text-sm">
              Telegram Dating Bot Dashboard
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            💖 Telegram Dating Bot 💖
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Telegram orqali yangi odamlar bilan tanishing! Har kuni 20 ta profil ko'ring, 
            like qiling va matchlar toping!
          </p>
          
          {/* Telegram Bot Link */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto mb-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-white mb-4">Botni Boshlang!</h3>
            <a 
              href="https://t.me/your_bot_username" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span className="mr-2">📱</span>
              Telegram'da Ochish
            </a>
            <p className="text-white/70 text-sm mt-4">
              @your_bot_username
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-3xl font-bold text-white mb-2">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-white/80">Jami Foydalanuvchilar</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <div className="text-4xl mb-4">💕</div>
            <h3 className="text-3xl font-bold text-white mb-2">{stats.activeMatches.toLocaleString()}</h3>
            <p className="text-white/80">Faol Matchlar</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <div className="text-4xl mb-4">👀</div>
            <h3 className="text-3xl font-bold text-white mb-2">{stats.dailyViews.toLocaleString()}</h3>
            <p className="text-white/80">Bugungi Ko'rishlar</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-4">Oddiy Qidiruv</h3>
            <ul className="text-white/90 space-y-2">
              <li>• Har kuni 20 ta yangi profil</li>
              <li>• Like yoki Skip tanlovi</li>
              <li>• Yosh va jins bo'yicha filtr</li>
              <li>• Tezkor va oson interfeys</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-5xl mb-6">💬</div>
            <h3 className="text-2xl font-bold text-white mb-4">Match va Chat</h3>
            <ul className="text-white/90 space-y-2">
              <li>• Ikkala tomon like qilganda match</li>
              <li>• Telegram ichida to'g'ridan chat</li>
              <li>• Xavfsiz va anonim muloqot</li>
              <li>• Spam va haqoratdan himoya</li>
            </ul>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-16 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">📋 Qanday Ishlatish</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Profil Yarating</h4>
              <p className="text-white/80 text-sm">/profile buyrug'i bilan ma'lumotlaringizni kiriting</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Qidiruv Boshlang</h4>
              <p className="text-white/80 text-sm">/search bilan boshqa profillarni ko'ring</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Like Qiling</h4>
              <p className="text-white/80 text-sm">Yoqqan profilga ❤️ tugmasini bosing</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Match & Chat</h4>
              <p className="text-white/80 text-sm">Match bo'lganda suhbat boshlang!</p>
            </div>
          </div>
        </div>

        {/* Commands Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">🤖 Bot Buyruqlari</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-mono text-sm">/start</span>
                <span className="text-white/90">Botni ishga tushirish</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full font-mono text-sm">/profile</span>
                <span className="text-white/90">Profil yaratish/tahrirlash</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full font-mono text-sm">/search</span>
                <span className="text-white/90">Qidiruv boshlash</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="bg-pink-500 text-white px-3 py-1 rounded-full font-mono text-sm">/matches</span>
                <span className="text-white/90">Matchlarni ko'rish</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full font-mono text-sm">/help</span>
                <span className="text-white/90">Yordam va qo'llanma</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80 mb-4">
            💖 Tanshuv Bot - Telegram orqali yangi tanishuvlar
          </p>
          <p className="text-white/60 text-sm">
            Xavfsiz, tez va oson foydalanish. Har kuni yangi imkoniyatlar!
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;