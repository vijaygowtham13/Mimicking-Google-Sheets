
import React from 'react';

interface FunctionHelperProps {
  functionName: string;
}

interface FunctionInfo {
  name: string;
  description: string;
  syntax: string;
  example: string;
}

const FunctionHelper: React.FC<FunctionHelperProps> = ({ functionName }) => {
  const functions: Record<string, FunctionInfo> = {
    SUM: {
      name: 'SUM',
      description: 'Adds all numbers in a range of cells.',
      syntax: '=SUM(cell1:cell2)',
      example: '=SUM(A1:A10) adds all values in cells A1 through A10.'
    },
    AVERAGE: {
      name: 'AVERAGE',
      description: 'Calculates the average of numbers in a range of cells.',
      syntax: '=AVERAGE(cell1:cell2)',
      example: '=AVERAGE(B1:B20) returns the average of values in cells B1 through B20.'
    },
    MAX: {
      name: 'MAX',
      description: 'Returns the maximum value from a range of cells.',
      syntax: '=MAX(cell1:cell2)',
      example: '=MAX(C1:C100) returns the highest value in cells C1 through C100.'
    },
    MIN: {
      name: 'MIN',
      description: 'Returns the minimum value from a range of cells.',
      syntax: '=MIN(cell1:cell2)',
      example: '=MIN(D1:D50) returns the lowest value in cells D1 through D50.'
    },
    COUNT: {
      name: 'COUNT',
      description: 'Counts the number of cells containing numerical values in a range.',
      syntax: '=COUNT(cell1:cell2)',
      example: '=COUNT(E1:E30) counts how many cells in E1 through E30 contain numbers.'
    },
    TRIM: {
      name: 'TRIM',
      description: 'Removes leading and trailing whitespace from a cell.',
      syntax: '=TRIM(cell)',
      example: '=TRIM(A1) removes extra spaces from the beginning and end of text in cell A1.'
    },
    UPPER: {
      name: 'UPPER',
      description: 'Converts the text in a cell to uppercase.',
      syntax: '=UPPER(cell)',
      example: '=UPPER(B5) converts the text in cell B5 to uppercase letters.'
    },
    LOWER: {
      name: 'LOWER',
      description: 'Converts the text in a cell to lowercase.',
      syntax: '=LOWER(cell)',
      example: '=LOWER(C3) converts the text in cell C3 to lowercase letters.'
    }
  };

  const functionInfo = functions[functionName.toUpperCase()];

  if (!functionInfo) {
    return null;
  }

  return (
    <div className="function-tooltip animate-fade-in">
      <h3 className="function-name">{functionInfo.name}</h3>
      <p className="function-desc">{functionInfo.description}</p>
      <code className="function-syntax">{functionInfo.syntax}</code>
      <p className="function-example">{functionInfo.example}</p>
    </div>
  );
};

export default FunctionHelper;
