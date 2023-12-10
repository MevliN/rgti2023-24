import { mat4 } from 'gl-matrix';
import { vertexShaderCode, fragmentShaderCode } from './shaders.js';
import { getViewMatrix, getProjectionMatrix, getModelMatrix } from './matrix.js';

let device, pipeline, uniformBuffer, playerCarBuffer, trafficCarBuffer, playerCarModel, trafficCarModel;

// Initialize your WebGPU device, pipeline, buffers, and models here...
async function initializePipeline() {
    const vertexShaderModule = device.createShaderModule({ code: vertexShaderCode });
    const fragmentShaderModule = device.createShaderModule({ code: fragmentShaderCode });

    pipeline = device.createRenderPipeline({
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
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        },
    });
}

async function initializePlayerCarBuffer(playerCarData) {
    playerCarBuffer = device.createBuffer({
        size: playerCarData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(playerCarBuffer.getMappedRange()).set(playerCarData);
    playerCarBuffer.unmap();
}

async function initializeTrafficCarBuffer(trafficCarData) {
    trafficCarBuffer = device.createBuffer({
        size: trafficCarData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(trafficCarBuffer.getMappedRange()).set(trafficCarData);
    trafficCarBuffer.unmap();
}

async function initializeDevice(playerCarModel, trafficCarModels) {
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

    uniformBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    await initializePipeline();
    await initializePlayerCarBuffer(playerCarModel);
    await initializeTrafficCarBuffer(trafficCarModels);
}

export function render(playerCar, trafficCars, camera) {
    const renderPassDescriptor = {
        colorAttachments: [{
            attachment: device.getCurrentTexture().createView(),
            loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
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

    renderPass.draw(playerCarModel.length / 5);

    renderPass.setVertexBuffer(0, trafficCarBuffer);
    
    for (const trafficCar of trafficCars) {
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

    renderPass.endPass();

    device.queue.submit([commandEncoder.finish()]);
}