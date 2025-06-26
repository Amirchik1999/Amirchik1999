from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timedelta
import httpx
import base64
from telegram import Bot, Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters
import asyncio
from telegram.constants import ParseMode
import json
from PIL import Image
import io
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
import hmac
import hashlib
import urllib.parse
from jose import JWTError, jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Disable logging for production
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("telegram").setLevel(logging.WARNING)
logging.getLogger("motor").setLevel(logging.WARNING)
logging.getLogger("pymongo").setLevel(logging.WARNING)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Telegram Bot
TELEGRAM_TOKEN = os.environ['TELEGRAM_TOKEN']
WEBHOOK_SECRET = os.environ['WEBHOOK_SECRET']
bot = Bot(token=TELEGRAM_TOKEN)

# JWT Settings
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Custom JSON encoder for MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

# Helper function to convert MongoDB document to dict with proper ObjectId handling
def mongo_to_dict(obj: Dict[str, Any]) -> Dict[str, Any]:
    if obj is None:
        return None
    obj_dict = dict(obj)
    if "_id" in obj_dict:
        obj_dict["_id"] = str(obj_dict["_id"])
    return obj_dict

# Telegram Web App Authentication
def verify_telegram_web_app_data(init_data: str) -> dict:
    """Verify Telegram Web App init data"""
    try:
        # Parse the init data
        parsed_data = urllib.parse.parse_qs(init_data)
        
        # Extract hash and remove it from data for verification
        received_hash = parsed_data.get('hash', [None])[0]
        if not received_hash:
            raise ValueError("No hash provided")
        
        # Remove hash from parsed data
        if 'hash' in parsed_data:
            del parsed_data['hash']
        
        # Create data check string
        data_check_arr = []
        for key, value in parsed_data.items():
            if isinstance(value, list):
                value = value[0]
            data_check_arr.append(f"{key}={value}")
        
        data_check_arr.sort()
        data_check_string = '\n'.join(data_check_arr)
        
        # Create secret key
        secret_key = hmac.new("WebAppData".encode(), TELEGRAM_TOKEN.encode(), hashlib.sha256).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        # Verify hash
        if not hmac.compare_digest(received_hash, calculated_hash):
            raise ValueError("Invalid hash")
        
        # Parse user data
        user_data = json.loads(parsed_data.get('user', ['{}'])[0])
        return user_data
        
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Telegram Web App data")

# JWT Token functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        telegram_id: int = payload.get("telegram_id")
        if telegram_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return telegram_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_id: int
    username: Optional[str] = None
    first_name: str
    age: int
    gender: str  # "erkak" yoki "ayol"
    interests: List[str] = []
    bio: str
    photos: List[str] = []  # Base64 encoded photos
    location: Optional[str] = None
    is_premium: bool = False
    premium_expires: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    last_seen: datetime = Field(default_factory=datetime.utcnow)

class DailyLimit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_id: int
    date: str  # YYYY-MM-DD format
    views_count: int = 0
    likes_given: int = 0
    super_likes_used: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: int
    user2_id: int
    user1_liked: bool = False
    user2_liked: bool = False
    user1_super_liked: bool = False
    user2_super_liked: bool = False
    is_matched: bool = False
    matched_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    sender_id: int
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False

class SwipeAction(BaseModel):
    target_user_id: int
    action: str  # "like", "pass", "super_like"

class AuthRequest(BaseModel):
    init_data: str

