# Claude LLM Accounting Cross-Reference Mapping Interface

A React application with Claude LLM integration for interactive accounting platform mapping. The app provides intelligent cross-reference mapping between accounting platforms with real-time user interaction and bidirectional communication with Claude.

## Features

- **Two-Panel Interface**: Resizable chat interface on the left, mapping grid on the right
- **Claude Integration**: Real-time AI assistance for mapping suggestions and validation
- **File Processing**: Support for Excel (.xlsx, .xls) and CSV file uploads
- **Interactive Mapping Grid**: Sortable, filterable data grid with inline editing
- **Confidence Scoring**: Visual confidence indicators for mapping quality
- **Auto-save**: Automatic data persistence with localStorage
- **Export Functionality**: Export mappings to Excel or CSV formats
- **Bulk Operations**: Accept/reject multiple mappings at once

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Custom hooks with localStorage persistence
- **File Upload**: react-dropzone
- **Data Grid**: ag-grid-react
- **Icons**: lucide-react
- **File Processing**: xlsx library
- **HTTP Client**: Axios for Claude API integration

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Claude API key from Anthropic

### Installation

1. Clone or extract the project files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
4. Edit `.env.local` and add your Claude API key:
   ```
   REACT_APP_CLAUDE_API_KEY=your_actual_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Upload Files
1. Drag and drop Excel or CSV files into the chat interface
2. Or click the attachment button to browse files
3. Files are automatically parsed and validated

### Chat with Claude
- Ask questions about your mapping data
- Request suggestions for unmapped items
- Get help with mapping logic and best practices

### Manage Mappings
- Edit mappings directly in the grid
- Use bulk operations for multiple items
- Filter and sort by status, confidence, or other criteria
- Export results to Excel or CSV

### Mapping Workflow
1. **Upload**: Import your source accounting data
2. **Review**: Examine auto-detected mappings and confidence scores
3. **Refine**: Use Claude's suggestions to improve mappings
4. **Validate**: Review and approve/reject mappings
5. **Export**: Download the final mapping file

## File Format Requirements

### Expected Columns
The application automatically detects columns with these names (case-insensitive):

**Source Data (Required)**:
- Source Code: `source_code`, `code`, `account_code`
- Source Description: `source_description`, `description`, `account_description`

**Target Data (Optional)**:
- Target Code: `target_code`, `to_code`, `new_code`
- Target Description: `target_description`, `to_description`, `new_description`

### Example CSV Format
```csv
source_code,source_description,target_code,target_description
1000,Cash,110,Cash and Cash Equivalents
1100,Accounts Receivable,120,Trade Receivables
2000,Accounts Payable,210,Trade Payables
```

## Configuration

### Environment Variables
- `REACT_APP_CLAUDE_API_KEY`: Your Claude API key (required)
- `REACT_APP_MAX_FILE_SIZE`: Maximum file upload size in bytes (default: 10MB)
- `REACT_APP_AUTO_SAVE_DELAY`: Auto-save delay in milliseconds (default: 2000ms)

### Confidence Levels
- **High (90-100%)**: Green - Exact or very close matches
- **Medium (70-89%)**: Yellow - Good semantic matches
- **Low (50-69%)**: Orange - Possible matches, review needed
- **Very Low (<50%)**: Red - Manual review required

## Development

### Project Structure
```
src/
├── components/           # React components
│   ├── ChatPanel/       # Chat interface components
│   ├── MappingPanel/    # Mapping grid components
│   ├── Layout/          # Layout components
│   └── Common/          # Shared components
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx             # Main application component
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Key Components
- **TwoColumnLayout**: Resizable split-panel layout
- **ChatInterface**: Chat UI with file upload
- **MappingGrid**: Interactive data grid with ag-Grid
- **useClaudeAPI**: Hook for Claude API integration
- **useMappingData**: Hook for data management and persistence
- **useFileProcessor**: Hook for file parsing and validation

## API Integration

The application integrates with Claude's API for:
- Contextual conversation about mapping data
- Intelligent mapping suggestions
- Bulk operation guidance
- Data quality insights

All API communication includes current mapping context for better assistance.

## Data Persistence

- Mappings are automatically saved to browser localStorage
- Recent changes are tracked for Claude context
- Data persists between browser sessions
- Export functionality for permanent storage

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Update documentation for new functionality
4. Test file upload and Claude integration thoroughly

## License

This project is provided as-is for demonstration and development purposes.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your Claude API key is valid
3. Ensure uploaded files match the expected format
4. Review the troubleshooting section below

## Troubleshooting

### Common Issues

**"Claude API key not configured"**
- Add your API key to `.env.local`
- Restart the development server

**"Could not detect source code column"**
- Verify your file has a column with names like "source_code", "code", or "account_code"
- Check that the first row contains column headers

**"File parsing failed"**
- Ensure the file is a valid Excel or CSV format
- Check for special characters or formatting issues
- Try saving the file in a simpler format

**Grid not loading**
- Check browser console for JavaScript errors
- Verify all dependencies are installed
- Try refreshing the page