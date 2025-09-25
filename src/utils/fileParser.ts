import * as XLSX from 'xlsx';
import { FileProcessingResult, FileValidationResult, MappingRow } from '../types';

// Common column name variations for accounting data
const COLUMN_MAPPINGS = {
  sourceCode: [
    'source_code', 'sourcecode', 'source code', 'code', 'account_code', 
    'accountcode', 'account code', 'from_code', 'fromcode', 'old_code', 'oldcode'
  ],
  sourceDescription: [
    'source_description', 'sourcedescription', 'source description', 'description',
    'account_description', 'accountdescription', 'account description', 'desc',
    'from_description', 'fromdescription', 'old_description', 'olddescription'
  ],
  targetCode: [
    'target_code', 'targetcode', 'target code', 'to_code', 'tocode', 
    'new_code', 'newcode', 'mapped_code', 'mappedcode'
  ],
  targetDescription: [
    'target_description', 'targetdescription', 'target description',
    'to_description', 'todescription', 'new_description', 'newdescription',
    'mapped_description', 'mappeddescription'
  ]
};

export const parseFile = async (file: File): Promise<FileProcessingResult> => {
  const result: FileProcessingResult = {
    data: [],
    headers: [],
    totalRows: 0,
    errors: [],
    warnings: []
  };

  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      result.errors.push('Unsupported file format. Please use Excel (.xlsx, .xls) or CSV (.csv) files.');
      return result;
    }

    const arrayBuffer = await file.arrayBuffer();
    let workbook: XLSX.WorkBook;

    if (fileExtension === 'csv') {
      const text = new TextDecoder().decode(arrayBuffer);
      workbook = XLSX.read(text, { type: 'string' });
    } else {
      workbook = XLSX.read(arrayBuffer, { type: 'array' });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      result.errors.push('No sheets found in the file.');
      return result;
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (jsonData.length === 0) {
      result.errors.push('The file appears to be empty.');
      return result;
    }

    // Extract headers (first row)
    result.headers = jsonData[0]?.map(header => String(header || '').trim()) || [];
    
    if (result.headers.length === 0) {
      result.errors.push('No headers found in the file.');
      return result;
    }

    // Convert data rows to objects
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        continue; // Skip empty rows
      }

      const rowObject: Record<string, any> = {};
      result.headers.forEach((header, index) => {
        rowObject[header] = row[index] || '';
      });

      result.data.push(rowObject);
    }

    result.totalRows = result.data.length;

    // Add warnings for common issues
    if (result.totalRows === 0) {
      result.warnings.push('No data rows found after header row.');
    } else if (result.totalRows > 10000) {
      result.warnings.push(`Large file detected (${result.totalRows} rows). Processing may take some time.`);
    }

    return result;

  } catch (error: any) {
    result.errors.push(`Failed to parse file: ${error.message}`);
    return result;
  }
};

export const validateAccountingData = (data: FileProcessingResult): FileValidationResult => {
  const validation: FileValidationResult = {
    isValid: false,
    errors: [...data.errors],
    warnings: [...data.warnings],
    detectedColumns: {}
  };

  if (data.errors.length > 0) {
    return validation;
  }

  // Detect column mappings
  const headers = data.headers.map(h => h.toLowerCase().trim());
  
  Object.entries(COLUMN_MAPPINGS).forEach(([key, variations]) => {
    const matchedHeader = headers.find(header => 
      variations.some(variation => 
        header.includes(variation) || variation.includes(header)
      )
    );
    
    if (matchedHeader) {
      const originalHeader = data.headers[headers.indexOf(matchedHeader)];
      validation.detectedColumns[key as keyof typeof validation.detectedColumns] = originalHeader;
    }
  });

  // Validate required columns
  if (!validation.detectedColumns.sourceCode) {
    validation.errors.push('Could not detect a source code column. Expected columns like: source_code, code, account_code');
  }

  if (!validation.detectedColumns.sourceDescription) {
    validation.warnings.push('Could not detect a source description column. This may affect mapping quality.');
  }

  // Check data quality
  if (data.data.length > 0) {
    const sourceCodeColumn = validation.detectedColumns.sourceCode;
    if (sourceCodeColumn) {
      const emptySourceCodes = data.data.filter(row => !row[sourceCodeColumn] || String(row[sourceCodeColumn]).trim() === '');
      if (emptySourceCodes.length > 0) {
        validation.warnings.push(`${emptySourceCodes.length} rows have empty source codes and will be skipped.`);
      }

      // Check for duplicate source codes
      const sourceCodes = data.data
        .map(row => String(row[sourceCodeColumn]).trim())
        .filter(code => code !== '');
      const duplicates = sourceCodes.filter((code, index) => sourceCodes.indexOf(code) !== index);
      if (duplicates.length > 0) {
        validation.warnings.push(`Found ${new Set(duplicates).size} duplicate source codes.`);
      }
    }
  }

  validation.isValid = validation.errors.length === 0;
  return validation;
};

