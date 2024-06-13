class Asteroids {
  height: number;
  width: number;
  asteroids: Array<GameObject>;
  bullets: Array<GameObject>;
  player: GameObject;
  score: number;
  started: boolean;
  timeSinceAsteroid: number;
  timeSinceBullet: number;

  constructor(height: number, width: number) {
    this.height = height;
    this.width = width;
    this.score = 0;
    this.asteroids = [];
    this.bullets = [];
    this.started = false;
    this.timeSinceAsteroid = 0;
    this.timeSinceBullet = 0;
    this.player = {
      x: 0,
      y: 0,
      momX: 0,
      momY: 0,
      momRot: 0,
      orientation: 0,
      value: 0
    }
  }

  gameTick(character: Set<string>): boolean {
    for (let char of character) {
      this.handleControls(char);
    }

    // Every 10 ticks see if an asteroid should be spawned after 100 ticks
    if (this.timeSinceAsteroid > 100 &&
      this.timeSinceAsteroid % 10 === 0 &&
      Math.random() < 0.75) {
      this.spawnAsteroid();
    }

    this.player = this.applyMomentum(this.player);
    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i] = this.applyMomentum(this.asteroids[i]);
    }
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].value += 1;
      if (this.bullets[i].value < 0){
        this.bullets[i] = this.applyMomentum(this.bullets[i]);
      } else {
        this.bullets.splice(i, 1);
      }
    }

    this.collideBullets();
    if (this.collidePlayer()) {
      return false;
    }
    this.timeSinceAsteroid += 1;
    this.timeSinceBullet += 1;
    return true;
  }


  handleControls(char: string) {
    const scalar = 0.25;
    const rotation = 10;
    if (char === "d") {
      this.player.orientation = (this.player.orientation + rotation) % 360;
    } else if (char === "a") {
      this.player.orientation = (this.player.orientation - rotation) % 360;
    } else if (char === "w") { // Forwards
      let xMomentum = Math.sin((this.player.orientation) * Math.PI / 180) * scalar;
      let yMomentum = Math.cos((this.player.orientation) * Math.PI / 180) * scalar;
      this.player.momX += xMomentum;
      this.player.momY -= yMomentum;
    } else if (char === "s") { // Backwards
      let xMomentum = Math.sin((this.player.orientation) * Math.PI / 180) * scalar;
      let yMomentum = Math.cos((this.player.orientation) * Math.PI / 180) * scalar;
      this.player.momX -= xMomentum;
      this.player.momY += yMomentum;
    } else if (char === " ") { // Spacebar
      if (this.timeSinceBullet > 10) {
        this.spawnBullet();
      }
    }
  }

  applyMomentum(object: GameObject): GameObject {
    // Updates X and Y and wraps around. 
    object.x = this.wrapAround((object.x + object.momX), this.width);
    object.y = this.wrapAround((object.y + object.momY), this.height);
    object.orientation = this.wrapAround((object.orientation + object.momRot), 360);
    return object;
  }

  wrapAround(current: number, max: number): number {
    if (current < 0) { return max + current; }
    if (current > max) { return current - max; }
    return current;
  }

  collideBullets() {
    // Checks all the bulllets and decides if an asteroid should split
    for (let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      for (let j = 0; j < this.asteroids.length; j++) {
        let asteroid = this.asteroids[j];
        let insideDistance = asteroid.value * 15;
        let actualDistance = Math.sqrt(Math.pow((bullet.x - (asteroid.x + 7.5 * asteroid.value)), 2) + Math.pow((bullet.y - (asteroid.y + 7.5 * asteroid.value)), 2));
        if (actualDistance < insideDistance){
          this.splitAsteroid(i, j);
          this.score += (3 - asteroid.value) * 10;
        }
      }
    }
  }

  collidePlayer(): boolean {
    for (let i = 0; i < this.asteroids.length; i++) {
      let asteroid = this.asteroids[i];
      let insideDistance = asteroid.value * 15;
      let actualDistance = Math.sqrt(Math.pow((this.player.x - (asteroid.x + 2.5 * asteroid.value)), 2) + Math.pow((this.player.y - (asteroid.y + 2.5 * asteroid.value)), 2));
      if (actualDistance < insideDistance) {
        return true;
      }
    }
    // Checks if a player collides with an asteroid
    return false;
  }

  splitAsteroid(bulletIndex: number, asteroidIndex: number) {
    let asteroid = this.asteroids[asteroidIndex];
    this.bullets.splice(bulletIndex, 1);
    this.asteroids.splice(asteroidIndex, 1);

    asteroid.value -= 1;
    if (asteroid.value > 0) {
      let asteroid2 = JSON.parse(JSON.stringify(asteroid));
      this.asteroids.push(asteroid);
      asteroid2.momX += randFloatBetween(-1.5, 1.5);
      asteroid2.momY += randFloatBetween(-1.5, 1.5);
      asteroid2.orientation = randNumberBetween(0, 360);
      asteroid2.momRot = randNumberBetween(-1, 1);
      this.asteroids.push(asteroid2);
    }
  }

  spawnAsteroid() {
    let rand = Math.random();
    let gameObject: GameObject = {
      x: 0,
      y: 0,
      momX: 0,
      momY: 0,
      momRot: randNumberBetween(-1, 2),
      orientation: randNumberBetween(0, 360),
      value: randNumberBetween(2, 4)
    }

    if (rand < 0.25) { // Top
      gameObject.x = randNumberBetween(10, this.width);
      gameObject.momX = randFloatBetween(-2, 2);
      gameObject.momY = randFloatBetween(0, 2);
    } else if (rand < 0.5) { // Left
      gameObject.y = randNumberBetween(20, this.height);
      gameObject.momX = randFloatBetween(0, 2);
      gameObject.momY = randFloatBetween(-2, 2);
    } else if (rand < 0.75) { // Bottom
      gameObject.x = randNumberBetween(20, this.width);
      gameObject.y = this.height;
      gameObject.momX = randFloatBetween(-2, 2);
      gameObject.momY = randFloatBetween(-2, 0);
    } else { // Right
      gameObject.x = this.width;
      gameObject.y = randNumberBetween(20, this.height);
      gameObject.momX = randFloatBetween(-2, 0);
      gameObject.momY = randFloatBetween(-2, 2);
    }

    this.asteroids.push(gameObject);
    this.timeSinceAsteroid = 0;
  }

  spawnBullet() {
    const scalar = 10;
    let bulletObject: GameObject = {
      x: this.player.x + 7,
      y: this.player.y + 10,
      momX: Math.sin((this.player.orientation) * Math.PI / 180) * scalar + this.player.momX / 2,
      momY: -1 * Math.cos((this.player.orientation) * Math.PI / 180) * scalar + this.player.momY / 2,
      momRot: 0,
      orientation: 0,
      value: -150
    }
    this.timeSinceBullet = 0;
    this.bullets.push(bulletObject);
  }

  startGame() {
    this.score = 0;
    this.asteroids = [];
    this.bullets = [];
    this.started = true;
    this.timeSinceAsteroid = 0;
    this.player = {
      x: this.width / 2,
      y: this.height / 2,
      momX: 0,
      momY: 0,
      momRot: 0,
      orientation: 0,
      value: 0
    }
    console.log("Finished Start Game, game state is: " + this.started);
  }

  stopGame() {
    this.started = false;
    this.bullets = [];
    console.log("Finished Stop Game, game state is: " + this.started);
  }

}

type GameObject = {
  x: number,
  y: number,
  momX: number,
  momY: number,
  momRot: number,
  orientation: number,
  value: number
}

/**
 * @param {number} x - Start value
 * @param {number} y - End value
 */
function randNumberBetween(x: number, y: number): number {
  return Math.floor(Math.random() * (y - x)) + x;
}

/**
 * @param {number} x - Start value
 * @param {number} y - End value
 */
function randFloatBetween(x: number, y: number): number {
  return Math.random() * (y - x) + x;
}

export { Asteroids, randNumberBetween };