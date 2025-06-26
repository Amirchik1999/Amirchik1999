from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File
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
from telegram import Bot, Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters
import asyncio
from telegram.constants import ParseMode
import json
from PIL import Image
import io
from bson import ObjectId
from fastapi.encoders import jsonable_encoder

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


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Telegram Bot
TELEGRAM_TOKEN = os.environ['TELEGRAM_TOKEN']
bot = Bot(token=TELEGRAM_TOKEN)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_id: int
    username: Optional[str] = None
    first_name: str
    age: int
    gender: str  # "erkak" yoki "ayol"
    interests: str
    bio: str
    photo_base64: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class DailyLimit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_id: int
    date: str  # YYYY-MM-DD format
    views_count: int = 0
    likes_given: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: int
    user2_id: int
    user1_liked: bool = False
    user2_liked: bool = False
    is_matched: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    sender_id: int
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Telegram Dating Bot API"}

@api_router.post("/users")
async def create_user_profile(profile: UserProfile):
    """Create or update user profile"""
    existing = await db.users.find_one({"telegram_id": profile.telegram_id})
    if existing:
        await db.users.update_one(
            {"telegram_id": profile.telegram_id},
            {"$set": profile.dict()}
        )
    else:
        await db.users.insert_one(profile.dict())
    return {"message": "Profile created/updated successfully"}

@api_router.get("/users/{telegram_id}")
async def get_user_profile(telegram_id: int):
    """Get user profile by telegram ID"""
    user = await db.users.find_one({"telegram_id": telegram_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return mongo_to_dict(user)

@api_router.get("/users/{telegram_id}/daily-limit")
async def get_daily_limit(telegram_id: int):
    """Get today's daily limit for user"""
    today = datetime.now().strftime("%Y-%m-%d")
    limit = await db.daily_limits.find_one({
        "telegram_id": telegram_id,
        "date": today
    })
    if not limit:
        # Create new daily limit
        new_limit = DailyLimit(telegram_id=telegram_id, date=today)
        await db.daily_limits.insert_one(new_limit.dict())
        return new_limit.dict()
    return mongo_to_dict(limit)

@api_router.post("/users/{telegram_id}/view")
async def increment_view_count(telegram_id: int):
    """Increment daily view count"""
    today = datetime.now().strftime("%Y-%m-%d")
    await db.daily_limits.update_one(
        {"telegram_id": telegram_id, "date": today},
        {"$inc": {"views_count": 1}},
        upsert=True
    )
    return {"message": "View count incremented"}

@api_router.get("/users/{telegram_id}/potential-matches")
async def get_potential_matches(telegram_id: int):
    """Get potential matches for user (excluding already seen/matched)"""
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
        "is_active": True
    }).to_list(50)
    
    return potential_matches

@api_router.post("/matches")
async def create_match(user1_id: int, user2_id: int, liked: bool):
    """Create or update match"""
    # Check if match already exists
    existing = await db.matches.find_one({
        "$or": [
            {"user1_id": user1_id, "user2_id": user2_id},
            {"user1_id": user2_id, "user2_id": user1_id}
        ]
    })
    
    if existing:
        # Update existing match
        if existing["user1_id"] == user1_id:
            update_data = {"user1_liked": liked}
            other_liked = existing["user2_liked"]
        else:
            update_data = {"user2_liked": liked}
            other_liked = existing["user1_liked"]
        
        if liked and other_liked:
            update_data["is_matched"] = True
        
        await db.matches.update_one(
            {"_id": existing["_id"]},
            {"$set": update_data}
        )
        
        # Check if it's a new match
        if liked and other_liked and not existing["is_matched"]:
            return {"message": "It's a match!", "matched": True}
            
    else:
        # Create new match
        match = Match(
            user1_id=user1_id,
            user2_id=user2_id,
            user1_liked=liked,
            user2_liked=False
        )
        await db.matches.insert_one(match.dict())
    
    return {"message": "Match updated", "matched": False}

@api_router.get("/users/{telegram_id}/matches")
async def get_user_matches(telegram_id: int):
    """Get all matches for user"""
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
        other_user_id = match["user2_id"] if match["user1_id"] == telegram_id else match["user1_id"]
        user = await db.users.find_one({"telegram_id": other_user_id})
        if user:
            matched_users.append({
                "match_id": match["id"],
                "user": user,
                "matched_at": match["created_at"]
            })
    
    return matched_users

