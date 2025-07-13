import type { Context } from "./context";
import basicShaderCode from './basic.wgsl?raw';

import { mat4, vec3 } from 'wgpu-matrix';

export class Renderer {

    private context: Context;
    private pipeline?: GPURenderPipeline;
    private depthTexture?: GPUTexture;
    private depthTextureView?: GPUTextureView;
    private uniformBuffer?: GPUBuffer;
    private bindGroup?: GPUBindGroup;


    public constructor(context: Context) {
        this.context = context;
    }

    public setup(): void {



        const shader = this.context.device.createShaderModule({
            code: basicShaderCode,
        });

        this.pipeline = this.context.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shader,
                entryPoint: 'vs_main',
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




    }


    render() {
        const commandEncoder = this.context.device.createCommandEncoder();
        const textureView = this.context.context.getCurrentTexture().createView();



        const fov = 60 * Math.PI / 180
        const aspect = this.context.canvas.width / this.context.canvas.height;
        const near = 0.1;
        const far = 1000;
        const perspective = mat4.perspective(fov, aspect, near, far);






        let transform = mat4.translate(mat4.identity(), [0, 0, -2]);



        let rotation = mat4.rotateZ(
            mat4.rotateY(mat4.identity(), Math.sin(performance.now() / 1000)),
            performance.now() / 1000 % (2 * Math.PI) - Math.PI / 2
        );

        transform = mat4.multiply(transform, rotation);



        // Combine both matrices into a single Float32Array for one writeBuffer call
        const combined = new Float32Array(32); // 16 floats per mat4, 2 matrices
        combined.set(perspective, 0);
        combined.set(transform, 16);

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
        passEncoder.draw(3, 1, 0, 0);
        passEncoder.end();
        this.context.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(() => this.render());
    }




}