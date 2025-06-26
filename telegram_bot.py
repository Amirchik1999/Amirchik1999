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
        'welcome_text': '''Welcome to **LinkUp Dating**, {name}! 🎉

I'm your personal dating assistant bot. I'll help you:

💕 **Find real people nearby** using GPS
🎯 **Get perfect matches** based on your interests  
💬 **Start meaningful conversations** with your matches
🌟 **Experience professional dating** like never before

Ready to find your perfect match? Let's start your journey! 🚀''',
        'open_app': '💕 Start My Dating Journey',
        'help_title': '🤖 Your Dating Assistant',
        'help_text': '''Hi! I'm your LinkUp Dating assistant! 🤖

📋 **What I can help you with:**
• `/start` - Begin your dating journey
• `/help` - Get assistance anytime
• `/language` - Change your language
• `/profile` - Access your dating profile

🎯 **How LinkUp Dating works:**
1. I'll help you create an amazing profile
2. You'll discover people near you using GPS
3. Swipe and match with people you like
4. Start conversations with your matches!

💡 **Pro tip:** Complete your profile for better matches!''',
        'profile_btn': '👤 My Dating Profile'
    },
    'ru': {
        'select_language': '💫 Выберите язык для продолжения:',
        'language_selected': '✅ Язык установлен: Русский! Добро пожаловать!',
        'welcome_title': '🌟 LinkUp Dating',
        'welcome_text': '''Добро пожаловать в **LinkUp Dating**, {name}! 🎉

Я ваш персональный бот-помощник для знакомств. Помогу вам:

💕 **Найти реальных людей рядом** через GPS
🎯 **Получить идеальные совпадения** по интересам
💬 **Начать значимые разговоры** с парами
🌟 **Испытать профессиональные знакомства** как никогда

Готовы найти идеальную пару? Начнём ваше путешествие! 🚀''',
        'open_app': '💕 Начать Моё Знакомство',
        'help_title': '🤖 Ваш Помощник Знакомств',
        'help_text': '''Привет! Я ваш помощник LinkUp Dating! 🤖

📋 **Чем могу помочь:**
• `/start` - Начать путешествие знакомств
• `/help` - Получить помощь в любое время
• `/language` - Изменить язык
• `/profile` - Доступ к профилю знакомств

🎯 **Как работает LinkUp Dating:**
1. Помогу создать потрясающий профиль
2. Вы найдёте людей рядом через GPS
3. Свайпайте и находите совпадения
4. Начинайте разговоры с парами!

💡 **Совет:** Заполните профиль для лучших совпадений!''',
        'profile_btn': '👤 Мой Профиль Знакомств'
    },
    'uz': {
        'select_language': '💫 Davom etish uchun tilni tanlang:',
        'language_selected': '✅ Til o\'rnatildi: O\'zbek! Xush kelibsiz!',
        'welcome_title': '🌟 LinkUp Dating',
        'welcome_text': '''**LinkUp Dating** ga xush kelibsiz, {name}! 🎉

Men sizning shaxsiy tanishuv yordamchi botingizman. Sizga yordam beraman:

💕 **Yaqin atrofdagi real odamlarni topishda** GPS orqali
🎯 **Mukammal matchlarni olishda** qiziqishlaringiz asosida
💬 **Mazmunli suhbatlar boshlashda** matchlaringiz bilan
🌟 **Professional tanishuv tajribasini boshdan kechirishda**

Mukammal juftingizni topishga tayyormisiz? Sayohatingizni boshlaylik! 🚀''',
        'open_app': '💕 Tanishuv Sayohatimni Boshlash',
        'help_title': '🤖 Sizning Tanishuv Yordamchingiz',
        'help_text': '''Salom! Men sizning LinkUp Dating yordamchingizman! 🤖

📋 **Nima bilan yordam bera olaman:**
• `/start` - Tanishuv sayohatingizni boshlash
• `/help` - Istalgan vaqtda yordam olish
• `/language` - Tilni o'zgartirish
• `/profile` - Tanishuv profilingizga kirish

🎯 **LinkUp Dating qanday ishlaydi:**
1. Ajoyib profil yaratishda yordam beraman
2. GPS orqali yaqin odamlarni topasiz
3. Swipe qiling va yoqqanlaringiz bilan match oling
4. Matchlaringiz bilan suhbat boshlang!

💡 **Maslahat:** Yaxshi matchlar uchun profilingizni to'ldiring!''',
        'profile_btn': '👤 Mening Tanishuv Profilim'
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