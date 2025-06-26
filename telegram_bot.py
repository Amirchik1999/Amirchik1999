import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import os

# Telegram Bot Token (o'zingizning tokeningizni qo'ying)
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")

# Web App URL
WEB_APP_URL = "https://23276d44-c6c8-4999-aa05-14f02da19e1b.preview.emergentagent.com"

# Bot va Dispatcher yaratish
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Logging sozlash
logging.basicConfig(level=logging.INFO)

@dp.message(Command("start"))
async def start_command(message: types.Message):
    """Start komandasi"""
    user = message.from_user
    
    # Welcome matn
    welcome_text = f"""
💎 **TON Dating** - Tanishuv boti!

Salom {user.first_name}! 👋

🔥 **TON Dating** ga xush kelibsiz!

✨ Bu yerda siz:
• Yaqin atrofdagi odamlar bilan tanishishingiz mumkin
• GPS orqali eng yaqin odamlarni topishingiz mumkin  
• Professional tanishuv tajribasini boshdan kechirishingiz mumkin

🎯 **Boshlash uchun** quyidagi tugmani bosing:
"""

    # Inline keyboard
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🚀 TON Dating ni ochish", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )],
        [InlineKeyboardButton(
            text="📱 Mini App orqali ochish", 
            url=WEB_APP_URL
        )]
    ])
    
    await message.answer(
        text=welcome_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

@dp.message(Command("help"))
async def help_command(message: types.Message):
    """Yordam komandasi"""
    help_text = """
🆘 **TON Dating Yordam**

📋 **Mavjud komandalar:**
• `/start` - Botni ishga tushirish
• `/help` - Yordam olish
• `/profile` - Profil sozlamalari

🎯 **Qanday ishlaydi:**
1. `/start` komandasi bilan boshlang
2. "TON Dating ni ochish" tugmasini bosing
3. Profilingizni yarating
4. Yaqin atrofdagi odamlar bilan tanishing!

💎 TON Dating - eng yaxshi tanishuv tajribasi!
"""
    
    await message.answer(text=help_text, parse_mode="Markdown")

@dp.message(Command("profile"))
async def profile_command(message: types.Message):
    """Profil komandasi"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="👤 Profilni ochish", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    
    await message.answer(
        text="👤 Profilingizni ko'rish va tahrirlash uchun quyidagi tugmani bosing:",
        reply_markup=keyboard
    )

async def main():
    """Bot ishga tushirish"""
    print("🤖 TON Dating Bot ishga tushmoqda...")
    print(f"🌐 Web App URL: {WEB_APP_URL}")
    
    # Webhookni o'chirish (agar mavjud bo'lsa)
    await bot.delete_webhook(drop_pending_updates=True)
    
    # Botni polling rejimida ishga tushirish
    try:
        await dp.start_polling(bot)
    except Exception as e:
        print(f"❌ Bot xatosi: {e}")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())