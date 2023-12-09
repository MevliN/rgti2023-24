// Get the canvas and set its size
const canvas = document.getElementById('myCanvas');
canvas.width = 512;
canvas.height = 512;

// Get a WebGPU context
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
    // Create the vertex buffer
    vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
    vertexBuffer.unmap();

    // Create the uniform buffer
    uniformBuffer = device.createBuffer({
        size: 64,
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



    pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });

    const vertexShaderCode = await fetchShader('vertexShader.wgsl');
    const fragmentShaderCode = await fetchShader('fragmentShader.wgsl');

    const vertexShaderModule = device.createShaderModule({ code: vertexShaderCode });
    const fragmentShaderModule = device.createShaderModule({ code: fragmentShaderCode });

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