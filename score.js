let score = 0;

export function updateScore(deltaTime) {
    score += deltaTime;
}

export function getScore() {
    return score;
}

export function resetScore() {
    score = 0;
}

export function increaseScore() {
    score += 10;
}