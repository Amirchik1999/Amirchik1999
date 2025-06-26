import React, { useState, useEffect } from 'react';
import './App.css';

// Telegram Web App SDK
const tg = window.Telegram?.WebApp;

// API Configuration
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://23276d44-c6c8-4999-aa05-14f02da19e1b.preview.emergentagent.com';

// Language detection - always Russian like real TON Dating
const getTelegramLanguage = () => {
  return 'ru';
};

// Exact texts from TON Dating
const texts = {
  'ru': {
    welcome_title: 'Добро пожаловать в TON Dating',
    app_name: 'TON Dating',
    welcome_subtitle: 'Знакомства в Telegram.\nПрисоединяйтесь к сообществу\nамбициозных и реальных людей.',
    create_profile: 'Создать профиль',
    connect_wallet: 'Подключить кошелёк',
    loading: 'Загрузка...',
    name_question: 'Как вас зовут?',
    age_question: 'Сколько вам лет?',
    gender_question: 'Ваш пол',
    male: 'Мужской',
    female: 'Женский',
    bio_question: 'Расскажите о себе',
    interests_question: 'Ваши интересы',
    location_question: 'Ваш город',
    save_profile: 'Сохранить',
    next: 'Далее',
    back: 'Назад',
    discover: 'Поиск',
    matches: 'Пары',
    profile: 'Профиль',
    its_match: 'СОВПАДЕНИЕ!',
    start_chat: 'Начать чат',
    continue_swiping: 'Продолжить',
    no_more_cards: 'Больше нет профилей',
    try_tomorrow: 'Завтра появятся новые!',
    no_matches: 'Пока нет совпадений',
    start_discovering: 'Начните поиск новых людей!'
  }
};

const getText = (key) => {
  const lang = getTelegramLanguage();
  return texts[lang]?.[key] || texts['ru'][key] || key;
};

// Intro Screen - "Добро пожаловать в TON Dating"
const IntroScreen = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 3000); // Show for 3 seconds
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="ton-app">
      <div className="ton-background">
        <div className="pattern-overlay"></div>
      </div>
      <div className="ton-content">
        <div className="intro-container">
          <div className="intro-icon">💎</div>
          <h1 className="intro-title">{getText('welcome_title')}</h1>
          <p className="intro-subtitle">
            Эксклюзивное сообщество для знакомств на базе Telegram — там, где реальные девушки встречают интересных парней.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Welcome Screen - with TON Dating logo and buttons
