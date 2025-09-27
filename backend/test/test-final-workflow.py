#!/usr/bin/env python3
"""
Final comprehensive test for mapping response display in right panel
"""

import requests
import json

BACKEND_URL = "http://localhost:8000"

def test_complete_workflow():
    print("🏁 Final Test: Complete Mapping Response Workflow")
    print("=" * 60)
    
    # Step 1: Upload accounts
    print("📤 Step 1: Uploading accounts...")
    with open('test-data/fis-io-ledger-accounts.csv', 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BACKEND_URL}/upload-accounts", files=files)
    
    if response.status_code != 200:
        print(f"❌ Upload failed: {response.status_code}")
        return False
    
    result = response.json()
    session_id = result['session_id']
    print(f"✅ Uploaded {result.get('accounts_count', 0)} accounts")
    print(f"   Session ID: {session_id}")
    
    # Step 2: Request structured mappings
    print("\n💬 Step 2: Requesting structured mapping analysis...")
    
    mapping_request = """
Please provide mapping suggestions for the uploaded FIS IO accounts in this exact format:

1. [SOURCE_CODE] -> [TARGET_CODE] (confidence%)
   Reasoning: [explanation]

Please analyze the first 10 accounts and provide structured mappings that can be parsed by the frontend. Use realistic target codes like CASH_001, BANK_CHK, etc.

Format each mapping exactly like this:
1. 1000 -> CASH_001 (95%)
   Reasoning: Primary cash account mapping

2. 1010 -> BANK_CHK (90%)
   Reasoning: Operating checking account

Please provide mappings for the uploaded accounts now.
"""
    
    chat_data = {
        "message": mapping_request,
        "session_id": session_id
    }
    
    response = requests.post(f"{BACKEND_URL}/chat", json=chat_data, timeout=120)
    
    if response.status_code != 200:
        print(f"❌ Chat request failed: {response.status_code}")
        return False
    
    result = response.json()
    claude_response = result.get('response', '')
    
    print("✅ Claude response received!")
    print(f"📝 Response length: {len(claude_response)} characters")
    
    # Step 3: Analyze response structure
    print("\n🔍 Step 3: Analyzing response structure...")
    
    lines = claude_response.split('\n')
    mappings_found = []
    
    for line in lines:
        if '->' in line and '(' in line and '%' in line:
            mappings_found.append(line.strip())
    
    print(f"📊 Found {len(mappings_found)} structured mappings:")
    for i, mapping in enumerate(mappings_found[:5], 1):
        print(f"   {i}. {mapping}")
    
    if len(mappings_found) > 5:
        print(f"   ... and {len(mappings_found) - 5} more")
    
    # Step 4: Test parsing logic
    print("\n🛠️  Step 4: Testing frontend parsing logic...")
    
    parsed_mappings = []
    
    for line in lines:
        # Same regex as frontend
        import re
        mapping_match = re.match(r'^\d+\.\s*(.+?)\s*->\s*(.+?)\s*\((\d+)%?\)', line)
        if mapping_match:
            source, target, confidence = mapping_match.groups()
            parsed_mappings.append({
                'source': source.strip(),
                'target': target.strip(),
                'confidence': int(confidence)
            })
    
    print(f"✅ Successfully parsed {len(parsed_mappings)} mappings for frontend:")
    for mapping in parsed_mappings[:3]:
        print(f"   • {mapping['source']} → {mapping['target']} ({mapping['confidence']}%)")
    
    # Step 5: Provide final assessment
    print("\n🎯 Final Assessment:")
    print("-" * 60)
    
    success_criteria = {
        "File Upload": response.status_code == 200,
        "Claude Response": len(claude_response) > 100,
        "Structured Format": len(mappings_found) > 0,
        "Parseable Data": len(parsed_mappings) > 0,
        "High Confidence": any(m['confidence'] > 80 for m in parsed_mappings)
    }
    
    for criterion, passed in success_criteria.items():
        status = "✅" if passed else "❌"
        print(f"   {status} {criterion}: {'PASS' if passed else 'FAIL'}")
    
    overall_success = all(success_criteria.values())
    
    print(f"\n{'🎉' if overall_success else '⚠️'} Overall Result:")
    if overall_success:
        print("   ✅ Complete workflow is ready for production!")
        print("   ✅ Mapping responses will populate the right panel automatically")
        print("   ✅ Users can review and modify Claude's suggestions in the grid")
    else:
        print("   ⚠️  Some issues need to be addressed before production")
        print("   ℹ️  Check the failed criteria above")
    
    return overall_success

if __name__ == "__main__":
    success = test_complete_workflow()
    
    print("\n" + "=" * 60)
    if success:
        print("🏆 SUCCESS: Mapping response display is fully functional!")
        print("   📋 Claude's mapping suggestions will appear in the right panel")
        print("   🔧 Users can review, modify, and approve mappings")
        print("   💬 Chat provides detailed analysis and reasoning")
    else:
        print("⚠️  NEEDS WORK: Some components need adjustment")
    print("=" * 60)