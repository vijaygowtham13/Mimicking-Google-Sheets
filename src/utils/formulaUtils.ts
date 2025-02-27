
// Types for the formula evaluation
type CellValueGetter = (row: number, col: string) => string;

// Function to parse a cell reference like "A1" into row and column
export const parseCellReference = (reference: string): { row: number; col: string } => {
  const match = reference.match(/([A-Z]+)(\d+)/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${reference}`);
  }
  
  const col = match[1];
  const row = parseInt(match[2], 10);
  
  return { row, col };
};

// Helper to convert column name to index
export const colNameToIndex = (colName: string): number => {
  let index = 0;
  for (let i = 0; i < colName.length; i++) {
    index = index * 26 + (colName.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
};

// Helper to get the range of cells between two references
export const getCellRange = (start: string, end: string): string[] => {
  const startCell = parseCellReference(start);
  const endCell = parseCellReference(end);
  
  const startColIndex = colNameToIndex(startCell.col);
  const endColIndex = colNameToIndex(endCell.col);
  
  const cells: string[] = [];
  
  for (let row = startCell.row; row <= endCell.row; row++) {
    for (let colIndex = startColIndex; colIndex <= endColIndex; colIndex++) {
      const colName = columnIndexToName(colIndex);
      cells.push(`${colName}${row}`);
    }
  }
  
  return cells;
};

// Helper to convert column index to name
export const columnIndexToName = (index: number): string => {
  let name = '';
  while (index >= 0) {
    name = String.fromCharCode(65 + (index % 26)) + name;
    index = Math.floor(index / 26) - 1;
  }
  return name;
};

// Main formula evaluation function
export const evaluateFormula = (formula: string, getCellValue: CellValueGetter): string => {
  // Check if formula starts with =
  if (!formula.startsWith('=')) {
    return formula;
  }
  
  // Extract the actual formula
  const expression = formula.substring(1).trim();
  
  try {
    // Handle the different types of functions
    if (expression.toUpperCase().startsWith('SUM(')) {
      return evaluateSum(expression, getCellValue);
    } else if (expression.toUpperCase().startsWith('AVERAGE(')) {
      return evaluateAverage(expression, getCellValue);
    } else if (expression.toUpperCase().startsWith('MAX(')) {
      return evaluateMax(expression, getCellValue);
    } else if (expression.toUpperCase().startsWith('MIN(')) {
      return evaluateMin(expression, getCellValue);
    } else if (expression.toUpperCase().startsWith('COUNT(')) {
      return evaluateCount(expression, getCellValue);
    } else if (expression.toUpperCase().startsWith('TRIM(')) {
      return evaluateTrim(expression, getCellValue);
    } else if (expression.toUpperCase().startsWith('UPPER(')) {
      return evaluateUpper(expression, getCellValue);
    } else if (expression.toUpperCase().startsWith('LOWER(')) {
      return evaluateLower(expression, getCellValue);
    } else {
      // Basic arithmetic expressions and cell references
      return evaluateBasicExpression(expression, getCellValue);
    }
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR!';
  }
};

// Process the range inside a function like SUM(A1:B5)
const processRange = (rangeStr: string, getCellValue: CellValueGetter): string[] => {
  if (rangeStr.includes(':')) {
    // It's a range like A1:B5
    const [start, end] = rangeStr.split(':');
    return getCellRange(start, end).map(ref => {
      const { row, col } = parseCellReference(ref);
      return getCellValue(row, col);
    });
  } else {
    // It's a single cell or a comma-separated list
    return rangeStr.split(',').map(ref => {
      ref = ref.trim();
      const { row, col } = parseCellReference(ref);
      return getCellValue(row, col);
    });
  }
};

// Evaluate SUM function
const evaluateSum = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the range from SUM(range)
  const rangeStr = expression.substring(4, expression.length - 1);
  const values = processRange(rangeStr, getCellValue);
  
  const sum = values
    .filter(val => val !== '' && !isNaN(parseFloat(val)))
    .reduce((acc, val) => acc + parseFloat(val), 0);
  
  return sum.toString();
};

// Evaluate AVERAGE function
const evaluateAverage = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the range from AVERAGE(range)
  const rangeStr = expression.substring(8, expression.length - 1);
  const values = processRange(rangeStr, getCellValue);
  
  const numericalValues = values
    .filter(val => val !== '' && !isNaN(parseFloat(val)))
    .map(val => parseFloat(val));
  
  if (numericalValues.length === 0) {
    return '0';
  }
  
  const sum = numericalValues.reduce((acc, val) => acc + val, 0);
  const average = sum / numericalValues.length;
  
  return average.toString();
};

// Evaluate MAX function
const evaluateMax = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the range from MAX(range)
  const rangeStr = expression.substring(4, expression.length - 1);
  const values = processRange(rangeStr, getCellValue);
  
  const numericalValues = values
    .filter(val => val !== '' && !isNaN(parseFloat(val)))
    .map(val => parseFloat(val));
  
  if (numericalValues.length === 0) {
    return '0';
  }
  
  const max = Math.max(...numericalValues);
  
  return max.toString();
};

// Evaluate MIN function
const evaluateMin = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the range from MIN(range)
  const rangeStr = expression.substring(4, expression.length - 1);
  const values = processRange(rangeStr, getCellValue);
  
  const numericalValues = values
    .filter(val => val !== '' && !isNaN(parseFloat(val)))
    .map(val => parseFloat(val));
  
  if (numericalValues.length === 0) {
    return '0';
  }
  
  const min = Math.min(...numericalValues);
  
  return min.toString();
};

// Evaluate COUNT function
const evaluateCount = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the range from COUNT(range)
  const rangeStr = expression.substring(6, expression.length - 1);
  const values = processRange(rangeStr, getCellValue);
  
  const count = values.filter(val => val !== '' && !isNaN(parseFloat(val))).length;
  
  return count.toString();
};

// Evaluate TRIM function
const evaluateTrim = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the cell reference from TRIM(cell)
  const cellRef = expression.substring(5, expression.length - 1);
  const { row, col } = parseCellReference(cellRef);
  const value = getCellValue(row, col);
  
  return value.trim();
};

// Evaluate UPPER function
const evaluateUpper = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the cell reference from UPPER(cell)
  const cellRef = expression.substring(6, expression.length - 1);
  const { row, col } = parseCellReference(cellRef);
  const value = getCellValue(row, col);
  
  return value.toUpperCase();
};

// Evaluate LOWER function
const evaluateLower = (expression: string, getCellValue: CellValueGetter): string => {
  // Extract the cell reference from LOWER(cell)
  const cellRef = expression.substring(6, expression.length - 1);
  const { row, col } = parseCellReference(cellRef);
  const value = getCellValue(row, col);
  
  return value.toLowerCase();
};

// Evaluate basic expressions (cell references and arithmetic)
const evaluateBasicExpression = (expression: string, getCellValue: CellValueGetter): string => {
  // Replace cell references with their values
  const cellRefPattern = /[A-Z]+\d+/g;
  const processedExpression = expression.replace(cellRefPattern, (match) => {
    const { row, col } = parseCellReference(match);
    const value = getCellValue(row, col);
    
    // If cell value is empty or not a number, use 0
    if (value === '' || isNaN(parseFloat(value))) {
      return '0';
    }
    
    return value;
  });
  
  // Evaluate the resulting expression (be careful with eval!)
  try {
    // This is for demonstration only - in a real app, use a proper expression parser
    const result = Function('"use strict";return (' + processedExpression + ')')();
    return result.toString();
  } catch (error) {
    console.error('Error evaluating expression:', processedExpression, error);
    return '#ERROR!';
  }
};
