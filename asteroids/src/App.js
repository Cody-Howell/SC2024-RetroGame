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
      pressedKeys: new Set(),
      animationTriggered: false,
      position: { x: 0, y: 0 }
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

  triggerAnimation = (x, y) => {
    this.setState({
      animationTriggered: true,
      position: { x, y }
    });

    setTimeout(() => {
      this.setState({ animationTriggered: false });
    }, 1000); 
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
    this.setState({ game: startedGame, position: {x: 0, y: 0} });
    const TICKS_PER_SECOND = 20;
    this.timer = setInterval(() => this.updateGame(), 1000 / TICKS_PER_SECOND);
  }

  stopGame = (died) => {
    let updatedGame = this.state.game;
    updatedGame.stopGame();
    if (died) {
      updatedGame.player.x = updatedGame.player.y = 0;
    }
    this.setState({ game: updatedGame, character: "" });
    clearInterval(this.timer);
  }

  updateGame = () => {
    let updatedGame = this.state.game;
    let alive = updatedGame.gameTick(this.state.pressedKeys);
    if (!alive) {
      let coordinates = [updatedGame.player.x, updatedGame.player.y];
      this.stopGame(true);
      // Ending animation
      this.triggerAnimation(coordinates[0], coordinates[1]);
      // Play ending transition, not sure how it will work yet. Update state to wherever
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
        <div id='infoArea'>
          <p>Developed by <a href='https://codyhowell.dev'>Cody Howell</a></p>
          <p>Use WASD and Spacebar</p>
          <p>Score: {this.state.game.score} | Asteroids: {game.asteroids.length}</p>
          {game.started ? (<p id='stopGame' onClick={this.stopGame}>Stop Game</p>) : (<p id='startGame' onClick={this.startGame}>Start Game</p>)}
        </div>
        <GameObject class={"player"} object={game.player} character={"player"} />
        {asteroids}
        {bullets}

        <div
          className={`animated-element ${this.state.animationTriggered ? 'animate' : ''}`}
          style={{ top: this.state.position.y, left: this.state.position.x }}
        />
        
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
