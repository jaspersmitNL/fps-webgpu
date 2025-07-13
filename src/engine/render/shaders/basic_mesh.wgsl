struct Uniforms {
    mvp: mat4x4<f32>
}
struct VertexOutput {
    @location(0) rawPosition: vec3<f32>,
    @builtin(position) position: vec4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(@location(0) position: vec3<f32>) -> VertexOutput {
    var output: VertexOutput;
    output.rawPosition = position;
    output.position = uniforms.mvp * vec4<f32>(position, 1.0);
    return output;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(in.rawPosition * 0.5 + 0.5, 1.0);
}