# Telegram Bot Webhook
@api_router.post("/telegram-webhook")
async def telegram_webhook(request: Request):
    """Handle Telegram webhook"""
    try:
        update_data = await request.json()
        update = Update.de_json(update_data, bot)
        
        if update.message:
            await handle_message(update.message)
        elif update.callback_query:
            await handle_callback_query(update.callback_query)
            
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Telegram Bot Handlers
async def handle_message(message):
    """Handle incoming messages"""
    chat_id = message.chat_id
    text = message.text
    
    if text == "/start":
        await send_welcome_message(chat_id)
    elif text == "/profile":
        await start_profile_creation(chat_id, message.from_user)
    elif text == "/search" or text == "🔍 Qidiruv":
        await start_search(chat_id)
    elif text == "/matches" or text == "💕 Matchlar":
        await show_matches(chat_id)
    elif text == "/help":
        await send_help_message(chat_id)
    elif message.photo:
        await handle_photo_upload(message)

async def handle_callback_query(callback_query):
    """Handle inline keyboard callbacks"""
    data = callback_query.data
    chat_id = callback_query.message.chat_id
    
    if data == "create_profile":
        await start_profile_creation(chat_id, callback_query.from_user)
    elif data == "start_search":
        await start_search(chat_id)
    elif data == "my_matches":
        await show_matches(chat_id)
    elif data.startswith("like_"):
        user_id = int(data.split("_")[1])
        await handle_like(chat_id, callback_query.from_user.id, user_id)
    elif data.startswith("skip_"):
        await continue_search(chat_id)

