
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '../components/ui/use-toast';
import { evaluateFormula } from '../utils/formulaUtils';

// Types
export interface CellData {
  value: string;
  formula: string;
  formatting: {
    bold: boolean;
    italic: boolean;
    fontSize: number;
    color: string;
  };
}

export interface SheetState {
  data: Record<string, Record<string, CellData>>;
  activeCell: { row: number; col: string } | null;
  selectedRange: {
    start: { row: number; col: string };
    end: { row: number; col: string };
  } | null;
  rowHeights: Record<number, number>;
  colWidths: Record<string, number>;
  numRows: number;
  numCols: number;
}

interface SheetContextType {
  sheetState: SheetState;
  setActiveCell: (row: number, col: string) => void;
  updateCellValue: (row: number, col: string, value: string, isFormula?: boolean) => void;
  updateCellFormatting: (row: number, col: string, formatting: Partial<CellData['formatting']>) => void;
  getCellValue: (row: number, col: string) => string;
  getCellDisplayValue: (row: number, col: string) => string;
  getCellData: (row: number, col: string) => CellData;
  addRow: (afterRow?: number) => void;
  deleteRow: (row: number) => void;
  addColumn: (afterCol?: string) => void;
  deleteColumn: (col: string) => void;
  setSelectedRange: (start: { row: number; col: string }, end: { row: number; col: string }) => void;
  clearSelectedRange: () => void;
  evaluateCell: (row: number, col: string) => string;
  findAndReplace: (findText: string, replaceText: string, selectedOnly?: boolean) => void;
  removeDuplicates: (columnIndices: string[]) => void;
  resizeColumn: (col: string, width: number) => void;
  resizeRow: (row: number, height: number) => void;
  recalculateAll: () => void;
}

// Helper functions
const generateColumnName = (index: number): string => {
  let name = '';
  while (index >= 0) {
    name = String.fromCharCode(65 + (index % 26)) + name;
    index = Math.floor(index / 26) - 1;
  }
  return name;
};

const generateInitialData = (rows: number, cols: number): Record<string, Record<string, CellData>> => {
  const data: Record<string, Record<string, CellData>> = {};
  
  for (let row = 1; row <= rows; row++) {
    data[row.toString()] = {};
    for (let col = 0; col < cols; col++) {
      const colName = generateColumnName(col);
      data[row.toString()][colName] = {
        value: '',
        formula: '',
        formatting: {
          bold: false,
          italic: false,
          fontSize: 12,
          color: '#000000'
        }
      };
    }
  }
  
  return data;
};

// Default values
const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26; // A to Z

// Context creation
const SheetContext = createContext<SheetContextType | undefined>(undefined);

