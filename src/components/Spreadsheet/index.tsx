
import React from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';
import { SheetProvider } from '@/context/SheetContext';

const Spreadsheet: React.FC = () => {
  return (
    <SheetProvider>
      <div className="flex flex-col h-screen">
        <Toolbar />
        <FormulaBar />
        <Grid />
      </div>
    </SheetProvider>
  );
};

export default Spreadsheet;
