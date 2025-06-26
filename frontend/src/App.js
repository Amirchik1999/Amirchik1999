import React, { useState, useEffect } from 'react';
import './App.css';

// Telegram Web App SDK with error handling
let tg = null;
try {
  tg = window.Telegram?.WebApp;
} catch (error) {
  console.log('Telegram Web App not available');
}

// API Configuration
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://23276d44-c6c8-4999-aa05-14f02da19e1b.preview.emergentagent.com';

// Realistic user profiles data
const REALISTIC_PROFILES = [
  {
    id: 1,
    name: 'Анна',
    age: 24,
    location: 'Москва',
    distance: '2 км',
    bio: 'Фотограф, люблю путешествия и новые впечатления. Ищу серьёзные отношения 📸✈️',
    interests: ['Фотография', 'Путешествия', 'Кофе'],
    photos: ['👩‍🦰'],
    isOnline: true
  },
  {
    id: 2,
    name: 'Дмитрий',
    age: 28,
    location: 'Санкт-Петербург',
    distance: '5 км',
    bio: 'IT-разработчик, занимаюсь спортом. Люблю активный отдых и интересные беседы 💻🏋️',
    interests: ['Программирование', 'Спорт', 'Кино'],
    photos: ['👨‍💻'],
    isOnline: false
  },
  {
    id: 3,
    name: 'Екатерина',
    age: 26,
    location: 'Москва',
    distance: '3 км',
    bio: 'Дизайнер, творческая личность. Обожаю искусство и хорошую музыку 🎨🎵',
    interests: ['Дизайн', 'Искусство', 'Музыка'],
    photos: ['👩‍🎨'],
    isOnline: true
  },
  {
    id: 4,
    name: 'Александр',
    age: 30,
    location: 'Москва',
    distance: '1 км',
    bio: 'Предприниматель, люблю природу и активный образ жизни. Ищу единомышленницу 🌲🚴',
    interests: ['Бизнес', 'Природа', 'Велоспорт'],
    photos: ['👨‍💼'],
    isOnline: false
  },
  {
    id: 5,
    name: 'Мария',
    age: 23,
    location: 'Москва',
    distance: '4 км',
    bio: 'Студентка медицинского, волонтёр. Ценю доброту и искренность ❤️🩺',
    interests: ['Медицина', 'Волонтёрство', 'Книги'],
    photos: ['👩‍⚕️'],
    isOnline: true
  }
];

// Language texts
const texts = {
  app_name: 'TON Dating',
  welcome_subtitle: 'Знакомства в Telegram.\nНайдите свою вторую половинку\nрядом с вами.',
  create_profile: 'Создать профиль',
  connect_wallet: 'Подключить кошелёк',
  discover: 'Поиск',
  matches: 'Пары',
  profile: 'Профиль',
  chat: 'Чаты',
  its_match: 'ЭТО МЭТЧ!',
  start_chat: 'Начать чат',
  continue_swiping: 'Продолжить',
  no_more_cards: 'Больше нет профилей',
  try_tomorrow: 'Попробуйте завтра!',
  no_matches: 'Пока нет совпадений',
  start_discovering: 'Начните поиск!',
  online: 'В сети',
  recently_active: 'Недавно был(а)',
  name_question: 'Как вас зовут?',
  age_question: 'Сколько вам лет?',
  bio_question: 'Расскажите о себе',
  location_question: 'Ваш город',
  interests_question: 'Ваши интересы',
  next: 'Далее',
  back: 'Назад',
  save: 'Сохранить',
  enable_location: 'Разрешить геолокацию',
  location_help: 'Для поиска людей рядом с вами'
};

