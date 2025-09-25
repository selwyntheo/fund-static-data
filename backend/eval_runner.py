#!/usr/bin/env python3
"""
Python Evaluation Runner for Account Mapping
Uses the FastAPI backend to run comprehensive evaluations
"""

import asyncio
import aiohttp
import pandas as pd
import json
import os
import time
from datetime import datetime
from pathlib import Path

class AccountMappingEvaluator:
    def __init__(self, api_base_url="http://localhost:8000"):
        self.api_base_url = api_base_url
        self.test_data_path = Path(__file__).parent / "test-data"
        self.session = None
        
    async def get_session(self):
        if not self.session:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close_session(self):
        if self.session:
            await self.session.close()
    
    def load_test_data(self):
        """Load all test data files"""
        print("📚 Loading test data...")
        
        # Load CSV files
        self.source_accounts = pd.read_csv(self.test_data_path / "fis-io-ledger-accounts.csv")
        self.target_accounts = pd.read_csv(self.test_data_path / "bny-eagle-ledger-accounts.csv")
        self.ground_truth = pd.read_csv(self.test_data_path / "ground-truth-mappings.csv")
        self.test_cases = pd.read_csv(self.test_data_path / "evaluation-test-cases.csv")
        
        print(f"✅ Loaded {len(self.source_accounts)} source accounts")
        print(f"✅ Loaded {len(self.target_accounts)} target accounts")
        print(f"✅ Loaded {len(self.ground_truth)} ground truth mappings")
        print(f"✅ Loaded {len(self.test_cases)} test cases")
    
    def prepare_api_data(self):
        """Convert pandas DataFrames to API-compatible format"""
        
        # Convert source accounts
        source_accounts = []
        for _, row in self.source_accounts.iterrows():
            source_accounts.append({
                "account_code": str(row['Account_Code']),
                "account_description": str(row['Account_Description']),
                "account_type": str(row['Account_Type']) if pd.notna(row['Account_Type']) else None,
                "account_category": str(row['Account_Category']) if pd.notna(row['Account_Category']) else None,
                "metadata": {}
            })
        
        # Convert target accounts
        target_accounts = []
        for _, row in self.target_accounts.iterrows():
            target_accounts.append({
                "account_code": str(row['GL_Account']),
                "account_description": str(row['GL_Description']),
                "account_type": str(row['Account_Class']) if pd.notna(row['Account_Class']) else None,
                "account_category": str(row['Sub_Class']) if pd.notna(row['Sub_Class']) else None,
                "metadata": {
                    "department": str(row['Department']) if pd.notna(row['Department']) else None,
                    "cost_center": str(row['Cost_Center']) if pd.notna(row['Cost_Center']) else None
                }
            })
        
        return source_accounts, target_accounts
    
    async def test_api_health(self):
        """Test if API is available"""
        try:
            session = await self.get_session()
            async with session.get(f"{self.api_base_url}/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    print(f"✅ API is healthy: {health_data}")
                    return True
                else:
                    print(f"❌ API health check failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Cannot connect to API: {str(e)}")
            return False
    
    async def run_sample_evaluation(self, sample_size=5):
        """Run evaluation on a sample of test cases"""
        print(f"\n🧪 Running sample evaluation with {sample_size} test cases...")
        
        # Get first N test cases
        sample_test_cases = self.test_cases.head(sample_size)
        
        # Get corresponding source accounts
        sample_source_accounts = []
        for _, test_case in sample_test_cases.iterrows():
            source_row = self.source_accounts[
                self.source_accounts['Account_Code'] == test_case['Source_Account']
            ].iloc[0]
            
            sample_source_accounts.append({
                "account_code": str(source_row['Account_Code']),
                "account_description": str(source_row['Account_Description']),
                "account_type": str(source_row['Account_Type']) if pd.notna(source_row['Account_Type']) else None,
                "account_category": str(source_row['Account_Category']) if pd.notna(source_row['Account_Category']) else None,
                "metadata": {}
            })
        
        # Prepare target accounts
        _, target_accounts = self.prepare_api_data()
        
        # Make API request
        mapping_request = {
            "source_accounts": sample_source_accounts,
            "target_accounts": target_accounts,
            "mapping_context": "Evaluation test - mapping FIS IO accounts to BNY Eagle accounts",
            "confidence_threshold": 80
        }
        
        try:
            session = await self.get_session()
            print("📡 Sending mapping request to API...")
            
            start_time = time.time()
            async with session.post(
                f"{self.api_base_url}/map-accounts",
                json=mapping_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_text = await response.text()
                    print(f"❌ API request failed: {response.status} - {error_text}")
                    return None
                
                result = await response.json()
                processing_time = time.time() - start_time
                
                print(f"✅ Mapping completed in {processing_time:.2f} seconds")
                return result
        
        except Exception as e:
            print(f"❌ Error during API call: {str(e)}")
            return None
    
    def analyze_results(self, api_result, sample_test_cases):
        """Analyze the API results against expected outcomes"""
        if not api_result:
            return
        
        print("\n📊 Analyzing Results...")
        print("=" * 60)
        
        results = api_result['results']
        summary = api_result['summary']
        
        # Overall summary
        print(f"Total Mappings: {summary['total_mappings']}")
        print(f"High Confidence Mappings: {summary['high_confidence_mappings']}")
        print(f"Average Confidence: {summary['average_confidence']}%")
        print(f"Processing Time: {summary['processing_time']} seconds")
        print(f"Confidence Threshold: {summary['confidence_threshold']}%")
        
        print("\n📋 Detailed Results:")
        print("-" * 60)
        
        correct_mappings = 0
        total_mappings = len(results)
        
        for i, result in enumerate(results):
            test_case = sample_test_cases.iloc[i]
            expected_target = test_case['Expected_Target']
            actual_target = result['target_account_code']
            
            is_correct = actual_target == expected_target
            if is_correct:
                correct_mappings += 1
            
            status_icon = "✅" if is_correct else "❌"
            
            print(f"{status_icon} {result['source_account_code']}: {actual_target}")
            print(f"   Expected: {expected_target}")
            print(f"   Confidence: {result['confidence_score']}%")
            print(f"   Reasoning: {result['reasoning'][:100]}...")
            if result['alternatives']:
                print(f"   Alternatives: {', '.join(result['alternatives'])}")
            print()
        
        # Calculate accuracy
        accuracy = (correct_mappings / total_mappings) * 100 if total_mappings > 0 else 0
        
        print("=" * 60)
        print(f"🎯 EVALUATION SUMMARY")
        print("=" * 60)
        print(f"Accuracy: {accuracy:.1f}% ({correct_mappings}/{total_mappings})")
        print(f"Average Confidence: {summary['average_confidence']}%")
        print(f"High Confidence Rate: {(summary['high_confidence_mappings']/total_mappings)*100:.1f}%")
        print(f"Processing Speed: {summary['processing_time']/total_mappings:.2f}s per mapping")
        print("=" * 60)
        
        # Success criteria check
        print("\n🏆 SUCCESS CRITERIA:")
        print(f"✅ Minimum Accuracy (85%): {'PASSED' if accuracy >= 85 else 'FAILED'}")
        print(f"✅ Average Confidence (80%): {'PASSED' if summary['average_confidence'] >= 80 else 'FAILED'}")
        print(f"✅ Processing Speed (<2s): {'PASSED' if (summary['processing_time']/total_mappings) < 2 else 'FAILED'}")
        
        return {
            "accuracy": accuracy,
            "average_confidence": summary['average_confidence'],
            "processing_time_per_mapping": summary['processing_time']/total_mappings,
            "high_confidence_rate": (summary['high_confidence_mappings']/total_mappings)*100
        }
    
    async def run_full_evaluation(self):
        """Run the complete evaluation suite"""
        print("🚀 Starting Full Account Mapping Evaluation...\n")
        
        # Load test data
        self.load_test_data()
        
        # Test API connectivity
        if not await self.test_api_health():
            print("❌ Cannot proceed - API is not available")
            return
        
        # Run sample evaluation (first 10 test cases)
        sample_size = min(10, len(self.test_cases))
        api_result = await self.run_sample_evaluation(sample_size)
        
        if api_result:
            sample_test_cases = self.test_cases.head(sample_size)
            analysis = self.analyze_results(api_result, sample_test_cases)
            
            # Save results
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            results_file = self.test_data_path / f"evaluation_results_{timestamp}.json"
            
            with open(results_file, 'w') as f:
                json.dump({
                    "timestamp": datetime.now().isoformat(),
                    "api_result": api_result,
                    "analysis": analysis,
                    "test_cases_used": sample_test_cases.to_dict('records')
                }, f, indent=2)
            
            print(f"\n💾 Results saved to: {results_file}")
        
        await self.close_session()
        print("\n🎉 Evaluation completed!")

async def main():
    evaluator = AccountMappingEvaluator()
    await evaluator.run_full_evaluation()

if __name__ == "__main__":
    asyncio.run(main())