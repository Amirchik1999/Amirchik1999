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
        'select_language': '💫 Choose your language to continue:',
        'language_selected': '✅ Language set to English! Welcome!',
        'welcome_title': '🌟 LinkUp Dating',
        'welcome_text': '''Welcome to LinkUp Dating 🖤

Exclusive community for dating based on Telegram — where real girls meet interesting guys.

All profiles go through multi-stage verification, ensuring that every meeting is a unique communication experience with a real person.

The most active participants receive rewards 💎''',
        'open_app': '💕 Join Exclusive Community',
        'help_title': '🤖 Your Dating Assistant',
        'help_text': '''Hi! I'm your LinkUp Dating assistant! 🤖

📋 **What I can help you with:**
• `/start` - Begin your dating journey
• `/help` - Get assistance anytime
• `/language` - Change your language
• `/profile` - Access your dating profile

🎯 **How LinkUp Dating works:**
1. I'll help you create a verified profile
2. Meet verified people near you using GPS
3. Swipe and match with real people
4. Start meaningful conversations!

💡 **Pro tip:** Active users get special rewards!''',
        'profile_btn': '👤 My Exclusive Profile'
    },
    'ru': {
        'select_language': '💫 Выберите язык для продолжения:',
        'language_selected': '✅ Язык установлен: Русский! Добро пожаловать!',
        'welcome_title': '🌟 LinkUp Dating',
        'welcome_text': '''Добро пожаловать в LinkUp Dating 🖤

Эксклюзивное сообщество для знакомств на базе Telegram — там, где реальные девушки встречают интересных парней.

Все профили проходят многоступенчатую верификацию, гарантируя, что каждая встреча - это уникальный опыт коммуникации с реальным человеком.

Самые активные участники получают вознаграждение 💎''',
        'open_app': '💕 Присоединиться к Сообществу',
        'help_title': '🤖 Ваш Помощник Знакомств',
        'help_text': '''Привет! Я ваш помощник LinkUp Dating! 🤖

📋 **Чем могу помочь:**
• `/start` - Начать эксклюзивное знакомство
• `/help` - Получить помощь в любое время
• `/language` - Изменить язык
• `/profile` - Доступ к эксклюзивному профилю

🎯 **Как работает LinkUp Dating:**
1. Помогу создать верифицированный профиль
2. Встречайте верифицированных людей рядом через GPS
3. Свайпайте и находите совпадения с реальными людьми
4. Начинайте значимые разговоры!

💡 **Совет:** Активные пользователи получают особые награды!''',
        'profile_btn': '👤 Мой Эксклюзивный Профиль'
    },
    'uz': {
        'select_language': '💫 Davom etish uchun tilni tanlang:',
        'language_selected': '✅ Til o\'rnatildi: O\'zbek! Xush kelibsiz!',
        'welcome_title': '🌟 LinkUp Dating',
        'welcome_text': '''LinkUp Dating ga xush kelibsiz 🖤

Telegram asosidagi eksklyuziv tanishuv hamjamiyati — bu yerda haqiqiy qizlar qiziqarli yigitlar bilan tanishadilar.

Barcha profillar ko'p bosqichli tekshiruvdan o'tadi, bu har bir uchrashuvning haqiqiy odam bilan noyob muloqot tajribasi ekanligini kafolatlaydi.

Eng faol ishtirokchilar mukofot oladilar 💎''',
        'open_app': '💕 Eksklyuziv Hamjamiyatga Qo\'shilish',
        'help_title': '🤖 Sizning Tanishuv Yordamchingiz',
        'help_text': '''Salom! Men sizning LinkUp Dating yordamchingizman! 🤖

📋 **Nima bilan yordam bera olaman:**
• `/start` - Eksklyuziv tanishuv sayohatingizni boshlash
• `/help` - Istalgan vaqtda yordam olish
• `/language` - Tilni o'zgartirish
• `/profile` - Eksklyuziv profilingizga kirish

🎯 **LinkUp Dating qanday ishlaydi:**
1. Tekshirilgan profil yaratishda yordam beraman
2. GPS orqali yaqin tekshirilgan odamlar bilan tanishing
3. Swipe qiling va haqiqiy odamlar bilan match oling
4. Mazmunli suhbatlar boshlang!

💡 **Maslahat:** Faol foydalanuvchilar maxsus mukofotlar oladilar!''',
        'profile_btn': '👤 Mening Eksklyuziv Profilim'
    }
}

