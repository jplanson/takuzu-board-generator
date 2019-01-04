export class Board
{
  seed: number;
  size: number;
  removePerc: number;

  takuzuPuzzle: number[][];
  originalPuzzle: number[][];

  constructor(size, seed, removePerc)
  {
    this.size = size;
    this.seed = seed;
    this.removePerc = removePerc;

    if (this.size % 2 != 0) {
      this.size++;
    }
  }

  /* ------------------------------------------------------ */
  /*                  BOARD GENERATION                      */
  /* ------------------------------------------------------ */

  generateBoard()
  {
    var board = [];

    for (var i = 0; i < this.size; i++) {
      board.push([]);
      for (var j = 0; j < this.size; j++) {
        board[i].push(-1);
      }
    }

    while(!Board.isSolvedArg(board)) {

      var columnData = {};

      for ( var i = 0 ; i < this.size ; i ++) {
        let m = {
          'numTotOnes':0,
          'numTotZeroes':0,
          'recentOnes':0,
          'recentZeroes':0
        }
        columnData[i] = m;
      }

      for (var i = 0; i < this.size; i++) {
        var numTotOnes = 0;
        var numTotZeroes = 0;
        var recentOnes = 0;
        var recentZeroes = 0;
        var added = false;

        for (var j = 0; j < this.size; j++) {
          var choice = Math.round(this.random());
          added = false;

          let column = columnData[j];

          if (numTotOnes < this.size/2 && choice == 1 && recentOnes < 2 &&
              column['numTotOnes'] < this.size/2 && column['recentOnes'] < 2
          ) {
            column['recentZeroes'] = 0;
            column['recentOnes']++;
            column['numTotOnes']++;

            recentZeroes = 0;
            recentOnes++;
            numTotOnes++;

            board[i][j] = choice;
            added = true;
          } else if (numTotZeroes < this.size/2 && choice == 1 && recentZeroes < 2 &&
              column['numTotZeroes'] < this.size/2 && column['recentZeroes'] < 2) {
            column['recentOnes'] = 0;
            column['recentZeroes']++;
            column['numTotZeroes']++;

            recentOnes = 0;
            recentZeroes++;
            numTotZeroes++;

            board[i][j] = 0;
            added = true;
          }

          if (numTotZeroes < this.size/2 && choice == 0 && recentZeroes < 2 &&
              column['numTotZeroes'] < this.size/2 && column['recentZeroes'] < 2) {
            column['recentOnes'] = 0;
            column['recentZeroes']++;
            column['numTotZeroes']++;

            recentOnes = 0;
            recentZeroes++;
            numTotZeroes++;

            board[i][j] = choice;
            added = true;
          } else if (numTotOnes < this.size/2 && choice == 0 && recentOnes < 2 &&
                     column['numTotOnes'] < this.size/2 && column['recentOnes'] < 2) {
            column['recentZeroes'] = 0;
            column['recentOnes']++;
            column['numTotOnes']++;

            recentZeroes = 0;
            recentOnes++;
            numTotOnes++;

            board[i][j] = 1;
            added = true;
          }

          if(added = false) {
            break;
          }
        }

        if(added = false) {
          break;
        }
      }
    }

    this.originalPuzzle = board;
    this.carve();
  }

  /* ------------------------------------------------------ */

  carve()
  {
    var carvedBoard = JSON.parse(JSON.stringify(this.originalPuzzle));

    var indexes = [];

      for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
          indexes.push([i, j]);
        }
      }

      console.log(this.removePerc * (this.size * this.size));
      for (var i = 0; i < (this.removePerc * (this.size * this.size)); i++) {

        if (indexes.length == 0) { break; }

        var idx = Math.trunc(this.random() * indexes.length);
        var row = (indexes[idx])[0];
        var col = (indexes[idx])[1];
        indexes.splice(idx, 1);

        if (carvedBoard[row][col] == -1) {
          i--;
          continue;
        }

        var oldVal = carvedBoard[row][col];
        carvedBoard[row][col] = -1;
        if (!Board.canSolve(carvedBoard)) {
          carvedBoard[row][col] = oldVal;
          i--;
        }
      }

      this.originalPuzzle = JSON.parse(JSON.stringify(carvedBoard));
      this.takuzuPuzzle = JSON.parse(JSON.stringify(carvedBoard));
  }


  /* ------------------------------------------------------ */
  /*                  MISC. FRONT-END API                   */
  /* ------------------------------------------------------ */

  isSolved()
  {
    return Board.isSolvedArg(this.takuzuPuzzle);
  }

  /* ------------------------------------------------------ */

  hasError()
  {
    return Board.hasErrorArg(this.takuzuPuzzle);
  }

  /* ------------------------------------------------------ */

  isOriginal(x, y)
  {
    if (x >= this.size || y >= this.size) {
      return false;
    } else if (this.originalPuzzle[y][x] != -1) {
      return true;
    } else {
      return false;
    }
  }

  /* ------------------------------------------------------ */

  rotateValue(x, y, forward)
  {
    if (x >= this.size || y >= this.size || this.isOriginal(x, y)) {
      return;
    }

    if (forward) {
      this.takuzuPuzzle[y][x] += 1;
      if (this.takuzuPuzzle[y][x] == 2)
      {
        this.takuzuPuzzle[y][x] = -1;
      }
    } else {
      this.takuzuPuzzle[y][x] -= 1;
      if (this.takuzuPuzzle[y][x] == -2)
      {
        this.takuzuPuzzle[y][x] = 1;
      }
    }
  }

  /* ------------------------------------------------------ */
  /*                  MAIN SOLVER FUNCTIONS                 */
  /* ------------------------------------------------------ */

  static hasErrorArg(board)
  {
    var rows = []
    var cols = []

    // create a list of strings of the values of each row and column
    for (var i = 0; i < board.length; i++) {
      var row = "";
      var col = "";

      for (var j = 0; j < board[0].length; j++) {
        if (board[i][j] == -1) {
          row += "-";
        } else {
          row += board[i][j];
        }

        if (board[j][i] == -1) {
          col += "-";
        } else {
          col += board[j][i];
        }
      }

      rows.push(row);
      cols.push(col);
    }

    var invalidOnes = "111";
    var invalidZeroes = "000";

    // check rows for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < rows.length; i++) {
      var curr = rows[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length)/2 ||
          numZeroes > (board[0].length)/2 ||
          curr.includes(invalidOnes) ||
          curr.includes(invalidZeroes)) {
        return true;
      }
    }

    // check cols for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < cols.length; i++) {
      var curr = cols[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length)/2 ||
          numZeroes > (board[0].length)/2 ||
          curr.includes(invalidOnes) ||
          curr.includes(invalidZeroes)) {
        return true;
      }
    }

    // check if any two rows or columns are the same
    for (var i = 0; i < rows.length; i++) {

      if (rows[i].includes("-")) {
        continue;
      }

      for (var j = i+1; j < rows.length; j++) {
        if (i == j || rows[j].includes("-")) {
          continue;
        }
        if (rows[i] == rows[j]) {
          return true;
        }
      }
    }

    for (var i = 0; i < cols.length; i++) {

      if (cols[i].includes("-")) {
        continue;
      }

      for (var j = i+1; j < cols.length; j++) {
        if(i == j || cols[j].includes("-")) {
          continue;
        }
        if (cols[i] == cols[j]) {
          return true;
        }
      }
    }

    return false;
  }

  /* ------------------------------------------------------ */

  static isSolvedArg(board)
  {
    var rows = []
    var cols = []

    // create a list of strings of the values of each row and column
    for (var i = 0; i < board.length; i++) {
      var row = "";
      var col = "";

      for (var j = 0; j < board[0].length; j++) {
        row += board[i][j];
        col += board[j][i];
      }

      rows.push(row);
      cols.push(col);
    }

    var invalidOnes = "111";
    var invalidZeroes = "000";

    // check rows for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < rows.length; i++) {
      var curr = rows[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length)/2 ||
          numZeroes > (board[0].length)/2 ||
          curr.includes(invalidOnes) ||
          curr.includes(invalidZeroes) ||
          curr.includes('-')) {
        return false;
      }
    }

    // check cols for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < cols.length; i++) {
      var curr = cols[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length)/2 ||
          numZeroes > (board[0].length)/2 ||
          curr.includes(invalidOnes) ||
          curr.includes(invalidZeroes) ||
        curr.includes('-')) {
        return false;
      }
    }

    // check if any two rows or columns are the same
    for (var i = 0; i < rows.length; i++) {
      for (var j = i+1; j < rows.length; j++) {
        if (i == j) { continue; }
        if (rows[i] == rows[j]) {
          return false;
        } else if (cols[i] == cols[j]) {
          return false;
        }
      }
    }

    return true;
  }

  /* ------------------------------------------------------ */

  static canSolve(board)
  {
    var thisBoard = JSON.parse(JSON.stringify(board));

    while (true) {
      var didSomething = false;

      didSomething = Board.useTechniques(thisBoard);

      if (!didSomething) {
        break;
      }
    }

    return (Board.isSolvedArg(thisBoard));
  }

  /* ------------------------------------------------------ */

  static canSolveOptimized(board, i, j, val)
  {
    if (board[i][j] == val) { return true; }

    var thisBoard = JSON.parse(JSON.stringify(board));

    while (true) {
      var didSomething = true;

      didSomething = Board.useTechniques(thisBoard);

      if (!didSomething || thisBoard[i][j] == val) {
        if (thisBoard[i][j] == val) { console.log("optimized"); }
        break;
      }
    }

    return (thisBoard[i][j] == val || Board.isSolvedArg(thisBoard));
  }

  /* ------------------------------------------------------ */
  /*                    SOLVER MODULES                      */
  /* ------------------------------------------------------ */

  static useTechniques(board)
  {
      var didSomething = false;

      didSomething = (didSomething || Board.wrapTwos(board));

      if (!didSomething) {
        didSomething = (didSomething || Board.breakThrees(board));
      }

      if (!didSomething) {
        didSomething = (didSomething || Board.completeParity(board));
      }

      if (!didSomething) {
        didSomething = (didSomething || Board.eliminateImpossibilities(board));
      }

      return didSomething;
  }

  /* ------------------------------------------------------ */

  static wrapTwos(board)
  {

    var didSomething = false;

    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {

        if (board[i][j] != -1) { continue; }

        if (Board.canAccess(board, i - 2, j)) {
          if (Board.sameVal(board, i - 1, j, i - 2, j)) {
            board[i][j] = Board.negate(board, i - 1, j);
            didSomething = true;
          }
        }

        if (Board.canAccess(board, i + 2, j)) {
          if (Board.sameVal(board, i + 1, j, i + 2, j)) {
            board[i][j] = Board.negate(board, i + 1, j);
            didSomething = true;
          }
        }

        if (Board.canAccess(board, i, j - 2)) {
          if (Board.sameVal(board, i, j - 1, i, j - 2)) {
            board[i][j] = Board.negate(board, i, j - 1);
            didSomething = true;
          }
        }

        if (Board.canAccess(board, i, j + 2)) {
          if (Board.sameVal(board, i, j + 1, i, j + 2)) {
            board[i][j] = Board.negate(board, i, j + 1);
            didSomething = true;
          }
        }
      }
    }
    return didSomething;
  }

  /* ------------------------------------------------------ */

  static breakThrees(board)
  {
    var didSomething = false;

    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {

        if (board[i][j] != -1) { continue; }

        if (Board.canAccess(board, i - 1, j) &&
            Board.canAccess(board, i + 1, j)) {
          if (Board.sameVal(board, i - 1, j, i + 1, j)) {
            board[i][j] = Board.negate(board, i - 1, j);
            didSomething = true;
          }
        }

        if (Board.canAccess(board, i, j - 1) &&
            Board.canAccess(board, i, j + 1)) {
          if (Board.sameVal(board, i, j - 1, i, j + 1)) {
            board[i][j] = Board.negate(board, i, j - 1);
            didSomething = true;
          }
        }

      }
    }
    return didSomething;
  }

  /* ------------------------------------------------------ */

  static completeParity(board)
  {
    var didSomething = false;

    for (var i = 0; i < board.length; i++) {
      var row = "";
      var col = "";
      var numZeroes = 0;
      var numOnes = 0;
      var idx = -1;

      // convert rows and columns into strings
      // DOES NOT WORK IF BOARD IS NOT SQUARE
      for (var j = 0; j < board[0].length; j++) {
        if (board[i][j] == -1) {
          row += "-";
        } else {
          row += board[i][j];
        }

        if (board[j][i] == -1) {
          col += "-";
        } else {
          col += board[j][i];
        }
      }

      if ((row.split("-").length - 1) != 0) {
        numZeroes = (row.split("0").length - 1);
        numOnes = (row.split("1").length - 1);
        if (numZeroes == board.length/2) {
          idx = -1;
          while ((idx = row.indexOf("-", idx + 1)) != -1) {
            board[i][idx] = 1;
          }
          didSomething = true;
        } else if (numOnes == board.length / 2) {
          idx = -1;
          while ((idx = row.indexOf("-", idx + 1)) != -1) {
            board[i][idx] = 0;
          }
          didSomething = true;
        }
      }

      if ((col.split("-").length - 1) != 0) {
        numZeroes = (col.split("0").length - 1);
        numOnes = (col.split("1").length - 1);
        if (numZeroes == board[i].length / 2) {
          idx = -1;
          while ((idx = col.indexOf("-", idx + 1)) != -1) {
            board[idx][i] = 1;
          }
          didSomething = true;
        } else if (numOnes == board[i].length / 2) {
          idx = -1;
          while ((idx = col.indexOf("-", idx + 1)) != -1) {
            board[idx][i] = 0;
          }
          didSomething = true;
        }
      }
    }
    return didSomething;
  }

  /* ------------------------------------------------------ */

  static eliminateImpossibilities(board)
  {
    var didSomething = false;
    var testBoard = JSON.parse(JSON.stringify(board));

    for (var i = 0; i < board.length; i++) {
      var row = "";
      var idx = -1;
      var matches = [];

      for (var j = 0; j < board[0].length; j++) {
        if (board[i][j] == -1) {
          row += "-";
        } else {
          row += board[i][j];
        }
      }

      if (row.includes("-")) {

        var numEmpty = (row.split("-").length - 1);

        var possibilities = Board.getPermutations(numEmpty);
        var validPossibilities = [];

        var testString = "";

        // try all possibilities and record ones that make a valid board
        for (var k = 0; k < possibilities.length; k++) {
          testString = Board.fillBlanks(row, possibilities[k]);
          if (Board.lineStringHasError(testString)) { continue; }
          Board.writeStringToLocation(testBoard, i, 0, testString, true);
          if (!Board.hasErrorArg(testBoard)) {
            validPossibilities.push(testString);
          }
          Board.writeStringToLocation(testBoard, i, 0, row, true);
        }

        if (validPossibilities.length != 0)
        {
          // find any values that are shared between all valid possibilities
          var boardAdditions = validPossibilities[0];
          for (var m = 1; m < validPossibilities.length; m++) {
            for (var n = 0; n < validPossibilities[m].length; n++) {
              if (boardAdditions.charAt(n) != "-" && validPossibilities[m].charAt(n) != boardAdditions.charAt(n)) {
                boardAdditions = Board.setCharAt(boardAdditions, n, "-");
              }
            }
          }
          if (boardAdditions != row) {
            didSomething = true;
            Board.writeStringToLocation(board, i, 0, boardAdditions, true);
          }
        }
      }
    }

    // repeat for cols
    testBoard = JSON.parse(JSON.stringify(board));

    for (var i = 0; i < board.length; i++) {
      var col = "";
      var idx = -1;
      var matches = [];

      for (var j = 0; j < board[0].length; j++) {
        if (board[j][i] == -1) {
          col += "-";
        } else {
          col += board[j][i];
        }
      }

      if (col.includes("-")) {

        var numEmpty = (col.split("-").length - 1);

        var possibilities = Board.getPermutations(numEmpty);
        var validPossibilities = [];

        var testString = "";

        // try all possibilities and record ones that make a valid board
        for (var k = 0; k < possibilities.length; k++) {
          testString = Board.fillBlanks(col, possibilities[k]);
          if (Board.lineStringHasError(testString)) { continue; }
          Board.writeStringToLocation(testBoard, 0, i, testString, false);
          if (!Board.hasErrorArg(testBoard)) {
            validPossibilities.push(testString);
          }
          Board.writeStringToLocation(testBoard, 0, i, col, false);
        }

        if (validPossibilities.length != 0)
        {
          // find any values that are shared between all valid possibilities
          var boardAdditions = validPossibilities[0];
          for (var m = 1; m < validPossibilities.length; m++) {
            for (var n = 0; n < validPossibilities[m].length; n++) {
              if (boardAdditions.charAt(n) != "-" && validPossibilities[m].charAt(n) != boardAdditions.charAt(n)) {
                boardAdditions = Board.setCharAt(boardAdditions, n, "-");
              }
            }
          }
          if (boardAdditions != col) {
            didSomething = true;
            Board.writeStringToLocation(board, 0, i, boardAdditions, false);
          }
        }
      }
    }
    return didSomething;
  }

  /* ------------------------------------------------------ */
  /*                     MISC. HELPERS                      */
  /* ------------------------------------------------------ */

  random()
  {
      var x = Math.sin(++this.seed) * 10000;
      return x - Math.floor(x);
  }

  /* ------------------------------------------------------ */

  static canAccess(board, i, j)
  {
    return ((i >= 0 && i < board.length) &&
            (j >= 0 && j < board[i].length));
  }

  /* ------------------------------------------------------ */

  static sameVal(board, i1, j1, i2, j2)
  {
    return (board[i1][j1] == board[i2][j2] && board[i1][j1] != -1);
  }

  /* ------------------------------------------------------ */

  static negate(board, i, j)
  {
    if (board[i][j] == 0) { return 1; }
    else if (board[i][j] == 1) { return 0; }
    else { return -1; }
  }

  /* ------------------------------------------------------ */

  static setCharAt(str,index,chr)
  {
    if(index > str.length-1) {return str};
    return str.substr(0,index) + chr + str.substr(index+1);
  }

  /* ------------------------------------------------------ */

  static lineStringHasError(str)
  {
    var numZeroes = (str.split("0").length - 1);
    var numOnes = (str.split("1").length - 1);
    return (str.includes("000") ||
            str.includes("111") ||
            numZeroes > str.length / 2 ||
            numOnes > str.length / 2);
  }

  /* ------------------------------------------------------ */

  static getPermutations(n)
  {
    if (n < 2) { return []; }

    var i = 0;
    var b = i.toString(2);

    var result = [];
    while (b.length <= n) {

      // prepend zeroes
      if (b.length < n)
      {
        b = (new Array((n - b.length) + 1).join("0")) + b;
      }

      result.push(b);

      b = (++i).toString(2);
    }
    return result;
  }

  /* ------------------------------------------------------ */

  static writeStringToLocation(board, i, j, str, toRow) {
    for (var ii = 0; ii < str.length; ii++) {

      var writeChar = str.charAt(ii);
      if (writeChar == "-") { writeChar = "-1"; }
      writeChar = parseInt(writeChar);

      if (!toRow && Board.canAccess(board, i + ii, j)) {
        board[i + ii][j] = writeChar;
      } else if (toRow && Board.canAccess(board, i, j + ii)) {
        board[i][j + ii] = writeChar;
      }
    }
  }

  /* ------------------------------------------------------ */

  static fillBlanks(mainStr, fillStr) {
    var result = "";
    var fillIdx = 0;
    for (var i = 0; i < mainStr.length; i++) {
      if (mainStr.charAt(i) == "-") {
        result += fillStr.charAt(fillIdx);
        fillIdx++;
      }
      else {
        result += mainStr.charAt(i);
      }
    }
    return result;
  }

  /* ------------------------------------------------------ */
}
