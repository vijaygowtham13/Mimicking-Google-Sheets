
import React, { useState, useEffect, useRef } from 'react';
import { useSheet } from '@/context/SheetContext';

const FormulaBar: React.FC = () => {
  const { sheetState, updateCellValue } = useSheet();
  const { activeCell } = sheetState;
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeCell) {
      const { row, col } = activeCell;
      const cellData = sheetState.data[row.toString()]?.[col];
      setValue(cellData?.formula || cellData?.value || '');
    } else {
      setValue('');
    }
  }, [activeCell, sheetState.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && activeCell) {
      e.preventDefault();
      const { row, col } = activeCell;
      if (value.startsWith('=')) {
        updateCellValue(row, col, value, true);
      } else {
        updateCellValue(row, col, value);
      }
      
      // Move focus back to the grid
      document.getElementById('grid-container')?.focus();
    }
  };

  return (
    <div className="formula-bar animate-slide-down">
      <span className="formula-fx">ƒx</span>
      {activeCell && (
        <div className="bg-white text-xs py-1 px-2 rounded border border-gray-300 mr-2">
          {activeCell.col}{activeCell.row}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        className="formula-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter a value or formula starting with ="
        disabled={!activeCell}
      />
    </div>
  );
};

export default FormulaBar;
