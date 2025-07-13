import type { Context } from "./context";
import basicShaderCode from './basic.wgsl?raw';
import monkeyObj from './monkey.obj?raw';

import { mat4 } from 'wgpu-matrix';
import { parseOBJ } from "./parser/obj";
import type { Camera } from "./camera";





export class Renderer {

    private context: Context;
    private lastTime = 0;
    private pipeline?: GPURenderPipeline;
    private depthTexture?: GPUTexture;
    private depthTextureView?: GPUTextureView;
    private uniformBuffer?: GPUBuffer;
    private bindGroup?: GPUBindGroup;
    private vertexBuffer?: GPUBuffer;
    private indexBuffer?: GPUBuffer;
    private vertexCount?: number;


    public constructor(context: Context) {
        this.context = context;
    }

    public async setup(): Promise<void> {

        console.log(this.context.device)



        const shader = this.context.device.createShaderModule({
            code: basicShaderCode,
        });

        this.pipeline = this.context.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shader,
                entryPoint: 'vs_main',
                buffers: [
                    {
                        arrayStride: 12, // 3 floats * 4 bytes each
                        attributes: [
                            {
                                format: 'float32x3',
                                offset: 0,
                                shaderLocation: 0, // position attribute
                            },
                        ],
                    }
                ]
            },
            fragment: {
                module: shader,
                entryPoint: 'fs_main',
                targets: [{
                    format: this.context.format,
                }],
            },
            primitive: {
                topology: 'triangle-list',
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            }
        });

        this.depthTexture = this.context.device.createTexture({
            size: [this.context.canvas.width, this.context.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.depthTextureView = this.depthTexture!.createView();



        this.uniformBuffer = this.context.device.createBuffer({
            size: 64 * 2, // 64 bytes for mat4x4f * 2 (projection and transform)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.bindGroup = this.context.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer!,
                    },
                },
            ],
        });



        let obj = parseOBJ(monkeyObj);


        let vertsFlat = obj.vertices.flat();
        let positions = new Float32Array(vertsFlat);


        let _indices: number[] = [];
        for (let i = 0; i < obj.faces.length; i++) {
            const face = obj.faces[i];
            if (face.vertexIndices.length === 3) {
                _indices.push(face.vertexIndices[0], face.vertexIndices[1], face.vertexIndices[2]);
            }
        }

        let indices = new Uint32Array(_indices);





        this.vertexCount = indices.length;






        this.vertexBuffer = this.context.device.createBuffer({
            size: positions.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(positions);
        this.vertexBuffer.unmap();




        this.indexBuffer = this.context.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(this.indexBuffer.getMappedRange()).set(indices);
        this.indexBuffer.unmap();



    }



    render(camera: Camera, time = 0) {
        if (!this.lastTime) this.lastTime = time;
        const deltaTime = (time - this.lastTime) / 1000; // seconds
        this.lastTime = time;

        const commandEncoder = this.context.device.createCommandEncoder();
        const textureView = this.context.context.getCurrentTexture().createView();

        camera.update(deltaTime);

        const fov = 60 * Math.PI / 180;
        const aspect = this.context.canvas.width / this.context.canvas.height;
        const near = 0.1;
        const far = 1000;
        const perspective = mat4.perspective(fov, aspect, near, far);

        const combined = new Float32Array(32); // 2 mat4's
        combined.set(perspective, 0);
        combined.set(camera.getViewMatrix(), 16);

        this.context.device.queue.writeBuffer(
            this.uniformBuffer!, 0, combined.buffer, 0, combined.byteLength
        );

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
            }],
            depthStencilAttachment: {
                view: this.depthTextureView!,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        if (!this.pipeline) {
            throw new Error('Pipeline not set up');
        }
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.bindGroup!);
        passEncoder.setVertexBuffer(0, this.vertexBuffer!);
        passEncoder.setIndexBuffer(this.indexBuffer!, 'uint32');
        passEncoder.drawIndexed(this.vertexCount!, 1, 0, 0, 0);
        passEncoder.end();
        this.context.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame((newTime) => this.render(camera, newTime));
    }



}