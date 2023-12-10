function parseObj(text) {
    const lines = text.split('\n');
    const vertices = [];
    const faces = [];
    const color = [Math.random(), Math.random(), Math.random()];

    for (const line of lines) {
        if (line.startsWith('v ')) {
            const [, x, y, z] = line.split(' ');
            vertices.push([parseFloat(x), parseFloat(y), parseFloat(z)]);
        } else if (line.startsWith('f ')) {
            const [, ...indices] = line.split(' ');
            const face = indices.map(index => {
                const [vertexIndex] = index.split('/');
                return {
                    vertexIndex: parseInt(vertexIndex, 10),
                    color: color
                };
            });
            faces.push(face);
        }
    }

    return { vertices, faces };
}

async function loadModel(url) {
    const response = await fetch(url);
    const text = await response.text();
    return parseObj(text);
}

export { loadModel };