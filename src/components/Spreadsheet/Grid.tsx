
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cell from './Cell';
import { useSheet } from '@/context/SheetContext';
import { columnIndexToName } from '@/utils/formulaUtils';

const Grid: React.FC = () => {
  const {
    sheetState,
    setActiveCell,
    setSelectedRange,
    clearSelectedRange
  } = useSheet();
  
  const { data, numRows, numCols, activeCell, selectedRange, colWidths, rowHeights } = sheetState;
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate column headers (A, B, C, ...)
  const columnHeaders = Array.from({ length: numCols }, (_, i) => columnIndexToName(i));

  // Handle cell selection
  const handleCellSelect = useCallback((row: number, col: string, isShiftKey: boolean) => {
    if (isShiftKey && activeCell) {
      // Create or extend selection range
      setSelectedRange(activeCell, { row, col });
    } else {
      // Clear selection and set active cell
      clearSelectedRange();
      setActiveCell(row, col);
    }
  }, [activeCell, setActiveCell, setSelectedRange, clearSelectedRange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return;
      
      const { row, col } = activeCell;
      const colIndex = col.charCodeAt(0) - 65; // Convert column letter to index (A = 0)
      
      switch (e.key) {
        case 'ArrowUp':
          if (row > 1) {
            e.preventDefault();
            setActiveCell(row - 1, col);
          }
          break;
        case 'ArrowDown':
          if (row < numRows) {
            e.preventDefault();
            setActiveCell(row + 1, col);
          }
          break;
        case 'ArrowLeft':
          if (colIndex > 0) {
            e.preventDefault();
            setActiveCell(row, String.fromCharCode(colIndex - 1 + 65));
          }
          break;
        case 'ArrowRight':
          if (colIndex < numCols - 1) {
            e.preventDefault();
            setActiveCell(row, String.fromCharCode(colIndex + 1 + 65));
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            // Move left
            if (colIndex > 0) {
              setActiveCell(row, String.fromCharCode(colIndex - 1 + 65));
            } else if (row > 1) {
              // Move to end of previous row
              setActiveCell(row - 1, String.fromCharCode(numCols - 1 + 65));
            }
          } else {
            // Move right
            if (colIndex < numCols - 1) {
              setActiveCell(row, String.fromCharCode(colIndex + 1 + 65));
            } else if (row < numRows) {
              // Move to start of next row
              setActiveCell(row + 1, 'A');
            }
          }
          break;
        case 'Enter':
          if (!e.shiftKey && row < numRows) {
            e.preventDefault();
            setActiveCell(row + 1, col);
          } else if (e.shiftKey && row > 1) {
            e.preventDefault();
            setActiveCell(row - 1, col);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCell, setActiveCell, numRows, numCols]);

  // Function to determine if a cell is selected
  const isCellSelected = (row: number, col: string): boolean => {
    if (!selectedRange) return false;
    
    const { start, end } = selectedRange;
    const startCol = start.col.charCodeAt(0);
    const endCol = end.col.charCodeAt(0);
    const cellCol = col.charCodeAt(0);
    
    return (
      row >= Math.min(start.row, end.row) &&
      row <= Math.max(start.row, end.row) &&
      cellCol >= Math.min(startCol, endCol) &&
      cellCol <= Math.max(startCol, endCol)
    );
  };

  // Determine if a cell is active
  const isCellActive = (row: number, col: string): boolean => {
    return activeCell?.row === row && activeCell?.col === col;
  };

  return (
    <div 
      ref={gridRef}
      id="grid-container" 
      className="spreadsheet-container relative focus:outline-none animate-fade-in"
      tabIndex={0}
    >
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="corner-header"></th>
            {columnHeaders.map((col) => (
              <th 
                key={col} 
                className="col-header"
                style={{ width: colWidths[col] ? `${colWidths[col]}px` : undefined }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: numRows }, (_, rowIndex) => (
            <tr key={rowIndex + 1}>
              <th className="row-header">
                {rowIndex + 1}
              </th>
              {columnHeaders.map((col) => (
                <td key={`${rowIndex + 1}-${col}`} className="p-0 m-0">
                  <Cell
                    row={rowIndex + 1}
                    col={col}
                    isActive={isCellActive(rowIndex + 1, col)}
                    isSelected={isCellSelected(rowIndex + 1, col)}
                    onSelect={handleCellSelect}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;
