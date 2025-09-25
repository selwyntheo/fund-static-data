# React Application: Claude LLM Accounting Cross-Reference Mapping Interface

Build a React application with Claude LLM integration for interactive accounting platform mapping. The app should provide intelligent cross-reference mapping between accounting platforms with real-time user interaction and bidirectional communication with Claude.

## Application Architecture

### Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS or Material-UI
- **State Management**: React Context API or Zustand
- **HTTP Client**: Axios for Claude API integration
- **File Upload**: react-dropzone for Excel/CSV handling
- **Data Grid**: ag-grid-react or react-table for mapping display
- **Icons**: lucide-react or react-icons

### Project Structure
```
src/
├── components/
│   ├── ChatPanel/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── InputArea.tsx
│   ├── MappingPanel/
│   │   ├── MappingGrid.tsx
│   │   ├── MappingRow.tsx
│   │   └── EditMappingModal.tsx
│   ├── Layout/
│   │   ├── TwoColumnLayout.tsx
│   │   └── ResizablePanels.tsx
│   └── Common/
│       ├── FileUpload.tsx
│       └── StatusIndicator.tsx
├── hooks/
│   ├── useClaudeAPI.ts
│   ├── useMappingData.ts
│   └── useFileProcessor.ts
├── types/
│   ├── mapping.ts
│   └── api.ts
├── utils/
│   ├── fileParser.ts
│   └── mappingHelpers.ts
└── App.tsx
```

## Core Components Implementation

### 1. Main Layout Component
```tsx
// Create a two-column resizable layout with:
interface TwoColumnLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialSplitPosition?: number;
}

// Features needed:
- Resizable splitter between panels
- Minimum width constraints (300px each panel)
- Responsive design for mobile/tablet
- Panel collapse/expand functionality
```

### 2. Chat Interface (Left Panel)
```tsx
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mappingContext?: {
    affectedRows: string[];
    action: 'create' | 'update' | 'delete';
  };
}

// Required features:
- Auto-scrolling message history
- Typing indicator when Claude is processing
- Message timestamps
- File upload integration (drag & drop Excel/CSV)
- Send button with Enter key support
- Message formatting (markdown support)
- Context awareness of mapping changes
```

### 3. Mapping Grid (Right Panel)
```tsx
interface MappingRow {
  id: string;
  sourceCode: string;
  sourceDescription: string;
  targetCode: string;
  targetDescription: string;
  matchType: 'Exact' | 'Semantic' | 'Manual' | 'None';
  confidence: number;
  status: 'mapped' | 'unmapped' | 'pending' | 'rejected';
  notes: string;
  lastModified: Date;
  modifiedBy: 'user' | 'claude';
}

// Grid features needed:
- Sortable columns
- Filterable rows (by status, confidence, match type)
- Inline editing capabilities
- Row selection (single/multiple)
- Context menu (right-click actions)
- Color-coded confidence levels
- Status badges
- Export functionality
```

### 4. Interactive Mapping Features
```tsx
// Mapping interaction requirements:
- Click to edit target code/description
- Dropdown for selecting alternative targets
- Confidence slider adjustment
- Status toggle (accept/reject mapping)
- Add notes/comments
- Bulk operations (accept all, reject all)
- Undo/redo functionality
- Real-time validation
```

## Claude LLM Integration

### API Integration Hook
```tsx
// Create useClaudeAPI hook with:
interface ClaudeAPIHook {
  sendMessage: (message: string, context?: MappingContext) => Promise<void>;
  processMappingFeedback: (changes: MappingChange[]) => Promise<void>;
  generateMappingSuggestions: (unmappedRows: MappingRow[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Context to include:
- Current mapping state
- Recent user changes
- File metadata
- Processing status
```

### Bidirectional Communication
```tsx
// Implement message types for Claude:
interface UserFeedback {
  type: 'mapping_change' | 'bulk_action' | 'request_suggestion' | 'file_upload';
  data: {
    changedRows?: MappingRow[];
    action?: string;
    context?: string;
  };
}

// Auto-generate messages to Claude when:
- User edits a mapping
- User rejects a suggestion
- User performs bulk operations
- User uploads new file
- User requests help/suggestions
```

## Key Functionalities

### File Processing
```tsx
// Implement file upload and processing:
- Support Excel (.xlsx, .xls) and CSV files
- Parse and validate account data structure
- Extract relevant columns automatically
- Preview data before processing
- Handle errors gracefully
- Progress indicator for large files
```

### Real-time Feedback Loop
```tsx
// Implement automatic feedback to Claude:
const handleMappingChange = (rowId: string, changes: Partial<MappingRow>) => {
  // 1. Update local state
  updateMapping(rowId, changes);
  
  // 2. Generate contextual message to Claude
  const feedbackMessage = generateFeedbackMessage(changes);
  
  // 3. Send to Claude with current context
  sendMessageToClaude(feedbackMessage, getCurrentMappingContext());
};
```

### Export and Import
```tsx
// Export functionality:
- Export mappings as Excel/CSV
- Export unmapped items report
- Export confidence analysis
- Save mapping templates
- Import previously saved mappings
```

## UI/UX Requirements

### Design System
- Clean, professional interface suitable for accounting professionals
- Consistent color coding for confidence levels:
  - Green (90-100%): High confidence
  - Yellow (70-89%): Medium confidence
  - Orange (50-69%): Low confidence
  - Red (<50%): Very low confidence
- Clear status indicators and progress bars
- Accessible design (WCAG 2.1 AA compliant)

### User Experience
- Intuitive workflow from file upload to final export
- Contextual help and tooltips
- Keyboard shortcuts for power users
- Undo/redo for all actions
- Auto-save functionality
- Responsive design for different screen sizes

## Sample Implementation Prompts

### For Chat Component:
"Create a React chat interface component that displays conversation history with Claude LLM, supports file upload via drag-and-drop, and automatically sends mapping change context to Claude when users modify the mapping grid."

### For Mapping Grid:
"Build an editable data grid component for accounting cross-reference mappings with inline editing, confidence color coding, status badges, sorting, filtering, and context menu actions."

### For API Integration:
"Implement a custom hook for Claude API integration that handles bidirectional communication, maintains conversation context, processes mapping feedback, and manages loading states."

### For File Processing:
"Create a file processing utility that can parse Excel and CSV files containing accounting data, validate the structure, extract relevant columns, and convert to the mapping data format."

## Testing Requirements
- Unit tests for all utility functions
- Integration tests for Claude API communication
- E2E tests for complete user workflows
- Mock data for development and testing
- Error boundary components for graceful error handling

## Deployment Considerations
- Environment variables for Claude API configuration
- Build optimization for production
- Error logging and monitoring
- Performance optimization for large datasets
- Browser compatibility testing