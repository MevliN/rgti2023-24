import PlayerCar from './playerCar.js';
import TrafficCar from './trafficCar.js';
import { getInput } from './input.js';
import { render, initializeDevice } from './renderer.js';
import { handleCollision } from './collision.js';
import { updateScore } from './score.js';

export let playerCar = new PlayerCar();

let trafficCars = [];

function addTrafficCar() {
    let trafficCar = new TrafficCar();
    trafficCars.push(trafficCar);

    let nextInterval = Math.random() * 3000 + 1000;
    setTimeout(addTrafficCar, nextInterval);
}

function updateGame() {
    let keys = getInput();

    playerCar.update(keys);

    for (let trafficCar of trafficCars) {
        trafficCar.update();
    }

    handleCollision(playerCar, trafficCars);

    trafficCars = trafficCars.filter(trafficCar => {
        trafficCar.update();
        return trafficCar.z < camera.z;
    });

    updateScore();

    render(playerCar, trafficCars);

    requestAnimationFrame(updateGame);
}

async function setupGame() {
    await playerCar.initialize();
    addTrafficCar();
    await trafficCars[0].initialize();
    await initializeDevice(playerCar.model, trafficCars.map(car => car.model));
    updateGame();
}

await setupGame();