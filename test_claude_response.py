#!/usr/bin/env python3
"""
Quick test to see what Claude responses look like for mapping requests
"""
import asyncio
import json
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from main import ClaudeClient

async def test_claude_response():
    """Test Claude response format"""
    claude = ClaudeClient()
    
    # Sample mapping request
    test_message = "Please map these FIS accounts to Eagle accounts: 1000 Cash, 1010 Checking Account, 2000 Accounts Payable"
    
    try:
        response = await claude.chat_completion([{"role": "user", "content": test_message}], None)
        print("=== CLAUDE RESPONSE ===")
        print(response)
        print("\n=== RESPONSE LENGTH ===")
        print(f"{len(response)} characters")
        print("\n=== LINES ===")
        lines = response.split('\n')
        for i, line in enumerate(lines):
            print(f"{i+1:2d}: {line}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    await claude.close()

if __name__ == "__main__":
    asyncio.run(test_claude_response())