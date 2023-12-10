import { setupInput } from './input.js';
import { createPlayerCar, updatePlayerCar } from './playerCar.js';
import { createTrafficCar, updateTrafficCars } from './trafficCar.js';
import { checkCollisions } from './collision.js';
import { updateScore, getScore } from './score.js';
import { render } from './renderer.js';

let playerCar;
let trafficCars = [];
let lastUpdateTime = Date.now();

function setupGame() {
    setupInput();
    playerCar = createPlayerCar();
    trafficCars.push(createTrafficCar());
}

function updateGame() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000;
    lastUpdateTime = currentTime;

    updatePlayerCar(playerCar, deltaTime);
    updateTrafficCars(trafficCars, deltaTime);
    updateScore(deltaTime);

    if (checkCollisions(playerCar, trafficCars)) {
        endGame();
    }
}

function endGame() {
    console.log('Game over! Your score is: ' + getScore());
}

function gameLoop() {
    updateGame();
    render(playerCar, trafficCars);
    requestAnimationFrame(gameLoop);
}

setupGame();
gameLoop();