# Account Mapping Evaluation Framework
# For Testing Claude AI Prompt Effectiveness in FIS IO to BNY Eagle Account Mapping

## Evaluation Metrics

### 1. Accuracy Metrics
- **Exact Match Rate**: Percentage of mappings that exactly match ground truth
- **Acceptable Match Rate**: Percentage of mappings within acceptable confidence threshold (>80%)
- **Category Accuracy**: Percentage of mappings that match the correct account category/type
- **Semantic Accuracy**: Percentage of mappings that are semantically correct even if not exact

### 2. Confidence Score Evaluation
- **Confidence Calibration**: How well confidence scores correlate with actual accuracy
- **Over/Under Confidence**: Analysis of confidence score distribution vs. actual performance
- **Confidence Threshold Optimization**: Determine optimal confidence thresholds for filtering

### 3. Mapping Quality Assessment
- **Direct Mapping Accuracy**: Success rate for 1:1 account mappings
- **Consolidated Mapping Logic**: Appropriateness of many-to-one mappings
- **Similar Account Identification**: Ability to identify functionally similar accounts
- **Unmappable Account Detection**: Accuracy in identifying accounts with no suitable target

### 4. Prompt Engineering Evaluation Criteria

#### Test Scenarios
1. **Basic Account Mapping**: Standard GL account mapping without additional context
2. **Contextual Mapping**: Mapping with business context and transaction history
3. **Ambiguous Account Handling**: Accounts that could map to multiple targets
4. **Industry-Specific Mapping**: Accounts with specialized business meanings
5. **Bulk Mapping Consistency**: Consistency across large batches of accounts

#### Evaluation Questions for Each Test Case:
1. Did the AI correctly identify the primary function of the source account?
2. Was the target account selection appropriate given the business context?
3. Was the confidence score calibrated appropriately?
4. Did the AI provide clear reasoning for the mapping decision?
5. Were alternative mapping options considered when appropriate?

### 5. Error Analysis Categories
- **Category Mismatch**: Wrong account type/category selection
- **Functional Mismatch**: Accounts serve different business purposes
- **Confidence Errors**: Inappropriate confidence levels
- **Context Misunderstanding**: Failure to consider business context
- **Missing Mappings**: Failure to identify valid mapping targets

### 6. Prompt Effectiveness Scoring

#### Scoring Rubric (1-5 scale for each criteria):

**Accuracy (25%)**
- 5: >95% accuracy on ground truth mappings
- 4: 90-95% accuracy
- 3: 80-89% accuracy
- 2: 70-79% accuracy
- 1: <70% accuracy

**Confidence Calibration (20%)**
- 5: Confidence scores highly correlated with accuracy (r>0.9)
- 4: Good correlation (r=0.8-0.9)
- 3: Moderate correlation (r=0.6-0.8)
- 2: Weak correlation (r=0.4-0.6)
- 1: Poor correlation (r<0.4)

**Reasoning Quality (20%)**
- 5: Clear, logical explanations for all mapping decisions
- 4: Good explanations for most decisions
- 3: Basic explanations provided
- 2: Limited explanations
- 1: Poor or no explanations

**Consistency (15%)**
- 5: Highly consistent mappings across similar accounts
- 4: Generally consistent with minor variations
- 3: Moderately consistent
- 2: Some inconsistencies noted
- 1: Highly inconsistent

**Edge Case Handling (10%)**
- 5: Excellent handling of ambiguous/complex cases
- 4: Good handling of most edge cases
- 3: Adequate edge case management
- 2: Some difficulties with edge cases
- 1: Poor edge case handling

**Speed/Efficiency (10%)**
- 5: Fast processing with no timeouts
- 4: Good performance speed
- 3: Acceptable processing time
- 2: Slow but functional
- 1: Very slow or frequent timeouts

### 7. Test Data Segments for Evaluation

#### Segment A: High Confidence Expected (>90%)
- Direct account name matches
- Common GL account types
- Clear functional equivalents

#### Segment B: Medium Confidence Expected (70-89%)
- Similar but not identical account functions
- Accounts requiring business context
- Industry-specific terminology

#### Segment C: Low Confidence Expected (<70%)
- Ambiguous account purposes
- Multiple valid mapping options
- Accounts with no clear equivalent

#### Segment D: No Mapping Expected
- Accounts unique to source system
- Obsolete or inactive accounts
- System-specific technical accounts

### 8. Benchmark Comparisons
- Compare against simple keyword matching
- Compare against rule-based mapping systems
- Compare against human expert mappings
- Historical mapping accuracy from manual processes

### 9. Continuous Improvement Metrics
- Track prompt performance over multiple iterations
- A/B testing of different prompt formulations
- User feedback integration scores
- Learning curve analysis

### 10. Success Criteria
**Minimum Acceptable Performance:**
- Overall accuracy >85%
- High confidence mappings (>90%) accuracy >95%
- Edge case handling score >3.0
- Consistency score >3.5

**Target Performance:**
- Overall accuracy >92%
- High confidence mappings accuracy >98%
- All evaluation criteria scores >4.0
- Processing time <2 seconds per mapping

## Implementation Notes
- Run evaluation on randomized subsets to avoid overfitting
- Include domain expert validation for complex cases
- Track performance across different account categories
- Monitor for bias in mapping preferences
- Regular recalibration of ground truth data