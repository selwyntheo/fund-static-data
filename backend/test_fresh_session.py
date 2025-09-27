#!/usr/bin/env python3
"""
Check what session IDs are currently in backend storage
"""

import requests

def check_backend_sessions():
    print("🔍 Checking Backend Session Storage")
    
    # First, let's do a fresh upload to see what session ID gets created
    print("\n📎 Step 1: Fresh file upload...")
    try:
        with open("../test-data/fis-io-ledger-accounts.csv", 'rb') as f:
            file_content = f.read()
        
        files = {'file': ('fis-io-ledger-accounts.csv', file_content, 'text/csv')}
        upload_response = requests.post("http://localhost:8000/upload-accounts", files=files)
        
        if upload_response.status_code == 200:
            upload_result = upload_response.json()
            fresh_session_id = upload_result['session_id']
            print(f"✅ Fresh upload successful")
            print(f"📋 New session ID: {fresh_session_id}")
            print(f"📊 Accounts: {upload_result['accounts_count']}")
            
            # Now immediately test chat with this fresh session ID
            print(f"\n💬 Step 2: Test chat with fresh session ID...")
            
            chat_payload = {
                "message": "Please analyze the uploaded accounts and suggest mappings",
                "context": {
                    "totalRows": upload_result['accounts_count'],
                    "sessionId": fresh_session_id
                },
                "conversation": [],
                "session_id": fresh_session_id
            }
            
            chat_response = requests.post("http://localhost:8000/chat", json=chat_payload)
            
            if chat_response.status_code == 200:
                response_text = chat_response.json()['response']
                print(f"✅ Chat successful!")
                
                if "don't see" in response_text.lower() or "please provide" in response_text.lower():
                    print(f"❌ Claude still asking for file data - backend session issue")
                else:
                    print(f"🎯 SUCCESS: Claude received file data!")
                    
                print(f"📝 Response preview: {response_text[:200]}...")
            else:
                print(f"❌ Chat failed: {chat_response.status_code} - {chat_response.text}")
                
        else:
            print(f"❌ Upload failed: {upload_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_backend_sessions()