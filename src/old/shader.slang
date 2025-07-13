
struct VertexOutput
{
    float4 position : SV_Position;
    float3 color;
}

struct VertexStageInput
{
    float4 position : POSITION0;
    float3 color : POSITION1;
};

struct Uniforms
{
    float rotation;
}

uniform Uniforms uniforms;

[shader("vertex")]
VertexOutput vs_main(VertexStageInput input)
{
    VertexOutput output;

    output.position = float4(input.position.xy, 1.0);

    output.position.x = input.position.x * cos(uniforms.rotation) - input.position.y * sin(uniforms.rotation);
    output.position.y = input.position.x * sin(uniforms.rotation) + input.position.y * cos(uniforms.rotation);
    output.color = input.color;

    return output;
}

struct FragmentOutput
{
    float4 color : SV_Target;
}

[shader("fragment")]
FragmentOutput fs_main(VertexOutput input)
{
    FragmentOutput output;
    output.color = float4(input.color, 1.0); // Red color
    return output;
}
