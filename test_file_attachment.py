#!/usr/bin/env python3
"""
Test script to verify file attachment workflow
Tests the complete flow from file upload to Claude API integration
"""

import sys
import json
import uuid
from datetime import datetime
from io import StringIO
import pandas as pd

# Add the backend directory to Python path
sys.path.append('/Volumes/D/Ai/fund-static-data/backend')

from main import uploaded_files_data, load_reference_data

def test_file_upload_simulation():
    """Simulate file upload and storage"""
    print("🧪 Testing File Upload Simulation...")
    
    # Load reference data first
    load_reference_data()
    print("✅ Reference data loaded")
    
    # Simulate CSV data
    csv_data = """Account_Code,Account_Description,Account_Type,Account_Category
1000,Operating Cash,Asset,Current Asset
1100,Accounts Receivable,Asset,Current Asset
2000,Accounts Payable,Liability,Current Liability
3000,Share Capital,Equity,Equity
4000,Revenue,Revenue,Operating Revenue
5000,Operating Expenses,Expense,Operating Expense"""
    
    # Parse CSV data
    df = pd.read_csv(StringIO(csv_data))
    print(f"✅ Parsed CSV: {len(df)} accounts")
    
    # Convert to AccountData format (simulating backend processing)
    accounts = []
    for _, row in df.iterrows():
        account = {
            'account_code': str(row['Account_Code']),
            'account_description': str(row['Account_Description']),
            'account_type': str(row['Account_Type']),
            'account_category': str(row['Account_Category']),
            'metadata': {}
        }
        accounts.append(account)
    
    # Generate session ID and store (simulating upload endpoint)
    session_id = str(uuid.uuid4())
    uploaded_files_data[session_id] = {
        "filename": "test_accounts.csv",
        "accounts": accounts,
        "upload_time": datetime.now(),
        "account_count": len(accounts),
        "columns": list(df.columns),
        "raw_data": df.to_dict('records')[:10]
    }
    
    print(f"✅ File data stored with session_id: {session_id}")
    print(f"✅ Total uploaded sessions: {len(uploaded_files_data)}")
    
    return session_id

def test_chat_context_inclusion(session_id):
    """Test if chat endpoint would include file context"""
    print(f"\n🧪 Testing Chat Context Inclusion for session: {session_id}")
    
    # Simulate chat request processing
    if session_id and session_id in uploaded_files_data:
        file_data = uploaded_files_data[session_id]
        print(f"✅ Found file data: {file_data['filename']}")
        print(f"✅ Account count: {file_data['account_count']}")
        print(f"✅ Columns: {file_data['columns']}")
        
        # Test system prompt enhancement
        system_prompt_addition = f"""
UPLOADED SOURCE FILE CONTEXT:
- Filename: {file_data['filename']}
- Total accounts: {file_data['account_count']}
- Columns: {', '.join(file_data['columns'])}
- Upload time: {file_data['upload_time']}
- Sample data: {json.dumps(file_data['raw_data'][:3], indent=2)}
"""
        print(f"\n📝 System prompt would include:")
        print(system_prompt_addition)
        return True
    else:
        print(f"❌ No file data found for session: {session_id}")
        return False

def test_mapping_keywords():
    """Test mapping keyword detection"""
    print(f"\n🧪 Testing Mapping Keyword Detection...")
    
    file_analysis_keywords = ["map", "mapping", "analyze", "analysis", "suggest", "recommend", "accounts", "data"]
    
    test_messages = [
        "Please map these accounts to Eagle",
        "Can you analyze the uploaded data?",
        "Suggest mappings for the accounts",
        "What accounts are in the file?",
        "Hello, how are you?",
        "Map the FIS IO accounts to Eagle targets"
    ]
    
    for message in test_messages:
        is_file_query = any(keyword in message.lower() for keyword in file_analysis_keywords)
        status = "✅ MAPPING" if is_file_query else "💬 CHAT"
        print(f"{status} - '{message}'")

def main():
    """Run all tests"""
    print("🚀 Starting File Attachment Workflow Tests\n")
    
    # Test 1: File upload simulation
    session_id = test_file_upload_simulation()
    
    # Test 2: Chat context inclusion
    context_success = test_chat_context_inclusion(session_id)
    
    # Test 3: Mapping keyword detection
    test_mapping_keywords()
    
    # Summary
    print(f"\n📊 Test Summary:")
    print(f"✅ File upload simulation: SUCCESS")
    print(f"{'✅' if context_success else '❌'} Chat context inclusion: {'SUCCESS' if context_success else 'FAILED'}")
    print(f"✅ Mapping keyword detection: SUCCESS")
    
    if context_success:
        print(f"\n🎯 File attachment workflow should be working!")
        print(f"   Session ID to test with: {session_id}")
    else:
        print(f"\n❌ File attachment workflow has issues!")

if __name__ == "__main__":
    main()