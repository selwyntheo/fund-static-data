#!/usr/bin/env python3
"""
Test to identify the UI file attachment timing issue
Simulates the exact UI flow: attach file -> type message -> send
"""

import requests
import time
import json

BACKEND_URL = "http://localhost:8000"

def simulate_ui_file_attachment_flow():
    """Simulate the exact UI flow that's causing issues"""
    print("🧪 Simulating UI File Attachment Flow\n")
    
    # Step 1: User attaches file (like dragging into InputArea)
    print("📎 Step 1: User attaches file to InputArea...")
    with open("test-data/fis-io-ledger-accounts.csv", 'rb') as f:
        file_content = f.read()
    
    files = {'file': ('fis-io-ledger-accounts.csv', file_content, 'text/csv')}
    upload_response = requests.post(f"{BACKEND_URL}/upload-accounts", files=files)
    
    if upload_response.status_code != 200:
        print(f"❌ File upload failed: {upload_response.text}")
        return
    
    upload_result = upload_response.json()
    session_id = upload_result['session_id']
    accounts_count = upload_result['accounts_count']
    
    print(f"✅ File attached with session_id: {session_id}")
    print(f"✅ Accounts uploaded: {accounts_count}")
    
    # Step 2: User types message (file is still attached in UI)
    print(f"\n💬 Step 2: User types message while file is attached...")
    user_message = "Please analyze the uploaded accounts and suggest Eagle mappings"
    print(f"   Message: {user_message}")
    
    # Step 3: User hits Send - this triggers BOTH onSendMessage AND onFileUpload
    print(f"\n🚀 Step 3: User hits Send (triggers both message send AND file upload)")
    
    # Simulate what happens in handleSend():
    # 3a. onSendMessage is called immediately
    print(f"   3a. Calling onSendMessage...")
    
    # The issue: at this point, the MappingContext might not have the session_id yet
    # because the file upload processing (processFiles) might still be running
    
    # Create context like useMappingData would (but without session_id yet)
    context_without_session = {
        "totalRows": 0,  # No mappings loaded yet
        "mappedRows": 0,
        "unmappedRows": 0,
        "pendingRows": 0,
        "rejectedRows": 0,
        "averageConfidence": 0,
        "recentChanges": [],
        "sessionId": None  # This is the problem!
    }
    
    chat_payload_immediate = {
        "message": user_message,
        "context": context_without_session,
        "conversation": [],
        "session_id": None  # No session ID!
    }
    
    print(f"   📤 Sending chat request WITHOUT session_id...")
    chat_response_immediate = requests.post(f"{BACKEND_URL}/chat", json=chat_payload_immediate)
    
    if chat_response_immediate.status_code == 200:
        response_immediate = chat_response_immediate.json()['response']
        print(f"   📝 Response length: {len(response_immediate)} chars")
        if "provide" in response_immediate.lower() or "need" in response_immediate.lower():
            print(f"   ❌ Claude asks for data (no session_id received)")
        else:
            print(f"   ✅ Claude seems to have data")
    
    # 3b. onFileUpload is called (but this creates new mappings with session_id)
    print(f"\n   3b. File processing would create mappings with session_id...")
    
    # Simulate what would happen if we sent the message AFTER the context had session_id
    print(f"\n🔄 Step 4: Simulating message sent AFTER mappings are loaded...")
    
    context_with_session = {
        "totalRows": accounts_count,
        "mappedRows": 0,
        "unmappedRows": 0,
        "pendingRows": accounts_count,
        "rejectedRows": 0,
        "averageConfidence": 0,
        "recentChanges": [],
        "sessionId": session_id  # Now we have the session ID!
    }
    
    chat_payload_delayed = {
        "message": user_message,
        "context": context_with_session,
        "conversation": [],
        "session_id": session_id  # Session ID included!
    }
    
    print(f"   📤 Sending chat request WITH session_id...")
    chat_response_delayed = requests.post(f"{BACKEND_URL}/chat", json=chat_payload_delayed)
    
    if chat_response_delayed.status_code == 200:
        response_delayed = chat_response_delayed.json()['response']
        print(f"   📝 Response length: {len(response_delayed)} chars")
        if "1000" in response_delayed and "confidence" in response_delayed.lower():
            print(f"   ✅ Claude received file data and provided mappings!")
        else:
            print(f"   ❌ Claude still doesn't have complete file data")
    
    print(f"\n📊 Analysis:")
    print(f"   Without session_id: Claude asks for data")
    print(f"   With session_id: Claude provides specific mappings")
    print(f"   🎯 ISSUE: UI sends message before file processing completes!")

if __name__ == "__main__":
    simulate_ui_file_attachment_flow()