#!/usr/bin/env python3
"""
Account Mapping System Evaluation Script

Tests the file upload and mapping analysis functionality by:
1. Converting CSV test data to Excel format
2. Uploading to the backend API
3. Requesting mapping analysis through chat
"""

import os
import sys
import pandas as pd
import requests
import json
from datetime import datetime
import time

class MappingEvaluator:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.test_data_dir = "test-data"
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "test_results": [],
            "summary": {}
        }
    
    def convert_csv_to_excel(self, csv_file_path, excel_file_path):
        """Convert CSV to Excel format for upload testing"""
        print(f"📄 Converting {csv_file_path} to {excel_file_path}")
        
        try:
            # Try different encodings to handle potential encoding issues
            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            df = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(csv_file_path, encoding=encoding)
                    print(f"✅ Successfully read CSV with {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue
            
            if df is None:
                raise Exception("Could not read CSV with any supported encoding")
            
            df.to_excel(excel_file_path, index=False)
            print(f"✅ Successfully converted to Excel with {len(df)} rows")
            return True
        except Exception as e:
            print(f"❌ Failed to convert CSV to Excel: {e}")
            return False
    
    def test_backend_health(self):
        """Test if backend is running"""
        print("🔍 Checking backend health...")
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend is healthy")
                return True
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Backend health check failed: {e}")
            return False
    
    def upload_file(self, file_path):
        """Upload file to backend and return session_id"""
        print(f"📤 Uploading {file_path} to backend...")
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{self.backend_url}/upload-accounts", files=files, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                session_id = result.get('session_id')
                print(f"✅ Upload successful! Session ID: {session_id}")
                print(f"📊 Processed {result.get('account_count', 0)} accounts")
                return session_id
            else:
                print(f"❌ Upload failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Upload error: {e}")
            return None
    
    def chat_with_mapping_analysis(self, session_id, message):
        """Send a chat message for mapping analysis"""
        print(f"💬 Sending mapping analysis request...")
        
        try:
            data = {
                "message": message,
                "session_id": session_id
            }
            response = requests.post(f"{self.backend_url}/chat", json=data, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Chat response received")
                return result.get('response', '')
            else:
                print(f"❌ Chat failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Chat error: {e}")
            return None
    
    def run_evaluation(self):
        """Run the complete evaluation workflow"""
        print("🔧 Account Mapping System Evaluation")
        print(f"Backend URL: {self.backend_url}")
        print(f"Test Data Directory: {self.test_data_dir}")
        print()
        
        # Check if backend is running
        if not self.test_backend_health():
            print("❌ Backend is not available. Please start the backend server first.")
            return False
        
        # Test files to process
        test_files = [
            "fis-io-ledger-accounts.csv",
            "bny-eagle-ledger-accounts.csv"
        ]
        
        for csv_file in test_files:
            print(f"\n🚀 Testing with {csv_file}")
            print("=" * 50)
            
            csv_path = os.path.join(self.test_data_dir, csv_file)
            if not os.path.exists(csv_path):
                print(f"❌ Test file not found: {csv_path}")
                continue
            
            # Convert CSV to Excel
            excel_file = csv_file.replace('.csv', '-test-upload.xlsx')
            excel_path = excel_file
            
            if not self.convert_csv_to_excel(csv_path, excel_path):
                continue
            
            # Upload file
            session_id = self.upload_file(excel_path)
            if not session_id:
                continue
            
            # Request mapping analysis
            mapping_request = f"""
            I've uploaded account data from {csv_file.replace('.csv', '')}. 
            Please analyze the accounts and provide insights about:
            1. Account types and categories
            2. Account structure and naming patterns
            3. Any potential mapping recommendations
            
            Please provide a detailed analysis of the uploaded account data.
            """
            
            analysis_response = self.chat_with_mapping_analysis(session_id, mapping_request)
            
            if analysis_response:
                print(f"📋 Analysis Response:")
                print("-" * 40)
                print(analysis_response[:500] + "..." if len(analysis_response) > 500 else analysis_response)
                print("-" * 40)
                
                # Store results
                test_result = {
                    "file": csv_file,
                    "session_id": session_id,
                    "upload_success": True,
                    "analysis_success": True,
                    "analysis_preview": analysis_response[:200] + "..." if len(analysis_response) > 200 else analysis_response
                }
            else:
                test_result = {
                    "file": csv_file,
                    "session_id": session_id,
                    "upload_success": True,
                    "analysis_success": False
                }
            
            self.results["test_results"].append(test_result)
            
            # Clean up Excel file
            try:
                os.remove(excel_path)
            except:
                pass
        
        # Print summary
        print(f"\n📊 Evaluation Summary")
        print("=" * 50)
        successful_tests = sum(1 for result in self.results["test_results"] if result.get("analysis_success", False))
        total_tests = len(self.results["test_results"])
        print(f"✅ Successful tests: {successful_tests}/{total_tests}")
        
        if successful_tests == total_tests and total_tests > 0:
            print("🎉 All tests passed! The file upload and mapping analysis workflow is working correctly.")
            return True
        else:
            print("❌ Some tests failed. Check the errors above.")
            return False

def main():
    print("🚀 Starting Account Mapping Evaluation")
    print("=" * 50)
    
    evaluator = MappingEvaluator()
    success = evaluator.run_evaluation()
    
    if success:
        print("\n✅ Evaluation completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Evaluation failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()