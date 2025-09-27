#!/usr/bin/env python3
"""
Debug session ID mismatch issue
"""

import requests
import json

def debug_session_ids():
    print("🔍 Debugging Session ID Mismatch")
    
    # Step 1: Upload file and note the session ID returned
    print("\n📎 Step 1: Upload file...")
    with open("test-data/fis-io-ledger-accounts.csv", 'rb') as f:
        file_content = f.read()
    
    files = {'file': ('fis-io-ledger-accounts.csv', file_content, 'text/csv')}
    upload_response = requests.post("http://localhost:8000/upload-accounts", files=files)
    
    if upload_response.status_code == 200:
        upload_result = upload_response.json()
        session_id_from_upload = upload_result['session_id']
        print(f"✅ Upload successful - Session ID: {session_id_from_upload}")
    else:
        print(f"❌ Upload failed: {upload_response.text}")
        return
    
    # Step 2: Send chat request with that exact session ID
    print(f"\n💬 Step 2: Send chat with session ID: {session_id_from_upload}")
    
    chat_payload = {
        "message": "Please analyze the uploaded accounts and suggest mappings",
        "context": {
            "totalRows": 72,
            "sessionId": session_id_from_upload
        },
        "conversation": [],
        "session_id": session_id_from_upload
    }
    
    print(f"📤 Chat payload session IDs:")
    print(f"   - context.sessionId: {chat_payload['context']['sessionId']}")
    print(f"   - session_id: {chat_payload['session_id']}")
    
    chat_response = requests.post("http://localhost:8000/chat", json=chat_payload)
    
    if chat_response.status_code == 200:
        response_text = chat_response.json()['response']
        print(f"✅ Chat successful!")
        
        if "don't see" in response_text.lower() or "file" in response_text.lower():
            print(f"❌ Claude still asking for file data")
            print(f"📋 Response snippet: {response_text[:200]}...")
        else:
            print(f"🎯 SUCCESS: Claude provided mappings!")
            print(f"📋 Response snippet: {response_text[:200]}...")
    else:
        print(f"❌ Chat failed: {chat_response.status_code} - {chat_response.text}")

if __name__ == "__main__":
    debug_session_ids()