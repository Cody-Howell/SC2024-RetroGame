import React from 'react';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div id="App">
        <header>
          <h1>Asteroids</h1>
        </header>
        <Asteroids />
      </div>
    );
  }
}

class Asteroids extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
    };
  }

  componentDidMount() {
    let current = document.querySelector('#game');
    this.setState({ width: current.offsetWidth, height: current.offsetHeight });
  }

  logKey = (event) => {
    console.log(event.key);
  }

  render() {
    console.log(this.state);
    return(
      <div id='game' onKeyDownCapture={this.logKey} tabIndex={0}>

      </div>
    )
  }
}

export default App;
