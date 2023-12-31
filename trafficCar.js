import { loadModel } from './modelLoader.js';

class TrafficCar {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.position = { x: this.lane * 2 - 2, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.speed = 1;
        this.model = null;
        this.loadAndSetModel('models/trafficCar/1.obj');
    }

    async initialize() {
        await this.loadAndSetModel('models/trafficCar/1.obj');
    }

    async loadAndSetModel(url) {
        const model = await loadModel(url);
        this.model = model.vertices;
    }

    update() {
        this.position.x = this.lane * 2 - 2;
        this.position.z -= this.speed;
    }
}

export default TrafficCar;