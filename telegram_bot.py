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
        'welcome_title': 'Welcome to LinkUp Dating 🖤',
        'welcome_text': '''Exclusive community for dating based on Telegram — where real girls meet interesting guys.

All profiles go through multi-stage verification, ensuring that every meeting is a unique communication experience with a real person.''',
        'join_button': '💕 Join Exclusive Community'
    },
    'ru': {
        'welcome_title': 'Добро пожаловать в LinkUp Dating 🖤',
        'welcome_text': '''Эксклюзивное сообщество для знакомств на базе Telegram — там, где реальные девушки встречают интересных парней.

Все профили проходят многоступенчатую верификацию, гарантируя, что каждая встреча - это уникальный опыт коммуникации с реальным человеком.''',
        'join_button': '💕 Присоединиться к Сообществу'
    },
    'uz': {
        'welcome_title': 'LinkUp Dating ga xush kelibsiz 🖤',
        'welcome_text': '''Telegram asosidagi eksklyuziv tanishuv hamjamiyati — bu yerda haqiqiy qizlar qiziqarli yigitlar bilan tanishadilar.

Barcha profillar ko'p bosqichli tekshiruvdan o'tadi, bu har bir uchrashuvning haqiqiy odam bilan noyob muloqot tajribasi ekanligini kafolatlaydi.''',
        'join_button': '💕 Eksklyuziv Hamjamiyatga Qo\'shilish'
    }
}

def get_user_language(user_id):
    return user_languages.get(user_id, 'uz')  # Default Uzbek

def get_text(user_id, key):
    lang = get_user_language(user_id)
    return TEXTS[lang].get(key, TEXTS['uz'].get(key, key))

@dp.message(Command("start"))
async def start_command(message: types.Message):
    """Start komanda - 3 tilda til tanlash"""
    
    # Language selection first
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
    
    # Simple language selection message
    await message.answer(
        text="🌍 Tilni tanlang / Выберите язык / Choose language:",
        reply_markup=keyboard
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
    """Show welcome message with image in selected language"""
    user_id = user.id
    user_lang = get_user_language(user_id)
    
    # Get welcome text in user's language
    welcome_title = TEXTS[user_lang]['welcome_title'] 
    welcome_text = TEXTS[user_lang]['welcome_text']
    join_button = TEXTS[user_lang]['join_button']
    
    # Combine title and text
    full_welcome = f"{welcome_title}\n\n{welcome_text}"
    
    # Use the uploaded logo image
    logo_image = INTRO_IMAGE_FILE_ID or "AgACAgIAAxkBAAICzWhd5McGMSgN1zqbXjbYkhg9qD7rAAJM8TEbbivwSllK5DewA85TAQADAgADeAADNgQ"
    
    # Add language parameter to Mini App URL
    app_url_with_lang = f"{WEB_APP_URL}?lang={user_lang}&user_id={user_id}"
    
    try:
        # Send photo with welcome text
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text=join_button, 
                web_app=WebAppInfo(url=app_url_with_lang)
            )]
        ])
        
        await message.edit_text(
            text="✅ Til saqlandi! / Language saved! / Язык сохранён!"
        )
        
        await message.answer_photo(
            photo=logo_image,
            caption=full_welcome,
            reply_markup=keyboard,
            parse_mode="Markdown"
        )
    except Exception as e:
        print(f"❌ Welcome message error: {e}")
        # Fallback to text
        await message.answer(
            text=f"💕 {full_welcome}",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text=join_button,
                    web_app=WebAppInfo(url=app_url_with_lang)
                )]
            ]),
            parse_mode="Markdown"
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

# Handle photo uploads to get file_id
@dp.message(F.photo)
async def handle_photo(message: types.Message):
    """Handle photo upload to get file_id"""
    try:
        photo = message.photo[-1]  # Get highest resolution
        file_id = photo.file_id
        
        print(f"📸 Received photo file_id: {file_id}")
        
        await message.answer(
            f"✅ Rasm qabul qilindi!\n\n"
            f"File ID: `{file_id}`\n\n"
            f"Endi bot intro rasmini yangilayman...",
            parse_mode="Markdown"
        )
        
        # Auto update the intro image in code
        global INTRO_IMAGE_FILE_ID
        INTRO_IMAGE_FILE_ID = file_id
        print(f"🔄 Updated intro image file_id: {file_id}")
        
    except Exception as e:
        print(f"❌ Photo handler error: {e}")
        await message.answer("❌ Rasm yuklashda xatolik!")

# Global variable for intro image
INTRO_IMAGE_FILE_ID = "AgACAgIAAxkBAAICzWhd5McGMSgN1zqbXjbYkhg9qD7rAAJM8TEbbivwSllK5DewA85TAQADAgADeAADNgQ"

# Handle only specific messages, not automatic greeting
@dp.message()
async def handle_any_message(message: types.Message):
    """Handle messages only when user sends something"""
    # Only respond to actual text messages from user
    if message.text and not message.text.startswith('/'):
        # User sent a message, show start prompt
        await message.answer(
            "💕 LinkUp Dating ga xush kelibsiz!\n\n"
            "Boshlash uchun /start tugmasini bosing",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🚀 Boshlash", callback_data="start_bot")]
            ])
        )
    # Don't auto-respond when user just opens bot

@dp.callback_query(F.data == "start_bot")
async def start_bot_callback(callback: CallbackQuery):
    """Start bot callback"""
    await callback.answer()
    await start_command(callback.message)

async def main():
    """Bot ishga tushirish"""
    print("🤖 LinkUp Dating Bot - REAL MODE")
    print(f"🌐 Web App URL: {WEB_APP_URL}")
    
    # Set bot commands and description
    try:
        # Set bot commands
        commands = [
            types.BotCommand(command="start", description="Boshlash va til tanlash"),
            types.BotCommand(command="help", description="Yordam va ma'lumot"),
            types.BotCommand(command="language", description="Tilni o'zgartirish"),
            types.BotCommand(command="profile", description="Profilni ochish")
        ]
        await bot.set_my_commands(commands)
        
        # Set bot description
        await bot.set_my_description(
            "💕 LinkUp Dating - Professional tanishuv platformasi\n\n"
            "Эксклюзивное сообщество для знакомств на базе Telegram — "
            "там, где реальные девушки встречают интересных парней.\n\n"
            "Все профили проходят многоступенчатую верификацию."
        )
        
        print("✅ Bot commands va description o'rnatildi")
        
    except Exception as e:
        print(f"⚠️ Bot setup error: {e}")
    
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