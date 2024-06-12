import React from 'react';
import './App.css';
import Asteroids from './logic/Asteroids.ts';

class App extends React.Component {
  render() {
    return (
      <div id="App">
        <header>
          <h1>Asteroids</h1>
        </header>
        <ReactAsteroids />
      </div>
    );
  }
}

class ReactAsteroids extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: new Asteroids(),
      pressedKeys: new Set()
    };
    this.divRef = React.createRef();
  }

  componentDidMount() {
    let current = document.querySelector('#game');
    let game = new Asteroids(current.offsetHeight, current.offsetWidth);
    this.setState({ game: game });

    this.divRef.current.addEventListener('keydown', this.handleKeyDown);
    this.divRef.current.addEventListener('keyup', this.handleKeyUp);
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

  startGame = () => {
    let startedGame = this.state.game;
    startedGame.startGame();
    this.setState({ game: startedGame });
    const TICKS_PER_SECOND = 20;
    this.timer = setInterval(() => this.updateGame(), 1000 / TICKS_PER_SECOND);
  }

  stopGame = () => {
    let updatedGame = this.state.game;
    updatedGame.stopGame();
    this.setState({ game: updatedGame, character: "" });
    clearInterval(this.timer);
  }

  updateGame = () => {
    let updatedGame = this.state.game;
    let alive = updatedGame.gameTick(this.state.pressedKeys);
    if (!alive) {
      this.stopGame();
      return;
    }
    this.setState({ game: updatedGame, character: "" });
  }

  render() {
    let game = this.state.game;
    let asteroids = [];
    for (let i = 0; i < game.asteroids.length; i++) {
      asteroids.push(<GameObject class={"asteroid"} object={game.asteroids[i]} character={""} key={i + "asteroid"}/>)
    }
    let bullets = [];
    for (let i = 0; i < game.bullets.length; i++) {
      bullets.push(<GameObject class={"bullet"} object={game.bullets[i]} character={""} key={i + "bullet"}/>)
    }
    return(
      <div id='game' ref={this.divRef} tabIndex={0}>
        <p id='score'>Score: {this.state.game.score}</p>
        {game.started ? (<p id='stopGame' onClick={this.stopGame}>Stop Game</p>) : (<p id='startGame' onClick={this.startGame}>Start Game</p>)}
        <GameObject class={"player"} object={game.player} character={"&#11165;"} />
        {asteroids}
        {bullets}
        
      </div>
    )
  }
}

class GameObject extends React.Component {
  render() {
    let style = {};
    if (!isNaN(this.props.object.x)){
      style = {"top": this.props.object.y, "left": this.props.object.x, "transform": `rotate(${this.props.object.orientation}deg)`};
      if (this.props.object.value > 0){
        style["width"] = style["height"] = (this.props.object.value * 15) + "px";
      }
    }
    return(
      <div className={this.props.class} style={style}>
        {this.props.character !== "" && (<span>&#11165;</span>)}
      </div>
    )
  }
}

export default App;
