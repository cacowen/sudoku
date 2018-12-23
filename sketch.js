let cells = [];
let stage = 1;
let backgroundColor = 0;
let cellColor = 190;
let valueColor = 64;
let fontSize = 12;
let historyTemp = [];
let cellHistory = [];
let input;
let inputButton;

function setup() {
  let smallSquareSide = 25;
  let medBorder = 1;
  let largeBorder = 5;
  let smallSquaresPerMedSquareX = 3;
  let smallSquaresPerMedSquareY = 3;
  let medSquaresPerLargeSquareX = 3;
  let medSquaresPerLargeSquareY = 3;
  let largeSquaresX = 3;
  let largeSquaresY = 3;

  let totalX = calculateTotalSize(smallSquareSide, medBorder, largeBorder, largeSquaresX, smallSquaresPerMedSquareX, medSquaresPerLargeSquareX);
  let totalY = calculateTotalSize(smallSquareSide, medBorder, largeBorder, largeSquaresY, smallSquaresPerMedSquareY, medSquaresPerLargeSquareY);
  createCanvas(totalX, totalY);
  background(backgroundColor);

  fontSize = smallSquareSide * 2;

  let maxX = 0;
  let maxY = 0;

  noStroke();

  for (let l = 0; l < largeSquaresX; l++) {
    for (let m = 0; m < largeSquaresY; m++) {
      for (let i = 0; i < medSquaresPerLargeSquareX; i++) {
        for (let j = 0; j < medSquaresPerLargeSquareY; j++) {
          let w = smallSquaresPerMedSquareX * smallSquareSide;
          let h = smallSquaresPerMedSquareY * smallSquareSide;
          let x = largeBorder + (i * w) + (i * medBorder);
          let y = largeBorder + (j * h) + (j * medBorder);
          fill(cellColor);
          rect((l * maxX) + x, (m * maxY) + y, w, h);

          let nx = (l * maxX) + x;
          let ny = (m * maxY) + y;

          // sub grids
          let subGrids = [];

          // grid
          let grid = new Grid(nx, ny, w, h);

          // cell
          let row = i + (medSquaresPerLargeSquareX * l);
          let col = j + (medSquaresPerLargeSquareY * m);
          let cell = new Cell(row, col, grid, subGrids);

          cells.push(cell);

          for (let n = 0; n < smallSquaresPerMedSquareX; n++) {
            for (let o = 0; o < smallSquaresPerMedSquareY; o++) {
              let sx = nx + (n * smallSquareSide);
              let sy = ny + (o * smallSquareSide);
              // fill(32);
              // rect(sx, sy, smallSquareSide, smallSquareSide);
              let sg = new Grid(sx, sy, smallSquareSide, smallSquareSide);
              let value = findBox(n * 3, o * 3) + 1;
              let button = cellButton(value, sx, sy, smallSquareSide, smallSquareSide);
              button.mousePressed(() => setCellValue(cell, value));
              sg.button = button;
              sg.show = true;
              sg.value = value;
              subGrids.push(sg);
            }
          }

          if (i === medSquaresPerLargeSquareX - 1) maxX = x + w;
          if (j === medSquaresPerLargeSquareY - 1) maxY = y + h;
        }
      }
    }
  }

  cells = cells.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  input = createInput();
  input.position(10, totalY + 10);
  inputButton = createButton("SUBMIT");
  inputButton.position(input.x + input.width, input.y);
  inputButton.mousePressed(submitValues);
}

function draw() {
  let rerun = true;

  findSingleValues(); // do always

  let completedCells = cells.filter(c => c.value).length;

  if (findHiddenValues()) { // continue if no changes made
    if (reduceLocations(completedCells)) { // continue if no changes made
      if (reduceGroups(completedCells)) { // continue if no changes made
        rerun = false; // do not rerun if no changes made
      }
    }
  }

  displayGrid();
  if (!rerun) {
    cellHistory.push(historyTemp);
    historyTemp = [];
    noLoop();
    console.log(completedCells === 81 ? "finished!" : "stuck!");
  }
}

function submitValues() {
  input.hide();
  inputButton.hide();

  let submittedFromInput = true;
  let inputIndex = 0;

  while (submittedFromInput) {
    let v = input.value()[inputIndex];
    let vInt = parseInt(v);
    let cell = cells[inputIndex];
    if (vInt && vInt > 0 && vInt < 10) setCellValue(cell, vInt);
    inputIndex++;
    if (input.value().length === inputIndex) submittedFromInput = false;
  }
}

function cellButton(value, x, y, h, w) {
  let button = createButton(value);
  button.position(x, y);
  button.size(h, w);
  button.style("background-color", "transparent");
  button.style("border", "none");
  return button;
}