def get_user_language(user_id):
    return user_languages.get(user_id, 'uz')  # Default Uzbek

def get_text(user_id, key):
    lang = get_user_language(user_id)
    return TEXTS[lang].get(key, TEXTS['uz'].get(key, key))

@dp.message(Command("start"))
async def start_command(message: types.Message):
    """Start komanda - logo ko'rsatish va til tanlash"""
    
    # Professional logo caption in 3 languages
    logo_caption = """💕 **LinkUp Dating** 💕

🌟 **O'zbek**: Professional tanishuv platformasi
🌟 **Русский**: Эксклюзивная платформа знакомств  
🌟 **English**: Professional dating platform

Davom etish uchun tilni tanlang 👇"""

    # Send the logo as a document/sticker simulation
    # Note: In real bot, you would upload your logo image to Telegram and use file_id
    
    # Send welcome message with logo description
    await message.answer(
        text=logo_caption,
        parse_mode="Markdown"
    )
    
    # Language selection
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
    
    await message.answer(
        text="💫 **Tilni tanlang / Выберите язык / Choose language:**",
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
    
    welcome_text = get_text(user_id, 'welcome_text')
    
    # Add language parameter to Mini App URL
    user_lang = get_user_language(user_id)
    app_url_with_lang = f"{WEB_APP_URL}?lang={user_lang}&user_id={user_id}"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text=get_text(user_id, 'open_app'), 
            web_app=WebAppInfo(url=app_url_with_lang)
        )]
    ])
    
    await message.edit_text(
        text=welcome_text,
        reply_markup=keyboard,
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
    photo = message.photo[-1]  # Get highest resolution
    file_id = photo.file_id
    
    print(f"📸 Received photo file_id: {file_id}")
    
    await message.answer(
        f"✅ Rasm qabul qilindi!\n\n"
        f"File ID: `{file_id}`\n\n"
        f"Endi bot intro rasmini yangilayman...",
        parse_mode="Markdown"
    )

# Handle when user opens bot chat (no command)
@dp.message()
async def handle_any_message(message: types.Message):
    """Show intro screen with image when user opens bot"""
    user = message.from_user
    
    # Get user language from Telegram
    user_lang = user.language_code or 'ru'
    if user_lang.startswith('uz'):
        lang = 'uz'
    elif user_lang.startswith('en'):
        lang = 'en'
    else:
        lang = 'ru'  # Default Russian
    
    # Messages by language
    intro_messages = {
        'uz': {
            'caption': '''**LinkUp Dating**
Professional tanishuv platformasi

Faqat haqiqiy odamlar. Faqat tekshirilgan profillar.
Tanishing, muloqot qiling va o'zingizga mos odamlarni toping.🖤''',
            'button': '🚀 Boshlash'
        },
        'ru': {
            'caption': '''**LinkUp Dating**
Профессиональная платформа знакомств

Только реальные люди. Только проверенные анкеты.
Знакомься, общайся и находи тех, кто тебе подходит.🖤''',
            'button': '🚀 Начать'
        },
        'en': {
            'caption': '''**LinkUp Dating**
Professional Dating Platform

Only real people. Only verified profiles.
Meet, chat and find those who suit you.🖤''',
            'button': '🚀 Start'
        }
    }
    
    intro = intro_messages[lang]
    
    # Create intro image (placeholder for now - replace with your actual image)
    # You need to upload your logo image to get file_id
    intro_image_url = "https://via.placeholder.com/400x300/000000/FFFFFF?text=LinkUp+Dating+Logo"
    
    try:
        # Try to send photo
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text=intro['button'], 
                callback_data="start_bot"
            )]
        ])
        
        await message.answer_photo(
            photo=intro_image_url,
            caption=intro['caption'],
            reply_markup=keyboard,
            parse_mode="Markdown"
        )
    except Exception as e:
        # If image fails, send text version
        print(f"Image send failed: {e}")
        await message.answer(
            text=f"💕 {intro['caption']}",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text=intro['button'], callback_data="start_bot")]
            ]),
            parse_mode="Markdown"
        )

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