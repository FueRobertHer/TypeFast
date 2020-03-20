import Box from "./box";
import LinkedList from './linkedlist';
import Node from './node';

const randomWords = require('random-words');

class Game {
  constructor(c, diff) {
    // initialize board, boxes, speed, music
    this.c = c;
    this.diff = diff
    this.score = document.getElementById("score");
    this.audio = document.getElementById("audio");
    this.input = document.getElementById("user-input");
    this.inputField = document.getElementById("text");
    this.startHeader = document.getElementById("start-header");
    this.startBtn = document.getElementById("start-btn");
    this.highest = document.querySelector("score-board");
    this.highestBoard = document.getElementById("score-broad");
    this.book = []

    this.initializeGame();
    this.animate = this.animate.bind(this);
    this.spawnRandomObject = this.spawnRandomObject.bind(this);
  } 

  initializeGame() {
    this.currentScore = 0;
    this.highScore = parseInt(localStorage.getItem("score")) || 0;
    this.gameOver = true;
    this.spawnY = 0;
    this.spawnRate = 2000; 
    this.spawnRateOfDescent = .8;
    this.lastSpawn = -1;
    this.boxes = new LinkedList();
    this.words = new Map();
    this.startTime = Date.now();
    this.audio.loop = true;
    this.audio.load();
    this.listenToInput();
    this.listenToKey();
    this.fillBook()
  }
  
  // function to start the gamewet
  playGame() {    
    this.startHeader.style.display = "none";
    this.score.style.display = "block";
    this.score.innerText = "Score: 0";
    this.input.style.display = "flex";   
    this.inputField.value = "";   
    this.inputField.focus();                    
    this.audio.play();
    this.gameOver = false;
    this.animate();
  }
    
  keyDown(e) {
    if (e.key === "Enter") this.inputField.value = "";
    if (e.keyCode === 27 && !this.gameOver) this.inputField.value = "";
    if (e.keyCode === 13 && this.gameOver) this.playGame();
  }

  listenToKey() {
    document.addEventListener("keydown", (e) => this.keyDown(e));
  }

  listenToInput() {
    this.input.addEventListener("input", e => {
      const userInput = e.target.value;
      if (this.words.has(userInput)) {
        let node = this.words.get(userInput);
        let box = node.val;

        this.boxes.remove(node);
        this.words.delete(userInput);

        e.target.value = "";
        this.currentScore += Math.floor(userInput.length / 2);
        this.score.innerText = `Score: ${this.currentScore}`;
      }
    })
  }

  fillBook() {
    if (this.book.length < 20) this.book.push(randomWords())
  }

  autoFocus() {
    this.inputField.focus()
  }
  
  animate() {
    if (!this.gameOver) {
      // console.log(this.boxes);
      // console.log(this.words);

      this.autoFocus()
      this.fillBook()
      
      const time = Date.now();
      if (this.currentScore > this.highScore) this.highestBoard.innerText = this.currentScore;
      
      if (time - this.startTime > 60000) {
        this.spawnRateOfDescent += 0.5;
        if (this.spawnRate <= 600) {
          this.spawnRate -= 100;
        } else {
          this.spawnRate -= 600;
        } 
        
        this.startTime = time;
      }
      
      if (time > (this.lastSpawn + this.spawnRate)) {
        this.lastSpawn = time;
        this.spawnRandomObject();
      }
      
      requestAnimationFrame(this.animate);
      
      this.c.clearRect(0, 0, this.c.canvas.width, this.c.canvas.height);
    
      if (this.boxes.size === 0) return;

      this.boxes.reset();
      while (this.boxes.hasNext()) {
        let box = this.boxes.next().val;
        box.y += this.spawnRateOfDescent;
        this.c.beginPath();
        this.c.fillStyle = "#B6FF00";
        this.c.fillText(box.text, box.x, box.y);
        this.c.font = "30px Iceland";
        this.c.closePath();
      }
      
      if (this.boxes.head.val.y >= this.c.canvas.height) this.gameOver = true;
    } else {
        this.startHeader.style.display = "flex";
        // this.startBtn.innerHTML = "<span>Restart Game</span>";

        let highestScore = localStorage.getItem("score");
        highestScore = Math.max(highestScore, this.currentScore);
        localStorage.setItem("score", highestScore);

        this.score.innerText = "";
        this.audio.pause();
        this.initializeGame();
      }
  }

  spawnRandomObject() {
    let word = this.book.shift();
    switch (this.diff) {
      case "Easy":
        while (word.length > 5) word = this.book.shift()
        break;
      case "Medium":
        while (word.length > 7 || word.length < 4) word = this.book.shift()
        break;
      case "Hard":
        while (word.length < 6) word = this.book.shift()
        break;
    }

    let x = Math.random() * 900;

    // console.log(word);
    // console.log(`x:${x}, len: ${this.c.measureText(word).width}`); 
    // console.log(`total width: ${x + this.c.measureText(word).width}`);
    while (x + this.c.measureText(word).width > this.c.canvas.width + 20) {
      // console.log("out of bound");
      x -= 100;
    }

    // console.log(`x:${x}, y:${this.spawnY}`)
    let box = new Box(this.c, x, this.spawnY, word);
    let node = new Node(box);
    this.boxes.insert(node);
    this.words.set(word, node);
  }

}

export default Game;