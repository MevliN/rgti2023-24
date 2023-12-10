import { getInput } from './input.js';

let playerCar = {
    position: { x: 0, y: 0, z: 0 },
    speed: 1,
    lane: 1,
    targetPosition: 0,
    laneChangeSpeed: 2,
};

const lanes = [-1, 0, 1];
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

export function createPlayerCar() {
    // Here you would load the car's model and initialize any other properties
    playerCar.targetPosition = lanes[playerCar.lane];
    return playerCar;
}

export function updatePlayerCar(deltaTime) {
    const input = getInput();

    if (input.a && playerCar.lane > 0) {
        playerCar.lane--;
        playerCar.targetPosition = lanes[playerCar.lane];
    }

    if (input.d && playerCar.lane < 2) {
        playerCar.lane++;
        playerCar.targetPosition = lanes[playerCar.lane];
    }

    playerCar.position.x = lerp(playerCar.position.x, playerCar.targetPosition, playerCar.laneChangeSpeed * deltaTime);

    playerCar.position.z += playerCar.speed * deltaTime;
}