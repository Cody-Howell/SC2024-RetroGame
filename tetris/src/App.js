import React from 'react';
import './App.css';
import TetrisGame from './Tetris.ts';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      pieceGen: "randomBag"
    }
  }

  updatePieceGen = (value) => {
    this.setState({pieceGen: value.target.value});
  }

  render() {
    return (
      <div id="App">
        <div id='title'>
          <h1>Tetris</h1>
        </div>
        <div id='infoArea'>
          <p>Developed by <a href='https://codyhowell.dev'>Cody Howell</a></p>
          <p>Use AD to move left-right <br/> 
            Use Q-E to rotate CCW-CW <br/>
            Use K to soft drop <br/>
            Use Spacebar to hard drop (inconsistent)<br/>
            Use J to hold <br/>
            This version of Tetris uses the Super Rotation System and implements wall kicks.</p>
          <label htmlFor='version'>Piece Gen: </label>
          <select id='version' name='version' onChange={this.updatePieceGen}>
            <option value="randomBag">Random Bag</option>
            <option value="7Bag">7-Bag</option>
          </select>
        </div>
        <Tetris pieceGen={this.state.pieceGen}/>
      </div>
    );
  }
}

class Tetris extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      game: new TetrisGame("randomBag"),
      pressedKeys: new Set(),
      level: 0, 
      scores: []
    }
    this.divRef = React.createRef();
  }

  componentDidMount() {
    let game = new TetrisGame(this.props.pieceGen);
    this.setState({ game: game });

    this.divRef.current.addEventListener('keydown', this.handleKeyDown);
    this.divRef.current.addEventListener('keyup', this.handleKeyUp);

    let scores = window.localStorage['tetrisScores'].split(',');
    if (scores){
      this.setState({scores: scores});
    }
  }

  componentWillUnmount() {
    // Remove event listeners when the component unmounts
    this.divRef.current.removeEventListener('keydown', this.handleKeyDown);
    this.divRef.current.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event) => {
    // Prevent default behavior for keys if necessary
    event.preventDefault();

    // Add the key to the set of pressed keys
    this.setState(prevState => {
      let pressedKeys = new Set(prevState.pressedKeys);
      pressedKeys.add(event.key);
      return { pressedKeys };
    });
  }
  
  handleKeyUp = (event) => {
    // Remove the key from the set of pressed keys
    this.setState(prevState => {
      let pressedKeys = new Set(prevState.pressedKeys);
      pressedKeys.delete(event.key);
      return { pressedKeys };
    });
  }
  
  updateLevel = (level) => {
    let updatedGame = this.state.game;
    updatedGame.level = level;
    this.setState({game: updatedGame});
  }

  startGame = () => {
    let startedGame = this.state.game;
    startedGame.startGame(this.props.pieceGen);
    const TICKS_PER_SECOND = 20;
    this.timer = setInterval(() => this.gameTick(), 1000 / TICKS_PER_SECOND);
    this.divRef.current.focus();
    this.setState({game: startedGame});
  }

  stopGame = () => {
    let startedGame = this.state.game;
    console.log(startedGame);
    startedGame.stopGame();
    clearInterval(this.timer);
    this.setState({ game: startedGame });
  }

  gameTick = () => {
    let updatedGame = this.state.game;
    let died = updatedGame.gameTick(this.state.pressedKeys);
    if (died) {
      this.stopGame();
      this.updateScore(this.state.game.score);
    }
    this.setState({game: updatedGame});
  }

  updateScore = (score) => {
    let scores = this.state.scores;
    scores.push(score);
    scores = this.sortAndTruncate(scores);
    this.setState({scores: scores});
    window.localStorage["tetrisScores"] = scores;
  }

  sortAndTruncate = (array) => {
    let newArray = [];
    for (let i = 0; i < 5; i++) {
      let largest = 0;
      for (let j = 1; j < array.length; j++) {
        if (parseInt(array[j]) > parseInt(array[largest])) {
          largest = j;
        }
      }
      if (array[largest] !== undefined && array[largest] !== "") {
        newArray.push(parseInt(array[largest]));
      }
      array.splice(largest, 1);
    }
    return newArray;
  }

  render() {
    // console.log(this.state.pressedKeys);
    return(
      <div id='tetris' ref={this.divRef} tabIndex={0}>
        <TetrisInfo game={this.state.game} scores={this.state.scores} startGame={this.startGame} stopGame={this.stopGame} updateLevel={this.updateLevel}/>
        <TetrisBoard board={this.state.game.board} width={"300"} height={"600"}/>
        <TetrisNext queue={this.state.game.nextPieces} held={this.state.game.heldPiece}/>
      </div>
    )
  }
}

class TetrisInfo extends React.Component {
  emptyLeaderBoard = () => {
    window.localStorage["tetrisScores"] = [];
    window.location.reload();
  }

