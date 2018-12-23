class Cell {
    constructor(row, col, grid, subGrids) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.box = findBox(row, col);
        this.id = getId(row, col);
        this.value = null;
        this.binaryPossibilities = 511;
        this.subGrids = subGrids;
    }

    setValue(value) {
        this.value = value;
        this.binaryPossibilities = convertToBinary(value);
        this.grid.value = value;
        this.grid.show = true;
        for (const subGrid of this.subGrids) subGrid.show = false;
    }

    removePossibleValue(value) {
        if (this.value) return;
        let v = convertToBinary(value);
        this.binaryPossibilities &= ~v;
        let grids = this.subGrids.filter(g => g.value === value);
        for (const subGrid of grids) subGrid.show = false;
    }

    getSingleValue() {
        if (this.value) return null;
        let singleValue = convertFromBinary(this.binaryPossibilities);
        return singleValue;
    }

    getHiddenValue(cells) {
        if (this.value) return null;
        let hiddenValue = null;
        let filters = ["row", "col", "box"];
        for (const filter of filters) {
            let value = filter === "row" ? this.row : filter === "col" ? this.col : this.box;
            let filteredCells = filterCells(cells, filter, value);
            let otherPossibilities = this.binaryPossibilities;
            for (const cell of filteredCells) {
                if (cell.id === this.id) continue;
                otherPossibilities &= ~cell.binaryPossibilities;
                if (otherPossibilities !== 0) continue;
                break;
            }
            if (otherPossibilities === 0) continue;
            hiddenValue = convertFromBinary(otherPossibilities);
            break;
        }
        return hiddenValue;
    }
}