# Web App Authentication
@api_router.post("/auth/telegram")
async def authenticate_telegram_user(auth_request: AuthRequest):
    """Authenticate user via Telegram Web App"""
    try:
        user_data = verify_telegram_web_app_data(auth_request.init_data)
        telegram_id = user_data.get('id')
        
        if not telegram_id:
            raise HTTPException(status_code=400, detail="No user ID in Telegram data")
        
        # Check if user exists, if not create
        existing_user = await db.users.find_one({"telegram_id": telegram_id})
        if not existing_user:
            # Create new user profile
            new_user = UserProfile(
                telegram_id=telegram_id,
                username=user_data.get('username'),
                first_name=user_data.get('first_name', 'Unknown'),
                age=18,  # Default, will be updated
                gender="erkak",  # Default, will be updated
                bio="",
                interests=[]
            )
            await db.users.insert_one(new_user.dict())
            user_profile = new_user.dict()
        else:
            user_profile = mongo_to_dict(existing_user)
        
        # Create JWT token
        access_token = create_access_token({"telegram_id": telegram_id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_profile
        }
        
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

# Protected Routes
@api_router.get("/users/me")
async def get_current_user(telegram_id: int = Depends(verify_token)):
    """Get current user profile"""
    user = await db.users.find_one({"telegram_id": telegram_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return mongo_to_dict(user)

@api_router.put("/users/me")
async def update_current_user(profile_update: dict, telegram_id: int = Depends(verify_token)):
    """Update current user profile"""
    # Update last seen
    profile_update["last_seen"] = datetime.utcnow()
    
    await db.users.update_one(
        {"telegram_id": telegram_id},
        {"$set": profile_update}
    )
    
    # Return updated profile
    updated_user = await db.users.find_one({"telegram_id": telegram_id})
    return mongo_to_dict(updated_user)

@api_router.get("/discover")
async def get_discover_cards(telegram_id: int = Depends(verify_token)):
    """Get cards for discovery/swiping"""
    # Check daily limit
    today = datetime.now().strftime("%Y-%m-%d")
    daily_limit = await db.daily_limits.find_one({
        "telegram_id": telegram_id,
        "date": today
    })
    
    if daily_limit and daily_limit.get("views_count", 0) >= 20:
        # Check if user is premium
        user = await db.users.find_one({"telegram_id": telegram_id})
        if not user or not user.get("is_premium", False):
            return {"error": "Daily limit reached", "limit_reached": True}
    
    # Get user's profile
    user = await db.users.find_one({"telegram_id": telegram_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get opposite gender
    opposite_gender = "ayol" if user["gender"] == "erkak" else "erkak"
    
    # Get already interacted users
    existing_matches = await db.matches.find({
        "$or": [
            {"user1_id": telegram_id},
            {"user2_id": telegram_id}
        ]
    }).to_list(1000)
    
    interacted_users = set()
    for match in existing_matches:
        if match["user1_id"] == telegram_id:
            interacted_users.add(match["user2_id"])
        else:
            interacted_users.add(match["user1_id"])
    
    # Find potential matches
    potential_matches = await db.users.find({
        "telegram_id": {"$nin": list(interacted_users) + [telegram_id]},
        "gender": opposite_gender,
        "is_active": True,
        "photos": {"$ne": []},  # Must have photos
        "age": {"$exists": True, "$ne": 0}  # Must have age set
    }).limit(10).to_list(10)
    
    return [mongo_to_dict(match) for match in potential_matches]

@api_router.post("/swipe")
async def handle_swipe(swipe: SwipeAction, telegram_id: int = Depends(verify_token)):
    """Handle swipe action"""
    # Increment view count
    today = datetime.now().strftime("%Y-%m-%d")
    await db.daily_limits.update_one(
        {"telegram_id": telegram_id, "date": today},
        {
            "$inc": {"views_count": 1},
            "$setOnInsert": {
                "id": str(uuid.uuid4()),
                "telegram_id": telegram_id,
                "date": today,
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )
    
    if swipe.action in ["like", "super_like"]:
        # Check if match already exists
        existing_match = await db.matches.find_one({
            "$or": [
                {"user1_id": telegram_id, "user2_id": swipe.target_user_id},
                {"user1_id": swipe.target_user_id, "user2_id": telegram_id}
            ]
        })
        
        if existing_match:
            # Update existing match
            existing_match = mongo_to_dict(existing_match)
            if existing_match["user1_id"] == telegram_id:
                update_data = {
                    "user1_liked": True,
                    "user1_super_liked": swipe.action == "super_like"
                }
                other_liked = existing_match.get("user2_liked", False)
            else:
                update_data = {
                    "user2_liked": True,
                    "user2_super_liked": swipe.action == "super_like"
                }
                other_liked = existing_match.get("user1_liked", False)
            
            if other_liked and not existing_match.get("is_matched", False):
                update_data["is_matched"] = True
                update_data["matched_at"] = datetime.utcnow()
            
            await db.matches.update_one(
                {"_id": ObjectId(existing_match["_id"])},
                {"$set": update_data}
            )
            
            # Check if it's a new match
            is_new_match = other_liked and not existing_match.get("is_matched", False)
            
        else:
            # Create new match
            new_match = Match(
                user1_id=telegram_id,
                user2_id=swipe.target_user_id,
                user1_liked=True,
                user1_super_liked=swipe.action == "super_like"
            )
            await db.matches.insert_one(new_match.dict())
            is_new_match = False
        
        return {
            "success": True,
            "is_match": is_new_match,
            "action": swipe.action
        }
    
    else:  # pass
        # Create pass record
        pass_match = Match(
            user1_id=telegram_id,
            user2_id=swipe.target_user_id,
            user1_liked=False
        )
        await db.matches.insert_one(pass_match.dict())
        return {"success": True, "action": "pass"}

@api_router.get("/matches")
async def get_matches(telegram_id: int = Depends(verify_token)):
    """Get user's matches"""
    matches = await db.matches.find({
        "$or": [
            {"user1_id": telegram_id},
            {"user2_id": telegram_id}
        ],
        "is_matched": True
    }).to_list(100)
    
    # Get matched users details
    matched_users = []
    for match in matches:
        match_dict = mongo_to_dict(match)
        other_user_id = match["user2_id"] if match["user1_id"] == telegram_id else match["user1_id"]
        user = await db.users.find_one({"telegram_id": other_user_id})
        if user:
            matched_users.append({
                "match_id": match_dict.get("id", str(match_dict.get("_id", ""))),
                "user": mongo_to_dict(user),
                "matched_at": match_dict.get("matched_at", match_dict.get("created_at", ""))
            })
    
    return matched_users

# Telegram Bot Commands
@api_router.post("/telegram-webhook")
async def telegram_webhook(request: Request):
    """Handle Telegram webhook"""
    try:
        update_data = await request.json()
        
        # Process with the bot
        try:
            update = Update.de_json(update_data, bot)
            
            if update and update.message:
                await handle_message(update.message)
            elif update and update.callback_query:
                await handle_callback_query(update.callback_query)
        except Exception:
            pass
            
        return {"status": "ok", "message": "Webhook received"}
    except Exception:
        return {"status": "error", "message": "Webhook error"}

async def handle_message(message):
    """Handle incoming messages"""
    chat_id = message.chat_id
    text = message.text
    
    if text == "/start":
        await send_webapp_message(chat_id)
    elif text == "/help":
        await send_help_message(chat_id)

async def send_webapp_message(chat_id):
    """Send Web App button"""
    web_app_url = "https://23276d44-c6c8-4999-aa05-14f02da19e1b.preview.emergentagent.com"
    
    keyboard = [[
        InlineKeyboardButton(
            "💕 Open LinkUp Dating", 
            web_app=WebAppInfo(url=web_app_url)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    message_text = """
💕 *LinkUp Dating - Find Your Match!*

🔥 Swipe through profiles
💬 Chat with matches
✨ Find your perfect match

Ready to start dating? 👇
    """
    
    await bot.send_message(
        chat_id=chat_id,
        text=message_text,
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=reply_markup
    )

async def handle_callback_query(callback_query):
    """Handle callback queries"""
    pass

async def send_help_message(chat_id):
    """Send help message"""
    help_text = """
🆘 *LinkUp Dating Help*

*How to use:*
• Tap the menu button to open the app
• Create your profile
• Swipe through profiles
• Match and chat!

*Commands:*
• /start - Open the dating app
• /help - Show this help

*Support:* @support_username
    """
    
    await bot.send_message(
        chat_id=chat_id,
        text=help_text,
        parse_mode=ParseMode.MARKDOWN
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure minimal logging for production
logging.basicConfig(
    level=logging.WARNING,
    format='%(levelname)s - %(message)s'
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()