export const SheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sheetState, setSheetState] = useState<SheetState>({
    data: generateInitialData(DEFAULT_ROWS, DEFAULT_COLS),
    activeCell: null,
    selectedRange: null,
    rowHeights: {},
    colWidths: {},
    numRows: DEFAULT_ROWS,
    numCols: DEFAULT_COLS
  });

  // Set active cell
  const setActiveCell = (row: number, col: string) => {
    setSheetState(prev => ({
      ...prev,
      activeCell: { row, col }
    }));
  };

  // Update cell value (and formula if applicable)
  const updateCellValue = (row: number, col: string, value: string, isFormula = false) => {
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      if (!newData[row.toString()]) {
        newData[row.toString()] = {};
      }
      
      if (!newData[row.toString()][col]) {
        newData[row.toString()][col] = {
          value: '',
          formula: '',
          formatting: {
            bold: false,
            italic: false,
            fontSize: 12,
            color: '#000000'
          }
        };
      }
      
      // Update the cell
      if (isFormula) {
        newData[row.toString()][col] = {
          ...newData[row.toString()][col],
          formula: value,
          value: evaluateFormula(value, (r, c) => getCellValue(r, c, newData))
        };
      } else {
        newData[row.toString()][col] = {
          ...newData[row.toString()][col],
          value,
          formula: ''
        };
      }
      
      return {
        ...prev,
        data: newData
      };
    });
  };

  // Update cell formatting
  const updateCellFormatting = (row: number, col: string, formatting: Partial<CellData['formatting']>) => {
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      if (!newData[row.toString()]) {
        newData[row.toString()] = {};
      }
      
      if (!newData[row.toString()][col]) {
        newData[row.toString()][col] = {
          value: '',
          formula: '',
          formatting: {
            bold: false,
            italic: false,
            fontSize: 12,
            color: '#000000'
          }
        };
      }
      
      newData[row.toString()][col] = {
        ...newData[row.toString()][col],
        formatting: {
          ...newData[row.toString()][col].formatting,
          ...formatting
        }
      };
      
      return {
        ...prev,
        data: newData
      };
    });
  };

  // Get cell value (for internal use with custom data state)
  const getCellValue = (row: number, col: string, data = sheetState.data): string => {
    if (!data[row.toString()] || !data[row.toString()][col]) {
      return '';
    }
    return data[row.toString()][col].value;
  };

  // Get cell data
  const getCellData = (row: number, col: string): CellData => {
    if (!sheetState.data[row.toString()] || !sheetState.data[row.toString()][col]) {
      return {
        value: '',
        formula: '',
        formatting: {
          bold: false,
          italic: false,
          fontSize: 12,
          color: '#000000'
        }
      };
    }
    return sheetState.data[row.toString()][col];
  };

  // Get cell display value (for UI)
  const getCellDisplayValue = (row: number, col: string): string => {
    const cellData = getCellData(row, col);
    return cellData.formula ? cellData.value : cellData.value;
  };

  // Add a row
  const addRow = (afterRow?: number) => {
    const insertPosition = afterRow !== undefined ? afterRow + 1 : sheetState.numRows + 1;
    
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      // Shift existing rows down
      for (let row = prev.numRows; row >= insertPosition; row--) {
        newData[(row + 1).toString()] = { ...newData[row.toString()] };
      }
      
      // Create new row
      newData[insertPosition.toString()] = {};
      for (let col = 0; col < prev.numCols; col++) {
        const colName = generateColumnName(col);
        newData[insertPosition.toString()][colName] = {
          value: '',
          formula: '',
          formatting: {
            bold: false,
            italic: false,
            fontSize: 12,
            color: '#000000'
          }
        };
      }
      
      return {
        ...prev,
        data: newData,
        numRows: prev.numRows + 1
      };
    });
    
    toast({
      title: "Row Added",
      description: `New row inserted at position ${insertPosition}`,
      duration: 2000,
    });
  };

  // Delete a row
  const deleteRow = (row: number) => {
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      // Remove the row
      delete newData[row.toString()];
      
      // Shift rows up
      for (let r = row + 1; r <= prev.numRows; r++) {
        newData[(r - 1).toString()] = { ...newData[r.toString()] };
        delete newData[r.toString()];
      }
      
      return {
        ...prev,
        data: newData,
        numRows: prev.numRows - 1,
        activeCell: null
      };
    });
    
    toast({
      title: "Row Deleted",
      description: `Row ${row} has been removed`,
      duration: 2000,
    });
  };

  // Add a column
  const addColumn = (afterCol?: string) => {
    let insertIndex = sheetState.numCols;
    
    if (afterCol) {
      let colIndex = 0;
      for (let i = 0; i < afterCol.length; i++) {
        colIndex = colIndex * 26 + (afterCol.charCodeAt(i) - 65 + 1);
      }
      insertIndex = colIndex;
    }
    
    const newColName = generateColumnName(insertIndex);
    
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      // Add the new column to each row
      for (let row = 1; row <= prev.numRows; row++) {
        if (!newData[row.toString()]) {
          newData[row.toString()] = {};
        }
        
        newData[row.toString()][newColName] = {
          value: '',
          formula: '',
          formatting: {
            bold: false,
            italic: false,
            fontSize: 12,
            color: '#000000'
          }
        };
      }
      
      return {
        ...prev,
        data: newData,
        numCols: prev.numCols + 1
      };
    });
    
    toast({
      title: "Column Added",
      description: `New column ${newColName} has been added`,
      duration: 2000,
    });
  };

  // Delete a column
  const deleteColumn = (col: string) => {
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      // Remove the column from each row
      for (let row = 1; row <= prev.numRows; row++) {
        if (newData[row.toString()]) {
          delete newData[row.toString()][col];
        }
      }
      
      return {
        ...prev,
        data: newData,
        numCols: prev.numCols - 1,
        activeCell: null
      };
    });
    
    toast({
      title: "Column Deleted",
      description: `Column ${col} has been removed`,
      duration: 2000,
    });
  };

  // Set selected range
  const setSelectedRange = (start: { row: number; col: string }, end: { row: number; col: string }) => {
    setSheetState(prev => ({
      ...prev,
      selectedRange: { start, end }
    }));
  };

  // Clear selected range
  const clearSelectedRange = () => {
    setSheetState(prev => ({
      ...prev,
      selectedRange: null
    }));
  };

  // Evaluate a cell (recalculate)
  const evaluateCell = (row: number, col: string): string => {
    const cellData = getCellData(row, col);
    
    if (!cellData.formula) {
      return cellData.value;
    }
    
    try {
      const result = evaluateFormula(cellData.formula, getCellValue);
      
      // Update the cell with the new calculated value
      setSheetState(prev => {
        const newData = { ...prev.data };
        if (newData[row.toString()] && newData[row.toString()][col]) {
          newData[row.toString()][col] = {
            ...newData[row.toString()][col],
            value: result
          };
        }
        return {
          ...prev,
          data: newData
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return '#ERROR!';
    }
  };

  // Find and replace
  const findAndReplace = (findText: string, replaceText: string, selectedOnly = false) => {
    if (!findText) return;
    
    let replacedCount = 0;
    
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      const processRange = () => {
        if (!selectedOnly || !prev.selectedRange) {
          // Process the entire sheet
          for (let row = 1; row <= prev.numRows; row++) {
            for (let col = 0; col < prev.numCols; col++) {
              const colName = generateColumnName(col);
              processCell(row, colName);
            }
          }
        } else {
          // Process only the selected range
          const { start, end } = prev.selectedRange;
          const startColIndex = start.col.charCodeAt(0) - 65;
          const endColIndex = end.col.charCodeAt(0) - 65;
          
          for (let row = start.row; row <= end.row; row++) {
            for (let col = startColIndex; col <= endColIndex; col++) {
              const colName = generateColumnName(col);
              processCell(row, colName);
            }
          }
        }
      };
      
      const processCell = (row: number, col: string) => {
        if (!newData[row.toString()] || !newData[row.toString()][col]) return;
        
        const cell = newData[row.toString()][col];
        
        // Process the value if it's not a formula result
        if (!cell.formula) {
          const newValue = cell.value.replace(new RegExp(findText, 'g'), replaceText);
          if (newValue !== cell.value) {
            newData[row.toString()][col] = {
              ...cell,
              value: newValue
            };
            replacedCount++;
          }
        }
      };
      
      processRange();
      
      return {
        ...prev,
        data: newData
      };
    });
    
    toast({
      title: "Find and Replace",
      description: `Replaced ${replacedCount} occurrences`,
      duration: 2000,
    });
  };

  // Remove duplicates
  const removeDuplicates = (columnIndices: string[]) => {
    if (columnIndices.length === 0) return;
    
    setSheetState(prev => {
      const newData = { ...prev.data };
      const seen = new Set<string>();
      let removedCount = 0;
      
      // First pass: identify unique values
      for (let row = 1; row <= prev.numRows; row++) {
        const rowKey = row.toString();
        if (!newData[rowKey]) continue;
        
        const key = columnIndices.map(col => {
          return newData[rowKey][col] ? newData[rowKey][col].value : '';
        }).join('|');
        
        if (seen.has(key)) {
          // Mark for deletion (temporarily set to null)
          newData[rowKey] = null as any;
          removedCount++;
        } else {
          seen.add(key);
        }
      }
      
      // Second pass: remove null rows and reindex
      const finalData: typeof newData = {};
      let newRowIndex = 1;
      
      for (let row = 1; row <= prev.numRows; row++) {
        if (newData[row.toString()] !== null) {
          finalData[newRowIndex.toString()] = newData[row.toString()];
          newRowIndex++;
        }
      }
      
      toast({
        title: "Remove Duplicates",
        description: `Removed ${removedCount} duplicate rows`,
        duration: 2000,
      });
      
      return {
        ...prev,
        data: finalData,
        numRows: newRowIndex - 1
      };
    });
  };

  // Resize column
  const resizeColumn = (col: string, width: number) => {
    setSheetState(prev => ({
      ...prev,
      colWidths: {
        ...prev.colWidths,
        [col]: width
      }
    }));
  };

  // Resize row
  const resizeRow = (row: number, height: number) => {
    setSheetState(prev => ({
      ...prev,
      rowHeights: {
        ...prev.rowHeights,
        [row]: height
      }
    }));
  };

  // Recalculate all formulas
  const recalculateAll = () => {
    setSheetState(prev => {
      const newData = { ...prev.data };
      
      // First, collect all cells with formulas
      const formulaCells: { row: number; col: string; formula: string }[] = [];
      
      for (let row = 1; row <= prev.numRows; row++) {
        for (let col = 0; col < prev.numCols; col++) {
          const colName = generateColumnName(col);
          const cellData = getCellData(row, colName);
          
          if (cellData.formula) {
            formulaCells.push({
              row,
              col: colName,
              formula: cellData.formula
            });
          }
        }
      }
      
      // Then evaluate all formulas
      formulaCells.forEach(({ row, col, formula }) => {
        try {
          const result = evaluateFormula(formula, (r, c) => getCellValue(r, c, newData));
          
          if (newData[row.toString()] && newData[row.toString()][col]) {
            newData[row.toString()][col] = {
              ...newData[row.toString()][col],
              value: result
            };
          }
        } catch (error) {
          console.error(`Error evaluating formula at ${col}${row}:`, error);
          if (newData[row.toString()] && newData[row.toString()][col]) {
            newData[row.toString()][col] = {
              ...newData[row.toString()][col],
              value: '#ERROR!'
            };
          }
        }
      });
      
      return {
        ...prev,
        data: newData
      };
    });
    
    toast({
      title: "Recalculate",
      description: "All formulas have been recalculated",
      duration: 2000,
    });
  };

  // Export the context value
  const contextValue: SheetContextType = {
    sheetState,
    setActiveCell,
    updateCellValue,
    updateCellFormatting,
    getCellValue,
    getCellDisplayValue,
    getCellData,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    setSelectedRange,
    clearSelectedRange,
    evaluateCell,
    findAndReplace,
    removeDuplicates,
    resizeColumn,
    resizeRow,
    recalculateAll
  };

  return (
    <SheetContext.Provider value={contextValue}>
      {children}
    </SheetContext.Provider>
  );
};

// Custom hook to use the context
export const useSheet = (): SheetContextType => {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error('useSheet must be used within a SheetProvider');
  }
  return context;
};
