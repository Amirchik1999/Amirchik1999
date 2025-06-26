import React, { useState, useEffect } from 'react';
import './App.css';

// Telegram Web App SDK
const tg = window.Telegram?.WebApp;

// API Configuration
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://a8447bef-3339-4070-80f8-ad58b7c2a078.preview.emergentagent.com';

// Get Telegram language
const getTelegramLanguage = () => {
  if (tg?.initDataUnsafe?.user?.language_code) {
    return tg.initDataUnsafe.user.language_code;
  }
  return 'en'; // default
};

// Language texts
const texts = {
  'en': {
    app_name: 'LinkUp Dating',
    welcome: 'Welcome to LinkUp Dating',
    start_button: '🚀 Start Dating',
    loading: 'Loading...',
    auth_error: 'This app only works in Telegram',
    profile_title: '📝 Create Profile',
    profile_subtitle: 'Fill in your information',
    name_label: 'Your Name',
    age_label: 'Your Age',
    gender_label: 'Gender',
    male: '👨 Male',
    female: '👩 Female',
    bio_label: 'About You',
    interests_label: 'Your Interests',
    location_label: 'Your Location',
    save_profile: '✅ Save Profile',
    discover: 'Discover',
    matches: 'Matches',
    profile: 'Profile',
    daily_limit: 'Daily limit reached! Try again tomorrow.',
    its_match: "IT'S A MATCH!",
    start_chat: '💬 Start Chat',
    continue: 'Continue',
    no_cards: 'No more profiles',
    try_tomorrow: 'New profiles will appear tomorrow!',
    reload: '🔄 Reload',
    no_matches: 'No matches yet',
    start_discovering: 'Start discovering and find new people!',
    saving: 'Saving...',
    cards_loading: 'Loading profiles...'
  },
  'uz': {
    app_name: 'LinkUp Dating',
    welcome: 'LinkUp Dating ga xush kelibsiz',
    start_button: '🚀 Tanishuvni boshlash',
    loading: 'Yuklanmoqda...',
    auth_error: 'Bu ilova faqat Telegram ichida ishlaydi',
    profile_title: '📝 Profil yaratish',
    profile_subtitle: 'Ma\'lumotlaringizni to\'ldiring',
    name_label: 'Ismingiz',
    age_label: 'Yoshingiz',
    gender_label: 'Jinsingiz',
    male: '👨 Erkak',
    female: '👩 Ayol',
    bio_label: 'O\'zingiz haqida',
    interests_label: 'Qiziqishlaringiz',
    location_label: 'Joylashuvingiz',
    save_profile: '✅ Profilni saqlash',
    discover: 'Qidiruv',
    matches: 'Matchlar',
    profile: 'Profil',
    daily_limit: 'Kunlik limit tugadi! Ertaga qayta urinib ko\'ring.',
    its_match: 'MATCH BO\'LDI!',
    start_chat: '💬 Suhbat boshlash',
    continue: 'Davom etish',
    no_cards: 'Profillar tugadi',
    try_tomorrow: 'Ertaga yangi profillar paydo bo\'ladi!',
    reload: '🔄 Qayta yuklash',
    no_matches: 'Hali matchlaringiz yo\'q',
    start_discovering: 'Qidiruv boshlang va yangi odamlarni toping!',
    saving: 'Saqlanmoqda...',
    cards_loading: 'Profillar yuklanmoqda...'
  },
  'ru': {
    app_name: 'LinkUp Dating',
    welcome: 'Добро пожаловать в LinkUp Dating',
    start_button: '🚀 Начать знакомства',
    loading: 'Загрузка...',
    auth_error: 'Это приложение работает только в Telegram',
    profile_title: '📝 Создать профиль',
    profile_subtitle: 'Заполните информацию о себе',
    name_label: 'Ваше имя',
    age_label: 'Ваш возраст',
    gender_label: 'Пол',
    male: '👨 Мужской',
    female: '👩 Женский',
    bio_label: 'О себе',
    interests_label: 'Ваши интересы',
    location_label: 'Местоположение',
    save_profile: '✅ Сохранить профиль',
    discover: 'Поиск',
    matches: 'Совпадения',
    profile: 'Профиль',
    daily_limit: 'Дневной лимит исчерпан! Попробуйте завтра.',
    its_match: 'ЭТО СОВПАДЕНИЕ!',
    start_chat: '💬 Начать чат',
    continue: 'Продолжить',
    no_cards: 'Профили закончились',
    try_tomorrow: 'Завтра появятся новые профили!',
    reload: '🔄 Обновить',
    no_matches: 'Пока нет совпадений',
    start_discovering: 'Начните поиск и находите новых людей!',
    saving: 'Сохранение...',
    cards_loading: 'Загружаются профили...'
  }
};

