# rgti2023-24
main.js: This is the entry point of the game. It sets up the game loop and handles high-level game logic.

input.js: This file handles user input. It listens for key presses and updates the player car's state accordingly.

playerCar.js: This file defines the player car. It includes its model, position, and movement logic.

trafficCar.js: This file defines a traffic car. It includes its model, position, and movement logic.

collision.js: This file handles collision detection. It checks if the player car has collided with any traffic cars.

score.js: This file handles the game score. It keeps track of how long the player has been driving and updates the score accordingly.

renderer.js: This file handles rendering the game scene. It uses the WebGPU API to draw the player car and traffic cars.

sound.js: This file handles sound effects. It plays sound effects when the player dodges a car or when a collision occurs.