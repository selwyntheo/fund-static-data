#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if API key is loaded
api_key = os.getenv('CLAUDE_API_KEY')
if api_key:
    print(f"✅ CLAUDE_API_KEY loaded: {api_key[:10]}...")
else:
    print("❌ CLAUDE_API_KEY not found")

# Now try to start the server
if __name__ == "__main__":
    print("Starting FastAPI server...")
    import uvicorn
    from main import app
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)