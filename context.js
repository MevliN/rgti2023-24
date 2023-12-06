// Get a reference to the canvas
const canvas = document.getElementById('myCanvas');

async function setupWebGPU() {
  // Get a reference to the GPU
  const gpu = navigator.gpu;

  // Get an adapter
  const adapter = await gpu.requestAdapter();

  // Get a device
  const device = await adapter.requestDevice();

  // Get a context to the canvas
  const context = canvas.getContext('gpupresent');

  // Create a swap chain
  const swapChain = context.configureSwapChain({
    device: device,
    format: 'bgra8unorm',
  });
}

setupWebGPU();

// Create a render pipeline
const pipeline = device.createRenderPipeline({
    vertex: {
        module: device.createShaderModule({
            code: `
                [[stage(vertex)]] fn main() -> [[builtin(position)]] vec4<f32> {
                    return vec4<f32>(0.0, 0.0, 0.0, 1.0);
                }
            `,
        }),
        entryPoint: 'main',
    },
    fragment: {
        module: device.createShaderModule({
            code: `
                [[stage(fragment)]] fn main() -> [[builtin(fragColor)]] vec4<f32> {
                    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
                }
            `,
        }),
        entryPoint: 'main',
        targets: [
            {
                format: 'bgra8unorm',
            },
        ],
    },
    primitive: {
        topology: 'triangle-list',
    },
});

function render() {
    // Get a command encoder for the GPU
    const commandEncoder = device.createCommandEncoder();

    // Get a render pass descriptor
    const renderPassDescriptor = {
        colorAttachments: [
            {
                view: swapChain.getCurrentTexture().createView(),
                loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                storeOp: 'store',
            },
        ],
    };

    // Get a render pass encoder
    const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    // Set the pipeline
    renderPassEncoder.setPipeline(pipeline);

    // End the render pass
    renderPassEncoder.endPass();

    // Submit the commands to the GPU
    device.queue.submit([commandEncoder.finish()]);

    // Request the next frame
    requestAnimationFrame(render);
}

// Start the render loop
render();