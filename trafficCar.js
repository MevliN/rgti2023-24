import { getInput } from './input.js';

let trafficCar = {
    position: { x: 0, y: 0, z: 2 },
    speed: 1,
    lane: 1,
};

const lanes = [-1, 0, 1];

export function createTrafficCar() {
    // Here you would load the car's model and initialize any other properties
    return trafficCar;
}

export function updateTrafficCars(trafficCars, deltaTime) {
    const input = getInput();

    if (input.a && trafficCar.lane > 0) {
        trafficCar.lane--;
    }

    if (input.d && trafficCar.lane < 2) {
        trafficCar.lane++;
    }

    trafficCar.position.x = lanes[trafficCar.lane];

    trafficCar.position.z += trafficCar.speed * deltaTime;
}