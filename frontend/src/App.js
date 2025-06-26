import React, { useState, useEffect } from 'react';
import './App.css';

// Telegram Web App SDK
const tg = window.Telegram?.WebApp;

// API Configuration
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://a8447bef-3339-4070-80f8-ad58b7c2a078.preview.emergentagent.com';

// Get Telegram language - force Russian for now
const getTelegramLanguage = () => {
  if (tg?.initDataUnsafe?.user?.language_code) {
    const lang = tg.initDataUnsafe.user.language_code;
    // Return 'ru' for Russian-speaking users, otherwise 'en'
    return ['ru', 'uk', 'be'].includes(lang) ? 'ru' : 'en';
  }
  return 'ru'; // Default to Russian like real TON Dating
};

// Language texts - exact copy from TON Dating
const texts = {
  'ru': {
    app_name: 'TON Dating',
    app_subtitle: 'Знакомства в Telegram.\nПрисоединяйтесь к сообществу\nамбициозных и реальных людей.',
    create_profile: 'Создать профиль',
    connect_wallet: 'Подключить кошелёк',
    loading: 'Загрузка...',
    profile_title: 'Создание профиля',
    name_label: 'Ваше имя',
    age_label: 'Ваш возраст',
    gender_label: 'Пол',
    male: 'Мужской',
    female: 'Женский',
    bio_label: 'О себе',
    interests_label: 'Интересы',
    location_label: 'Город',
    save_profile: 'Сохранить',
    discover: 'Поиск',
    matches: 'Пары',
    profile: 'Профиль',
    daily_limit: 'Дневной лимит исчерпан! Попробуйте завтра.',
    its_match: 'СОВПАДЕНИЕ!',
    start_chat: 'Начать чат',
    continue: 'Продолжить',
    no_cards: 'Больше нет профилей',
    try_tomorrow: 'Завтра появятся новые!',
    reload: 'Обновить',
    no_matches: 'Пока нет совпадений',
    start_discovering: 'Начните поиск новых людей!',
    saving: 'Сохранение...',
    cards_loading: 'Загружаем профили...',
    next: 'Далее',
    back: 'Назад'
  },
  'en': {
    app_name: 'TON Dating',
    app_subtitle: 'High-quality connections in Telegram.\nJoin the community of ambitious\nand beautiful people.',
    create_profile: 'Create Profile',
    connect_wallet: 'Connect Wallet',
    loading: 'Loading...',
    profile_title: 'Create Profile',
    name_label: 'Your Name',
    age_label: 'Your Age',
    gender_label: 'Gender',
    male: 'Male',
    female: 'Female',
    bio_label: 'About You',
    interests_label: 'Interests',
    location_label: 'Location',
    save_profile: 'Save Profile',
    discover: 'Discover',
    matches: 'Matches',
    profile: 'Profile',
    daily_limit: 'Daily limit reached! Try again tomorrow.',
    its_match: "IT'S A MATCH!",
    start_chat: 'Start Chat',
    continue: 'Continue',
    no_cards: 'No more profiles',
    try_tomorrow: 'New profiles will appear tomorrow!',
    reload: 'Reload',
    no_matches: 'No matches yet',
    start_discovering: 'Start discovering and find new people!',
    saving: 'Saving...',
    cards_loading: 'Loading profiles...',
    next: 'Next',
    back: 'Back'
  }
};

// Get text by key
const getText = (key) => {
  const lang = getTelegramLanguage();
  return texts[lang]?.[key] || texts['ru'][key] || key;
};

