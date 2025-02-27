
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PopoverContent, PopoverTrigger, Popover } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useSheet } from '@/context/SheetContext';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, 
  Search, ChevronDown, Rows, Save, RefreshCw, FileSpreadsheet, 
  Columns, FileUp, FileDown, Share2, Upload
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Toolbar: React.FC = () => {
  const { 
    sheetState, 
    updateCellFormatting, 
    addRow, 
    deleteRow, 
    addColumn, 
    deleteColumn, 
    findAndReplace,
    removeDuplicates,
    recalculateAll
  } = useSheet();
  
  const { activeCell } = sheetState;
  
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isFindDialogOpen, setIsFindDialogOpen] = useState(false);
  const [isDuplicatesDialogOpen, setIsDuplicatesDialogOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const handleBoldClick = () => {
    if (!activeCell) return;
    
    const { row, col } = activeCell;
    const cellData = sheetState.data[row.toString()]?.[col];
    const currentBold = cellData?.formatting.bold || false;
    
    updateCellFormatting(row, col, { bold: !currentBold });
  };

  const handleItalicClick = () => {
    if (!activeCell) return;
    
    const { row, col } = activeCell;
    const cellData = sheetState.data[row.toString()]?.[col];
    const currentItalic = cellData?.formatting.italic || false;
    
    updateCellFormatting(row, col, { italic: !currentItalic });
  };

  const handleFontSizeChange = (size: string) => {
    if (!activeCell) return;
    
    const { row, col } = activeCell;
    updateCellFormatting(row, col, { fontSize: parseInt(size, 10) });
  };

  const handleAddRow = () => {
    const row = activeCell?.row || sheetState.numRows;
    addRow(row);
  };

  const handleDeleteRow = () => {
    if (!activeCell) {
      toast({
        title: "No row selected",
        description: "Please select a cell in the row you want to delete",
        variant: "destructive"
      });
      return;
    }
    
    deleteRow(activeCell.row);
  };

  const handleAddColumn = () => {
    const col = activeCell?.col || columnIndexToName(sheetState.numCols - 1);
    addColumn(col);
  };

  const handleDeleteColumn = () => {
    if (!activeCell) {
      toast({
        title: "No column selected",
        description: "Please select a cell in the column you want to delete",
        variant: "destructive"
      });
      return;
    }
    
    deleteColumn(activeCell.col);
  };

  const handleFindAndReplace = () => {
    if (!findText) {
      toast({
        title: "Find text is empty",
        description: "Please enter text to find",
        variant: "destructive"
      });
      return;
    }
    
    findAndReplace(findText, replaceText, false);
    setIsFindDialogOpen(false);
  };

  const handleRemoveDuplicates = () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "No columns selected",
        description: "Please select at least one column to check for duplicates",
        variant: "destructive"
      });
      return;
    }
    
    removeDuplicates(selectedColumns);
    setIsDuplicatesDialogOpen(false);
    setSelectedColumns([]);
  };

  // Helper to convert column index to name
  const columnIndexToName = (index: number): string => {
    let name = '';
    while (index >= 0) {
      name = String.fromCharCode(65 + (index % 26)) + name;
      index = Math.floor(index / 26) - 1;
    }
    return name;
  };

  const toggleColumnSelection = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  return (
    <div className="toolbar animate-slide-down">
      {/* Formatting Section */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBoldClick}
          className="toolbar-button"
          aria-label="Bold"
        >
          <Bold size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleItalicClick}
          className="toolbar-button"
          aria-label="Italic"
        >
          <Italic size={16} />
        </Button>

        <Select onValueChange={handleFontSizeChange} defaultValue="12">
          <SelectTrigger className="w-16 h-8">
            <SelectValue placeholder="12" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="toolbar-divider"></div>

        <Button
          variant="ghost"
          size="icon"
          className="toolbar-button"
          aria-label="Align Left"
        >
          <AlignLeft size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-button"
          aria-label="Align Center"
        >
          <AlignCenter size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-button"
          aria-label="Align Right"
        >
          <AlignRight size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8 mx-2" />

      {/* Row/Column Management */}
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Rows size={16} />
              <span>Rows</span>
              <ChevronDown size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0">
            <div className="flex flex-col">
              <button
                className="dropdown-item flex items-center gap-2"
                onClick={handleAddRow}
              >
                <Plus size={14} /> Insert row
              </button>
              <button
                className="dropdown-item flex items-center gap-2"
                onClick={handleDeleteRow}
              >
                <Trash2 size={14} /> Delete row
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Columns size={16} />
              <span>Columns</span>
              <ChevronDown size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-0">
            <div className="flex flex-col">
              <button
                className="dropdown-item flex items-center gap-2"
                onClick={handleAddColumn}
              >
                <Plus size={14} /> Insert column
              </button>
              <button
                className="dropdown-item flex items-center gap-2"
                onClick={handleDeleteColumn}
              >
                <Trash2 size={14} /> Delete column
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator orientation="vertical" className="h-8 mx-2" />

      {/* Data Operations */}
      <div className="flex items-center">
        <Dialog open={isFindDialogOpen} onOpenChange={setIsFindDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Search size={16} />
              <span>Find & Replace</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find and Replace</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="find" className="text-right">
                  Find
                </Label>
                <Input
                  id="find"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="replace" className="text-right">
                  Replace with
                </Label>
                <Input
                  id="replace"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleFindAndReplace}>
                Replace All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDuplicatesDialogOpen} onOpenChange={setIsDuplicatesDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <FileSpreadsheet size={16} />
              <span>Remove Duplicates</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Duplicate Rows</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Select columns to check for duplicate values:
              </p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: Math.min(25, sheetState.numCols) }, (_, i) => {
                  const col = columnIndexToName(i);
                  return (
                    <Button
                      key={col}
                      variant={selectedColumns.includes(col) ? "default" : "outline"}
                      className="h-8 w-8"
                      onClick={() => toggleColumnSelection(col)}
                    >
                      {col}
                    </Button>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleRemoveDuplicates}
                disabled={selectedColumns.length === 0}
              >
                Remove Duplicates
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          onClick={recalculateAll}
        >
          <RefreshCw size={16} />
          <span>Recalculate</span>
        </Button>
      </div>

      <div className="flex-1"></div>

      {/* File Operations */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={() => {
            toast({
              title: "Save feature",
              description: "This feature will be available in a future update",
            });
          }}
        >
          <Save size={16} />
          <span>Save</span>
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
