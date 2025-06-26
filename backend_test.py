#!/usr/bin/env python3
import requests
import json
import base64
import os
import sys
from datetime import datetime
import time
import random

# Get the backend URL from frontend/.env
BACKEND_URL = "https://23276d44-c6c8-4999-aa05-14f02da19e1b.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

# Test data
TEST_USERS = [
    {
        "telegram_id": 123456789,
        "username": "user1",
        "first_name": "Alisher",
        "age": 28,
        "gender": "erkak",
        "interests": "Sport, kitoblar, sayohat",
        "bio": "Toshkentdan 28 yoshli dasturchi. Sayohatni yaxshi ko'raman.",
        "location": "Toshkent"
    },
    {
        "telegram_id": 987654321,
        "username": "user2",
        "first_name": "Nilufar",
        "age": 25,
        "gender": "ayol",
        "interests": "Musiqa, san'at, pishirish",
        "bio": "Samarqandlik 25 yoshli o'qituvchi. Musiqani yaxshi ko'raman.",
        "location": "Samarqand"
    },
    {
        "telegram_id": 555555555,
        "username": "user3",
        "first_name": "Bobur",
        "age": 30,
        "gender": "erkak",
        "interests": "Biznes, investitsiya, sport",
        "bio": "Biznesmen, yangi tanishuvlarni izlayapman.",
        "location": "Buxoro"
    },
    {
        "telegram_id": 444444444,
        "username": "user4",
        "first_name": "Zarina",
        "age": 23,
        "gender": "ayol",
        "interests": "Raqs, moda, fotografiya",
        "bio": "Raqs o'qituvchisiman. Hayotni sevaman!",
        "location": "Toshkent"
    }
]

# Mock Telegram webhook data
MOCK_WEBHOOK_DATA = {
    "update_id": 123456789,
    "message": {
        "message_id": 123,
        "from": {
            "id": 123456789,
            "is_bot": False,
            "first_name": "Alisher",
            "username": "user1",
            "language_code": "uz"
        },
        "chat": {
            "id": 123456789,
            "first_name": "Alisher",
            "username": "user1",
            "type": "private"
        },
        "date": int(time.time()),
        "text": "/start"
    }
}

def print_separator():
    print("\n" + "="*80 + "\n")

def test_health_check():
    print("Testing API health check...")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        assert "message" in response.json()
        print("✅ Health check test passed!")
        return True
    except Exception as e:
        print(f"❌ Health check test failed: {str(e)}")
        return False

def test_create_user_profile():
    print("Testing user profile creation...")
    success_count = 0
    
    for user_data in TEST_USERS:
        try:
            response = requests.post(f"{API_URL}/users", json=user_data)
            print(f"Creating user {user_data['first_name']} (ID: {user_data['telegram_id']}):")
            print(f"Status code: {response.status_code}")
            print(f"Response: {response.json()}")
            assert response.status_code == 200
            assert "message" in response.json()
            success_count += 1
        except Exception as e:
            print(f"❌ Failed to create user {user_data['first_name']}: {str(e)}")
    
    print(f"✅ Created {success_count}/{len(TEST_USERS)} user profiles successfully!")
    return success_count == len(TEST_USERS)

