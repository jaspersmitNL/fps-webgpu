struct Uniforms {
  proj : mat4x4f,
  transform : mat4x4f,
}

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) VertexIndex: u32) -> @builtin(position) vec4f {
  var positions = array<vec3f, 3>(
    vec3(0.0, 0.5, 0.0),
    vec3(-0.5, -0.5, 0.0),
    vec3(0.5, -0.5, 0.0)
  );

  var pos = positions[VertexIndex];

  return uniforms.proj * uniforms.transform * vec4f(pos, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4f {
  return vec4(1.0, 0.0, 0.0, 1.0);
}