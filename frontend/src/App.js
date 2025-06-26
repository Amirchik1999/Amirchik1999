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

// Language texts - dynamic based on user selection
const TEXTS = {
  en: {
    app_name: 'LinkUp Dating',
    welcome_subtitle: 'Dating Mini App.\nMeet people nearby\nand start meaningful connections.',
    create_profile: 'Create Profile',
    connect_wallet: 'Connect Wallet',
    discover: 'Discover',
    matches: 'Matches',
    profile: 'Profile',
    chat: 'Chats',
    its_match: 'IT\'S A MATCH!',
    start_chat: 'Start Chat',
    continue_swiping: 'Continue Swiping',
    no_more_cards: 'No more profiles',
    try_tomorrow: 'Try again tomorrow!',
    no_matches: 'No matches yet',
    start_discovering: 'Start discovering people!',
    online: 'Online',
    recently_active: 'Recently active',
    name_question: 'What\'s your name?',
    age_question: 'How old are you?',
    bio_question: 'Tell us about yourself',
    location_question: 'Your city',
    interests_question: 'Your interests',
    next: 'Next',
    back: 'Back',
    save: 'Save',
    enable_location: 'Enable Location',
    location_help: 'To find people near you'
  },
  ru: {
    app_name: 'LinkUp Dating',
    welcome_subtitle: 'Мини Приложение Знакомств.\nВстречайте людей рядом\nи создавайте связи.',
    create_profile: 'Создать Профиль',
    connect_wallet: 'Подключить Кошелёк',
    discover: 'Поиск',
    matches: 'Пары',
    profile: 'Профиль',
    chat: 'Чаты',
    its_match: 'ЭТО СОВПАДЕНИЕ!',
    start_chat: 'Начать Чат',
    continue_swiping: 'Продолжить',
    no_more_cards: 'Больше нет профилей',
    try_tomorrow: 'Попробуйте завтра!',
    no_matches: 'Пока нет совпадений',
    start_discovering: 'Начните поиск людей!',
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
    enable_location: 'Разрешить Геолокацию',
    location_help: 'Для поиска людей рядом с вами'
  },
  uz: {
    app_name: 'LinkUp Dating',
    welcome_subtitle: 'Tanishuv Mini Ilova.\nYaqin atrofdagi odamlar bilan\ntanishing va aloqa o\'rnatishni boshlang.',
    create_profile: 'Profil Yaratish',
    connect_wallet: 'Hamyon Ulash',
    discover: 'Qidiruv',
    matches: 'Matchlar',
    profile: 'Profil',
    chat: 'Chatlar',
    its_match: 'BU MATCH!',
    start_chat: 'Chat Boshlash',
    continue_swiping: 'Davom Etish',
    no_more_cards: 'Boshqa profil yo\'q',
    try_tomorrow: 'Ertaga qayta urinib ko\'ring!',
    no_matches: 'Hali matchlar yo\'q',
    start_discovering: 'Odamlarni qidirishni boshlang!',
    online: 'Onlayn',
    recently_active: 'Yaqinda faol bo\'lgan',
    name_question: 'Ismingiz nima?',
    age_question: 'Necha yoshdasiz?',
    bio_question: 'O\'zingiz haqingizda gapirib bering',
    location_question: 'Shaharingiz',
    interests_question: 'Qiziqishlaringiz',
    next: 'Keyingi',
    back: 'Orqaga',
    save: 'Saqlash',
    enable_location: 'Joylashuvni Ruxsat Berish',
    location_help: 'Yaqin atrofdagi odamlarni topish uchun'
  }
};

// Get user language from Telegram or URL
const getUserLanguage = () => {
  // Try to get from Telegram WebApp first
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
    const tgLang = window.Telegram.WebApp.initDataUnsafe.user.language_code;
    if (tgLang.startsWith('ru')) return 'ru';
    if (tgLang.startsWith('uz')) return 'uz';
    if (tgLang.startsWith('en')) return 'en';
  }
  
  // Try URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && TEXTS[urlLang]) return urlLang;
  
  // Try browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('uz')) return 'uz';
  
  // Default to Russian for wider audience
  return 'ru';
};

// Current user language
const USER_LANGUAGE = getUserLanguage();