// Location service
const LocationService = {
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          // Fallback to Moscow coordinates
          resolve({
            latitude: 55.7558,
            longitude: 37.6173
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }
};

// Welcome Screen Component
const WelcomeScreen = ({ onCreateProfile, onConnectWallet }) => {
  return (
    <div className="app-screen welcome-screen">
      <div className="welcome-content">
        <div className="logo-section">
          <div className="app-logo">
            <div className="diamond-icon">💎</div>
          </div>
          <h1 className="app-title">{texts.app_name}</h1>
        </div>
        
        <div className="welcome-text">
          <p>{texts.welcome_subtitle}</p>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={onCreateProfile}>
            {texts.create_profile}
          </button>
          <button className="btn btn-secondary" onClick={onConnectWallet}>
            {texts.connect_wallet}
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Setup Component
const ProfileSetup = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: '',
    location: '',
    interests: []
  });
  const [location, setLocation] = useState(null);

  const interests_list = [
    'Спорт', 'Музыка', 'Путешествия', 'Книги', 'Кулинария', 'Фотография',
    'Программирование', 'Искусство', 'Кино', 'Игры', 'Бизнес', 'Мода',
    'Наука', 'Природа', 'Танцы', 'Йога'
  ];

  const steps = [
    { key: 'name', title: texts.name_question },
    { key: 'age', title: texts.age_question },
    { key: 'bio', title: texts.bio_question },
    { key: 'location', title: texts.location_question },
    { key: 'interests', title: texts.interests_question }
  ];

  const handleLocationRequest = async () => {
    try {
      const pos = await LocationService.getCurrentPosition();
      setLocation(pos);
      setProfile(prev => ({ ...prev, location: 'Москва' })); // Mock city
    } catch (error) {
      console.error('Location error:', error);
      setProfile(prev => ({ ...prev, location: 'Москва' }));
    }
  };

  const handleNext = () => {
    if (isValid()) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        onComplete({ ...profile, location });
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const isValid = () => {
    const currentStep = steps[step];
    switch (currentStep.key) {
      case 'name': return profile.name.length >= 2;
      case 'age': return profile.age >= 18 && profile.age <= 100;
      case 'bio': return profile.bio.length >= 10;
      case 'location': return profile.location.length > 0;
      case 'interests': return profile.interests.length >= 2;
      default: return true;
    }
  };

  const renderStepContent = () => {
    const currentStep = steps[step];
    
    switch (currentStep.key) {
      case 'name':
        return (
          <div className="step-content">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите ваше имя"
              className="text-input"
            />
          </div>
        );
      
      case 'age':
        return (
          <div className="step-content">
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || '' }))}
              placeholder="18"
              min="18"
              max="100"
              className="text-input"
            />
          </div>
        );
      
      case 'bio':
        return (
          <div className="step-content">
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Расскажите о себе, своих интересах и том, кого ищете..."
              className="text-area"
              rows="4"
            />
          </div>
        );
      
      case 'location':
        return (
          <div className="step-content">
            <div className="location-section">
              <button className="btn btn-primary" onClick={handleLocationRequest}>
                📍 {texts.enable_location}
              </button>
              <p className="help-text">{texts.location_help}</p>
              {profile.location && (
                <div className="location-result">
                  <span>📍 {profile.location}</span>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'interests':
        return (
          <div className="step-content">
            <div className="interests-grid">
              {interests_list.map(interest => (
                <button
                  key={interest}
                  className={`interest-tag ${profile.interests.includes(interest) ? 'selected' : ''}`}
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
      
      default:
        return null;
    }
  };

  return (
    <div className="app-screen setup-screen">
      <div className="setup-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="step-counter">{step + 1} / {steps.length}</span>
      </div>
      
      <div className="setup-content">
        <h2 className="step-title">{steps[step].title}</h2>
        {renderStepContent()}
      </div>
      
      <div className="setup-actions">
        {step > 0 && (
          <button className="btn btn-secondary" onClick={handleBack}>
            {texts.back}
          </button>
        )}
        <button 
          className={`btn btn-primary ${!isValid() ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!isValid()}
        >
          {step === steps.length - 1 ? texts.save : texts.next}
        </button>
      </div>
    </div>
  );
};

// Discover Screen Component
const DiscoverScreen = ({ user }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);

  const currentCard = REALISTIC_PROFILES[currentCardIndex];

  const handleSwipe = (action) => {
    if (!currentCard) return;

    // Show match animation sometimes
    if (action === 'like' && Math.random() > 0.7) {
      setMatchedUser(currentCard);
      setShowMatch(true);
    }

    // Move to next card
    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1);
    }, 300);
  };

  if (!currentCard) {
    return (
      <div className="app-screen discover-screen">
        <div className="empty-state">
          <div className="empty-icon">😊</div>
          <h3>{texts.no_more_cards}</h3>
          <p>{texts.try_tomorrow}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-screen discover-screen">
      {/* Match Modal */}
      {showMatch && (
        <div className="match-modal">
          <div className="match-content">
            <div className="match-icon">🎉</div>
            <h2>{texts.its_match}</h2>
            <div className="match-users">
              <div className="user-avatar">{user?.name?.charAt(0) || 'Я'}</div>
              <div className="heart-icon">💕</div>
              <div className="user-avatar">{matchedUser?.name?.charAt(0)}</div>
            </div>
            <div className="match-actions">
              <button className="btn btn-primary" onClick={() => setShowMatch(false)}>
                {texts.start_chat}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowMatch(false)}>
                {texts.continue_swiping}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="discover-content">
        <div className="card-stack">
          <div className="profile-card">
            <div className="card-photo">
              <div className="photo-placeholder">
                <span className="avatar-emoji">{currentCard.photos[0]}</span>
              </div>
              {currentCard.isOnline && (
                <div className="online-indicator">
                  <span className="status-dot"></span>
                  {texts.online}
                </div>
              )}
            </div>
            
            <div className="card-info">
              <div className="card-header">
                <h3>{currentCard.name}, {currentCard.age}</h3>
                <span className="distance">{currentCard.distance}</span>
              </div>
              
              <div className="location">
                📍 {currentCard.location}
              </div>
              
              <p className="bio">{currentCard.bio}</p>
              
              <div className="interests">
                {currentCard.interests.map((interest, index) => (
                  <span key={index} className="interest-tag small">{interest}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="swipe-actions">
          <button 
            className="action-btn reject" 
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
  );
};

// Matches Screen Component
const MatchesScreen = () => {
  const matches = REALISTIC_PROFILES.slice(0, 3);

  return (
    <div className="app-screen matches-screen">
      <div className="screen-header">
        <h2>{texts.matches} ({matches.length})</h2>
      </div>
      
      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h3>{texts.no_matches}</h3>
          <p>{texts.start_discovering}</p>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div key={match.id} className="match-item">
              <div className="match-avatar">
                {match.photos[0]}
              </div>
              <div className="match-info">
                <h4>{match.name}</h4>
                <p>{match.age} лет • {match.distance}</p>
                {match.isOnline && (
                  <span className="online-status">{texts.online}</span>
                )}
              </div>
              <button className="chat-btn">💬</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Bottom Navigation Component
const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'discover', icon: '🔍', label: texts.discover },
    { id: 'matches', icon: '💕', label: texts.matches },
    { id: 'chat', icon: '💬', label: texts.chat },
    { id: 'profile', icon: '👤', label: texts.profile }
  ];

  return (
    <div className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    // Telegram Web App initialization with error handling
    try {
      if (tg) {
        tg.ready();
        tg.expand();
        tg.MainButton.hide();
      }
    } catch (error) {
      console.log('Telegram Web App not available:', error);
    }
  }, []);

  const handleCreateProfile = () => {
    setCurrentScreen('setup');
  };

  const handleConnectWallet = () => {
    try {
      if (tg?.showAlert) {
        tg.showAlert('Функция подключения кошелька будет доступна скоро');
      } else {
        alert('Функция подключения кошелька будет доступна скоро');
      }
    } catch (error) {
      alert('Функция подключения кошелька будет доступна скоро');
    }
  };

  const handleProfileComplete = (profileData) => {
    setUser(profileData);
    setCurrentScreen('app');
  };

  // Render different screens
  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen 
        onCreateProfile={handleCreateProfile}
        onConnectWallet={handleConnectWallet}
      />
    );
  }

  if (currentScreen === 'setup') {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  // Main app with bottom navigation
  return (
    <div className="dating-app">
      <div className="app-content">
        {activeTab === 'discover' && <DiscoverScreen user={user} />}
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'chat' && (
          <div className="app-screen">
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Чаты</h3>
              <p>Здесь будут ваши беседы</p>
            </div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="app-screen">
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>Профиль</h3>
              <p>Настройки профиля</p>
            </div>
          </div>
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;