function setCellValue(cellPressed, value) {
  historyTemp.push(cellPressed.id);
  //console.log("Setting cell", cellPressed.id, "to value", value);
  cellPressed.setValue(value);
  for (const cell of cells) {
    if (cell.id === cellPressed.id) continue;
    if (!cellInRowColBox(cellPressed, cell)) continue;
    cell.removePossibleValue(value);
  }
  loop();
}

function findSingleValues() {
  let changeMade = false;
  for (const cell of cells) {
    let value = cell.getSingleValue();
    if (!value) continue;
    setCellValue(cell, value);
    changeMade = true;
    break;
  }
  return !changeMade;
}

function findHiddenValues() {
  let changeMade = false;
  for (const cell of cells) {
    let value = cell.getHiddenValue(cells);
    if (!value) continue;
    setCellValue(cell, value);
    changeMade = true;
    break;
  }
  return !changeMade;
}

function reduceLocations(completedCells) {
  if (completedCells < 20) return true;
  let changeMade = false;
  let filterItems = [["row", "box"], ["col", "box"], ["box", "row"], ["box", "col"]];
  for (const filterItem of filterItems) {
    let filter = filterItem[0];
    let subFilter = filterItem[1];
    for (let filterValue = 0; filterValue < 9; filterValue++) {
      let filteredCells = filterCells(cells, filter, filterValue);
      for (let v = 1; v < 10; v++) {
        let trackedContainer = -1;
        for (const cell of filteredCells) {
          if (cell.value && cell.value === v) break;
          if (cell.value) continue;
          if (!binaryValueContains(cell.binaryPossibilities, v)) continue;
          let subFilterValue = subFilter === "row" ? cell.row : subFilter === "col" ? cell.col : cell.box;
          if (trackedContainer === -1) trackedContainer = subFilterValue;
          if (trackedContainer === subFilterValue) continue;
          trackedContainer = -1;
          break;
        }
        if (trackedContainer === -1) continue;
        let subFilteredCells = filterCells(cells, subFilter, trackedContainer);
        for (const cell of subFilteredCells) {
          let filterValueSub = filter === "row" ? cell.row : filter === "col" ? cell.col : cell.box;
          if (filterValueSub === filterValue) continue;
          if (cell.value) continue;
          if (!binaryValueContains(cell.binaryPossibilities, v)) continue;
          cell.removePossibleValue(v);
          changeMade = true;
        }
        if (changeMade) break;
      }
      if (changeMade) break;
    }
    if (changeMade) break;
  }
  return !changeMade;
}

function reduceGroups(completedCells) {
  if (completedCells < 20) return true;
  let changeMade = false;
  let filters = ["row", "col", "box"];
  for (const filter of filters) {
    for (let filterValue = 0; filterValue < 9; filterValue++) {
      let filteredCells = filterCells(cells, filter, filterValue);
      for (const cell of filteredCells) {
        if (cell.value) continue;
        let possibleValues = possibleValuesFromBinary(cell.binaryPossibilities);
        if (possibleValues > 4) continue; // performance limit
        let matchedCellIds = [];
        for (const cellToCompare of filteredCells) {
          if (cellToCompare.value) continue;
          if (!binaryValueContainsOtherBinary(cell.binaryPossibilities, cellToCompare.binaryPossibilities)) continue;
          matchedCellIds.push(cellToCompare.id);
          if (matchedCellIds.length > possibleValues.length) break;
        }
        if (matchedCellIds.length !== possibleValues.length) continue;
        let cellsToChange = filteredCells.filter(c => matchedCellIds.indexOf(c.id) < 0);
        for (const cellToChange of cellsToChange) {
          if (cellToChange.value) continue;
          for (const v of possibleValues) {
            if (!binaryValueContains(cellToChange.binaryPossibilities, v)) continue;
            cellToChange.removePossibleValue(v);
            changeMade = true;
          }
        }
        if (changeMade) break;
      }
      if (changeMade) break;
    }
    if (changeMade) break;
  }
  return !changeMade;
}

function displayGrid() {
  noStroke();
  fill(valueColor);
  textSize(fontSize);
  textAlign(CENTER, CENTER);

  for (const cell of cells) {
    if (cell.value) {
      let grid = cell.grid;
      text(grid.value, grid.x + (grid.width / 2), grid.y + (grid.height / 2));
    }
    for (const subGrid of cell.subGrids) {
      if (!subGrid.show) subGrid.button.hide();
    }
  }
}

function calculateTotalSize(smallSquareSide, medBorder, largeBorder, largeSquares, smallSquaresPerMedSquare, medSquaresPerLargeSquare) {
  let medBorderCount = (medSquaresPerLargeSquare - 1) * largeSquares;
  let largeBorderCount = largeSquares + 1;
  let smallSquareCount = smallSquaresPerMedSquare * medSquaresPerLargeSquare * largeSquares;
  let total = (medBorderCount * medBorder) + (largeBorderCount * largeBorder) + (smallSquareCount * smallSquareSide);
  return total;
}
