export function detectCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
           car1.x + car1.width > car2.x &&
           car1.y < car2.y + car2.height &&
           car1.y + car1.height > car2.y;
}

export function handleCollision(playerCar, trafficCars) {
    for (let i = 0; i < trafficCars.length; i++) {
        if (detectCollision(playerCar, trafficCars[i])) {
            console.log('Collision detected between player car and traffic car', i);

            playerCar.speed = 0;
            trafficCars[i].speed = 0;
            console.log('Game over!');
            break;
        } else if (playerCar.y + playerCar.height < trafficCars[i].y) {
            increaseScore();
        }
    }
}