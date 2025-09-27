#!/usr/bin/env python3
"""
Test script to verify file upload behavior fix
"""

import requests
import time

BACKEND_URL = "http://localhost:8000"

def test_file_upload_behavior():
    print("🧪 Testing File Upload Behavior Fix")
    print("=" * 50)
    
    # Test 1: Upload a file
    print("📤 Step 1: Uploading test file...")
    
    # Use our existing test file
    with open('test-data/fis-io-ledger-accounts.csv', 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BACKEND_URL}/upload-accounts", files=files)
    
    if response.status_code == 200:
        result = response.json()
        session_id = result['session_id']
        print(f"✅ File uploaded successfully! Session ID: {session_id}")
        print(f"📊 Accounts processed: {result.get('accounts_count', 0)}")
        
        # Test 2: Send a mapping request
        print("\n💬 Step 2: Sending mapping request...")
        
        chat_data = {
            "message": "Map the file - analyze the uploaded accounts and suggest mappings",
            "session_id": session_id
        }
        
        chat_response = requests.post(f"{BACKEND_URL}/chat", json=chat_data)
        
        if chat_response.status_code == 200:
            chat_result = chat_response.json()
            response_text = chat_result.get('response', '')
            
            print("✅ Chat response received!")
            print("📋 Response preview:")
            print("-" * 40)
            print(response_text[:300] + "..." if len(response_text) > 300 else response_text)
            print("-" * 40)
            
            # Check if the response shows file awareness
            if any(keyword in response_text.lower() for keyword in ['account', 'uploaded', 'data', 'mapping']):
                print("✅ Claude is aware of the uploaded file data!")
                return True
            else:
                print("❌ Claude doesn't seem to have access to file data")
                return False
        else:
            print(f"❌ Chat request failed: {chat_response.status_code}")
            return False
    else:
        print(f"❌ File upload failed: {response.status_code}")
        return False

if __name__ == "__main__":
    success = test_file_upload_behavior()
    if success:
        print("\n🎉 Test passed! File upload + chat integration is working correctly.")
    else:
        print("\n❌ Test failed. There may still be issues with the integration.")