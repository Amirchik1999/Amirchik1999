from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import uuid
from datetime import datetime, timedelta
import math
import random

app = FastAPI(title="TON Dating API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database - In production, use MongoDB
USERS_DB = {}
MATCHES_DB = {}
DAILY_LIMITS_DB = {}
PROFILES_DB = {}

# Realistic cities and their coordinates
CITIES = {
    "Москва": {"lat": 55.7558, "lng": 37.6173},
    "Санкт-Петербург": {"lat": 59.9311, "lng": 30.3609},
    "Новосибирск": {"lat": 55.0084, "lng": 82.9357},
    "Екатеринбург": {"lat": 56.8431, "lng": 60.6454},
    "Казань": {"lat": 55.8304, "lng": 49.0661},
    "Нижний Новгород": {"lat": 56.2965, "lng": 43.9361},
    "Челябинск": {"lat": 55.1644, "lng": 61.4368},
    "Самара": {"lat": 53.2415, "lng": 50.2212},
    "Омск": {"lat": 54.9893, "lng": 73.3682},
    "Ростов-на-Дону": {"lat": 47.2357, "lng": 39.7015}
}

# Realistic profile data
REALISTIC_BIOS = [
    "Люблю путешествия и новые впечатления. Ищу искренние отношения 🌟",
    "IT-специалист, увлекаюсь спортом и фотографией. Давайте знакомиться! 💻📸",
    "Творческая натура, обожаю искусство и музыку. Ценю честность и юмор 🎨🎵",
    "Работаю в сфере образования, люблю читать и готовить. Ищу серьёзные отношения 📚👩‍🍳",
    "Предприниматель, активный образ жизни. Интересуюсь психологией и саморазвитием 🚀",
    "Дизайнер, люблю красивые вещи и вдохновляющие места. Мечтаю о большой любви ✨",
    "Врач по профессии, волонтёр по зову сердца. Ценю доброту и искренность ❤️",
    "Фитнес-тренер, здоровый образ жизни - моё всё. Ищу партнёра для совместных приключений 🏋️‍♀️",
    "Журналист, обожаю истории и людей. Хочу найти того, с кем можно говорить обо всём 📰",
    "Маркетолог, люблю анализировать и создавать. Ищу умного и интересного собеседника 📊"
]

REALISTIC_NAMES = {
    "female": ["Анна", "Мария", "Елена", "Екатерина", "Наталья", "Ольга", "Юлия", "Татьяна", "Ирина", "Светлана", "Дарья", "Виктория", "Александра", "Алина", "Валерия"],
    "male": ["Александр", "Дмитрий", "Максим", "Сергей", "Андрей", "Алексей", "Артём", "Илья", "Кирилл", "Михаил", "Никита", "Владимир", "Егор", "Иван", "Роман"]
}

INTERESTS_LIST = [
    "Спорт", "Музыка", "Путешествия", "Книги", "Кулинария", "Фотография",
    "Программирование", "Искусство", "Кино", "Игры", "Бизнес", "Мода",
    "Наука", "Природа", "Танцы", "Йога", "Психология", "Дизайн"
]

# Data models
class UserProfile(BaseModel):
    name: str
    age: int
    gender: str
    bio: str
    location: str
    interests: List[str]
    photos: Optional[List[str]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class SwipeAction(BaseModel):
    target_user_id: str
    action: str  # "like", "pass", "super_like"

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float

class UserResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    bio: str
    location: str
    interests: List[str]
    photos: List[str]
    distance: Optional[str] = None
    is_online: bool = True

# Helper functions
def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in kilometers"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def generate_realistic_profiles(count: int = 50):
    """Generate realistic user profiles"""
    profiles = []
    
    for i in range(count):
        gender = random.choice(["male", "female"])
        name = random.choice(REALISTIC_NAMES[gender])
        age = random.randint(18, 45)
        city = random.choice(list(CITIES.keys()))
        city_coords = CITIES[city]
        
        # Add some random offset to coordinates (within 10km)
        lat_offset = random.uniform(-0.1, 0.1)  # ~10km
        lng_offset = random.uniform(-0.1, 0.1)
        
        profile = {
            "id": str(uuid.uuid4()),
            "name": name,
            "age": age,
            "gender": gender,
            "bio": random.choice(REALISTIC_BIOS),
            "location": city,
            "interests": random.sample(INTERESTS_LIST, random.randint(3, 6)),
            "photos": ["👩" if gender == "female" else "👨"],
            "latitude": city_coords["lat"] + lat_offset,
            "longitude": city_coords["lng"] + lng_offset,
            "is_online": random.choice([True, False]),
            "created_at": datetime.now().isoformat()
        }
        
        profiles.append(profile)
        PROFILES_DB[profile["id"]] = profile
    
    return profiles

# Generate initial realistic profiles
generate_realistic_profiles(50)

@app.get("/")
async def root():
    return {"message": "TON Dating API", "version": "1.0.0", "profiles_count": len(PROFILES_DB)}

@app.post("/api/users/profile")
async def create_user_profile(profile: UserProfile):
    """Create or update user profile"""
    user_id = str(uuid.uuid4())
    
    # Get coordinates for the location
    coords = CITIES.get(profile.location, CITIES["Москва"])
    
    user_data = {
        "id": user_id,
        "name": profile.name,
        "age": profile.age,
        "gender": profile.gender,
        "bio": profile.bio,
        "location": profile.location,
        "interests": profile.interests,
        "photos": profile.photos or ["👤"],
        "latitude": profile.latitude or coords["lat"],
        "longitude": profile.longitude or coords["lng"],
        "is_online": True,
        "created_at": datetime.now().isoformat()
    }
    
    USERS_DB[user_id] = user_data
    PROFILES_DB[user_id] = user_data
    
    # Initialize daily limit
    DAILY_LIMITS_DB[user_id] = {
        "date": datetime.now().date().isoformat(),
        "views_count": 0,
        "likes_count": 0,
        "super_likes_count": 0
    }
    
    return {"message": "Profile created successfully", "user_id": user_id}

@app.get("/api/users/me")
async def get_my_profile():
    """Get current user profile (mock)"""
    # For demo purposes, return a mock user
    mock_user = {
        "id": "user_123",
        "name": "Вы",
        "age": 25,
        "gender": "male",
        "bio": "Ваш профиль",
        "location": "Москва",
        "interests": ["Спорт", "Музыка"],
        "photos": ["👤"],
        "is_online": True
    }
    return mock_user

@app.get("/api/discover")
async def discover_profiles(
    user_id: str = "user_123",
    limit: int = 10,
    lat: Optional[float] = None,
    lng: Optional[float] = None
):
    """Get profiles for discovery (swiping)"""
    
    # Check daily limit
    daily_limit = DAILY_LIMITS_DB.get(user_id, {})
    today = datetime.now().date().isoformat()
    
    if daily_limit.get("date") != today:
        # Reset daily limit for new day
        DAILY_LIMITS_DB[user_id] = {
            "date": today,
            "views_count": 0,
            "likes_count": 0,
            "super_likes_count": 0
        }
        daily_limit = DAILY_LIMITS_DB[user_id]
    
    if daily_limit.get("views_count", 0) >= 20:
        return {"profiles": [], "message": "Daily limit reached"}
    
    # Use provided coordinates or default to Moscow
    user_lat = lat or 55.7558
    user_lng = lng or 37.6173
    
    print(f"🔍 Discovery request: lat={user_lat}, lng={user_lng}")
    
    # Get all profiles except current user
    available_profiles = []
    for profile_id, profile in PROFILES_DB.items():
        if profile_id == user_id:
            continue
            
        # Calculate distance
        distance_km = calculate_distance(
            user_lat, user_lng,
            profile["latitude"], profile["longitude"]
        )
        
        # Format distance
        if distance_km < 1:
            distance_str = f"{int(distance_km * 1000)} м"
        else:
            distance_str = f"{int(distance_km)} км"
        
        profile_copy = profile.copy()
        profile_copy["distance"] = distance_str
        available_profiles.append(profile_copy)
    
    # Sort by distance and return limited results
    available_profiles.sort(key=lambda x: float(x["distance"].split()[0]))
    profiles = available_profiles[:limit]
    
    print(f"📊 Found {len(profiles)} profiles")
    
    return {"profiles": profiles}

@app.post("/api/swipe")
async def swipe_action(action: SwipeAction, user_id: str = "user_123"):
    """Handle swipe action"""
    
    # Update daily limits
    daily_limit = DAILY_LIMITS_DB.get(user_id, {})
    today = datetime.now().date().isoformat()
    
    if daily_limit.get("date") != today:
        DAILY_LIMITS_DB[user_id] = {
            "date": today,
            "views_count": 0,
            "likes_count": 0,
            "super_likes_count": 0
        }
    
    # Increment counters
    DAILY_LIMITS_DB[user_id]["views_count"] += 1
    
    if action.action in ["like", "super_like"]:
        DAILY_LIMITS_DB[user_id]["likes_count"] += 1
        
        if action.action == "super_like":
            DAILY_LIMITS_DB[user_id]["super_likes_count"] += 1
    
    # Check for match (30% chance for demo)
    is_match = action.action in ["like", "super_like"] and random.random() < 0.3
    
    if is_match:
        match_id = str(uuid.uuid4())
        MATCHES_DB[match_id] = {
            "id": match_id,
            "user1_id": user_id,
            "user2_id": action.target_user_id,
            "created_at": datetime.now().isoformat()
        }
        
        # Get target user profile
        target_profile = PROFILES_DB.get(action.target_user_id)
        
        return {
            "is_match": True,
            "match_id": match_id,
            "matched_user": target_profile
        }
    
    return {"is_match": False}

@app.get("/api/matches")
async def get_matches(user_id: str = "user_123"):
    """Get user's matches"""
    user_matches = []
    
    for match in MATCHES_DB.values():
        if match["user1_id"] == user_id or match["user2_id"] == user_id:
            # Get the other user's profile
            other_user_id = match["user2_id"] if match["user1_id"] == user_id else match["user1_id"]
            other_profile = PROFILES_DB.get(other_user_id)
            
            if other_profile:
                user_matches.append({
                    "match_id": match["id"],
                    "user": other_profile,
                    "created_at": match["created_at"]
                })
    
    return {"matches": user_matches}

@app.get("/api/daily-limit")
async def get_daily_limit(user_id: str = "user_123"):
    """Get daily usage limits"""
    daily_limit = DAILY_LIMITS_DB.get(user_id, {})
    today = datetime.now().date().isoformat()
    
    if daily_limit.get("date") != today:
        # Reset for new day
        DAILY_LIMITS_DB[user_id] = {
            "date": today,
            "views_count": 0,
            "likes_count": 0,
            "super_likes_count": 0
        }
        daily_limit = DAILY_LIMITS_DB[user_id]
    
    return {
        "date": daily_limit.get("date"),
        "views_count": daily_limit.get("views_count", 0),
        "likes_count": daily_limit.get("likes_count", 0),
        "super_likes_count": daily_limit.get("super_likes_count", 0),
        "max_views": 20,
        "max_likes": 100,
        "max_super_likes": 5
    }

@app.post("/api/location")
async def update_location(location: LocationUpdate, user_id: str = "user_123"):
    """Update user location"""
    if user_id in USERS_DB:
        USERS_DB[user_id]["latitude"] = location.latitude
        USERS_DB[user_id]["longitude"] = location.longitude
        
        # Update in profiles DB as well
        if user_id in PROFILES_DB:
            PROFILES_DB[user_id]["latitude"] = location.latitude
            PROFILES_DB[user_id]["longitude"] = location.longitude
    
    return {"message": "Location updated successfully"}

@app.get("/api/stats")
async def get_stats():
    """Get app statistics"""
    return {
        "total_users": len(PROFILES_DB),
        "online_users": len([p for p in PROFILES_DB.values() if p.get("is_online", False)]),
        "total_matches": len(MATCHES_DB),
        "cities": list(CITIES.keys())
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)