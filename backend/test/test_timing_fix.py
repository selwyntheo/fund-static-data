#!/usr/bin/env python3
"""
Test the UI timing fix
"""

import time
import requests

def test_ui_timing_fix():
    print("🧪 Testing UI Timing Fix")
    print("This test simulates the fixed UI flow where files are processed BEFORE sending message")
    
    # The fix ensures:
    # 1. User attaches file + types message  
    # 2. User hits Send
    # 3. Files are processed FIRST (creates mappings with session_id)
    # 4. Message is sent AFTER with updated context containing session_id
    
    # Step 1: Upload file (simulates file processing in fixed UI)
    print("\n📎 Step 1: Processing file attachment...")
    with open("test-data/fis-io-ledger-accounts.csv", 'rb') as f:
        file_content = f.read()
    
    files = {'file': ('fis-io-ledger-accounts.csv', file_content, 'text/csv')}
    upload_response = requests.post("http://localhost:8000/upload-accounts", files=files)
    
    if upload_response.status_code != 200:
        print(f"❌ Upload failed: {upload_response.text}")
        return
    
    result = upload_response.json()
    session_id = result['session_id']
    accounts_count = result['accounts_count']
    
    print(f"✅ File processed with session_id: {session_id}")
    print(f"✅ Accounts loaded: {accounts_count}")
    
    # Step 2: Send message with context that includes session_id (simulates fixed timing)
    print(f"\n💬 Step 2: Sending message with session_id in context...")
    
    context = {
        "totalRows": accounts_count,
        "mappedRows": 0,
        "unmappedRows": 0, 
        "pendingRows": accounts_count,
        "rejectedRows": 0,
        "averageConfidence": 0,
        "recentChanges": [],
        "sessionId": session_id  # Session ID is now available!
    }
    
    message = "Please analyze the uploaded FIS IO accounts and suggest Eagle mappings for the first 5 accounts."
    
    chat_payload = {
        "message": message,
        "context": context,
        "conversation": [],
        "session_id": session_id
    }
    
    print(f"📤 Sending chat request...")
    print(f"   Session ID: {session_id}")
    print(f"   Context rows: {accounts_count}")
    
    chat_response = requests.post("http://localhost:8000/chat", json=chat_payload)
    
    if chat_response.status_code == 200:
        response_text = chat_response.json()['response']
        print(f"\n✅ Chat successful!")
        print(f"📝 Response length: {len(response_text)} characters")
        
        # Check if Claude provided specific mappings
        if any(code in response_text for code in ['1000', '1010', '1020']) and 'confidence' in response_text.lower():
            print(f"🎯 SUCCESS: Claude received file data and provided specific account mappings!")
            print(f"📋 Preview: {response_text[:200]}...")
        else:
            print(f"❌ ISSUE: Claude didn't provide expected account mappings")
            print(f"📋 Response: {response_text[:500]}...")
    else:
        print(f"❌ Chat failed: {chat_response.status_code} - {chat_response.text}")

if __name__ == "__main__":
    test_ui_timing_fix()