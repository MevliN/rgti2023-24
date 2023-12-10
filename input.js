let keys = {
    'a': false,
    'd': false
};

window.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'd') {
        keys[event.key.toLowerCase()] = true;
    }
});

window.addEventListener('keyup', function(event) {
    if (event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'd') {
        keys[event.key.toLowerCase()] = false;
    }
});

export function getInput() {
    return keys;
}