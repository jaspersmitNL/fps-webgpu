struct Uniforms_std140_0
{
    @align(16) rotation_0 : f32,
};

struct GlobalParams_std140_0
{
    @align(16) uniforms_0 : Uniforms_std140_0,
};

@binding(0) @group(0) var<uniform> globalParams_0 : GlobalParams_std140_0;
struct VertexOutput_0
{
    @builtin(position) position_0 : vec4<f32>,
    @location(0) color_0 : vec3<f32>,
};

struct vertexInput_0
{
    @location(0) position_1 : vec4<f32>,
    @location(1) color_1 : vec3<f32>,
};

@vertex
fn vs_main( _S1 : vertexInput_0) -> VertexOutput_0
{
    var output_0 : VertexOutput_0;
    output_0.position_0 = vec4<f32>(_S1.position_1.xy, vec2<f32>(1.0f));
    var _S2 : f32 = _S1.position_1.x;
    var _S3 : f32 = _S1.position_1.y;
    output_0.position_0[i32(0)] = _S2 * cos(globalParams_0.uniforms_0.rotation_0) - _S3 * sin(globalParams_0.uniforms_0.rotation_0);
    output_0.position_0[i32(1)] = _S2 * sin(globalParams_0.uniforms_0.rotation_0) + _S3 * cos(globalParams_0.uniforms_0.rotation_0);
    output_0.color_0 = _S1.color_1;
    return output_0;
}

struct FragmentOutput_0
{
    @location(0) color_2 : vec4<f32>,
};

struct pixelInput_0
{
    @location(0) color_3 : vec3<f32>,
};

@fragment
fn fs_main( _S4 : pixelInput_0, @builtin(position) position_2 : vec4<f32>) -> FragmentOutput_0
{
    var output_1 : FragmentOutput_0;
    output_1.color_2 = vec4<f32>(_S4.color_3, 1.0f);
    return output_1;
}

