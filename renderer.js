import { vertexShaderCode, fragmentShaderCode } from './shaders.js';
import { getViewMatrix, getProjectionMatrix, getModelMatrix } from './matrix.js';
import * as glMatrix from "./esm/index.js"

let mat4 = glMatrix.mat4;

let device, pipeline, uniformBuffer, playerCarBuffer, trafficCarBuffer, canvas, context, swapChain;

canvas = document.querySelector('canvas');
console.log('Canvas element type:', canvas.constructor.name);
context = canvas.getContext('webgpu');

async function initializePipeline() {
    const vertexShaderModule = device.createShaderModule({ code: vertexShaderCode });
    const fragmentShaderModule = device.createShaderModule({ code: fragmentShaderCode });

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                },
            },
        ],
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
    });

    pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module: vertexShaderModule,
            entryPoint: 'vertex_main',
            buffers: [{
                arrayStride: 20,
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x3',
                }, {
                    shaderLocation: 1,
                    offset: 12,
                    format: 'float32x2',
                }],
            }],
        },
        fragment: {
            module: fragmentShaderModule,
            entryPoint: 'fragment_main',
            targets: [{
                format: 'bgra8unorm',
            }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });
}

async function initializeCarBuffer(carData) {
    if (!(carData instanceof Array || carData instanceof ArrayBuffer || carData instanceof TypedArray)) {
        console.error('carData must be an array, ArrayBuffer, or TypedArray');
        return;
    }

    if (!(carData instanceof Float32Array)) {
        carData = new Float32Array(carData);
    }

    console.log('Initializing car buffer with size:', carData.byteLength, 'and length:', carData.length);


    const carBuffer = device.createBuffer({
        size: carData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    new Float32Array(carBuffer.getMappedRange()).set(carData);
    carBuffer.unmap();
    return carBuffer;
}

export async function initializeDevice(playerCarModel, trafficCarModels) {
    if (!navigator.gpu) {
        console.log('WebGPU is not supported');
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.log('Failed to get GPU adapter');
        return;
    }

    device = await adapter.requestDevice();
    if (!device) {
        console.log('Failed to get GPU device');
        return;
    }

    if (!context) {
        console.log('Failed to get GPU context');
        return;
    }

    swapChain = context.configure({
        device: device,
        format: 'bgra8unorm',
    });

    uniformBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    await initializePipeline();
    console.log('Initializing device with trafficCarModels:', trafficCarModels);
    playerCarBuffer = await initializeCarBuffer(playerCarModel);
    trafficCarBuffer = await initializeCarBuffer(trafficCarModels);
}

export function render(playerCar, trafficCars, camera) {
    if (!device || !context) {
        console.log('GPU device or context is not initialized');
        return;
    }

    const currentTexture = context.getCurrentTexture();
    if (!currentTexture) {
        console.log('Failed to get current texture');
        return;
    }

    let currentTextureView;
    try {
        currentTextureView = currentTexture.createView();
    } catch (error) {
        console.error('Failed to create texture view:', error);
        return;
    }

    if (!currentTextureView) {
        console.log('Texture view is undefined');
        return;
    }

    const renderPassDescriptor = {
        colorAttachments: [{
            view: currentTextureView,
            loadValue: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store',
        }],
    };

    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, playerCarBuffer);

    let viewMatrix = getViewMatrix(camera);
    let projectionMatrix = getProjectionMatrix(camera);

    let modelMatrix = getModelMatrix(playerCar);
    let playerCarMvpMatrix = mat4.create();
    mat4.multiply(playerCarMvpMatrix, projectionMatrix, viewMatrix);
    mat4.multiply(playerCarMvpMatrix, playerCarMvpMatrix, modelMatrix);
    const playerCarMvpMatrixFloat32 = new Float32Array(playerCarMvpMatrix);

    device.queue.writeBuffer(uniformBuffer, 0, playerCarMvpMatrixFloat32.buffer);

    renderPass.setBindGroup(0, device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    }));

    renderPass.draw(playerCar.model.length / 5);

    renderPass.setVertexBuffer(0, trafficCarBuffer);
    
    for (const trafficCar of trafficCars) {

        trafficCar.position = [camera.position[0], camera.position[1], camera.position[2] - 10];

        modelMatrix = getModelMatrix(trafficCar);
        let trafficCarMvpMatrix = mat4.create();
        mat4.multiply(trafficCarMvpMatrix, projectionMatrix, viewMatrix);
        mat4.multiply(trafficCarMvpMatrix, trafficCarMvpMatrix, modelMatrix);
        const trafficCarMvpMatrixFloat32 = new Float32Array(trafficCarMvpMatrix);

        device.queue.writeBuffer(uniformBuffer, 0, trafficCarMvpMatrixFloat32.buffer);

        renderPass.setBindGroup(0, device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
        }));

        renderPass.draw(trafficCar.model.length / 5);
    }

    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}