export const convertToMappingRows = (
  data: FileProcessingResult, 
  validation: FileValidationResult
): MappingRow[] => {
  if (!validation.isValid || !validation.detectedColumns.sourceCode) {
    return [];
  }

  const sourceCodeCol = validation.detectedColumns.sourceCode!;
  const sourceDescCol = validation.detectedColumns.sourceDescription;
  const targetCodeCol = validation.detectedColumns.targetCode;
  const targetDescCol = validation.detectedColumns.targetDescription;

  return data.data
    .map((row, index) => {
      const sourceCode = String(row[sourceCodeCol] || '').trim();
      if (!sourceCode) return null; // Skip empty source codes

      const sourceDescription = sourceDescCol ? String(row[sourceDescCol] || '').trim() : '';
      const targetCode = targetCodeCol ? String(row[targetCodeCol] || '').trim() : '';
      const targetDescription = targetDescCol ? String(row[targetDescCol] || '').trim() : '';

      // Determine initial mapping status and confidence
      let status: MappingRow['status'] = 'unmapped';
      let matchType: MappingRow['matchType'] = 'None';
      let confidence = 0;

      if (targetCode) {
        status = 'mapped';
        if (targetCode === sourceCode) {
          matchType = 'Exact';
          confidence = 100;
        } else if (targetDescription && sourceDescription) {
          // Simple semantic matching heuristic
          const descSimilarity = calculateDescriptionSimilarity(sourceDescription, targetDescription);
          if (descSimilarity > 0.8) {
            matchType = 'Semantic';
            confidence = Math.round(descSimilarity * 100);
          } else {
            matchType = 'Manual';
            confidence = 50;
          }
        } else {
          matchType = 'Manual';
          confidence = 50;
        }
      }

      const mappingRow: MappingRow = {
        id: `row_${index + 1}_${Date.now()}`,
        sourceCode,
        sourceDescription,
        targetCode,
        targetDescription,
        matchType,
        confidence,
        status,
        notes: '',
        lastModified: new Date(),
        modifiedBy: 'user'
      };

      return mappingRow;
    })
    .filter((row): row is MappingRow => row !== null);
};

// Simple description similarity calculation
const calculateDescriptionSimilarity = (desc1: string, desc2: string): number => {
  if (!desc1 || !desc2) return 0;

  const words1 = desc1.toLowerCase().split(/\s+/);
  const words2 = desc2.toLowerCase().split(/\s+/);

  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];

  return intersection.length / union.length;
};

export const exportToExcel = (data: MappingRow[], filename: string = 'mapping-export.xlsx'): void => {
  const exportData = data.map(row => ({
    'Source Code': row.sourceCode,
    'Source Description': row.sourceDescription,
    'Target Code': row.targetCode,
    'Target Description': row.targetDescription,
    'Match Type': row.matchType,
    'Confidence': row.confidence,
    'Status': row.status,
    'Notes': row.notes,
    'Last Modified': row.lastModified.toISOString().split('T')[0],
    'Modified By': row.modifiedBy
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mappings');

  // Auto-size columns
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
};

export const exportToCSV = (data: MappingRow[], filename: string = 'mapping-export.csv'): void => {
  const exportData = data.map(row => ({
    'Source Code': row.sourceCode,
    'Source Description': row.sourceDescription,
    'Target Code': row.targetCode,
    'Target Description': row.targetDescription,
    'Match Type': row.matchType,
    'Confidence': row.confidence,
    'Status': row.status,
    'Notes': row.notes,
    'Last Modified': row.lastModified.toISOString().split('T')[0],
    'Modified By': row.modifiedBy
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};