// Get text function
const getText = (key) => {
  return TEXTS[USER_LANGUAGE][key] || TEXTS['uz'][key] || key;
};


// Location service with real city detection
const LocationService = {
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Get real city name from coordinates
          try {
            const cityName = await LocationService.getCityFromCoords(coords.latitude, coords.longitude);
            resolve({
              ...coords,
              city: cityName
            });
          } catch (error) {
            // If city detection fails, use coordinates with unknown city
            resolve({
              ...coords,
              city: `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`
            });
          }
        },
        (error) => {
          console.log('GPS Error:', error);
          // Fallback to Moscow only if GPS completely fails
          resolve({
            latitude: 55.7558,
            longitude: 37.6173,
            city: 'Москва'
          });
        },
        { 
          timeout: 10000, 
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  },

  getCityFromCoords: async (lat, lng) => {
    try {
      // Use Nominatim OpenStreetMap API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ru`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      // Extract city name in order of preference
      const address = data.address || {};
      const cityName = 
        address.city || 
        address.town || 
        address.village || 
        address.municipality || 
        address.county || 
        address.state ||
        address.country ||
        'Неизвестный город';
        
      return cityName;
    } catch (error) {
      console.error('City detection error:', error);
      
      // Fallback to nearest known city based on coordinates
      return LocationService.findNearestCity(lat, lng);
    }
  },

  findNearestCity: (lat, lng) => {
    // Calculate distance to known cities
    let nearestCity = 'Неизвестный город';
    let minDistance = Infinity;
    
    const cities = {
      "Москва": { lat: 55.7558, lng: 37.6173 },
      "Санкт-Петербург": { lat: 59.9311, lng: 30.3609 },
      "Новосибирск": { lat: 55.0084, lng: 82.9357 },
      "Екатеринбург": { lat: 56.8431, lng: 60.6454 },
      "Казань": { lat: 55.8304, lng: 49.0661 },
      "Нижний Новгород": { lat: 56.2965, lng: 43.9361 },
      "Челябинск": { lat: 55.1644, lng: 61.4368 },
      "Самара": { lat: 53.2415, lng: 50.2212 },
      "Омск": { lat: 54.9893, lng: 73.3682 },
      "Ростов-на-Дону": { lat: 47.2357, lng: 39.7015 },
      "Уфа": { lat: 54.7388, lng: 55.9721 },
      "Красноярск": { lat: 56.0184, lng: 92.8672 },
      "Пермь": { lat: 58.0105, lng: 56.2502 },
      "Воронеж": { lat: 51.6720, lng: 39.1843 },
      "Волгоград": { lat: 48.7080, lng: 44.5133 },
      "Краснодар": { lat: 45.0355, lng: 38.9753 },
      "Саратов": { lat: 51.5924, lng: 46.0348 },
      "Тюмень": { lat: 57.1522, lng: 65.5272 },
      "Тольятти": { lat: 53.5303, lng: 49.3461 },
      "Ижевск": { lat: 56.8431, lng: 53.2045 }
    };
    
    for (const [cityName, coords] of Object.entries(cities)) {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
      }
    }
    
    return nearestCity;
  }
};

