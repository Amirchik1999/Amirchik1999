import React, { useState, useEffect } from 'react';
import './App.css';

// Telegram Web App SDK
const tg = window.Telegram?.WebApp;

// API Configuration
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://a8447bef-3339-4070-80f8-ad58b7c2a078.preview.emergentagent.com';

// Components
const AuthScreen = ({ onAuth }) => {
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (!tg) {
        throw new Error('Bu ilova faqat Telegram ichida ishlaydi');
      }

      const initData = tg.initData;
      if (!initData) {
        throw new Error('Telegram ma\'lumotlari topilmadi');
      }

      const response = await fetch(`${API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ init_data: initData })
      });

      if (!response.ok) {
        throw new Error('Autentifikatsiya xatolik');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      onAuth(data.user);
    } catch (error) {
      console.error('Auth error:', error);
      tg?.showAlert(`Xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-logo">💎</div>
        <h1>TON Dating</h1>
        <p>Premium tanishuv platformasi</p>
        <button 
          className="auth-button" 
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? 'Yuklanmoqda...' : '🚀 Boshlash'}
        </button>
      </div>
    </div>
  );
};

const ProfileSetup = ({ user, onComplete }) => {
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    location: user?.location || ''
  });
  const [loading, setLoading] = useState(false);

  const interests_list = [
    'Sport', 'Musiqa', 'Sayohat', 'Kitoblar', 'Pishirish', 'Fotografiya',
    'Dasturlash', 'San\'at', 'Kino', 'O\'yinlar', 'Biznes', 'Moda'
  ];

  const handleInterestToggle = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async () => {
    if (!profile.first_name || !profile.age || !profile.gender || !profile.bio) {
      tg?.showAlert('Barcha maydonlarni to\'ldiring!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Profil yangilanmadi');
      }

      const updatedUser = await response.json();
      onComplete(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      tg?.showAlert(`Xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup">
      <div className="profile-header">
        <h2>📝 Profil Yaratish</h2>
        <p>Ma'lumotlaringizni to'ldiring</p>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label>Ismingiz</label>
          <input
            type="text"
            value={profile.first_name}
            onChange={(e) => setProfile(prev => ({...prev, first_name: e.target.value}))}
            placeholder="Ismingizni kiriting"
          />
        </div>

        <div className="form-group">
          <label>Yoshingiz</label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile(prev => ({...prev, age: parseInt(e.target.value) || ''}))}
            placeholder="18"
            min="18"
            max="100"
          />
        </div>

        <div className="form-group">
          <label>Jinsiz</label>
          <div className="gender-buttons">
            <button
              className={`gender-btn ${profile.gender === 'erkak' ? 'active' : ''}`}
              onClick={() => setProfile(prev => ({...prev, gender: 'erkak'}))}
            >
              👨 Erkak
            </button>
            <button
              className={`gender-btn ${profile.gender === 'ayol' ? 'active' : ''}`}
              onClick={() => setProfile(prev => ({...prev, gender: 'ayol'}))}
            >
              👩 Ayol
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>O'zingiz haqida</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
            placeholder="Qisqacha o'zingiz haqida yozing..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Qiziqishlaringiz</label>
          <div className="interests-grid">
            {interests_list.map(interest => (
              <button
                key={interest}
                className={`interest-tag ${profile.interests.includes(interest) ? 'active' : ''}`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Joylashuvingiz</label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
            placeholder="Masalan: Toshkent"
          />
        </div>

        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saqlanmoqda...' : '✅ Profilni Saqlash'}
        </button>
      </div>
    </div>
  );
};

const DiscoverScreen = ({ user }) => {
  const [currentCard, setCurrentCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/discover`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Kartalar yuklanmadi');
      }

      const data = await response.json();
      if (data.limit_reached) {
        tg?.showAlert('Kunlik limit tugadi! Ertaga qayta urinib ko\'ring.');
        return;
      }

      setCards(data);
      setCurrentCard(data[0] || null);
    } catch (error) {
      console.error('Load cards error:', error);
      tg?.showAlert(`Xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (!currentCard) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target_user_id: currentCard.telegram_id,
          action: action
        })
      });

      if (!response.ok) {
        throw new Error('Swipe amalga oshmadi');
      }

      const result = await response.json();
      
      if (result.is_match) {
        setMatchedUser(currentCard);
        setShowMatch(true);
        // Haptic feedback
        tg?.HapticFeedback?.impactOccurred('heavy');
      }

      // Move to next card
      const currentIndex = cards.findIndex(card => card.telegram_id === currentCard.telegram_id);
      const nextCard = cards[currentIndex + 1] || null;
      setCurrentCard(nextCard);

      // Load more cards if running low
      if (currentIndex >= cards.length - 2) {
        await loadCards();
      }

    } catch (error) {
      console.error('Swipe error:', error);
      tg?.showAlert(`Xatolik: ${error.message}`);
    }
  };

  const closeMatchModal = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Kartalar yuklanmoqda...</p>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="no-cards">
        <div className="no-cards-icon">😔</div>
        <h3>Kartalar tugadi</h3>
        <p>Ertaga yangi profillar paydo bo'ladi!</p>
        <button onClick={loadCards} className="reload-button">
          🔄 Qayta yuklash
        </button>
      </div>
    );
  }

  return (
    <div className="discover-screen">
      {/* Match Modal */}
      {showMatch && (
        <div className="match-modal">
          <div className="match-content">
            <div className="match-icon">🎉</div>
            <h2>IT'S A MATCH!</h2>
            <div className="match-users">
              <div className="match-user">
                <div className="match-avatar">{user?.first_name?.charAt(0)}</div>
                <span>{user?.first_name}</span>
              </div>
              <div className="match-heart">💕</div>
              <div className="match-user">
                <div className="match-avatar">{matchedUser?.first_name?.charAt(0)}</div>
                <span>{matchedUser?.first_name}</span>
              </div>
            </div>
            <button className="match-button" onClick={closeMatchModal}>
              💬 Suhbat Boshlash
            </button>
            <button className="match-close" onClick={closeMatchModal}>
              Davom etish
            </button>
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="card-stack">
        <div className="swipe-card">
          <div className="card-image">
            {currentCard.photos && currentCard.photos.length > 0 ? (
              <img src={`data:image/jpeg;base64,${currentCard.photos[0]}`} alt={currentCard.first_name} />
            ) : (
              <div className="no-photo">
                <span>{currentCard.first_name?.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className="card-info">
            <div className="card-name">
              <h3>{currentCard.first_name}, {currentCard.age}</h3>
              {currentCard.location && <span className="location">📍 {currentCard.location}</span>}
            </div>
            
            {currentCard.bio && (
              <p className="card-bio">{currentCard.bio}</p>
            )}
            
            {currentCard.interests && currentCard.interests.length > 0 && (
              <div className="card-interests">
                {currentCard.interests.slice(0, 3).map((interest, index) => (
                  <span key={index} className="interest-tag">{interest}</span>
                ))}
                {currentCard.interests.length > 3 && (
                  <span className="interest-more">+{currentCard.interests.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="swipe-actions">
        <button 
          className="action-button pass-button"
          onClick={() => handleSwipe('pass')}
        >
          ✕
        </button>
        <button 
          className="action-button super-like-button"
          onClick={() => handleSwipe('super_like')}
        >
          ⭐
        </button>
        <button 
          className="action-button like-button"
          onClick={() => handleSwipe('like')}
        >
          ❤️
        </button>
      </div>
    </div>
  );
};

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/matches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Matchlar yuklanmadi');
      }

      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Load matches error:', error);
      tg?.showAlert(`Xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Matchlar yuklanmoqda...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="no-matches">
        <div className="no-matches-icon">💔</div>
        <h3>Hali matchlaringiz yo'q</h3>
        <p>Qidiruv boshlang va yangi odamlarni toping!</p>
      </div>
    );
  }

  return (
    <div className="matches-screen">
      <div className="matches-header">
        <h2>💕 Matchlaringiz ({matches.length})</h2>
      </div>
      
      <div className="matches-list">
        {matches.map((match) => (
          <div key={match.match_id} className="match-item">
            <div className="match-avatar">
              {match.user.photos && match.user.photos.length > 0 ? (
                <img src={`data:image/jpeg;base64,${match.user.photos[0]}`} alt={match.user.first_name} />
              ) : (
                <div className="avatar-placeholder">
                  {match.user.first_name?.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="match-info">
              <h4>{match.user.first_name}, {match.user.age}</h4>
              <p className="match-bio">{match.user.bio}</p>
              <span className="match-time">
                {new Date(match.matched_at).toLocaleDateString('uz-UZ')}
              </span>
            </div>
            
            <div className="match-actions">
              <button className="chat-button">💬</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'discover', icon: '🔍', label: 'Qidiruv' },
    { id: 'matches', icon: '💕', label: 'Matchlar' },
    { id: 'profile', icon: '👤', label: 'Profil' }
  ];

  return (
    <div className="navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Telegram Web App
    if (tg) {
      tg.ready();
      tg.expand();
      tg.MainButton.hide();
    }

    // Check for existing auth
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem('auth_token');
        setLoading(false);
        return;
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      
      // Check if profile is complete
      if (!userData.age || !userData.gender || !userData.bio) {
        setNeedsProfile(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Check if profile needs completion
    if (!userData.age || !userData.gender || !userData.bio) {
      setNeedsProfile(true);
    }
  };

  const handleProfileComplete = (updatedUser) => {
    setUser(updatedUser);
    setNeedsProfile(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (needsProfile) {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} />;
  }

  return (
    <div className="app">
      <div className="app-content">
        {activeTab === 'discover' && <DiscoverScreen user={user} />}
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'profile' && <ProfileSetup user={user} onComplete={(updatedUser) => setUser(updatedUser)} />}
      </div>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;