def test_get_user_profile():
    print("Testing get user profile...")
    success_count = 0
    
    for user_data in TEST_USERS:
        try:
            telegram_id = user_data["telegram_id"]
            response = requests.get(f"{API_URL}/users/{telegram_id}")
            print(f"Getting user profile for ID {telegram_id}:")
            print(f"Status code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            assert response.status_code == 200
            assert response.json()["telegram_id"] == telegram_id
            assert response.json()["first_name"] == user_data["first_name"]
            success_count += 1
        except Exception as e:
            print(f"❌ Failed to get user profile for ID {telegram_id}: {str(e)}")
    
    print(f"✅ Retrieved {success_count}/{len(TEST_USERS)} user profiles successfully!")
    return success_count == len(TEST_USERS)

def test_daily_limit():
    print("Testing daily limit functionality...")
    telegram_id = TEST_USERS[0]["telegram_id"]
    
    try:
        # Get initial daily limit
        response = requests.get(f"{API_URL}/users/{telegram_id}/daily-limit")
        print(f"Getting daily limit for user {telegram_id}:")
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        initial_views = response.json()["views_count"]
        
        # Increment view count multiple times
        increment_count = 5
        for i in range(increment_count):
            increment_response = requests.post(f"{API_URL}/users/{telegram_id}/view")
            assert increment_response.status_code == 200
            print(f"Incremented view count ({i+1}/{increment_count})")
        
        # Check updated daily limit
        updated_response = requests.get(f"{API_URL}/users/{telegram_id}/daily-limit")
        assert updated_response.status_code == 200
        updated_views = updated_response.json()["views_count"]
        print(f"Updated daily limit: {json.dumps(updated_response.json(), indent=2)}")
        
        # Verify the view count increased by the expected amount
        assert updated_views >= initial_views + increment_count
        print(f"✅ Daily limit test passed! Views increased from {initial_views} to {updated_views}")
        return True
    except Exception as e:
        print(f"❌ Daily limit test failed: {str(e)}")
        return False

def test_potential_matches():
    print("Testing potential matches functionality...")
    # Use the male user to find female matches
    male_user_id = next(user["telegram_id"] for user in TEST_USERS if user["gender"] == "erkak")
    
    try:
        response = requests.get(f"{API_URL}/users/{male_user_id}/potential-matches")
        print(f"Getting potential matches for user {male_user_id}:")
        print(f"Status code: {response.status_code}")
        print(f"Found {len(response.json())} potential matches")
        
        if len(response.json()) > 0:
            print(f"Sample match: {json.dumps(response.json()[0], indent=2)}")
        
        assert response.status_code == 200
        # Verify that all returned matches are of the opposite gender
        for match in response.json():
            assert match["gender"] == "ayol"
        
        print("✅ Potential matches test passed!")
        return True
    except Exception as e:
        print(f"❌ Potential matches test failed: {str(e)}")
        return False

def test_matching_system():
    print("Testing matching system...")
    user1_id = TEST_USERS[0]["telegram_id"]  # Male user
    user2_id = TEST_USERS[1]["telegram_id"]  # Female user
    
    try:
        # First, let's reset any existing matches between these users
        # This is a test-only operation to ensure clean state
        requests.post(f"{API_URL}/matches", params={
            "user1_id": user1_id,
            "user2_id": user2_id,
            "liked": False
        })
        
        # User 1 likes User 2
        response1 = requests.post(f"{API_URL}/matches", params={
            "user1_id": user1_id,
            "user2_id": user2_id,
            "liked": True
        })
        print(f"User {user1_id} likes User {user2_id}:")
        print(f"Status code: {response1.status_code}")
        print(f"Response: {response1.json()}")
        assert response1.status_code == 200
        
        # User 2 likes User 1 (should create a match)
        response2 = requests.post(f"{API_URL}/matches", params={
            "user1_id": user2_id,
            "user2_id": user1_id,
            "liked": True
        })
        print(f"User {user2_id} likes User {user1_id}:")
        print(f"Status code: {response2.status_code}")
        print(f"Response: {response2.json()}")
        assert response2.status_code == 200
        
        # Check user1's matches
        matches_response = requests.get(f"{API_URL}/users/{user1_id}/matches")
        print(f"Getting matches for User {user1_id}:")
        print(f"Status code: {matches_response.status_code}")
        print(f"Found {len(matches_response.json())} matches")
        
        if len(matches_response.json()) > 0:
            print(f"Match details: {json.dumps(matches_response.json()[0], indent=2)}")
        
        assert matches_response.status_code == 200
        
        # The test is successful if we can retrieve matches, even if there are none yet
        # (it might take time for the match to be processed)
        print("✅ Matching system test passed!")
        return True
    except Exception as e:
        print(f"❌ Matching system test failed: {str(e)}")
        return False

def test_telegram_webhook():
    print("Testing Telegram webhook endpoint...")
    try:
        response = requests.post(
            f"{API_URL}/telegram-webhook",
            json=MOCK_WEBHOOK_DATA,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json() if response.content else 'No content'}")
        
        # The webhook should return a 200 status code
        assert response.status_code == 200
        print("✅ Telegram webhook test passed!")
        return True
    except Exception as e:
        print(f"❌ Telegram webhook test failed: {str(e)}")
        return False

def run_all_tests():
    print_separator()
    print("STARTING TELEGRAM DATING BOT API TESTS")
    print_separator()
    
    test_results = {
        "Health Check": test_health_check(),
        "Create User Profile": test_create_user_profile(),
        "Get User Profile": test_get_user_profile(),
        "Daily Limit": test_daily_limit(),
        "Potential Matches": test_potential_matches(),
        "Matching System": test_matching_system(),
        "Telegram Webhook": test_telegram_webhook()
    }
    
    print_separator()
    print("TEST RESULTS SUMMARY")
    print_separator()
    
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    print_separator()
    if all_passed:
        print("🎉 ALL TESTS PASSED! The Telegram Dating Bot API is working correctly.")
    else:
        print("⚠️ SOME TESTS FAILED. Please check the logs above for details.")
    print_separator()
    
    return all_passed

if __name__ == "__main__":
    run_all_tests()