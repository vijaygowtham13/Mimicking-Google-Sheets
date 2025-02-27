# Web Application Mimicking Google Sheets

A web application that closely mimics the user interface and core functionalities of Google Sheets, with a focus on mathematical and data quality functions, data entry, and key UI interactions.

---

## Deployment

[Live Demo](https://your-deployment-link.com)

---

## Features

### Core Features:
1. **Spreadsheet Interface**:
   - Mimics Google Sheets UI, including toolbar, formula bar, and cell structure.
   - Drag functionality for cell content, formulas, and selections.
   - Cell dependencies: Formulas update automatically when related cells change.
   - Basic cell formatting (bold, italics, font size, color).
   - Ability to add, delete, and resize rows and columns.

2. **Mathematical Functions**:
   - `SUM`: Calculates the sum of a range of cells.
   - `AVERAGE`: Calculates the average of a range of cells.
   - `MAX`: Returns the maximum value from a range of cells.
   - `MIN`: Returns the minimum value from a range of cells.
   - `COUNT`: Counts the number of cells containing numerical values in a range.

3. **Data Quality Functions**:
   - `TRIM`: Removes leading and trailing whitespace.
   - `UPPER`: Converts text to uppercase.
   - `LOWER`: Converts text to lowercase.
   - `REMOVE_DUPLICATES`: Removes duplicate rows from a selected range.
   - `FIND_AND_REPLACE`: Finds and replaces specific text within a range of cells.

4. **Data Entry and Validation**:
   - Supports input of numbers, text, and dates.
   - Implements basic data validation (e.g., ensuring numeric cells only contain numbers).

### Bonus Features:
- Support for additional mathematical and data quality functions.
- Complex formulas with relative and absolute cell references.
- Save and load functionality for spreadsheets.
- Data visualization capabilities (e.g., charts, graphs).

---

## Architecture and Design

### This Approach:
- **Two-Level Nested Record:**  
  Rows are string keys and columns are string keys within each row, saving memory by only storing non-empty cells.
- **Separate Formula/Value Storage:**  
  Preserving the original formula enables proper recalculation and formula display in the UI.
- **Formatting as an Object:**  
  Centralizes styling properties for each cell, simplifying style application and manipulation.

### Data Structure Design:
- **Sparse Matrix Approach:**  
  Most cells are empty, so using a nested Record structure instead of a dense array optimizes memory usage.
- **Formula Engine:**  
  Custom-built to evaluate formulas, handle dependencies, and manage errors efficiently.

---

## Tech Stack

- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS and shadcn/ui for a consistent and minimal design system.
- **State Management:** React Context for efficient and decoupled state handling.
- **Build Tools:** Vite for fast builds and optimized performance.
- **Formula Evaluation:** Custom-built engine for accurate and efficient formula computation.

---

## Installation

### Prerequisites:
- Node.js (v16 or above)
- npm or yarn

### Steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/project-name.git