const WelcomeScreen = ({ onCreateProfile, onConnectWallet }) => {
  return (
    <div className="ton-app">
      <div className="ton-background">
        <div className="pattern-overlay"></div>
      </div>
      <div className="ton-content">
        <div className="welcome-container">
          {/* TON Dating Logo */}
          <div className="ton-logo-container">
            <div className="ton-logo">
              <div className="logo-diamond">💎</div>
            </div>
            <h1 className="app-title">{getText('app_name')}</h1>
          </div>
          
          {/* Welcome text */}
          <div className="welcome-text">
            <p>{getText('welcome_subtitle')}</p>
          </div>
          
          {/* Action buttons */}
          <div className="welcome-actions">
            <button 
              className="ton-btn primary"
              onClick={onCreateProfile}
            >
              {getText('create_profile')}
            </button>
            
            <button 
              className="ton-btn secondary"
              onClick={onConnectWallet}
            >
              {getText('connect_wallet')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSetup = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    age: '',
    gender: '',
    bio: '',
    interests: [],
    location: ''
  });

  const interests_list = [
    'Спорт', 'Музыка', 'Путешествия', 'Книги', 'Кулинария', 'Фотография',
    'Программирование', 'Искусство', 'Кино', 'Игры', 'Бизнес', 'Мода'
  ];

  const steps = [
    { key: 'name', question: getText('name_question') },
    { key: 'age', question: getText('age_question') },
    { key: 'gender', question: getText('gender_question') },
    { key: 'bio', question: getText('bio_question') },
    { key: 'interests', question: getText('interests_question') },
    { key: 'location', question: getText('location_question') }
  ];

  const handleNext = () => {
    if (isStepValid()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete({ ...profile, telegram_id: 123456789 });
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.key) {
      case 'name': return profile.first_name.length > 0;
      case 'age': return profile.age >= 18 && profile.age <= 100;
      case 'gender': return profile.gender !== '';
      case 'bio': return profile.bio.length > 10;
      case 'interests': return profile.interests.length > 0;
      case 'location': return true; // Optional
      default: return false;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.key) {
      case 'name':
        return (
          <div className="step-input-container">
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) => setProfile(prev => ({...prev, first_name: e.target.value}))}
              placeholder="Введите ваше имя"
              className="step-input"
              autoFocus
            />
          </div>
        );
      
      case 'age':
        return (
          <div className="step-input-container">
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile(prev => ({...prev, age: parseInt(e.target.value) || ''}))}
              placeholder="18"
              min="18"
              max="100"
              className="step-input"
              autoFocus
            />
          </div>
        );
      
      case 'gender':
        return (
          <div className="gender-selection">
            <button
              className={`gender-btn ${profile.gender === 'male' ? 'selected' : ''}`}
              onClick={() => setProfile(prev => ({...prev, gender: 'male'}))}
            >
              <span className="gender-icon">👨</span>
              <span>{getText('male')}</span>
            </button>
            <button
              className={`gender-btn ${profile.gender === 'female' ? 'selected' : ''}`}
              onClick={() => setProfile(prev => ({...prev, gender: 'female'}))}
            >
              <span className="gender-icon">👩</span>
              <span>{getText('female')}</span>
            </button>
          </div>
        );
      
      case 'bio':
        return (
          <div className="step-input-container">
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
              placeholder="Напишите что-то интересное о себе..."
              className="step-textarea"
              rows="4"
              autoFocus
            />
          </div>
        );
      
      case 'interests':
        return (
          <div className="interests-container">
            <div className="interests-grid">
              {interests_list.map(interest => (
                <button
                  key={interest}
                  className={`interest-btn ${profile.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => {
                    setProfile(prev => ({
                      ...prev,
                      interests: prev.interests.includes(interest)
                        ? prev.interests.filter(i => i !== interest)
                        : [...prev.interests, interest]
                    }));
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="step-input-container">
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
              placeholder="Москва"
              className="step-input"
              autoFocus
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="ton-app">
      <div className="ton-background">
        <div className="pattern-overlay"></div>
      </div>
      
      <div className="ton-content">
        <div className="profile-setup-container">
          {/* Progress */}
          <div className="setup-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${((currentStep + 1) / steps.length) * 100}%`}}
              />
            </div>
            <span className="progress-text">{currentStep + 1} / {steps.length}</span>
          </div>
          
          {/* Question */}
          <div className="setup-question">
            <h2>{steps[currentStep].question}</h2>
          </div>
          
          {/* Step content */}
          <div className="setup-content">
            {renderStepContent()}
          </div>
          
          {/* Navigation */}
          <div className="setup-navigation">
            {currentStep > 0 && (
              <button className="nav-btn secondary" onClick={handleBack}>
                {getText('back')}
              </button>
            )}
            <button 
              className={`nav-btn primary ${isStepValid() ? '' : 'disabled'}`}
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === steps.length - 1 ? getText('save_profile') : getText('next')}
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

  // Mock data
  const mockCards = [
    {
      telegram_id: 1,
      first_name: 'Анна',
      age: 25,
      bio: 'Люблю путешествия и фотографию 📸',
      interests: ['Путешествия', 'Фотография', 'Музыка'],
      location: 'Москва',
      photos: []
    },
    {
      telegram_id: 2,
      first_name: 'Михаил',
      age: 28,
      bio: 'Разработчик и фитнес-энтузиаст 💪',
      interests: ['Программирование', 'Спорт', 'Книги'],
      location: 'Санкт-Петербург',
      photos: []
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setCards(mockCards);
      setCurrentCard(mockCards[0]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSwipe = (action) => {
    if (!currentCard) return;

    // Show match sometimes
    if (action === 'like' && Math.random() > 0.7) {
      setMatchedUser(currentCard);
      setShowMatch(true);
    }

    // Move to next card
    setTimeout(() => {
      const currentIndex = cards.findIndex(c => c.telegram_id === currentCard.telegram_id);
      const nextCard = cards[currentIndex + 1] || null;
      setCurrentCard(nextCard);
    }, 300);
  };

  if (loading) {
    return (
      <div className="ton-app">
        <div className="ton-background">
          <div className="pattern-overlay"></div>
        </div>
        <div className="ton-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загружаем профили...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="ton-app">
        <div className="ton-background">
          <div className="pattern-overlay"></div>
        </div>
        <div className="ton-content">
          <div className="empty-container">
            <div className="empty-icon">😊</div>
            <h3>{getText('no_more_cards')}</h3>
            <p>{getText('try_tomorrow')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ton-app">
      <div className="ton-background">
        <div className="pattern-overlay"></div>
      </div>
      
      {/* Match Modal */}
      {showMatch && (
        <div className="match-overlay">
          <div className="match-container">
            <div className="match-icon">🎉</div>
            <h2>{getText('its_match')}</h2>
            <div className="match-users">
              <div className="match-user">
                <div className="user-avatar">{user?.first_name?.charAt(0) || 'У'}</div>
                <span>{user?.first_name || 'Вы'}</span>
              </div>
              <div className="match-heart">💕</div>
              <div className="match-user">
                <div className="user-avatar">{matchedUser?.first_name?.charAt(0)}</div>
                <span>{matchedUser?.first_name}</span>
              </div>
            </div>
            <div className="match-actions">
              <button className="ton-btn primary" onClick={() => setShowMatch(false)}>
                {getText('start_chat')}
              </button>
              <button className="ton-btn secondary" onClick={() => setShowMatch(false)}>
                {getText('continue_swiping')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="ton-content">
        <div className="discover-container">
          {/* Card */}
          <div className="card-container">
            <div className="profile-card">
              <div className="card-photo">
                <div className="photo-placeholder">
                  <span>{currentCard.first_name?.charAt(0)}</span>
                </div>
              </div>
              <div className="card-info">
                <div className="card-header">
                  <h3>{currentCard.first_name}, {currentCard.age}</h3>
                  {currentCard.location && <span className="location">📍 {currentCard.location}</span>}
                </div>
                <p className="card-bio">{currentCard.bio}</p>
                {currentCard.interests && (
                  <div className="card-tags">
                    {currentCard.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="tag">{interest}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="card-actions">
            <button className="action-btn reject" onClick={() => handleSwipe('pass')}>
              ✕
            </button>
            <button className="action-btn super" onClick={() => handleSwipe('super_like')}>
              ⭐
            </button>
            <button className="action-btn like" onClick={() => handleSwipe('like')}>
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchesScreen = () => {
  const [matches] = useState([
    {
      id: 1,
      user: {
        first_name: 'Анна',
        age: 25,
        photos: []
      }
    }
  ]);

  return (
    <div className="ton-app">
      <div className="ton-background">
        <div className="pattern-overlay"></div>
      </div>
      <div className="ton-content">
        <div className="matches-container">
          <div className="matches-header">
            <h2>{getText('matches')} ({matches.length})</h2>
          </div>
          
          {matches.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">💔</div>
              <h3>{getText('no_matches')}</h3>
              <p>{getText('start_discovering')}</p>
            </div>
          ) : (
            <div className="matches-list">
              {matches.map((match) => (
                <div key={match.id} className="match-item">
                  <div className="match-avatar">
                    {match.user.first_name?.charAt(0)}
                  </div>
                  <div className="match-info">
                    <h4>{match.user.first_name}</h4>
                    <p>{match.user.age} лет</p>
                  </div>
                  <button className="chat-button">💬</button>
                </div>
              ))}
            </div>
          )}
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
  const [currentScreen, setCurrentScreen] = useState('intro'); // intro -> welcome -> profile -> app
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.MainButton.hide();
    }
  }, []);

  const handleIntroComplete = () => {
    setCurrentScreen('welcome');
  };

  const handleCreateProfile = () => {
    setCurrentScreen('profile');
    setUser({ telegram_id: 123456789, first_name: 'Пользователь' });
  };

  const handleConnectWallet = () => {
    if (tg?.showAlert) {
      tg.showAlert('Функция подключения кошелька пока недоступна');
    } else {
      alert('Функция подключения кошелька пока недоступна');
    }
  };

  const handleProfileComplete = (profileData) => {
    setUser(profileData);
    setCurrentScreen('app');
  };

  // Intro sequence
  if (currentScreen === 'intro') {
    return <IntroScreen onContinue={handleIntroComplete} />;
  }

  // Welcome screen with buttons
  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen 
        onCreateProfile={handleCreateProfile}
        onConnectWallet={handleConnectWallet}
      />
    );
  }

  // Profile setup
  if (currentScreen === 'profile') {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} />;
  }

  // Main app
  return (
    <div className="ton-dating-app">
      <div className="app-content">
        {activeTab === 'discover' && <DiscoverScreen user={user} />}
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'profile' && (
          <ProfileSetup user={user} onComplete={(u) => setUser(u)} />
        )}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;