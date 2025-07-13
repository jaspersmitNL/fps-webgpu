import './style.css'
import shaderCode from './shader.wgsl?raw';
import shaderCode2 from './shader_out.wgsl?raw';
const WIDTH = 1080;
const HEIGHT = 720;

const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.width = WIDTH;
canvas.height = HEIGHT;

let context: GPUCanvasContext | null = null;
let device: GPUDevice | null = null;
let pipeline: GPURenderPipeline | null = null;
let vertexBuffer: GPUBuffer | null = null;
let uniformBuffer: GPUBuffer | null = null;
let bindGroup: GPUBindGroup | null = null;


function render() {
  if (!context || !device) {
    return;
  }

  const encoder = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();


  const rotationData = new Float32Array([-performance.now() / 1000, 0.0, 0.0, 0.0]);
  device.queue.writeBuffer(uniformBuffer!, 0, rotationData.buffer, rotationData.byteOffset, rotationData.byteLength);


  const time = performance.now() / 1000;
  const passDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view,
        clearValue: [0.0, 0.0, (Math.sin(time) * 0.5) + 0.8, 1.0],
        loadOp: 'clear',
        storeOp: 'store'
      }
    ]
  }

  const passEncoder = encoder.beginRenderPass(passDescriptor);
  passEncoder.setPipeline(pipeline!);
  passEncoder.setBindGroup(0, bindGroup!);
  passEncoder.setVertexBuffer(0, vertexBuffer!);
  passEncoder.draw(3, 1, 0, 0);
  passEncoder.end();

  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(render);


}



async function setup() {
  console.log('Hello, World!');

  context = canvas.getContext('webgpu') as GPUCanvasContext;

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error('WebGPU not supported or no adapter found');
  }

  device = await adapter.requestDevice();



  const format = await navigator.gpu.getPreferredCanvasFormat();



  await context.configure({
    device,
    format,
  });

  pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: shaderCode2,
      }),
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: (2 + 3) * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2'
            },
            {
              shaderLocation: 1,
              offset: 2 * 4,
              format: 'float32x3'
            }
          ]
        }
      ]
    },
    fragment: {
      module: device.createShaderModule({
        code: shaderCode2,
      }),
      entryPoint: "fs_main",
      targets: [
        {
          format: format,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list'
    }
  });

  const vertexData = new Float32Array([
    0.0, 0.5, 1.0, 0.0, 0.0,   // Vertex 1 (Red)
    -0.5, -0.5, 0.0, 1.0, 0.0, // Vertex 2 (Green)
    0.5, -0.5, 0.0, 0.0, 1.0  // Vertex 3 (Blue)
  ]);

  vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  });
  uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: { buffer: uniformBuffer }
      }
    ]
  })

  // x, y, r, g, b


  new Float32Array(vertexBuffer.getMappedRange()).set(vertexData);
  vertexBuffer.unmap();



  render();

}


setup();