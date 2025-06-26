import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, CallbackQuery
import os

# Telegram Bot Token 
BOT_TOKEN = os.getenv("BOT_TOKEN", "7341041276:AAHxZ4-BWga2oSoslug0TkCiFoE52Jzl9is")

# Web App URL
WEB_APP_URL = "https://23276d44-c6c8-4999-aa05-14f02da19e1b.preview.emergentagent.com"

# Bot va Dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

logging.basicConfig(level=logging.INFO)

# User language storage
user_languages = {}

# Multi-language texts
TEXTS = {
    'en': {
        'select_language': '🌐 Select your language:',
        'language_selected': '✅ Language set to English',
        'welcome_title': '💕 LinkUp Dating',
        'welcome_text': '''Hello {name}! 👋

🔥 Welcome to LinkUp Dating!

✨ Here you can:
• Meet people nearby
• Find matches using GPS location
• Chat with your matches
• Professional dating experience

🎯 Press the button below to start:''',
        'open_app': '🚀 Open LinkUp Dating',
        'help_title': '🆘 LinkUp Dating Help',
        'help_text': '''📋 Available commands:
• /start - Start the bot
• /help - Get help
• /language - Change language

🎯 How it works:
1. Start with /start command
2. Press "Open LinkUp Dating"
3. Create your profile
4. Meet people nearby!

💕 LinkUp Dating - Best dating experience!''',
        'profile_btn': '👤 Open Profile'
    },
    'ru': {
        'select_language': '🌐 Выберите ваш язык:',
        'language_selected': '✅ Язык установлен: Русский',
        'welcome_title': '💕 LinkUp Dating',
        'welcome_text': '''Привет {name}! 👋

🔥 Добро пожаловать в LinkUp Dating!

✨ Здесь вы можете:
• Знакомиться с людьми рядом
• Находить совпадения по GPS
• Общаться с парами
• Профессиональный опыт знакомств

🎯 Нажмите кнопку ниже, чтобы начать:''',
        'open_app': '🚀 Открыть LinkUp Dating',
        'help_title': '🆘 Помощь LinkUp Dating',
        'help_text': '''📋 Доступные команды:
• /start - Запустить бота
• /help - Получить помощь
• /language - Изменить язык

🎯 Как это работает:
1. Начните с команды /start
2. Нажмите "Открыть LinkUp Dating"
3. Создайте свой профиль
4. Знакомьтесь с людьми рядом!

💕 LinkUp Dating - Лучший опыт знакомств!''',
        'profile_btn': '👤 Открыть профиль'
    },
    'uz': {
        'select_language': '🌐 Tilingizni tanlang:',
        'language_selected': '✅ Til o\'rnatildi: O\'zbek',
        'welcome_title': '💕 LinkUp Dating',
        'welcome_text': '''Salom {name}! 👋

🔥 LinkUp Dating ga xush kelibsiz!

✨ Bu yerda siz:
• Yaqin atrofdagi odamlar bilan tanishishingiz mumkin
• GPS orqali eng yaqin odamlarni topishingiz mumkin
• Matchlar bilan chat qilishingiz mumkin
• Professional tanishuv tajribasini boshdan kechirishingiz mumkin

🎯 Boshlash uchun quyidagi tugmani bosing:''',
        'open_app': '🚀 LinkUp Dating ni ochish',
        'help_title': '🆘 LinkUp Dating Yordam',
        'help_text': '''📋 Mavjud komandalar:
• /start - Botni boshlash
• /help - Yordam olish
• /language - Tilni o'zgartirish

🎯 Qanday ishlaydi:
1. /start komandasi bilan boshlang
2. "LinkUp Dating ni ochish" tugmasini bosing
3. Profilingizni yarating
4. Yaqin atrofdagi odamlar bilan tanishing!

💕 LinkUp Dating - Eng yaxshi tanishuv tajribasi!''',
        'profile_btn': '👤 Profilni ochish'
    }
}

def get_user_language(user_id):
    return user_languages.get(user_id, 'uz')  # Default Uzbek

def get_text(user_id, key):
    lang = get_user_language(user_id)
    return TEXTS[lang].get(key, TEXTS['uz'].get(key, key))

@dp.message(Command("start"))
async def start_command(message: types.Message):
    """Start komanda - professional til tanlash"""
    
    # Professional language selection design
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🇺🇿 O'zbekcha", callback_data="lang_uz")
        ],
        [
            InlineKeyboardButton(text="🇷🇺 Русский язык", callback_data="lang_ru")
        ],
        [
            InlineKeyboardButton(text="🇺🇸 English", callback_data="lang_en")
        ]
    ])
    
    # Professional welcome with language selection
    welcome_msg = """
🌟 **LinkUp Dating** ga xush kelibsiz!

Yaqin atrofdagi odamlar bilan tanishing, real people bilan chat qiling va hayotingizni o'zgartiring! 

💫 **Boshlash uchun tilni tanlang:**
    """
    
    await message.answer(
        text=welcome_msg,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

@dp.callback_query(F.data.startswith("lang_"))
async def language_callback(callback: CallbackQuery):
    """Til tanlash callback"""
    user_id = callback.from_user.id
    lang_code = callback.data.split("_")[1]
    
    # Save user language
    user_languages[user_id] = lang_code
    
    # Show language confirmation
    await callback.answer(get_text(user_id, 'language_selected'))
    
    # Show welcome message in selected language
    await show_welcome(callback.message, callback.from_user)

async def show_welcome(message, user):
    """Welcome message ko'rsatish"""
    user_id = user.id
    
    welcome_text = get_text(user_id, 'welcome_text').format(name=user.first_name)
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text=get_text(user_id, 'open_app'), 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    
    await message.edit_text(
        text=welcome_text,
        reply_markup=keyboard
    )

@dp.message(Command("help"))
async def help_command(message: types.Message):
    """Yordam komandasi"""
    user_id = message.from_user.id
    help_text = get_text(user_id, 'help_text')
    
    await message.answer(text=help_text)

@dp.message(Command("language"))
async def language_command(message: types.Message):
    """Tilni o'zgartirish"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🇺🇿 O'zbek", callback_data="lang_uz"),
            InlineKeyboardButton(text="🇷🇺 Русский", callback_data="lang_ru")
        ],
        [
            InlineKeyboardButton(text="🇺🇸 English", callback_data="lang_en")
        ]
    ])
    
    await message.answer(
        text="🌐 Tilni tanlang / Выберите язык / Select language:",
        reply_markup=keyboard
    )

@dp.message(Command("profile"))
async def profile_command(message: types.Message):
    """Profil komandasi"""
    user_id = message.from_user.id
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text=get_text(user_id, 'profile_btn'), 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    
    await message.answer(
        text=get_text(user_id, 'profile_btn'),
        reply_markup=keyboard
    )

async def main():
    """Bot ishga tushirish"""
    print("🤖 LinkUp Dating Bot - REAL MODE")
    print(f"🌐 Web App URL: {WEB_APP_URL}")
    
    # Real bot ishga tushirish
    await bot.delete_webhook(drop_pending_updates=True)
    print("✅ Bot webhook o'chirildi")
    
    try:
        print("🚀 Bot polling rejimida ishga tushmoqda...")
        await dp.start_polling(bot)
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())