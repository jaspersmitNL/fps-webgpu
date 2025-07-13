struct Uniforms {
  // model, view, projection
  proj: mat4x4f,
  view: mat4x4f,
}

struct Vertex {
  @location(0) position: vec3f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) rawPosition: vec3f,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(vertex: Vertex) -> VertexOutput {
  var output: VertexOutput;

  // model, view, projection

  output.position = uniforms.proj * uniforms.view  * vec4(vertex.position, 1.0);
  output.rawPosition = vertex.position;
  return output;  
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
  return vec4(in.rawPosition * 0.5 + 0.5, 1.0);
}