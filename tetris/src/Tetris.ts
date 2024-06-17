class TetrisGame {
  board: Array<Array<string>>;
  pieceGen: string;
  level: number;
  score: number;
  completedLines: number;
  currentPiece: Tetrimino;
  nextPieces: Array<string>;
  bag: Array<string>;
  heldPiece: string;
  gameStarted: boolean;
  swapped: boolean;
  rotationDAS: number;
  rotationCharacter: string;
  movementDAS: number;
  movementCharacter: string;
  timeSinceDown: number;
  pieceCount: { i: number, j: number, l: number, s: number, z: number, o: number, t: number };

  constructor(pieceGen: string) {
    this.board = [];
    this.resetBoard();
    this.pieceGen = pieceGen;
    this.level = 10;
    this.score = 0;
    this.bag = [];
    this.heldPiece = "";
    this.completedLines = 0;
    this.currentPiece = { color: 'r', type: "s", squares: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }], rotation: 0 };
    this.resetCurrentPiece();
    this.gameStarted = false;
    this.swapped = false;
    this.rotationDAS = 0;
    this.rotationCharacter = "";
    this.movementDAS = 0;
    this.movementCharacter = "";
    this.timeSinceDown = 0;
    this.pieceCount = { i: 0, j: 0, t: 0, z: 0, l: 0, s: 0, o: 0 }
  }

  resetBoard() {
    this.board = [
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '']
    ];
  }

  resetCurrentPiece() {
    // Just an arbitrary piece that should break things and not be used
    this.currentPiece = { color: 'x', type: 'x', rotation: -1, squares: [{ x: -1, y: -1 }, { x: -1, y: -1 }, { x: -1, y: -1 }, { x: -1, y: -1 }] };
  }

  startGame(pieceGen: string) {
    this.gameStarted = true;
    this.score = 0;
    this.completedLines = 0;
    this.pieceGen = pieceGen;
    this.heldPiece = "";
    this.nextPieces = [];
    this.swapped = false;
    this.bag = ["s", "z", "l", "j", "o", "i", "t"];
    this.resetBoard();
    this.pieceCount = { i: 0, j: 0, t: 0, z: 0, l: 0, s: 0, o: 0 };
    this.timeSinceDown = 0;
    // Fill nextPieces and make current piece
    this.fillQueue();
    this.dequeuePiece();
    this.drawCurrentPiece();
    console.log("Started game. Level is " + this.level);
  }

  stopGame() {
    this.gameStarted = false;
    console.log("Stopped game.");
  }

  fillQueue() {
    while(this.nextPieces.length < 6){
      if (this.pieceGen === "7Bag"){
        let value = Math.floor(Math.random() * this.bag.length);
        this.nextPieces.push(this.bag[value]);
        this.bag.splice(value, 1);
        if (this.bag.length === 0){
          this.bag = ["s", "z", "l", "j", "o", "i", "t"];
        }
      } else {
        let value = Math.floor(Math.random() * 7);
        this.nextPieces.push(this.bag[value]);
      }
    }
  }

  dequeuePiece(addPiece: boolean = true) {
    let newPiece = this.getTypeSpawn(this.nextPieces[0]);
    this.currentPiece = newPiece;
    this.nextPieces.splice(0, 1);
    if (addPiece) {
      this.pieceCount[this.currentPiece.type]++;
    }
    this.fillQueue();
  }

  drawCurrentPiece() {
    for (let i = 0; i < this.currentPiece.squares.length; i++) {
      let cS = this.currentPiece.squares[i]; // Current Square
      this.board[cS.y][cS.x] = this.currentPiece.color;
    }
  }

  removeCurrentPiece() {
    for (let i = 0; i < this.currentPiece.squares.length; i++) {
      let cS = this.currentPiece.squares[i]; // Current Square
      this.board[cS.y][cS.x] = '';
    }
  }

  gameTick(inputs: Set<string>): boolean {
    try {
      for (let char of inputs) {
        this.handleControls(char);
      }
      if (this.getTickSpeed(this.level) < this.timeSinceDown) {
        this.movePieceDown();
      }
    } catch {
      // Game throws error if spawned piece overlaps with any other blocks. 
      return true;
    }

    if (!inputs.has("q") && this.rotationCharacter === "q") {this.adjustRotationDAS("");}
    if (!inputs.has("e") && this.rotationCharacter === "e") {this.adjustRotationDAS("");}
    if (!inputs.has("a") && this.movementCharacter === "a") {this.adjustMovementDAS("");}
    if (!inputs.has("d") && this.movementCharacter === "d") {this.adjustMovementDAS("");}
    if (!inputs.has("s") && this.movementCharacter === "s") {this.adjustMovementDAS("");}
    // if (!inputs.has(" ") && this.movementCharacter === " ") {this.adjustMovementDAS("");}

    this.checkAndRemoveLines();
    this.timeSinceDown++;
    return false;
  }

  handleControls(input: string) {
    if (input === "q") {
      this.adjustRotationDAS("q");
      if (this.rotationDAS % 3 === 0) {
        this.rotateCounterClockwise();
      }
    } else if (input === "e") {
      this.adjustRotationDAS("e");
      if (this.rotationDAS % 3 === 0) {
        this.rotateClockwise();
      }
    } else if (input === "d") {
      this.adjustMovementDAS("d");
      if (this.movementDAS % 1 === 0 && (this.movementDAS === 0 || this.movementDAS > 6)) {
        this.moveRight();
      }
    } else if (input === "a") {
      this.adjustMovementDAS("a");
      if (this.movementDAS % 1 === 0 && (this.movementDAS === 0 || this.movementDAS > 6)) {
        this.moveLeft();
      }
    } else if (input === "k") {
      this.adjustMovementDAS("k");
      if (this.movementDAS % 1 === 0) {
        this.movePieceDown();
      }
    } else if (input === " ") {
      this.adjustMovementDAS(" ");
      if (this.movementDAS > 1) {
        this.movePieceDown();
        while (JSON.stringify(this.currentPiece) !== JSON.stringify(this.getTypeSpawn(this.currentPiece.type))) {
          this.movePieceDown();
        }
        this.movementDAS = 0;
      }
    } else if (input === "j") {
      if (!this.swapped){
        this.swapped = true;
        let type = this.heldPiece;
        this.heldPiece = this.currentPiece.type;
        this.removeCurrentPiece();
        if (type === ""){
          this.dequeuePiece(false);
          this.drawCurrentPiece();
        } else {
          this.currentPiece = this.getTypeSpawn(type);
        }
      }
    }
  }

  adjustRotationDAS(character: string) {
    if (this.rotationCharacter === character) {
      this.rotationDAS++;
    } else {
      this.rotationCharacter = character;
      this.rotationDAS = 0;
    }
  }

  adjustMovementDAS(character: string) {
    if (this.movementCharacter === character) {
      this.movementDAS++;
    } else {
      this.movementCharacter = character;
      this.movementDAS = 0;
    }
  }

  rotateCounterClockwise() {
    this.removeCurrentPiece();
    // Do stuff here to adjust currentPiece
    let values = JSON.parse(JSON.stringify(this.currentPiece.squares));
    switch (this.currentPiece.type) {
      case "t":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x++; values[0].y++;
            values[1].x--; values[1].y++;
            values[2].x--; values[2].y--; break;
          case 1:
            values[0].x--; values[0].y++;
            values[1].x--; values[1].y--;
            values[2].x++; values[2].y--; break;
          case 2:
            values[0].x--; values[0].y--;
            values[1].x++; values[1].y--;
            values[2].x++; values[2].y++; break;
          case 3:
            values[0].x++; values[0].y--;
            values[1].x++; values[1].y++;
            values[2].x--; values[2].y++; break;
        }
        break;
      case "i":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x += 1; values[0].y += 2;
            values[1].y += 1;
            values[2].x -= 1;
            values[3].x -= 2; values[3].y -= 1; break;
          case 1:
            values[0].x -= 2; values[0].y += 1;
            values[1].x -= 1;
            values[2].y -= 1;
            values[3].x += 1; values[3].y -= 2; break;
          case 2:
            values[0].x -= 1; values[0].y -= 2;
            values[1].y -= 1;
            values[2].x += 1;
            values[3].x += 2; values[3].y += 1; break;
          case 3:
            values[0].x += 2; values[0].y -= 1;
            values[1].x += 1;
            values[2].y += 1;
            values[3].x -= 1; values[3].y += 2; break;
        }
        break;
      case "j":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x--; values[0].y--;
            values[1].x++; values[1].y++;
            values[2].y+=2; break;
          case 1:
            values[0].x++; values[0].y--;
            values[1].x--; values[1].y++;
            values[2].x-=2; break;
          case 2:
            values[0].x++; values[0].y++;
            values[1].x--; values[1].y--;
            values[2].y-=2; break;
          case 3:
            values[0].x--; values[0].y++;
            values[1].x++; values[1].y--;
            values[2].x+=2; break;
        }
        break;
      case "l":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x++; values[0].y++;
            values[1].x-=2;
            values[2].x--; values[2].y--; break;
          case 1:
            values[0].x--; values[0].y++;
            values[1].y-=2;
            values[2].x++; values[2].y--; break;
          case 2:
            values[0].x--; values[0].y--;
            values[1].x+=2;
            values[2].x++; values[2].y++; break;
          case 3:
            values[0].x++; values[0].y--;
            values[1].y+=2;
            values[2].x--; values[2].y++; break;
        }
        break;
      case "s":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x++; values[0].y++;
            values[1].x--; values[1].y++;
            values[2].x-=2;  break;
          case 1:
            values[0].x--; values[0].y++;
            values[1].x--; values[1].y--;
            values[2].y-=2;  break;
          case 2:
            values[0].x--; values[0].y--;
            values[1].x++; values[1].y--;
            values[2].x+=2;  break;
          case 3:
            values[0].x++; values[0].y--;
            values[1].x++; values[1].y++;
            values[2].y+=2;  break;
        }
        break;
      case "z":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x--; values[0].y--;
            values[1].y+=2; 
            values[2].x--; values[2].y++; break;
          case 1:
            values[0].x++; values[0].y--;
            values[1].x-=2; 
            values[2].x--; values[2].y--; break;
          case 2:
            values[0].x++; values[0].y++;
            values[1].y-=2; 
            values[2].x++; values[2].y--; break;
          case 3:
            values[0].x--; values[0].y++;
            values[1].x+=2; 
            values[2].x++; values[2].y++; break;
        }
        break;
      default: break; // Contains "o" type
    }

    if (this.checkValidity(values)) {
      this.currentPiece.squares = values;
    } else { 
      for (let i = 0; i < 4; i++){ // Right kick
        values[i].x++;
      }
      if (this.checkValidity(values)){
        this.currentPiece.squares = values;
      } else {
        for (let i = 0; i < 4; i++) { // Left kick
          values[i].x-=2;
        }
        if (this.checkValidity(values)) {
          this.currentPiece.squares = values;
        } else { return; }
      }
    }

    let newRotation = this.currentPiece.rotation - 1;
    if (newRotation < 0) { newRotation += 4; }
    this.currentPiece.rotation = newRotation;
    this.drawCurrentPiece();
  }

  rotateClockwise() {
    this.removeCurrentPiece();
    // Do stuff here to adjust currentPiece
    let values = JSON.parse(JSON.stringify(this.currentPiece.squares));
    switch (this.currentPiece.type) {
      case "t":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x++; values[0].y--;
            values[1].x++; values[1].y++;
            values[2].x--; values[2].y++; break;
          case 1:
            values[0].x++; values[0].y++;
            values[1].x--; values[1].y++;
            values[2].x--; values[2].y--; break;
          case 2:
            values[0].x--; values[0].y++;
            values[1].x--; values[1].y--;
            values[2].x++; values[2].y--; break;
          case 3:
            values[0].x--; values[0].y--;
            values[1].x++; values[1].y--;
            values[2].x++; values[2].y++; break;
        }
        break;
      case "i":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x += 2; values[0].y -= 1;
            values[1].x += 1;
            values[2].y += 1;
            values[3].x -= 1; values[3].y += 2; break;
          case 1:
            values[0].x += 1; values[0].y += 2;
            values[1].y += 1;
            values[2].x -= 1;
            values[3].x -= 2; values[3].y -= 1; break;
          case 2:
            values[0].x -= 2; values[0].y += 1;
            values[1].x -= 1;
            values[2].y -= 1;
            values[3].x += 1; values[3].y -= 2; break;
          case 3:
            values[0].x -= 1; values[0].y -= 2;
            values[1].y -= 1;
            values[2].x += 1;
            values[3].x += 2; values[3].y += 1; break;
        }
        break;
      case "j":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x--; values[0].y++;
            values[1].x++; values[1].y--;
            values[2].x += 2; break;
          case 1:
            values[0].x--; values[0].y--;
            values[1].x++; values[1].y++;
            values[2].y += 2; break;
          case 2:
            values[0].x++; values[0].y--;
            values[1].x--; values[1].y++;
            values[2].x -= 2; break;
          case 3:
            values[0].x++; values[0].y++;
            values[1].x--; values[1].y--;
            values[2].y -= 2; break;
        }
        break;
      case "l":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x++; values[0].y--;
            values[1].y += 2;
            values[2].x--; values[2].y++; break;
          case 1:
            values[0].x++; values[0].y++;
            values[1].x -= 2;
            values[2].x--; values[2].y--; break;
          case 2:
            values[0].x--; values[0].y++;
            values[1].y -= 2;
            values[2].x++; values[2].y--; break;
          case 3:
            values[0].x--; values[0].y--;
            values[1].x += 2;
            values[2].x++; values[2].y++; break;
        }
        break;
      case "s":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x++; values[0].y--;
            values[1].x++; values[1].y++;
            values[2].y += 2; break;
          case 1:
            values[0].x++; values[0].y++;
            values[1].x--; values[1].y++;
            values[2].x -= 2; break;
          case 2:
            values[0].x--; values[0].y++;
            values[1].x--; values[1].y--;
            values[2].y -= 2; break;
          case 3:
            values[0].x--; values[0].y--;
            values[1].x++; values[1].y--;
            values[2].x += 2; break;
        }
        break;
      case "z":
        switch (this.currentPiece.rotation) {
          case 0:
            values[0].x--; values[0].y++;
            values[1].x += 2;
            values[2].x++; values[2].y++; break;
          case 1:
            values[0].x--; values[0].y--;
            values[1].y += 2;
            values[2].x--; values[2].y++; break;
          case 2:
            values[0].x++; values[0].y--;
            values[1].x -= 2;
            values[2].x--; values[2].y--; break;
          case 3:
            values[0].x++; values[0].y++;
            values[1].y -= 2;
            values[2].x++; values[2].y--; break;
        }
        break;
      default: break; // Contains "o" type
    }

    if (this.checkValidity(values)) {
      this.currentPiece.squares = values;
    } else {
      for (let i = 0; i < 4; i++) { // Right kick
        values[i].x++;
      }
      if (this.checkValidity(values)) {
        this.currentPiece.squares = values;
      } else {
        for (let i = 0; i < 4; i++) { // Left kick
          values[i].x -= 2;
        }
        if (this.checkValidity(values)) {
          this.currentPiece.squares = values;
        } else { return; }
      }
    }

    this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;
    this.drawCurrentPiece();
  }

  checkValidity(squares: Tetrimino["squares"]): boolean {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].x < 0 || squares[i].x > 9 || squares[i].y < 0 || squares[i].y > 19 || this.board[squares[i].y][squares[i].x] !== "") {
        return false;
      }
    }
    return true;
  }

  moveLeft() {
    this.removeCurrentPiece();
    for (let i = 0; i < 4; i++) {
      if (this.currentPiece.squares[i].x <= 0 || this.board[this.currentPiece.squares[i].y][this.currentPiece.squares[i].x - 1]) {
        this.drawCurrentPiece();
        return;
      }
    }
    for (let i = 0; i < 4; i++) {
      this.currentPiece.squares[i].x--;
    }
    this.drawCurrentPiece();
  }

  moveRight() {
    this.removeCurrentPiece();
    for (let i = 0; i < 4; i++) {
      if (this.currentPiece.squares[i].x >= 9 || this.board[this.currentPiece.squares[i].y][this.currentPiece.squares[i].x + 1]) {
        this.drawCurrentPiece();
        return;
      }
    }
    for (let i = 0; i < 4; i++) {
      this.currentPiece.squares[i].x++;
    }
    this.drawCurrentPiece();
  }

  movePieceDown() {
    this.removeCurrentPiece();
    for (let i = 0; i < 4; i++) {
      // Ensure all spaces inside the current piece are not currently filled.
      if (this.currentPiece.squares[i].y >= 19 || this.board[this.currentPiece.squares[i].y + 1][this.currentPiece.squares[i].x] !== '') {
        this.drawCurrentPiece();
        this.resetCurrentPiece();
        this.dequeuePiece();
        this.swapped = false;
        for (let j = 0; j < 4; j++) {
          if (this.board[this.currentPiece.squares[j].y][this.currentPiece.squares[j].x] !== "") {
            throw new Error("Piece overlaps, game is over");
          }
        }
        this.drawCurrentPiece();
        return;
      }
    }
    for (let i = 0; i < 4; i++) {
      this.currentPiece.squares[i].y++;
    }
    this.drawCurrentPiece();
    this.timeSinceDown = 0;
  }

  checkAndRemoveLines() {
    this.removeCurrentPiece();
    let lines = 0;
    for (let i = 0; i < this.board.length; i++) {
      let completed = true;
      for (let j = 0; j < this.board[i].length; j++) {
        if (this.board[i][j] === "") {
          completed = false;
          break;
        }
      }
      if (completed) {
        this.board.splice(i, 1);
        this.board.unshift(['', '', '', '', '', '', '', '', '', '']);
        i--;
        lines++;
      }
    }
    switch (lines) {
      case 1: this.score += 40 * (this.level + 1); break;
      case 2: this.score += 100 * (this.level + 1); break;
      case 3: this.score += 300 * (this.level + 1); break;
      case 4: this.score += 1200 * (this.level + 1); break;
      default: break;
    }
    this.completedLines += lines;

    let calculatedLevel = Math.floor(this.completedLines / 10);
    if (calculatedLevel > this.level) { this.level = calculatedLevel; }
    this.drawCurrentPiece();
  }

  getTickSpeed(level: number): number {
    if (level >= 29) { return 1; }
    if (level >= 19) { return 2; }
    if (level === 18) { return 3; }
    if (level >= 15) { return 5; }
    if (level >= 10) { return 6; }
    if (level >= 9) { return 8; }
    if (level >= 8) { return 10; }
    if (level >= 7) { return 15; }
    if (level >= 5) { return 20; }
    if (level >= 2) { return 30; }
    if (level >= 1) { return 40; }
    return 60;
  }

  getTypeSpawn(type: string): Tetrimino {
    switch (type) {
      case "t": return { color: 'p', type: 't', rotation: 0, squares: [{ x: 4, y: 1 }, { x: 5, y: 0 }, { x: 6, y: 1 }, { x: 5, y: 1 }] };
      case "i": return { color: 'c', type: 'i', rotation: 0, squares: [{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }] };
      case "j": return { color: 'b', type: 'j', rotation: 0, squares: [{ x: 6, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 0 }, { x: 5, y: 1 }] };
      case "l": return { color: 'o', type: 'l', rotation: 0, squares: [{ x: 4, y: 1 }, { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 5, y: 1 }] };
      case "s": return { color: 'g', type: 's', rotation: 0, squares: [{ x: 4, y: 1 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 5, y: 1 }] };
      case "z": return { color: 'r', type: 'z', rotation: 0, squares: [{ x: 6, y: 1 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1 }] };
      case "o": return { color: 'y', type: 'o', rotation: 0, squares: [{ x: 4, y: 0 }, { x: 5, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 1 }] };
      default: return { color: 'x', type: 'x', rotation: -1, squares: [{ x: -1, y: -1 }, { x: -1, y: -1 }, { x: -1, y: -1 }, { x: -1, y: -1 }] };
    }
  }
}

type Tetrimino = {
  color: string,
  type: string,
  squares: Array<{ x: number, y: number }>
  rotation: number
}

export default TetrisGame;