// Intro Splash Screen Component - Auto detects user language
const IntroSplashScreen = ({ onContinue }) => {
  const [currentLang, setCurrentLang] = useState(0);
  
  const introTexts = [
    {
      lang: "🇺🇿 O'zbekcha",
      title: "LinkUp Dating",
      subtitle: "Professional tanishuv platformasi",
      description: "Faqat haqiqiy odamlar. Faqat tekshirilgan profillar.\nTanishing, muloqot qiling va o'zingizga mos odamlarni toping.🖤"
    },
    {
      lang: "🇷🇺 Русский",
      title: "LinkUp Dating", 
      subtitle: "Профессиональная платформа знакомств",
      description: "Только реальные люди. Только проверенные анкеты.\nЗнакомься, общайся и находи тех, кто тебе подходит.🖤"
    },
    {
      lang: "🇺🇸 English",
      title: "LinkUp Dating",
      subtitle: "Professional Dating Platform", 
      description: "Only real people. Only verified profiles.\nMeet, chat and find those who suit you.🖤"
    }
  ];

  useEffect(() => {
    // Detect user language and set initial language
    const userLang = getUserLanguage();
    const langIndex = userLang === 'ru' ? 1 : userLang === 'en' ? 2 : 0;
    setCurrentLang(langIndex);

    // Auto cycle through languages starting from user's language
    const interval = setInterval(() => {
      setCurrentLang(prev => (prev + 1) % 3);
    }, 3000); // 3 seconds per language

    // Auto continue after 10 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onContinue]);

  const currentText = introTexts[currentLang];

  return (
    <div className="intro-splash-screen">
      <div className="intro-background">
        <div className="pattern-overlay"></div>
      </div>
      
      <div className="intro-splash-content">
        {/* Professional Logo - Updated */}
        <div className="intro-logo-section">
          <div className="intro-logo-container">
            <div className="professional-heart-logo">
              <svg viewBox="0 0 200 60" className="intro-logo-svg">
                {/* Heart shape background */}
                <path d="M20,40 C20,25 35,15 50,25 C65,15 80,25 80,40 C80,55 50,75 50,75 C50,75 20,55 20,40 Z" 
                      fill="#f8f9fa" stroke="#e0e0e0" strokeWidth="1"/>
                
                {/* Female symbol inside heart */}
                <g transform="translate(40, 35)">
                  <circle cx="0" cy="0" r="6" fill="none" stroke="#2d3436" strokeWidth="2"/>
                  <line x1="0" y1="6" x2="0" y2="15" stroke="#2d3436" strokeWidth="2"/>
                  <line x1="-4" y1="11" x2="4" y2="11" stroke="#2d3436" strokeWidth="2"/>
                </g>
                
                {/* Male symbol */}
                <g transform="translate(60, 35)">
                  <circle cx="0" cy="0" r="6" fill="none" stroke="#2d3436" strokeWidth="2"/>
                  <line x1="4" y1="-4" x2="10" y2="-10" stroke="#2d3436" strokeWidth="2"/>
                  <line x1="10" y1="-10" x2="10" y2="-6" stroke="#2d3436" strokeWidth="2"/>
                  <line x1="10" y1="-10" x2="6" y2="-10" stroke="#2d3436" strokeWidth="2"/>
                </g>
                
                {/* LinkUp text */}
                <text x="105" y="25" fill="#ffffff" fontSize="18" fontWeight="700" fontFamily="Arial, sans-serif">
                  LinkUp
                </text>
                {/* Dating text */}
                <text x="105" y="45" fill="#ffffff" fontSize="18" fontWeight="700" fontFamily="Arial, sans-serif">
                  Dating
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Language indicator */}
        <div className="language-indicator">
          <span className="current-language">{currentText.lang}</span>
        </div>

        {/* Description */}
        <div className="intro-description">
          <p>{currentText.description}</p>
        </div>

        {/* Language dots */}
        <div className="language-dots">
          {introTexts.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${currentLang === index ? 'active' : ''}`}
              onClick={() => setCurrentLang(index)}
            />
          ))}
        </div>

        {/* Continue button */}
        <div className="intro-actions">
          <button className="intro-continue-btn" onClick={onContinue}>
            <span>Continue • Продолжить • Davom etish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
// Welcome Screen Component
const WelcomeScreen = ({ onCreateProfile, onConnectWallet }) => {
  return (
    <div className="app-screen welcome-screen">
      <div className="welcome-content">
        <div className="logo-section">
          <div className="app-logo">
            <div className="professional-logo">
              <svg viewBox="0 0 120 120" className="logo-svg">
                <defs>
                  <clipPath id="heartClip">
                    <path d="M60,100 C60,100 20,65 20,40 C20,27 30,15 45,15 C52,15 57,20 60,28 C63,20 68,15 75,15 C90,15 100,27 100,40 C100,65 60,100 60,100 Z"/>
                  </clipPath>
                </defs>
                
                {/* Heart background with border */}
                <path d="M60,100 C60,100 20,65 20,40 C20,27 30,15 45,15 C52,15 57,20 60,28 C63,20 68,15 75,15 C90,15 100,27 100,40 C100,65 60,100 60,100 Z" 
                      fill="#f8f9fa" stroke="#e0e0e0" strokeWidth="2"/>
                
                {/* Left half (white/light) */}
                <rect x="0" y="0" width="60" height="120" fill="#f8f9fa" clipPath="url(#heartClip)"/>
                
                {/* Right half (dark) */}
                <rect x="60" y="0" width="60" height="120" fill="#2d3436" clipPath="url(#heartClip)"/>
                
                {/* Female symbol (♀) - left side, moved more inside */}
                <g transform="translate(40, 45)">
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#2d3436" strokeWidth="3"/>
                  <line x1="0" y1="9" x2="0" y2="22" stroke="#2d3436" strokeWidth="3"/>
                  <line x1="-7" y1="16" x2="7" y2="16" stroke="#2d3436" strokeWidth="3"/>
                </g>
                
                {/* Male symbol (♂) - right side, moved more inside */}
                <g transform="translate(80, 45)">
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#f8f9fa" strokeWidth="3"/>
                  <line x1="7" y1="-7" x2="16" y2="-16" stroke="#f8f9fa" strokeWidth="3"/>
                  <line x1="16" y1="-16" x2="16" y2="-9" stroke="#f8f9fa" strokeWidth="3"/>
                  <line x1="16" y1="-16" x2="9" y2="-16" stroke="#f8f9fa" strokeWidth="3"/>
                </g>
              </svg>
            </div>
          </div>
          <h1 className="app-title">{getText('app_name')}</h1>
        </div>
        
        <div className="welcome-text">
          <p>{getText('welcome_subtitle')}</p>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={onCreateProfile}>
            {getText('create_profile')}
          </button>
          <button className="btn btn-secondary" onClick={onConnectWallet}>
            {getText('connect_wallet')}
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
    { key: 'name', title: getText('name_question') },
    { key: 'age', title: getText('age_question') },
    { key: 'bio', title: getText('bio_question') },
    { key: 'location', title: getText('location_question') },
    { key: 'interests', title: getText('interests_question') }
  ];

  const handleLocationRequest = async () => {
    try {
      console.log('📍 Location so\'raldi...');
      const locationData = await LocationService.getCurrentPosition();
      console.log('📍 Location olindi:', locationData);
      
      setLocation(locationData);
      setProfile(prev => ({ 
        ...prev, 
        location: locationData.city || 'Неизвестный город'
      }));
      
      // Show success message
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(`Joylashuv aniqlandi: ${locationData.city}`);
      }
    } catch (error) {
      console.error('Location error:', error);
      setProfile(prev => ({ ...prev, location: 'Москва' }));
      
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert('GPS ishlamadi, Moskva qo\'yildi');
      }
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
                📍 {getText('enable_location')}
              </button>
              <p className="help-text">{getText('location_help')}</p>
              {profile.location && (
                <div className="location-result">
                  <span>📍 {profile.location}</span>
                  <div className="location-coordinates">
                    {location && (
                      <small>
                        {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                      </small>
                    )}
                  </div>
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
            {getText('back')}
          </button>
        )}
        <button 
          className={`btn btn-primary ${!isValid() ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!isValid()}
        >
          {step === steps.length - 1 ? getText('save') : getText('next')}
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
          <h3>{getText('no_more_cards')}</h3>
          <p>{getText('try_tomorrow')}</p>
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
            <h2>{getText('its_match')}</h2>
            <div className="match-users">
              <div className="user-avatar">{user?.name?.charAt(0) || 'Я'}</div>
              <div className="heart-icon">💕</div>
              <div className="user-avatar">{matchedUser?.name?.charAt(0)}</div>
            </div>
            <div className="match-actions">
              <button className="btn btn-primary" onClick={() => setShowMatch(false)}>
                {getText('start_chat')}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowMatch(false)}>
                {getText('continue_swiping')}
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
                  {getText('online')}
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
        <h2>{getText('matches')} ({matches.length})</h2>
      </div>
      
      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h3>{getText('no_matches')}</h3>
          <p>{getText('start_discovering')}</p>
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
                  <span className="online-status">{getText('online')}</span>
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
    { id: 'discover', icon: '🔍', label: getText('discover') },
    { id: 'matches', icon: '💕', label: getText('matches') },
    { id: 'chat', icon: '💬', label: getText('chat') },
    { id: 'profile', icon: '👤', label: getText('profile') }
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
  const [currentScreen, setCurrentScreen] = useState('intro');
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
  if (currentScreen === 'intro') {
    return <IntroSplashScreen onContinue={() => setCurrentScreen('welcome')} />;
  }
  
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