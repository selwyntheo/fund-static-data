#!/usr/bin/env python3
"""
Test script to verify ground truth mappings functionality
"""
import asyncio
import aiohttp
import json

async def test_ground_truth_endpoints():
    """Test the ground truth mapping endpoints"""
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        print("🧪 Testing Ground Truth Mappings API\n")
        
        # Test 1: Get all ground truth mappings
        print("1️⃣ Testing GET /ground-truth-mappings")
        try:
            async with session.get(f"{base_url}/ground-truth-mappings") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Retrieved {data['total']} ground truth mappings")
                    if data['mappings']:
                        sample = data['mappings'][0]
                        print(f"📋 Sample mapping: {sample['Source_Account_Code']} -> {sample['Target_Account_Code']} ({sample['Mapping_Confidence']}%)")
                else:
                    print(f"❌ Failed with status {response.status}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print()
        
        # Test 2: Search ground truth mappings
        print("2️⃣ Testing POST /search-ground-truth")
        search_payload = {
            "search_term": "cash",
            "mapping_type": "Direct",
            "min_confidence": 90
        }
        
        try:
            async with session.post(
                f"{base_url}/search-ground-truth", 
                json=search_payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Found {data['total']} matching mappings for 'cash'")
                    for mapping in data['mappings'][:3]:  # Show first 3
                        print(f"  📋 {mapping['Source_Account_Code']}: {mapping['Source_Description']} -> {mapping['Target_Account_Code']}")
                else:
                    print(f"❌ Search failed with status {response.status}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print()
        
        # Test 3: Test health endpoint
        print("3️⃣ Testing GET /health")
        try:
            async with session.get(f"{base_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Backend is {data['status']}")
                else:
                    print(f"❌ Health check failed with status {response.status}")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Starting Ground Truth Mappings Test")
    print("Make sure the backend server is running on localhost:8000\n")
    
    try:
        asyncio.run(test_ground_truth_endpoints())
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Test failed: {e}")
    
    print("\n✨ Test completed!")