async def send_welcome_message(chat_id):
    """Send welcome message with main menu"""
    keyboard = [
        [InlineKeyboardButton("📝 Profil yaratish", callback_data="create_profile")],
        [InlineKeyboardButton("🔍 Qidiruv", callback_data="start_search")],
        [InlineKeyboardButton("💕 Matchlar", callback_data="my_matches")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = """
🌟 *Tanshuv Botiga Xush Kelibsiz!* 🌟

Bu bot orqali siz:
• Profil yaratishingiz
• Har kuni 20 tagacha odamni ko'rishingiz  
• Agar ikkingiz ham yoqtirsangiz - chat boshlanadi!

Boshlash uchun tugmani bosing! 👇
    """
    
    await bot.send_message(
        chat_id=chat_id,
        text=welcome_text,
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=reply_markup
    )

async def start_profile_creation(chat_id, user):
    """Start profile creation process"""
    await bot.send_message(
        chat_id=chat_id,
        text="📝 *Profil yaratish boshlandi!*\n\nIltimos, quyidagi ma'lumotlarni kiriting:\n\n*Ismingiz:*",
        parse_mode=ParseMode.MARKDOWN
    )
    
    # Store user state for profile creation
    await db.user_states.update_one(
        {"telegram_id": user.id},
        {"$set": {"state": "waiting_name", "data": {}}},
        upsert=True
    )

async def start_search(chat_id):
    """Start profile search"""
    # Check daily limit
    limit = await get_daily_limit(chat_id)
    if limit["views_count"] >= 20:
        await bot.send_message(
            chat_id=chat_id,
            text="⏰ *Kunlik limit tugadi!*\n\nSiz bugun 20 ta profilni ko'rdingiz. Ertaga qayta urinib ko'ring!",
            parse_mode=ParseMode.MARKDOWN
        )
        return
    
    # Get potential matches
    try:
        matches = await get_potential_matches(chat_id)
        if not matches:
            await bot.send_message(
                chat_id=chat_id,
                text="😔 *Hozircha yangi profillar yo'q*\n\nKeyin qayta urinib ko'ring!",
                parse_mode=ParseMode.MARKDOWN
            )
            return
        
        # Show first profile
        await show_profile(chat_id, matches[0])
        
    except Exception as e:
        await bot.send_message(
            chat_id=chat_id,
            text="❌ Xatolik yuz berdi. Avval profilingizni yarating: /profile",
            parse_mode=ParseMode.MARKDOWN
        )

async def show_profile(chat_id, profile):
    """Show a profile to user"""
    keyboard = [
        [
            InlineKeyboardButton("❤️ Yoqdi", callback_data=f"like_{profile['telegram_id']}"),
            InlineKeyboardButton("👎 Keyingisi", callback_data=f"skip_{profile['telegram_id']}")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    profile_text = f"""
👤 *{profile['first_name']}*, {profile['age']} yosh

🔸 *Jins:* {profile['gender']}
🔸 *Qiziqishlar:* {profile['interests']}
🔸 *Haqida:* {profile['bio']}
    """
    
    if profile.get('photo_base64'):
        try:
            # Convert base64 to image
            image_data = base64.b64decode(profile['photo_base64'])
            await bot.send_photo(
                chat_id=chat_id,
                photo=io.BytesIO(image_data),
                caption=profile_text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=reply_markup
            )
        except:
            await bot.send_message(
                chat_id=chat_id,
                text=profile_text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=reply_markup
            )
    else:
        await bot.send_message(
            chat_id=chat_id,
            text=profile_text,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
    
    # Increment view count
    await increment_view_count(chat_id)

async def handle_like(chat_id, user_id, liked_user_id):
    """Handle like action"""
    # Create match
    result = await create_match(user_id, liked_user_id, True)
    
    if result.get("matched"):
        # It's a match!
        await bot.send_message(
            chat_id=chat_id,
            text="🎉 *IT'S A MATCH!* 🎉\n\nIkkingiz ham bir-biringizni yoqtirdingiz!\n\n💬 Endi suhbat boshlay olasiz!",
            parse_mode=ParseMode.MARKDOWN
        )
        
        # Notify the other user
        await bot.send_message(
            chat_id=liked_user_id,
            text="🎉 *YANGI MATCH!* 🎉\n\nKimdir sizni yoqtirdi va siz ham uni yoqtirgan edingiz!\n\n💬 Matchlar bo'limida ko'ring: /matches",
            parse_mode=ParseMode.MARKDOWN
        )
    else:
        await bot.send_message(
            chat_id=chat_id,
            text="👍 *Yuborildi!*\n\nAgar u ham sizni yoqtirsa - match bo'ladi!",
            parse_mode=ParseMode.MARKDOWN
        )
    
    # Continue search
    await continue_search(chat_id)

async def continue_search(chat_id):
    """Continue showing profiles"""
    await asyncio.sleep(1)  # Small delay
    await start_search(chat_id)

async def show_matches(chat_id):
    """Show user's matches"""
    try:
        matches = await get_user_matches(chat_id)
        if not matches:
            await bot.send_message(
                chat_id=chat_id,
                text="😔 *Hali matchlaringiz yo'q*\n\nQidiruv boshlang: /search",
                parse_mode=ParseMode.MARKDOWN
            )
            return
        
        text = "💕 *Sizning Matchlaringiz:*\n\n"
        for match in matches:
            user = match["user"]
            text += f"👤 *{user['first_name']}* - {user['age']} yosh\n"
            text += f"💬 Chat: @{user.get('username', 'mavjud_emas')}\n\n"
        
        await bot.send_message(
            chat_id=chat_id,
            text=text,
            parse_mode=ParseMode.MARKDOWN
        )
        
    except Exception as e:
        await bot.send_message(
            chat_id=chat_id,
            text="❌ Xatolik yuz berdi. Avval profilingizni yarating: /profile"
        )

async def send_help_message(chat_id):
    """Send help message"""
    help_text = """
🆘 *Yordam*

*Asosiy buyruqlar:*
• /start - Botni ishga tushirish
• /profile - Profil yaratish/tahrirlash  
• /search - Qidiruv boshlash
• /matches - Matchlarni ko'rish
• /help - Yordam

*Qoidalar:*
• Har kuni 20 ta profil ko'rish mumkin
• Agar ikkingiz ham like qilsangiz - match!
• Faqat haqiqiy ma'lumotlar kiriting

*Muammo bo'lsa:* @admin_username ga murojaat qiling
    """
    
    await bot.send_message(
        chat_id=chat_id,
        text=help_text,
        parse_mode=ParseMode.MARKDOWN
    )

async def handle_photo_upload(message):
    """Handle photo upload during profile creation"""
    chat_id = message.chat_id
    
    # Get largest photo
    photo = message.photo[-1]
    file = await bot.get_file(photo.file_id)
    
    # Download and convert to base64
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.telegram.org/file/bot{TELEGRAM_TOKEN}/{file.file_path}")
        image_data = response.content
    
    # Convert to base64
    image_base64 = base64.b64encode(image_data).decode()
    
    # Store in user state
    await db.user_states.update_one(
        {"telegram_id": message.from_user.id},
        {"$set": {"data.photo_base64": image_base64}}
    )
    
    await bot.send_message(
        chat_id=chat_id,
        text="✅ *Rasm qabul qilindi!*\n\nEndi profilingiz tayyor. Qidiruv boshlang: /search",
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()