  render() {
    let numberArray = [];
    for (let i = 0; i < 20; i++){
      numberArray.push(
        <p className={this.props.game.level === i ? ("selected number") : ("number")} onClick={() => this.props.updateLevel(i)} key={i}>{i}</p>
      )
    }
    let leaderBoard = [];
    for (let i = 0; i < this.props.scores.length; i++) {
      leaderBoard.push(<p>{this.props.scores[i]}</p>)
    }
    return(
      <div id='tetrisInfo'>
        <p>Piece Gen: {this.props.game.pieceGen}</p>
        {this.props.game.gameStarted ? (
          <>
            <p>Score: {this.props.game.score}</p>
            <p>Lines: {this.props.game.completedLines}</p>
            <p>Level: {this.props.game.level}</p>
            <button onClick={this.props.stopGame}>Stop Game</button>
            <p>I: {this.props.game.pieceCount.i}</p>
            <p>J: {this.props.game.pieceCount.j}</p>
            <p>L: {this.props.game.pieceCount.l}</p>
            <p>S: {this.props.game.pieceCount.s}</p>
            <p>Z: {this.props.game.pieceCount.z}</p>
            <p>T: {this.props.game.pieceCount.t}</p>
            <p>O: {this.props.game.pieceCount.o}</p>
          </>
        ) : (
          <>
            <h2>Level: </h2>
            <div id='numberArray'>
              {numberArray}
            </div>
            <button onClick={this.props.startGame}>Start Game</button>
            <p>Score: {this.props.game.score}</p>
            <div id='leaderBoard'>
              <h2>Leaderboard</h2>
              {leaderBoard}
              <button onClick={this.emptyLeaderBoard}>Clear Leaderboard</button>
            </div>
          </>
        )}
      </div>
    )
  }
}

class TetrisNext extends React.Component {
  constructor(props){
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    this.ctx = canvas.getContext('2d');
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {this.renderFrame();}
  }

  renderFrame = () => {
    // Clear the canvas
    this.ctx.clearRect(0, 0, 250, 680);

    this.ctx.font = "15px Inter";
    this.ctx.fillStyle = "#000000";
    this.ctx.fillText("Held", 110, 30);

    // Print held item
    this.drawItem(this.props.held, 80, 60);

    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 140, 250, 1);
    this.ctx.fillText("Queue", 102, 160);

    // Print queue
    let queue = this.props.queue;
    if (queue) {
      for (let i = 0; i < queue.length; i++){
        this.drawItem(queue[i], 80, 190 + (i * 85));
      }
    }
  }

  drawItem = (held, x, y) => {
    // Assumes standard is 3-wide, which is 90 px wide, starting at 80 px. 
    switch (held) {
      case "i": 
        this.ctx.fillStyle = returnColor('c');
        this.ctx.fillRect(x-15, y+15, 120, 30);
        break;
      case "o": 
        this.ctx.fillStyle = returnColor('y');
        this.ctx.fillRect(x+15, y, 60, 60);
        break;
      case "t": 
        this.ctx.fillStyle = returnColor('p');
        this.ctx.fillRect(x, y+30, 90, 30);
        this.ctx.fillRect(x+30, y, 30, 30);
        break;
      case "j": 
        this.ctx.fillStyle = returnColor('b');
        this.ctx.fillRect(x, y+30, 90, 30);
        this.ctx.fillRect(x, y, 30, 30);
        break;
      case "l": 
        this.ctx.fillStyle = returnColor('o');
        this.ctx.fillRect(x, y+30, 90, 30);
        this.ctx.fillRect(x+60, y, 30, 30);
        break;
      case "s": 
        this.ctx.fillStyle = returnColor('g');
        this.ctx.fillRect(x+30, y, 60, 30);
        this.ctx.fillRect(x, y+30, 60, 30);
        break;
      case "z": 
        this.ctx.fillStyle = returnColor('r');
        this.ctx.fillRect(x, y, 60, 30);
        this.ctx.fillRect(x+30, y+30, 60, 30);
        break;
      default: break;
    }
  }

  render() {
    // let queueArray = [];
    // if (this.props.queue){
    //   for (let i = 0; i < this.props.queue.length; i++){
    //     queueArray.push(<p>{this.props.queue[i]}</p>)
    //   }
    // }
    return(
      <div id='tetrisNext'>
        <canvas
          id='nextBox'
          ref={this.canvasRef}
          width={250}
          height={680}
          style={{ border: '1px solid black' }}
        />
      </div>
    )
  }
}

class TetrisBoard extends React.Component {
  constructor(props){
    super(props);
    this.canvasRef = React.createRef(); // Create a ref for the canvas
    this.animationFrameId = null; // Keep track of the animation frame
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    this.ctx = canvas.getContext('2d');
    // this.startAnimation();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.renderFrame();
    }
  }

  renderFrame = () => {
    // Clear the canvas
    const { width, height } = this.props;
    this.ctx.clearRect(0, 0, width, height);

    let board = this.props.board;
    if (JSON.stringify(board) === "[]") {return;}
    for (let i = 0; i < board[0].length; i++){
      for (let j = 0; j < board.length; j++){
        if (board[j][i] !== ''){
          this.ctx.fillStyle = returnColor(board[j][i]);
          this.ctx.fillRect(i * 30, j * 30, 30, 30);
        }
      }
    }

    this.ctx.fillStyle = "#00000055";
    for (let i = 0; i < 10; i++){
      this.ctx.fillRect(i*30, 0, 1, height);
    }
    for (let i = 0; i < 20; i++){
      this.ctx.fillRect(0, i*30, width, 1);
    }
  }


  render() {
    return(
      <div id='tetrisBoard'>
        <canvas
          id='gameBoard'
          ref={this.canvasRef} 
          width={this.props.width}
          height={this.props.height}
          style={{ border: '1px solid black' }}
        />
      </div>
    )
  }
}

function returnColor(color) {
  switch (color) {
    case "r": return "#ff0000"; 
    case "o": return "#e88615";
    case "g": return "#00ff00";
    case "b": return "#0000ff";
    case "p": return "#aa00ff";
    case "c": return "#40a2ed";
    case "y": return "#e8cf15";
    default: return "#000000";
  }
}

export default App;
