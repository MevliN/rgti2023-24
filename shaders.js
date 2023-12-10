export const vertexShaderCode = `
struct VertexInput {
    [[location(0)]] position: vec4<f32>;
    [[location(1)]] uv: vec2<f32>;
};

struct VertexOutput {
    [[builtin(position)]] position: vec4<f32>;
    [[location(0)]] uv: vec2<f32>;
};

[[stage(vertex)]]
fn main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = input.position; // TODO: Apply model-view-projection matrix
    output.uv = input.uv;
    return output;
}
`;

export const fragmentShaderCode = `
[[stage(fragment)]]
fn main([[location(0)]] uv: vec2<f32>) -> [[location(0)]] vec4<f32> {
    return vec4<f32>(uv, 0.0, 1.0); // Color based on UV coordinates
}
`;