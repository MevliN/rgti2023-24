async function testWGSL() {
    if (!navigator.gpu) {
        console.log('WebGPU is not supported by your browser.');
        return;
    }

    // Create a canvas and get a drawing context
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const context = canvas.getContext('gpupresent');

    // Request a GPU adapter
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    // Create a simple WGSL shader
    const shaderCode = `
        [[stage(vertex)]]
        fn main() -> [[builtin(position)]] vec4<f32> {
            return vec4<f32>(0.0, 0.0, 0.0, 1.0);
        }
    `;

    // Try to create a shader module with the WGSL shader
    try {
        const shaderModule = device.createShaderModule({ code: shaderCode });
        console.log('WGSL is supported!');
    } catch (error) {
        console.log('Failed to create shader module:', error);
    }
}

testWGSL();