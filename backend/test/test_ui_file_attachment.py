#!/usr/bin/env python3
"""
Comprehensive test case to simulate UI file attachment workflow
Tests the complete flow: file upload -> storage -> chat request -> Claude API
"""

import sys
import json
import uuid
import requests
import pandas as pd
from datetime import datetime
from io import StringIO, BytesIO

# Test the actual API endpoints
BACKEND_URL = "http://localhost:8000"

def test_file_upload_endpoint():
    """Test actual file upload endpoint"""
    print("🧪 Testing File Upload Endpoint...")
    
    # Read the actual test file
    try:
        test_file_path = "test-data/fis-io-ledger-accounts.csv"
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        print(f"✅ Loaded test file: {test_file_path}")
        print(f"✅ File size: {len(file_content)} bytes")
        
        # Test file upload
        files = {'file': ('fis-io-ledger-accounts.csv', file_content, 'text/csv')}
        
        try:
            response = requests.post(f"{BACKEND_URL}/upload-accounts", files=files, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Upload successful!")
                print(f"✅ Session ID: {result['session_id']}")
                print(f"✅ Accounts count: {result['accounts_count']}")
                print(f"✅ Sample account: {result['accounts'][0] if result['accounts'] else 'None'}")
                return result['session_id'], result['accounts_count']
            else:
                print(f"❌ Upload failed: {response.status_code} - {response.text}")
                return None, 0
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend server. Server not running.")
            return None, 0
        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            return None, 0
            
    except FileNotFoundError:
        print(f"❌ Test file not found: {test_file_path}")
        return None, 0

def test_chat_endpoint_with_session(session_id, accounts_count):
    """Test chat endpoint with session ID"""
    print(f"\n🧪 Testing Chat Endpoint with Session ID: {session_id}")
    
    if not session_id:
        print("❌ No session ID to test with")
        return
    
    # Simulate frontend context (like useMappingData would send)
    context = {
        "totalRows": accounts_count,
        "mappedRows": 0,
        "unmappedRows": 0,
        "pendingRows": accounts_count,
        "rejectedRows": 0,
        "averageConfidence": 0,
        "recentChanges": [],
        "sessionId": session_id
    }
    
    # Test mapping request message
    test_message = "Please analyze the uploaded FIS IO accounts and suggest mappings to Eagle accounts. Show me the first 10 accounts with suggested Eagle mappings."
    
    chat_payload = {
        "message": test_message,
        "context": context,
        "conversation": [],
        "session_id": session_id
    }
    
    print(f"📤 Sending chat request...")
    print(f"   Message: {test_message[:50]}...")
    print(f"   Session ID: {session_id}")
    print(f"   Context total rows: {context['totalRows']}")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/chat", 
            json=chat_payload,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            claude_response = result.get('response', '')
            
            print(f"✅ Chat request successful!")
            print(f"📝 Claude response length: {len(claude_response)} characters")
            
            # Print full response for analysis
            print(f"\n📝 FULL CLAUDE RESPONSE:")
            print("=" * 80)
            print(claude_response)
            print("=" * 80)
            
            # Check if Claude mentions specific account codes
            if any(keyword in claude_response.lower() for keyword in ['account code', 'account_code', 'io account', 'specific']):
                print(f"✅ Claude seems to have received account details!")
            else:
                print(f"❌ Claude response suggests it didn't receive account details")
                
            return claude_response
        else:
            print(f"❌ Chat request failed: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server for chat request")
        return None
    except Exception as e:
        print(f"❌ Chat request error: {str(e)}")
        return None

def test_backend_server_health():
    """Test if backend server is running"""
    print("🧪 Testing Backend Server Health...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running")
        print("   Please start the server with: cd backend && source venv/bin/activate && uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def analyze_claude_response(response):
    """Analyze Claude's response to identify the issue"""
    print(f"\n🔍 Analyzing Claude Response...")
    
    if not response:
        print("❌ No response to analyze")
        return
    
    # Check for indicators that Claude received account data
    indicators = {
        "has_account_codes": any(word in response.lower() for word in ['account code', 'account_code', 'gl_account']),
        "has_specific_numbers": any(char.isdigit() for char in response[:500]),  # Check first 500 chars
        "mentions_io_accounts": 'io account' in response.lower(),
        "mentions_eagle_mapping": 'eagle' in response.lower(),
        "provides_specific_mappings": 'confidence' in response.lower() and 'mapping' in response.lower(),
        "asks_for_original_data": any(phrase in response.lower() for phrase in ['please provide', 'need the specific', 'share the attachment', 'without the specific']),
        "response_length": len(response)
    }
    
    print(f"Analysis results:")
    for key, value in indicators.items():
        status = "✅" if value else "❌"
        print(f"  {status} {key}: {value}")
    
    if indicators["asks_for_original_data"]:
        print(f"\n❌ ISSUE IDENTIFIED: Claude is asking for original data, meaning it didn't receive the uploaded accounts")
    elif indicators["provides_specific_mappings"] and indicators["has_account_codes"]:
        print(f"\n✅ SUCCESS: Claude received account data and provided specific mappings!")
    elif indicators["has_account_codes"] and indicators["has_specific_numbers"]:
        print(f"\n✅ SUCCESS: Claude appears to have received account data")
    else:
        print(f"\n⚠️  UNCLEAR: Claude response doesn't clearly indicate if it received account data")

def main():
    """Run comprehensive file attachment test"""
    print("🚀 Starting Comprehensive File Attachment Test\n")
    
    # Test 1: Server health
    if not test_backend_server_health():
        print("\n❌ Cannot proceed without running backend server")
        return
    
    # Test 2: File upload
    session_id, accounts_count = test_file_upload_endpoint()
    
    if not session_id:
        print("\n❌ File upload failed, cannot test chat endpoint")
        return
    
    # Test 3: Chat with file context
    claude_response = test_chat_endpoint_with_session(session_id, accounts_count)
    
    # Test 4: Analyze response
    analyze_claude_response(claude_response)
    
    # Summary
    print(f"\n📊 Test Summary:")
    print(f"✅ Server health: OK")
    print(f"{'✅' if session_id else '❌'} File upload: {'SUCCESS' if session_id else 'FAILED'}")
    print(f"{'✅' if claude_response else '❌'} Chat request: {'SUCCESS' if claude_response else 'FAILED'}")
    
    if session_id and claude_response:
        if "confidence" in claude_response.lower() and any(num in claude_response for num in ['1000', '1010', '1020']):
            print(f"✅ OVERALL: File attachment workflow is WORKING! Claude received complete account data and provided mappings")
        elif "please provide" in claude_response.lower() or "need the specific" in claude_response.lower():
            print(f"❌ OVERALL: File attachment workflow is NOT working - Claude doesn't receive account data")
        else:
            print(f"⚠️  OVERALL: File attachment workflow status unclear")
    else:
        print(f"❌ OVERALL: File attachment workflow has issues")

if __name__ == "__main__":
    main()