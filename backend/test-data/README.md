# Test Data Files for Account Mapping Application

## Available Test Data Sets

### 1. Source System Data (FIS IO)
- **File**: `fis-io-ledger-accounts.csv`
- **Records**: 64 accounts
- **Format**: CSV with headers
- **Columns**: Account_Code, Account_Description, Account_Type, Account_Category, Balance_Sheet_Category, Income_Statement_Category, Active, Created_Date, Last_Modified

### 2. Target System Data (BNY Eagle)
- **File**: `bny-eagle-ledger-accounts.csv`  
- **Records**: 66 accounts
- **Format**: CSV with headers
- **Columns**: GL_Account, GL_Description, Account_Class, Sub_Class, Financial_Statement, Normal_Balance, Status, Department, Cost_Center

### 3. Ground Truth Mappings
- **File**: `ground-truth-mappings.csv`
- **Records**: 64 mappings
- **Format**: CSV with headers
- **Columns**: Source_Account_Code, Source_Description, Target_Account_Code, Target_Description, Mapping_Confidence, Mapping_Type, Notes

### 4. Evaluation Test Cases
- **File**: `evaluation-test-cases.csv`
- **Records**: 30 test cases
- **Format**: CSV with headers
- **Columns**: Test_Case_ID, Source_Account, Expected_Target, Expected_Confidence_Range, Test_Category, Difficulty_Level, Expected_Reasoning_Keywords, Notes

## Test Scenarios

### Scenario 1: Complete File Upload
Upload `fis-io-ledger-accounts.csv` as source data and test the application's ability to:
- Parse CSV files correctly
- Display account data in the mapping grid
- Handle different column structures
- Validate data integrity

### Scenario 2: Partial Mapping Test
Upload first 20 accounts from FIS IO data and test:
- AI mapping suggestions
- Confidence score accuracy
- Mapping reasoning quality
- User interface responsiveness

### Scenario 3: Bulk Mapping Evaluation
Upload complete FIS IO dataset and evaluate:
- Processing speed for large datasets
- Consistency across similar accounts
- Memory usage and performance
- Export functionality

### Scenario 4: Edge Case Testing
Test specific challenging accounts:
- Accounts with ambiguous descriptions
- Accounts requiring business context
- Accounts with no clear mapping target
- Accounts with multiple valid options

## Data Quality Notes

### FIS IO Data Characteristics:
- Standard chart of accounts structure
- Hierarchical account numbering (1000s, 2000s, etc.)
- Clear account type categorization
- Includes both active and potential inactive accounts
- Mix of asset, liability, equity, revenue, and expense accounts

### BNY Eagle Data Characteristics:
- Different numbering scheme (6-digit GL codes)
- Additional metadata (departments, cost centers)
- Different terminology and naming conventions
- More granular sub-classifications
- Extended account attributes

### Mapping Complexity Levels:
- **Easy (40%)**: Direct functional matches with clear equivalents
- **Medium (35%)**: Similar functions requiring semantic understanding
- **Hard (20%)**: Ambiguous or consolidated mappings
- **Edge Cases (5%)**: Accounts requiring special handling

## Usage Instructions

1. **For Development Testing**: Use individual CSV files to test specific features
2. **For Performance Testing**: Use complete datasets to test bulk operations
3. **For Accuracy Testing**: Compare AI suggestions against ground truth mappings
4. **For User Acceptance Testing**: Use evaluation test cases with expected outcomes

## File Formats Supported
- CSV files with headers
- Excel files (.xlsx) - can be generated from CSV data
- JSON format for API testing
- Tab-delimited files for alternative parsing

## Evaluation Workflow
1. Load source data (FIS IO accounts)
2. Run AI mapping process
3. Compare results against ground truth
4. Calculate accuracy metrics
5. Analyze confidence score calibration
6. Generate evaluation report