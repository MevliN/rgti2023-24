import { mat4, vec3 } from './gl-matrix.js';

export function getModelMatrix(model) {
    const matrix = mat4.create();
    mat4.translate(matrix, matrix, vec3.fromValues(model.position.x, model.position.y, model.position.z));
    mat4.rotateX(matrix, matrix, model.rotation.x);
    mat4.rotateY(matrix, matrix, model.rotation.y);
    mat4.rotateZ(matrix, matrix, model.rotation.z);
    mat4.scale(matrix, matrix, vec3.fromValues(model.scale.x, model.scale.y, model.scale.z));
    return matrix;
}

export function getViewMatrix(camera) {
    const matrix = mat4.create();
    mat4.lookAt(matrix, vec3.fromValues(camera.x, camera.y, camera.z), vec3.fromValues(camera.targetX, camera.targetY, camera.targetZ), vec3.fromValues(0, 1, 0));
    return matrix;
}

export function getProjectionMatrix(camera) {
    const matrix = mat4.create();
    mat4.perspective(matrix, camera.fieldOfView, camera.aspectRatio, camera.near, camera.far);
    return matrix;
}