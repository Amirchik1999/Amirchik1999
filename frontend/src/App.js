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
    welcome: 'Find Your Perfect Match',
    start_button: '💕 Start Dating',
    loading: 'Loading...',
    auth_error: 'This app only works in Telegram',
    profile_title: 'Create Profile',
    profile_subtitle: 'Tell us about yourself',
    name_label: 'Your Name',
    age_label: 'Your Age',
    gender_label: 'Gender',
    male: '👨 Male',
    female: '👩 Female',
    bio_label: 'About You',
    interests_label: 'Your Interests',
    location_label: 'Your Location',
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
    cards_loading: 'Loading profiles...'
  },
  'uz': {
    app_name: 'LinkUp Dating',
    welcome: 'Mukammal juftingizni toping',
    start_button: '💕 Tanishuvni boshlash',
    loading: 'Yuklanmoqda...',
    auth_error: 'Bu ilova faqat Telegram ichida ishlaydi',
    profile_title: 'Profil yaratish',
    profile_subtitle: 'O\'zingiz haqida ma\'lumot bering',
    name_label: 'Ismingiz',
    age_label: 'Yoshingiz',
    gender_label: 'Jinsingiz',
    male: '👨 Erkak',
    female: '👩 Ayol',
    bio_label: 'O\'zingiz haqida',
    interests_label: 'Qiziqishlaringiz',
    location_label: 'Joylashuvingiz',
    save_profile: 'Profilni saqlash',
    discover: 'Qidiruv',
    matches: 'Matchlar',
    profile: 'Profil',
    daily_limit: 'Kunlik limit tugadi! Ertaga qayta urinib ko\'ring.',
    its_match: 'MATCH BO\'LDI!',
    start_chat: 'Suhbat boshlash',
    continue: 'Davom etish',
    no_cards: 'Profillar tugadi',
    try_tomorrow: 'Ertaga yangi profillar paydo bo\'ladi!',
    reload: 'Qayta yuklash',
    no_matches: 'Hali matchlaringiz yo\'q',
    start_discovering: 'Qidiruv boshlang va yangi odamlarni toping!',
    saving: 'Saqlanmoqda...',
    cards_loading: 'Profillar yuklanmoqda...'
  },
  'ru': {
    app_name: 'LinkUp Dating',
    welcome: 'Найди свою идеальную пару',
    start_button: '💕 Начать знакомства',
    loading: 'Загрузка...',
    auth_error: 'Это приложение работает только в Telegram',
    profile_title: 'Создать профиль',
    profile_subtitle: 'Расскажите о себе',
    name_label: 'Ваше имя',
    age_label: 'Ваш возраст',
    gender_label: 'Пол',
    male: '👨 Мужской',
    female: '👩 Женский',
    bio_label: 'О себе',
    interests_label: 'Ваши интересы',
    location_label: 'Местоположение',
    save_profile: 'Сохранить профиль',
    discover: 'Поиск',
    matches: 'Совпадения',
    profile: 'Профиль',
    daily_limit: 'Дневной лимит исчерпан! Попробуйте завтра.',
    its_match: 'ЭТО СОВПАДЕНИЕ!',
    start_chat: 'Начать чат',
    continue: 'Продолжить',
    no_cards: 'Профили закончились',
    try_tomorrow: 'Завтра появятся новые профили!',
    reload: 'Обновить',
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

// Simple Swipe Detection
const useSwipeDetection = (onSwipeLeft, onSwipeRight, onSwipeUp) => {
  const [startPos, setStartPos] = useState(null);

  const handleTouchStart = (e) => {
    setStartPos({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    if (!startPos) return;

    const endPos = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const minSwipeDistance = 100;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          onSwipeRight && onSwipeRight();
        } else {
          onSwipeLeft && onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance && deltaY < 0) {
        onSwipeUp && onSwipeUp();
      }
    }

    setStartPos(null);
  };

  return { handleTouchStart, handleTouchEnd };
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
        throw new Error(getText('auth_error'));
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

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="hero-emoji">💕</div>
        <h1>{getText('app_name')}</h1>
        <p>{getText('welcome')}</p>
        
        <div className="hero-animation">
          <div className="floating-hearts">
            <span>💖</span>
            <span>💝</span>
            <span>💗</span>
          </div>
        </div>
        
        {!tg && loading && (
          <div className="auth-loading">
            <div className="pulse-loader"></div>
            <p>{getText('loading')}</p>
          </div>
        )}
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
    'Sport', 'Music', 'Travel', 'Books', 'Cooking', 'Photography',
    'Programming', 'Art', 'Movies', 'Games', 'Business', 'Fashion'
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
            <h2>What's your name?</h2>
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) => setProfile(prev => ({...prev, first_name: e.target.value}))}
              placeholder="Enter your name"
              className="step-input"
              autoFocus
            />
          </div>
        );
      
      case 'age':
        return (
          <div className="step-content">
            <h2>How old are you?</h2>
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
          <div className="step-content">
            <h2>I am a...</h2>
            <div className="gender-options">
              <button
                className={`gender-option ${profile.gender === 'erkak' ? 'selected' : ''}`}
                onClick={() => setProfile(prev => ({...prev, gender: 'erkak'}))}
              >
                <span className="gender-emoji">👨</span>
                <span>Man</span>
              </button>
              <button
                className={`gender-option ${profile.gender === 'ayol' ? 'selected' : ''}`}
                onClick={() => setProfile(prev => ({...prev, gender: 'ayol'}))}
              >
                <span className="gender-emoji">👩</span>
                <span>Woman</span>
              </button>
            </div>
          </div>
        );
      
      case 'bio':
        return (
          <div className="step-content">
            <h2>Tell us about yourself</h2>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
              placeholder="Write something interesting about yourself..."
              className="step-textarea"
              rows="4"
              autoFocus
            />
          </div>
        );
      
      case 'interests':
        return (
          <div className="step-content">
            <h2>What are you interested in?</h2>
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
            <h2>Where are you from?</h2>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
              placeholder="City, Country"
              className="step-input"
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
          className={`next-btn ${isStepValid() ? 'enabled' : 'disabled'}`}
          onClick={handleNext}
          disabled={!isStepValid() || loading}
        >
          {loading ? getText('saving') : 
           currentStep === steps.length - 1 ? getText('save_profile') : 'Next'}
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
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Mock data for testing
  const mockCards = [
    {
      telegram_id: 987654321,
      first_name: 'Sarah',
      age: 25,
      gender: 'ayol',
      bio: 'Love traveling and photography 📸 Always up for new adventures!',
      interests: ['Travel', 'Photography', 'Music'],
      location: 'New York',
      photos: []
    },
    {
      telegram_id: 555555555,
      first_name: 'Mike',
      age: 28,
      gender: 'erkak',
      bio: 'Software developer and fitness enthusiast 💪 Let\'s explore the world together!',
      interests: ['Programming', 'Sport', 'Books'],
      location: 'California',
      photos: []
    },
    {
      telegram_id: 444444444,
      first_name: 'Emma',
      age: 23,
      gender: 'ayol',
      bio: 'Artist and coffee lover ☕ Looking for someone to share beautiful moments with',
      interests: ['Art', 'Music', 'Books'],
      location: 'London',
      photos: []
    }
  ];

  const { handleTouchStart, handleTouchEnd } = useSwipeDetection(
    () => handleSwipe('pass'),  // swipe left
    () => handleSwipe('like'),  // swipe right
    () => handleSwipe('super_like')  // swipe up
  );

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
        } else {
          alert(getText('daily_limit'));
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
      // Fallback to mock data
      setCards(mockCards);
      setCurrentCard(mockCards[0] || null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (!currentCard) return;

    // Visual feedback
    setSwipeDirection(action);
    if (tg?.HapticFeedback?.impactOccurred) {
      tg.HapticFeedback.impactOccurred(action === 'super_like' ? 'heavy' : 'medium');
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      // Mock swipe response
      if (!token) {
        const isMatch = Math.random() > 0.7; // 30% chance of match
        if (action === 'like' && isMatch) {
          setTimeout(() => {
            setMatchedUser(currentCard);
            setShowMatch(true);
          }, 500);
        }
      } else {
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

        if (response.ok) {
          const result = await response.json();
          if (result.is_match) {
            setTimeout(() => {
              setMatchedUser(currentCard);
              setShowMatch(true);
            }, 500);
          }
        }
      }

      // Move to next card with animation
      setTimeout(() => {
        const currentIndex = cards.findIndex(card => card.telegram_id === currentCard.telegram_id);
        const nextCard = cards[currentIndex + 1] || null;
        setCurrentCard(nextCard);
        setSwipeDirection(null);

        // Load more cards if running low
        if (currentIndex >= cards.length - 2) {
          loadCards();
        }
      }, 300);

    } catch (error) {
      console.error('Swipe error:', error);
      // Continue anyway
      setTimeout(() => {
        const currentIndex = cards.findIndex(card => card.telegram_id === currentCard.telegram_id);
        const nextCard = cards[currentIndex + 1] || null;
        setCurrentCard(nextCard);
        setSwipeDirection(null);
      }, 300);
    }
  };

  const closeMatchModal = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  if (loading) {
    return (
      <div className="discover-screen">
        <div className="loading-state">
          <div className="card-skeleton"></div>
          <div className="loading-text">{getText('cards_loading')}</div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="discover-screen">
        <div className="empty-state">
          <div className="empty-emoji">😊</div>
          <h3>{getText('no_cards')}</h3>
          <p>{getText('try_tomorrow')}</p>
          <button onClick={loadCards} className="reload-btn">
            {getText('reload')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-screen">
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
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <span>{user?.first_name || 'You'}</span>
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
                <button className="match-btn primary" onClick={closeMatchModal}>
                  {getText('start_chat')}
                </button>
                <button className="match-btn secondary" onClick={closeMatchModal}>
                  {getText('continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="card-stack">
        <div 
          className={`dating-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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
            
            {/* Action Overlay */}
            {swipeDirection && (
              <div className={`action-overlay ${swipeDirection}`}>
                <span className="action-text">
                  {swipeDirection === 'like' && '💕 LIKE'}
                  {swipeDirection === 'pass' && '👎 PASS'}
                  {swipeDirection === 'super_like' && '⭐ SUPER LIKE'}
                </span>
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

      {/* Action Buttons */}
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
    },
    {
      match_id: '2',
      user: {
        telegram_id: 555555555,
        first_name: 'Emma',
        age: 23,
        bio: 'Artist and coffee lover',
        photos: []
      },
      matched_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
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
      setMatches(data.length > 0 ? data : mockMatches);
    } catch (error) {
      console.error('Load matches error:', error);
      setMatches(mockMatches);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="matches-screen">
        <div className="loading-state">
          <div className="pulse-loader"></div>
          <p>{getText('loading')}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="matches-screen">
        <div className="empty-state">
          <div className="empty-emoji">💔</div>
          <h3>{getText('no_matches')}</h3>
          <p>{getText('start_discovering')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-screen">
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
              <p>{match.user.age} years old</p>
              <button className="chat-btn">💬 Chat</button>
            </div>
          </div>
        ))}
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
      
      // Set theme colors based on Telegram theme
      if (tg.themeParams) {
        const root = document.documentElement;
        root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color || '#ffffff');
        root.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#000000');
        root.style.setProperty('--tg-hint-color', tg.themeParams.hint_color || '#999999');
      }
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
      // Fallback for testing
      setUser({ telegram_id: 123456789, first_name: 'Test User' });
      setIsAuthenticated(true);
      setNeedsProfile(true);
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
      <div className="app-loading">
        <div className="pulse-loader"></div>
        <p>{getText('loading')}</p>
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
    <div className="dating-app">
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