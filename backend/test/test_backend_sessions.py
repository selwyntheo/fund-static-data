#!/usr/bin/env python3
"""
Test backend session ID handling
"""

import requests
import json

def test_backend_session_handling():
    print("🧪 Testing Backend Session ID Handling")
    
    # Step 1: Upload file
    print("\n📎 Step 1: Upload file...")
    try:
        with open("test-data/fis-io-ledger-accounts.csv", 'rb') as f:
            file_content = f.read()
        
        files = {'file': ('fis-io-ledger-accounts.csv', file_content, 'text/csv')}
        upload_response = requests.post("http://localhost:8000/upload-accounts", files=files)
        
        if upload_response.status_code == 200:
            upload_result = upload_response.json()
            session_id = upload_result['session_id']
            print(f"✅ Upload successful")
            print(f"📋 Session ID: {session_id}")
            print(f"📊 Accounts: {upload_result['accounts_count']}")
        else:
            print(f"❌ Upload failed: {upload_response.text}")
            return
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return
    
    # Step 2: Test chat with the session ID
    print(f"\n💬 Step 2: Test chat with session ID...")
    
    # Test different ways of sending session ID
    test_payloads = [
        {
            "name": "session_id in root + context",
            "payload": {
                "message": "Please analyze the uploaded accounts and suggest Eagle mappings",
                "context": {
                    "totalRows": 72,
                    "sessionId": session_id
                },
                "conversation": [],
                "session_id": session_id
            }
        },
        {
            "name": "session_id only in context", 
            "payload": {
                "message": "Please analyze the uploaded accounts and suggest Eagle mappings",
                "context": {
                    "totalRows": 72,
                    "sessionId": session_id
                },
                "conversation": []
            }
        },
        {
            "name": "session_id only in root",
            "payload": {
                "message": "Please analyze the uploaded accounts and suggest Eagle mappings", 
                "context": {
                    "totalRows": 72
                },
                "conversation": [],
                "session_id": session_id
            }
        }
    ]
    
    for test in test_payloads:
        print(f"\n🧪 Testing: {test['name']}")
        
        try:
            chat_response = requests.post("http://localhost:8000/chat", json=test['payload'])
            
            if chat_response.status_code == 200:
                response_text = chat_response.json()['response']
                print(f"✅ Request successful")
                
                # Check if Claude got the file data
                if any(phrase in response_text.lower() for phrase in ["don't see", "haven't provided", "please provide", "share the"]):
                    print(f"❌ Claude asking for file data (backend not sending file content)")
                elif any(phrase in response_text.lower() for phrase in ["confidence", "mapping", "account"]):
                    print(f"🎯 SUCCESS: Claude received file data and provided mappings!")
                else:
                    print(f"❓ Unclear response")
                
                print(f"📝 Response preview: {response_text[:150]}...")
            else:
                print(f"❌ Request failed: {chat_response.status_code} - {chat_response.text}")
                
        except Exception as e:
            print(f"❌ Request error: {e}")

if __name__ == "__main__":
    test_backend_session_handling()