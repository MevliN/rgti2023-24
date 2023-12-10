const canvas = document.getElementById('myCanvas');
canvas.width = 960;
canvas.height = 960;

const context = canvas.getContext('webgpu');

let matrix = mat4.create();
let angle = 0;

let device, swapChain, vertexBuffer, uniformBuffer, bindGroupLayout, bindGroup, pipelineLayout;

const vertices = new Float32Array([
    1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, -1.0,
    1.0, -1.0, -1.0
]);

function createBuffers() {
    vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
    vertexBuffer.unmap();

    uniformBuffer = device.createBuffer({
        size: matrix.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
}

async function fetchShader(url) {
    const response = await fetch(url);
    return await response.text();
}

async function setupWebGPU() {

    if (!navigator.gpu) {
        console.log('WebGPU is not supported. Make sure you are on a supported platform and have the flag enabled.');
        return;
    }

    const context = canvas.getContext('webgpu');

    const adapter = await navigator.gpu.requestAdapter();
    device = await adapter.requestDevice();

    createBuffers();

    // Configure the context for the swapChain
    context.configure({
        device: device,
        format: 'bgra8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    bindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: 'uniform' },
        }],
    });

    bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer },
        }],
    });

    try {

    pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });

    const vertexShaderCode = /*wgsl*/`[[stage(vertex)]]
    fn main([[builtin(vertex_index)]] VertexIndex : u32) -> [[builtin(position)]] vec4<f32> {
        var pos : array<vec2<f32>, 3> = array<vec2<f32>, 3>(
            vec2<f32>(0.0, 0.5),
            vec2<f32>(-0.5, -0.5),
            vec2<f32>(0.5, -0.5));
        return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    }`;

    const fragmentShaderCode = /*wgsl*/`[[stage(fragment)]]
    fn main() -> [[builtin(frag_color)]] vec4<f32> {
        return vec4<f32>(1.0, 0.0, 0.0, 1.0);
    }`;

    let vertexShaderModule, fragmentShaderModule;

    try {
        vertexShaderModule = device.createShaderModule({ code: vertexShaderCode });
        fragmentShaderModule = device.createShaderModule({ code: fragmentShaderCode });
        console.log('WGSL is supported!');
    } catch (e) {
        console.log('Failed to create shader module:', error);
    }

    renderPipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module: vertexShaderModule,
            entryPoint: 'main',
        },
        fragment: {
            module: fragmentShaderModule,
            entryPoint: 'main',
            targets: [
              { format: 'bgra8unorm' },
            ],
        },
        primitive: {
          topology: 'triangle-list',
        },
    });
} catch (e) {
    console.error(e.stack);
}

    render();
}

function render() {
    if (!device) {
        console.log('Device is not initialized');
        return;
    }

    mat4.identity(matrix);
    mat4.rotate(matrix, matrix, angle, [1, 0, 0]); // Rotate around x-axis
    mat4.rotate(matrix, matrix, angle, [0, 1, 0]); // Rotate around y-axis
    mat4.rotate(matrix, matrix, angle, [0, 0, 1]); // Rotate around z-axis
    angle += 0.01;

    device.queue.writeBuffer(uniformBuffer, 0, matrix.buffer);

    const textureView = context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();

    const renderPassDescriptor = {
    colorAttachments: [{
        view: textureView,
        loadValue: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
        }],
    };

    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

    renderPass.setPipeline(renderPipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(12, 1, 0, 0);

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
}

setupWebGPU();