// Components
const AuthScreen = ({ onAuth }) => {
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (!tg) {
        // For testing without Telegram
        console.log('Mock authentication for testing');
        const mockUser = {
          telegram_id: 123456789,
          first_name: 'Test User',
          username: 'testuser'
        };
        onAuth(mockUser);
        return;
      }

      const initData = tg.initData;
      if (!initData) {
        // Fallback for testing
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
      // Fallback to mock for testing
      const mockUser = {
        telegram_id: 123456789,
        first_name: 'Test User',
        username: 'testuser'
      };
      onAuth(mockUser);
    } finally {
      setLoading(false);
    }
  };

  // Auto-authenticate on mount
  useEffect(() => {
    handleAuth();
  }, []);

  if (loading) {
    return (
      <div className="ton-app">
        <div className="ton-background"></div>
        <div className="ton-content">
          <div className="loading-state">
            <div className="ton-logo">
              <div className="logo-icon">💎</div>
            </div>
            <h1 className="ton-title">{getText('app_name')}</h1>
            <div className="loading-spinner"></div>
            <p className="loading-text">{getText('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ton-app">
      <div className="ton-background"></div>
      <div className="ton-content">
        <div className="welcome-screen">
          <div className="ton-logo">
            <div className="logo-icon">💎</div>
          </div>
          <h1 className="ton-title">{getText('app_name')}</h1>
          <p className="ton-subtitle">{getText('app_subtitle')}</p>
          
          <div className="action-buttons">
            <button className="ton-button primary" onClick={handleAuth}>
              {getText('create_profile')}
            </button>
            <button className="ton-button secondary">
              {getText('connect_wallet')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSetup = ({ user, onComplete, isEdit = false }) => {
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    location: user?.location || ''
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const interests_list = [
    'Спорт', 'Музыка', 'Путешествия', 'Книги', 'Кулинария', 'Фотография',
    'Программирование', 'Искусство', 'Кино', 'Игры', 'Бизнес', 'Мода'
  ];

  const steps = [
    { key: 'name', label: getText('name_label') },
    { key: 'age', label: getText('age_label') },
    { key: 'gender', label: getText('gender_label') },
    { key: 'bio', label: getText('bio_label') },
    { key: 'interests', label: getText('interests_label') },
    { key: 'location', label: getText('location_label') }
  ];

  const handleInterestToggle = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (tg?.HapticFeedback?.impactOccurred) {
        tg.HapticFeedback.impactOccurred('light');
      }
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (tg?.HapticFeedback?.impactOccurred) {
        tg.HapticFeedback.impactOccurred('light');
      }
    }
  };

  const handleSubmit = async () => {
    if (!profile.first_name || !profile.age || !profile.gender || !profile.bio) {
      const message = 'Пожалуйста, заполните все обязательные поля!';
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
      // Fallback for testing
      onComplete({ ...profile, telegram_id: 123456789 });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    switch (step.key) {
      case 'name':
        return (
          <div className="step-content">
            <h2>Как вас зовут?</h2>
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) => setProfile(prev => ({...prev, first_name: e.target.value}))}
              placeholder="Введите ваше имя"
              className="ton-input"
              autoFocus
            />
          </div>
        );
      
      case 'age':
        return (
          <div className="step-content">
            <h2>Сколько вам лет?</h2>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile(prev => ({...prev, age: parseInt(e.target.value) || ''}))}
              placeholder="18"
              min="18"
              max="100"
              className="ton-input"
              autoFocus
            />
          </div>
        );
      
      case 'gender':
        return (
          <div className="step-content">
            <h2>Ваш пол</h2>
            <div className="gender-options">
              <button
                className={`gender-option ${profile.gender === 'male' ? 'selected' : ''}`}
                onClick={() => setProfile(prev => ({...prev, gender: 'male'}))}
              >
                <span className="gender-emoji">👨</span>
                <span>{getText('male')}</span>
              </button>
              <button
                className={`gender-option ${profile.gender === 'female' ? 'selected' : ''}`}
                onClick={() => setProfile(prev => ({...prev, gender: 'female'}))}
              >
                <span className="gender-emoji">👩</span>
                <span>{getText('female')}</span>
              </button>
            </div>
          </div>
        );
      
      case 'bio':
        return (
          <div className="step-content">
            <h2>Расскажите о себе</h2>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
              placeholder="Напишите что-то интересное о себе..."
              className="ton-textarea"
              rows="4"
              autoFocus
            />
          </div>
        );
      
      case 'interests':
        return (
          <div className="step-content">
            <h2>Ваши интересы</h2>
            <div className="interests-grid">
              {interests_list.map(interest => (
                <button
                  key={interest}
                  className={`interest-chip ${profile.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="step-content">
            <h2>Ваш город</h2>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
              placeholder="Москва"
              className="ton-input"
              autoFocus
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.key) {
      case 'name':
        return profile.first_name.length > 0;
      case 'age':
        return profile.age >= 18 && profile.age <= 100;
      case 'gender':
        return profile.gender !== '';
      case 'bio':
        return profile.bio.length > 10;
      case 'interests':
        return profile.interests.length > 0;
      case 'location':
        return true; // Optional
      default:
        return false;
    }
  };

  return (
    <div className="ton-app">
      <div className="ton-background"></div>
      <div className="ton-content">
        <div className="profile-setup">
          <div className="setup-header">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${((currentStep + 1) / steps.length) * 100}%`}}
              ></div>
            </div>
            <button className="back-btn" onClick={handleBack} disabled={currentStep === 0}>
              ‹
            </button>
            <span className="step-counter">{currentStep + 1} / {steps.length}</span>
          </div>

          <div className="setup-content">
            {renderStep()}
          </div>

          <div className="setup-footer">
            <button 
              className={`ton-button primary ${isStepValid() ? 'enabled' : 'disabled'}`}
              onClick={handleNext}
              disabled={!isStepValid() || loading}
            >
              {loading ? getText('saving') : 
               currentStep === steps.length - 1 ? getText('save_profile') : getText('next')}
            </button>
          </div>
        </div>
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
      first_name: 'Анна',
      age: 25,
      gender: 'female',
      bio: 'Люблю путешествия и фотографию 📸 Всегда готова к новым приключениям!',
      interests: ['Путешествия', 'Фотография', 'Музыка'],
      location: 'Москва',
      photos: []
    },
    {
      telegram_id: 555555555,
      first_name: 'Михаил',
      age: 28,
      gender: 'male',
      bio: 'Разработчик и фитнес-энтузиаст 💪 Давайте исследовать мир вместе!',
      interests: ['Программирование', 'Спорт', 'Книги'],
      location: 'Санкт-Петербург',
      photos: []
    }
  ];

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
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
        }
        setCards([]);
        setCurrentCard(null);
        setLoading(false);
        return;
      }

      setCards(data.length > 0 ? data : mockCards);
      setCurrentCard((data.length > 0 ? data : mockCards)[0] || null);
    } catch (error) {
      console.error('Load cards error:', error);
      setCards(mockCards);
      setCurrentCard(mockCards[0] || null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (!currentCard) return;

    if (tg?.HapticFeedback?.impactOccurred) {
      tg.HapticFeedback.impactOccurred(action === 'super_like' ? 'heavy' : 'medium');
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      // Mock match chance
      if (!token) {
        const isMatch = Math.random() > 0.7;
        if (action === 'like' && isMatch) {
          setTimeout(() => {
            setMatchedUser(currentCard);
            setShowMatch(true);
          }, 500);
        }
      }

      // Move to next card
      setTimeout(() => {
        const currentIndex = cards.findIndex(card => card.telegram_id === currentCard.telegram_id);
        const nextCard = cards[currentIndex + 1] || null;
        setCurrentCard(nextCard);
      }, 300);

    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const closeMatchModal = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  if (loading) {
    return (
      <div className="ton-app">
        <div className="ton-background"></div>
        <div className="ton-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">{getText('cards_loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="ton-app">
        <div className="ton-background"></div>
        <div className="ton-content">
          <div className="empty-state">
            <div className="empty-emoji">😊</div>
            <h3>{getText('no_cards')}</h3>
            <p>{getText('try_tomorrow')}</p>
            <button onClick={loadCards} className="ton-button primary">
              {getText('reload')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ton-app">
      <div className="ton-background"></div>
      
      {/* Match Modal */}
      {showMatch && (
        <div className="match-overlay">
          <div className="match-modal">
            <div className="match-animation">
              <div className="match-emoji">🎉</div>
              <h2>{getText('its_match')}</h2>
              
              <div className="match-users">
                <div className="match-user">
                  <div className="match-avatar">
                    {user?.first_name?.charAt(0) || 'У'}
                  </div>
                  <span>{user?.first_name || 'Вы'}</span>
                </div>
                
                <div className="match-heart">💕</div>
                
                <div className="match-user">
                  <div className="match-avatar">
                    {matchedUser?.first_name?.charAt(0)}
                  </div>
                  <span>{matchedUser?.first_name}</span>
                </div>
              </div>
              
              <div className="match-actions">
                <button className="ton-button primary" onClick={closeMatchModal}>
                  {getText('start_chat')}
                </button>
                <button className="ton-button secondary" onClick={closeMatchModal}>
                  {getText('continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ton-content">
        <div className="discover-content">
          <div className="card-stack">
            <div className="dating-card">
              <div className="card-image">
                {currentCard.photos && currentCard.photos.length > 0 ? (
                  <img src={`data:image/jpeg;base64,${currentCard.photos[0]}`} alt={currentCard.first_name} />
                ) : (
                  <div className="card-placeholder">
                    <div className="placeholder-avatar">
                      {currentCard.first_name?.charAt(0)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="card-content">
                <div className="card-header">
                  <h3>{currentCard.first_name}, {currentCard.age}</h3>
                  {currentCard.location && (
                    <span className="location">📍 {currentCard.location}</span>
                  )}
                </div>
                
                <p className="card-bio">{currentCard.bio}</p>
                
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

          <div className="action-buttons">
            <button 
              className="action-btn pass"
              onClick={() => handleSwipe('pass')}
            >
              ✕
            </button>
            <button 
              className="action-btn super"
              onClick={() => handleSwipe('super_like')}
            >
              ⭐
            </button>
            <button 
              className="action-btn like"
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
        first_name: 'Анна',
        age: 25,
        bio: 'Люблю путешествия и фотографию',
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
      setTimeout(() => {
        setMatches(mockMatches);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Load matches error:', error);
      setMatches(mockMatches);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ton-app">
        <div className="ton-background"></div>
        <div className="ton-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">{getText('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="ton-app">
        <div className="ton-background"></div>
        <div className="ton-content">
          <div className="empty-state">
            <div className="empty-emoji">💔</div>
            <h3>{getText('no_matches')}</h3>
            <p>{getText('start_discovering')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ton-app">
      <div className="ton-background"></div>
      <div className="ton-content">
        <div className="matches-content">
          <div className="matches-header">
            <h2>{getText('matches')} ({matches.length})</h2>
          </div>
          
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match.match_id} className="match-card">
                <div className="match-photo">
                  {match.user.photos && match.user.photos.length > 0 ? (
                    <img src={`data:image/jpeg;base64,${match.user.photos[0]}`} alt={match.user.first_name} />
                  ) : (
                    <div className="photo-placeholder">
                      {match.user.first_name?.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="match-info">
                  <h4>{match.user.first_name}</h4>
                  <p>{match.user.age} лет</p>
                  <button className="chat-btn">💬 Чат</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'discover', icon: '🔍', label: getText('discover') },
    { id: 'matches', icon: '💕', label: getText('matches') },
    { id: 'profile', icon: '👤', label: getText('profile') }
  ];

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
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
    }

    // Check existing authentication
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token && !tg) {
        // For testing without Telegram
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        return;
      }

      if (!token) {
        setLoading(false);
        return;
      }

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
      
      // Check if profile needs completion
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
      <div className="ton-app">
        <div className="ton-background"></div>
        <div className="ton-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">{getText('loading')}</p>
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
    <div className="ton-dating-app">
      <div className="app-container">
        {activeTab === 'discover' && <DiscoverScreen user={user} />}
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'profile' && (
          <ProfileSetup 
            user={user} 
            onComplete={(updatedUser) => setUser(updatedUser)}
            isEdit={true}
          />
        )}
      </div>
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;