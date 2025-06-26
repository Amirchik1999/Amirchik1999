import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import os

# Telegram Bot Token 
BOT_TOKEN = os.getenv("BOT_TOKEN", "7890123456:AAHBcdefghijklmnopqrstuvwxyz1234567890")

# Web App URL
WEB_APP_URL = "https://23276d44-c6c8-4999-aa05-14f02da19e1b.preview.emergentagent.com"

# Bot va Dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

logging.basicConfig(level=logging.INFO)

@dp.message(Command("start"))
async def start_command(message: types.Message):
    """Start komanda - LinkUp Dating"""
    user = message.from_user
    
    welcome_text = f"""
💕 LinkUp Dating

Salom {user.first_name}! 

🔥 Yaqin atrofdagi odamlar bilan tanishing!

• Swipe qiling va like bering
• Match oling va chat boshlang
• GPS orqali yaqin odamlarni toping

Boshlash uchun tugmani bosing 👇
"""

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="💕 LinkUp Dating ni ochish", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    
    await message.answer(
        text=welcome_text,
        reply_markup=keyboard
    )

async def main():
    """Bot ishga tushirish"""
    print("🤖 LinkUp Dating Bot - Mock Mode")
    print("Real bot uchun BOT_TOKEN environment variable qo'ying")
    print(f"🌐 Web App URL: {WEB_APP_URL}")

    # Mock rejimda ishga tushirish
    if BOT_TOKEN == "7890123456:AAHBcdefghijklmnopqrstuvwxyz1234567890":
        print("⚠️  Mock token - real bot emas")
        print("💡 Real token olish uchun: https://t.me/BotFather")
        
        # Mock bot ma'lumotlari
        print("""
    📋 Bot sozlash:
    1. @BotFather ga /start yozing
    2. /newbot komandasi
    3. Bot nomi: LinkUp Dating Bot  
    4. Username: linkup_dating_bot
    5. Tokenni oling va BOT_TOKEN environment variable ga qo'ying
    
    🔧 Mini App sozlash:
    /setmycommands - start, help, profile
    /setdescription - LinkUp Dating - Tanishuv Mini App
    /setmenubutton - 💕 LinkUp Dating
    """)
        return

    # Real bot ishga tushirish
    try:
        await dp.start_polling(bot)
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())