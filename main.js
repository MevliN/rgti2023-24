// main.js

import { setupWebGPU, render } from './webgpu.js';

async function main() {
    const { device, swapChain, swapChainFormat } = await setupWebGPU();
    render({ device, swapChain, swapChainFormat });
}

main();