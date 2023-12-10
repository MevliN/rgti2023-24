import { getInput } from './input.js';
import { loadModel } from './modelLoader.js';

class PlayerCar {

    constructor() {
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.lane = 1;
        this.model = null;
        this.loadModel('models/playerCar/bugatti.obj');
    }

    async initialize() {
        await this.loadAndSetModel('models/playerCar/bugatti.obj');
    }

    async loadAndSetModel(url) {
        const model = await loadModel(url);
        this.model = model.vertices;
    }

    changeLane(direction) {
        if (direction === 'left' && this.lane > 0) {
            this.lane--;
        } else if (direction === 'right' && this.lane < 2) {
            this.lane++;
        }

        this.position.x = this.lane * 2 - 2;
    }

    update() {
        const input = getInput();

        if (input.a) {
            this.changeLane('left');
        }

        if (input.d) {
            this.changeLane('right');
        }
    }
}

export default PlayerCar;