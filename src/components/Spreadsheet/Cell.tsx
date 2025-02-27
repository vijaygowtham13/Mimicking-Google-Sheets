
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSheet } from '@/context/SheetContext';

interface CellProps {
  row: number;
  col: string;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (row: number, col: string, isShiftKey: boolean) => void;
}

const Cell: React.FC<CellProps> = ({ row, col, isActive, isSelected, onSelect }) => {
  const { updateCellValue, getCellData, getCellDisplayValue } = useSheet();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cellData = getCellData(row, col);
  const displayValue = getCellDisplayValue(row, col);

  useEffect(() => {
    if (isActive && inputRef.current) {
      setInputValue(cellData.formula || cellData.value);
    }
  }, [isActive, cellData]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't set editing on initial click, just select
    onSelect(row, col, e.shiftKey);
    
    if (isActive) {
      setIsEditing(true);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setInputValue(cellData.formula || cellData.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (inputValue.startsWith('=')) {
      updateCellValue(row, col, inputValue, true);
    } else {
      updateCellValue(row, col, inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
    
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setInputValue(cellData.formula || cellData.value);
    }
  };

  // Determine cell width based on column (can be extended with custom width)
  const cellStyle = {
    fontWeight: cellData.formatting.bold ? 'bold' : 'normal',
    fontStyle: cellData.formatting.italic ? 'italic' : 'normal',
    fontSize: `${cellData.formatting.fontSize}px`,
    color: cellData.formatting.color,
  };

  return (
    <div
      className={cn(
        'cell',
        isSelected && 'cell-selected',
        isActive && 'cell-active',
        'ui-transition'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="gridcell"
      aria-colindex={col.charCodeAt(0) - 64}
      aria-rowindex={row}
    >
      {isActive && isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="cell-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="cell-input overflow-hidden text-ellipsis whitespace-nowrap" style={cellStyle}>
          {displayValue}
        </div>
      )}
    </div>
  );
};

export default Cell;
