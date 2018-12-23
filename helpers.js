function findBox(row, col) {
    let rGroup = Math.floor(row / 3);
    let cGroup = Math.floor(col / 3);
    return (3 * cGroup) + rGroup;
}

function getId(row, col) {
    return (9 * col) + row;
}

//   [9,   8,   7,   6,   5,   4,   3,   2,   1]
//   [1    1    1    1    1    1    1    1    1]
//  256  128   64   32   16    8    4    2    1

function convertToBinary(value) {
    let bits = 10**(value - 1);
    return parseInt(bits, 2);
}

function convertFromBinary(value) {
    let returnValue = null;
    for (let i = 1; i < 10; i++) {
        let v = convertToBinary(i);
        if (value !== v) continue;
        returnValue = i;
        break;
    }
    return returnValue;
}

function binaryValueContains(binaryFull, value) {
    let bValue = convertToBinary(value);
    return binaryValueContainsOtherBinary(binaryFull, bValue);
}

function binaryValueContainsOtherBinary(binaryFull, binaryCompare) {
    return binaryCompare - (binaryCompare & binaryFull) === 0;
}

function possibleValuesFromBinary(binaryValue) {
    let values = [];
    for (let i = 1; i < 10; i++) {
        if (!binaryValueContains(binaryValue, i)) continue;
        values.push(i);
    }
    return values;
}

function cellInRowColBox(cellSelected, cellCompared) {
    if (cellSelected.row === cellCompared.row) return true;
    if (cellSelected.col === cellCompared.col) return true;
    if (cellSelected.box === cellCompared.box) return true;
    return false;
}

function filterCells(cells, filterBy, value) {
    if (filterBy === "row") return cells.filter(c => c.row === value);
    if (filterBy === "col") return cells.filter(c => c.col === value);
    if (filterBy === "box") return cells.filter(c => c.box === value);
    return cells;
}