// Get text by key
const getText = (key) => {
  const lang = getTelegramLanguage();
  return texts[lang]?.[key] || texts['en'][key] || key;
};

// Components
const AuthScreen = ({ onAuth }) => {
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (!tg) {
        throw new Error(getText('auth_error'));
      }

      const initData = tg.initData;
      if (!initData) {
        // For testing without Telegram, create mock auth
        console.log('Mock authentication for testing');
        const mockUser = {
          telegram_id: 123456789,
          first_name: 'Test User',
          username: 'testuser'
        };
        onAuth(mockUser);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ init_data: initData })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      onAuth(data.user);
    } catch (error) {
      console.error('Auth error:', error);
      if (tg?.showAlert) {
        tg.showAlert(`Error: ${error.message}`);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-authenticate on mount
  useEffect(() => {
    if (tg) {
      handleAuth();
    }
  }, []);

  return (
    <div className="telegram-page">
      <div className="telegram-header">
        <div className="header-back"></div>
        <div className="header-title">{getText('app_name')}</div>
        <div className="header-action"></div>
      </div>
      
      <div className="telegram-content">
        <div className="auth-container">
          <div className="app-icon">💕</div>
          <h1>{getText('app_name')}</h1>
          <p>{getText('welcome')}</p>
          
          {!tg && (
            <button 
              className="telegram-button primary"
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? getText('loading') : getText('start_button')}
            </button>
          )}
        </div>
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
    'Sport', 'Music', 'Travel', 'Books', 'Cooking', 'Photography',
    'Programming', 'Art', 'Movies', 'Games', 'Business', 'Fashion'
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
      const message = 'Please fill in all required fields!';
      if (tg?.showAlert) {
        tg.showAlert(message);
      } else {
        alert(message);
      }
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Mock API call if no token (for testing)
      if (!token) {
        setTimeout(() => {
          onComplete({ ...profile, telegram_id: 123456789 });
        }, 1000);
        return;
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      onComplete(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      const message = `Error: ${error.message}`;
      if (tg?.showAlert) {
        tg.showAlert(message);
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="telegram-page">
      <div className="telegram-header">
        <div className="header-back">‹</div>
        <div className="header-title">{getText('profile_title')}</div>
        <div className="header-action"></div>
      </div>

      <div className="telegram-content">
        <div className="telegram-form">
          <div className="form-section">
            <div className="section-header">
              <h3>{getText('profile_subtitle')}</h3>
            </div>

            <div className="input-group">
              <label>{getText('name_label')}</label>
              <input
                type="text"
                className="telegram-input"
                value={profile.first_name}
                onChange={(e) => setProfile(prev => ({...prev, first_name: e.target.value}))}
                placeholder={getText('name_label')}
              />
            </div>

            <div className="input-group">
              <label>{getText('age_label')}</label>
              <input
                type="number"
                className="telegram-input"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({...prev, age: parseInt(e.target.value) || ''}))}
                placeholder="18"
                min="18"
                max="100"
              />
            </div>

            <div className="input-group">
              <label>{getText('gender_label')}</label>
              <div className="button-group">
                <button
                  className={`telegram-button ${profile.gender === 'erkak' ? 'selected' : 'secondary'}`}
                  onClick={() => setProfile(prev => ({...prev, gender: 'erkak'}))}
                >
                  {getText('male')}
                </button>
                <button
                  className={`telegram-button ${profile.gender === 'ayol' ? 'selected' : 'secondary'}`}
                  onClick={() => setProfile(prev => ({...prev, gender: 'ayol'}))}
                >
                  {getText('female')}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>{getText('bio_label')}</label>
              <textarea
                className="telegram-textarea"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
                placeholder={getText('bio_label')}
                rows="3"
              />
            </div>

            <div className="input-group">
              <label>{getText('interests_label')}</label>
              <div className="tags-grid">
                {interests_list.map(interest => (
                  <button
                    key={interest}
                    className={`tag-button ${profile.interests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>{getText('location_label')}</label>
              <input
                type="text"
                className="telegram-input"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
                placeholder="Tashkent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="telegram-footer">
        <button 
          className="telegram-button primary full-width"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? getText('saving') : getText('save_profile')}
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

  // Mock data for testing
  const mockCards = [
    {
      telegram_id: 987654321,
      first_name: 'Sarah',
      age: 25,
      gender: 'ayol',
      bio: 'Love traveling and photography 📸',
      interests: ['Travel', 'Photography', 'Music'],
      location: 'New York',
      photos: []
    },
    {
      telegram_id: 555555555,
      first_name: 'Mike',
      age: 28,
      gender: 'erkak',
      bio: 'Software developer and fitness enthusiast 💪',
      interests: ['Programming', 'Sport', 'Books'],
      location: 'California',
      photos: []
    }
  ];

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Mock data if no token
      if (!token) {
        setTimeout(() => {
          setCards(mockCards);
          setCurrentCard(mockCards[0] || null);
          setLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch(`${API_URL}/api/discover`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load cards');
      }

      const data = await response.json();
      if (data.limit_reached) {
        if (tg?.showAlert) {
          tg.showAlert(getText('daily_limit'));
        } else {
          alert(getText('daily_limit'));
        }
        return;
      }

      setCards(data);
      setCurrentCard(data[0] || null);
    } catch (error) {
      console.error('Load cards error:', error);
      // Fallback to mock data
      setCards(mockCards);
      setCurrentCard(mockCards[0] || null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (!currentCard) return;

    try {
      const token = localStorage.getItem('auth_token');
      
      // Mock swipe response
      if (!token) {
        const isMatch = Math.random() > 0.7; // 30% chance of match
        if (action === 'like' && isMatch) {
          setMatchedUser(currentCard);
          setShowMatch(true);
          if (tg?.HapticFeedback?.impactOccurred) {
            tg.HapticFeedback.impactOccurred('heavy');
          }
        }
        
        // Move to next card
        const currentIndex = cards.findIndex(card => card.telegram_id === currentCard.telegram_id);
        const nextCard = cards[currentIndex + 1] || null;
        setCurrentCard(nextCard);
        return;
      }

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
        throw new Error('Swipe failed');
      }

      const result = await response.json();
      
      if (result.is_match) {
        setMatchedUser(currentCard);
        setShowMatch(true);
        if (tg?.HapticFeedback?.impactOccurred) {
          tg.HapticFeedback.impactOccurred('heavy');
        }
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
      // Continue anyway
      const currentIndex = cards.findIndex(card => card.telegram_id === currentCard.telegram_id);
      const nextCard = cards[currentIndex + 1] || null;
      setCurrentCard(nextCard);
    }
  };

  const closeMatchModal = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  if (loading) {
    return (
      <div className="telegram-page">
        <div className="telegram-header">
          <div className="header-back"></div>
          <div className="header-title">{getText('discover')}</div>
          <div className="header-action"></div>
        </div>
        <div className="telegram-content center">
          <div className="loading-container">
            <div className="telegram-spinner"></div>
            <p>{getText('cards_loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="telegram-page">
        <div className="telegram-header">
          <div className="header-back"></div>
          <div className="header-title">{getText('discover')}</div>
          <div className="header-action"></div>
        </div>
        <div className="telegram-content center">
          <div className="empty-state">
            <div className="empty-icon">😔</div>
            <h3>{getText('no_cards')}</h3>
            <p>{getText('try_tomorrow')}</p>
            <button onClick={loadCards} className="telegram-button primary">
              {getText('reload')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="telegram-page">
      {/* Match Modal */}
      {showMatch && (
        <div className="telegram-overlay">
          <div className="match-modal">
            <div className="match-content">
              <div className="match-icon">🎉</div>
              <h2>{getText('its_match')}</h2>
              <div className="match-users">
                <div className="match-user">
                  <div className="user-avatar">{user?.first_name?.charAt(0) || 'U'}</div>
                  <span>{user?.first_name || 'You'}</span>
                </div>
                <div className="match-heart">💕</div>
                <div className="match-user">
                  <div className="user-avatar">{matchedUser?.first_name?.charAt(0)}</div>
                  <span>{matchedUser?.first_name}</span>
                </div>
              </div>
              <button className="telegram-button primary" onClick={closeMatchModal}>
                {getText('start_chat')}
              </button>
              <button className="telegram-button secondary" onClick={closeMatchModal}>
                {getText('continue')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="telegram-header">
        <div className="header-back"></div>
        <div className="header-title">{getText('discover')}</div>
        <div className="header-action"></div>
      </div>

      <div className="telegram-content">
        <div className="card-container">
          <div className="card">
            <div className="card-image">
              {currentCard.photos && currentCard.photos.length > 0 ? (
                <img src={`data:image/jpeg;base64,${currentCard.photos[0]}`} alt={currentCard.first_name} />
              ) : (
                <div className="card-placeholder">
                  <span>{currentCard.first_name?.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="card-info">
              <div className="card-header">
                <h3>{currentCard.first_name}, {currentCard.age}</h3>
                {currentCard.location && <span className="location">📍 {currentCard.location}</span>}
              </div>
              
              {currentCard.bio && (
                <p className="card-bio">{currentCard.bio}</p>
              )}
              
              {currentCard.interests && currentCard.interests.length > 0 && (
                <div className="card-tags">
                  {currentCard.interests.slice(0, 3).map((interest, index) => (
                    <span key={index} className="tag">{interest}</span>
                  ))}
                  {currentCard.interests.length > 3 && (
                    <span className="tag more">+{currentCard.interests.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card-actions">
            <button 
              className="action-btn pass-btn"
              onClick={() => handleSwipe('pass')}
            >
              ✕
            </button>
            <button 
              className="action-btn super-btn"
              onClick={() => handleSwipe('super_like')}
            >
              ⭐
            </button>
            <button 
              className="action-btn like-btn"
              onClick={() => handleSwipe('like')}
            >
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock matches for testing
  const mockMatches = [
    {
      match_id: '1',
      user: {
        telegram_id: 987654321,
        first_name: 'Sarah',
        age: 25,
        bio: 'Love traveling and photography',
        photos: []
      },
      matched_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Mock data if no token
      if (!token) {
        setTimeout(() => {
          setMatches(mockMatches);
          setLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch(`${API_URL}/api/matches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load matches');
      }

      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Load matches error:', error);
      setMatches(mockMatches);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="telegram-page">
        <div className="telegram-header">
          <div className="header-back"></div>
          <div className="header-title">{getText('matches')}</div>
          <div className="header-action"></div>
        </div>
        <div className="telegram-content center">
          <div className="loading-container">
            <div className="telegram-spinner"></div>
            <p>{getText('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="telegram-page">
        <div className="telegram-header">
          <div className="header-back"></div>
          <div className="header-title">{getText('matches')}</div>
          <div className="header-action"></div>
        </div>
        <div className="telegram-content center">
          <div className="empty-state">
            <div className="empty-icon">💔</div>
            <h3>{getText('no_matches')}</h3>
            <p>{getText('start_discovering')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="telegram-page">
      <div className="telegram-header">
        <div className="header-back"></div>
        <div className="header-title">{getText('matches')} ({matches.length})</div>
        <div className="header-action"></div>
      </div>
      
      <div className="telegram-content">
        <div className="telegram-list">
          {matches.map((match) => (
            <div key={match.match_id} className="list-item">
              <div className="item-avatar">
                {match.user.photos && match.user.photos.length > 0 ? (
                  <img src={`data:image/jpeg;base64,${match.user.photos[0]}`} alt={match.user.first_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {match.user.first_name?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="item-content">
                <div className="item-title">{match.user.first_name}, {match.user.age}</div>
                <div className="item-subtitle">{match.user.bio}</div>
                <div className="item-time">
                  {new Date(match.matched_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="item-action">
                <button className="icon-button">💬</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'discover', icon: '🔍', label: getText('discover') },
    { id: 'matches', icon: '💕', label: getText('matches') },
    { id: 'profile', icon: '👤', label: getText('profile') }
  ];

  return (
    <div className="telegram-tabbar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
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
      
      // Set theme colors
      if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-hint-color', tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-button-color', tg.themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f1f1f1');
      }
    }

    // Auto-start authentication
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token && !tg) {
      // For testing without Telegram
      setTimeout(() => {
        setUser({ telegram_id: 123456789, first_name: 'Test User' });
        setIsAuthenticated(true);
        setNeedsProfile(true);
        setLoading(false);
      }, 1000);
      return;
    }

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
      <div className="telegram-page">
        <div className="telegram-content center">
          <div className="loading-container">
            <div className="telegram-spinner"></div>
            <p>{getText('loading')}</p>
          </div>
        </div>
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
    <div className="telegram-app">
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