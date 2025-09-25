# Account Mapping Backend API

A FastAPI-based backend service for AI-powered account mapping between different accounting systems.

## 🏗️ Architecture Benefits

### Why Python Backend + REST API?

**Frontend Issues Solved:**
- ✅ **Security**: API keys safely stored server-side
- ✅ **Performance**: Server-side processing and caching
- ✅ **Scalability**: Centralized request management
- ✅ **Error Handling**: Robust retry mechanisms
- ✅ **Rate Limiting**: Proper Claude API usage control
- ✅ **Data Processing**: Efficient pandas-based CSV/Excel handling

## 🚀 Quick Start

### 1. Setup and Installation

```bash
cd backend
chmod +x start_server.sh
./start_server.sh
```

The script will:
- Create a Python virtual environment
- Install all dependencies
- Copy test data
- Start the API server on http://localhost:8000

### 2. Manual Setup (Alternative)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy test data
cp -r ../test-data ./

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Environment Configuration

Create `.env` file:
```bash
CLAUDE_API_KEY=your_claude_api_key_here
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

## 📡 API Endpoints

### Core Endpoints

- **`GET /`** - API information
- **`GET /health`** - Health check
- **`POST /upload-accounts`** - Upload CSV/Excel account files
- **`POST /map-accounts`** - Map source accounts to target accounts
- **`GET /mapping-status/{session_id}`** - Check mapping progress
- **`POST /run-evaluation`** - Run evaluation tests

### Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Running Evaluations

### Using Python Script

```bash
# Make sure the API server is running first
python eval_runner.py
```

### Using API Directly

```bash
# Upload source accounts
curl -X POST "http://localhost:8000/upload-accounts" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-data/fis-io-ledger-accounts.csv"

# Run mapping
curl -X POST "http://localhost:8000/map-accounts" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d @mapping_request.json
```

## 📊 API Response Format

### Mapping Response
```json
{
  "session_id": "uuid-string",
  "results": [
    {
      "source_account_code": "1000",
      "target_account_code": "101000",
      "confidence_score": 95,
      "reasoning": "Direct cash account mapping",
      "alternatives": ["101100", "101200"],
      "processing_time": 1.2
    }
  ],
  "summary": {
    "total_mappings": 64,
    "high_confidence_mappings": 52,
    "average_confidence": 87.3,
    "processing_time": 78.5
  },
  "status": "completed"
}
```

## 🔧 Configuration

### API Settings
- **Host**: 0.0.0.0 (configurable)
- **Port**: 8000 (configurable)
- **CORS**: Enabled for React frontend
- **Rate Limiting**: 1 second delay between Claude API calls

### Claude API Settings
- **Model**: claude-3-sonnet-20240229
- **Max Tokens**: 1000
- **API Version**: 2023-06-01

## 📈 Evaluation Metrics

The evaluation system tracks:

### Accuracy Metrics
- **Exact Match Rate**: Percentage matching expected targets
- **Ground Truth Accuracy**: Percentage matching expert mappings
- **Category Accuracy**: Percentage with correct account types
- **High Confidence Accuracy**: Accuracy for >80% confidence

### Performance Metrics
- **Processing Time**: Seconds per mapping
- **API Response Time**: Claude API call duration
- **Memory Usage**: Server resource consumption
- **Throughput**: Mappings per minute

### Quality Metrics
- **Confidence Calibration**: How well confidence correlates with accuracy
- **Reasoning Quality**: Evaluation of AI explanations
- **Consistency**: Performance across similar account types
- **Edge Case Handling**: Complex scenario management

## 🏆 Success Criteria

- ✅ **Minimum Accuracy**: >85%
- ✅ **High Confidence Accuracy**: >95%
- ✅ **Average Confidence**: >80%
- ✅ **Processing Speed**: <2 seconds per mapping
- ✅ **API Reliability**: >99% uptime

## 🔍 Monitoring and Logging

### Log Levels
- **INFO**: General operation info
- **ERROR**: Error conditions
- **DEBUG**: Detailed debugging info

### Metrics Tracked
- Request/response times
- Claude API usage
- Error rates
- Memory/CPU usage

## 🚦 Frontend Integration

### React Hook Example
```typescript
const useAccountMapping = () => {
  const [mappingResult, setMappingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const mapAccounts = async (sourceAccounts, targetAccounts) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/map-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_accounts: sourceAccounts,
          target_accounts: targetAccounts,
          confidence_threshold: 80
        })
      });
      const result = await response.json();
      setMappingResult(result);
    } catch (error) {
      console.error('Mapping failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { mapAccounts, mappingResult, loading };
};
```

## 📝 Development

### Adding New Features
1. Add endpoint to `main.py`
2. Update Pydantic models
3. Add tests
4. Update documentation

### Testing
```bash
# Run unit tests
python -m pytest tests/

# Run evaluation
python eval_runner.py

# Test API health
curl http://localhost:8000/health
```

## 🐛 Troubleshooting

### Common Issues

**API Key Not Working**
- Check `.env` file exists
- Verify CLAUDE_API_KEY is set correctly
- Restart server after changing environment variables

**CORS Errors**
- Ensure frontend origin is in ALLOWED_ORIGINS
- Check React app is running on expected port

**File Upload Issues**
- Verify CSV/Excel file format
- Check column names match expected format
- Ensure file size is reasonable

**Slow Performance**
- Monitor Claude API rate limits
- Check server resources
- Consider caching for repeated requests

## 📋 Dependencies

- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Pandas**: Data processing
- **Aiohttp**: Async HTTP client
- **Pydantic**: Data validation
- **OpenPyXL**: Excel file handling

## 🔒 Security

- API keys stored server-side only
- CORS properly configured
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Error handling to prevent information leakage