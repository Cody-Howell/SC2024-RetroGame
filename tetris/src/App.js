import React from 'react';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div id="App">
        <div id='title'>
          <h1>Tetris</h1>
        </div>
        <Tetris />
      </div>
    );
  }
}

class Tetris extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      game: ""
    }
  }
  render() {
    return(
      <>
      <div id='infoArea'>
        <p>Developed by <a href='https://codyhowell.dev'>Cody Howell</a></p>
        <p>Use AD to move left-right <br/> 
          Use W to rotate clockwise <br/>
          Use S to soft drop <br/>
          Use Spacebar to hard drop</p>
      </div>
      <div id='tetris'>
        <TetrisBoard />
      </div>
      </>
    )
  }
}

class TetrisBoard extends React.Component {
  render() {
    return(
      <div id='tetrisBoard'>

      </div>
    )
  }
}

export default App;
