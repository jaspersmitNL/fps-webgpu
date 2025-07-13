import { mat4 } from "wgpu-matrix";
import type Context from "../core/context";
import type { TransformComponent, MeshComponent, MaterialComponent } from "../core/ecs";
import Scene from "../core/scene";
import PipelineManager, { PipelineType } from "./pipeline-manager";

export default class Renderer {


    private context: Context;
    private commandEncoder?: GPUCommandEncoder;
    private textureView?: GPUTextureView;
    private renderPass?: GPURenderPassEncoder;
    private depthTexture?: GPUTexture;
    private depthTextureView?: GPUTextureView;
    private pipelineManager: PipelineManager;


    constructor(context: Context) {
        this.context = context;
        this.pipelineManager = new PipelineManager(context);
        this.setup();
    }

    setup() {

        this.depthTexture = this.context.device.createTexture({
            size: [this.context.canvas.width, this.context.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.depthTextureView = this.depthTexture!.createView();
    }


    private begin() {
        this.commandEncoder = this.context.device.createCommandEncoder();
        this.textureView = this.context.context.getCurrentTexture().createView();
    }



    clear(clearColor: number[]) {
        this.begin();

        if (!this.commandEncoder || !this.textureView) {
            throw new Error("Render pass or command encoder not initialized");
        }

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: this.textureView,
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: { r: clearColor[0], g: clearColor[1], b: clearColor[2], a: clearColor[3] },
            }],
            depthStencilAttachment: {
                view: this.depthTextureView!,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                depthClearValue: 1.0,
            },
        };

        this.renderPass = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        if (!this.renderPass) {
            throw new Error("Render pass not initialized");
        }
        this.renderPass!.end();
        this.context.device.queue.submit([this.commandEncoder.finish()]);



    }




    renderMesh(transform: TransformComponent, mesh: MeshComponent, material?: MaterialComponent) {
        this.begin();
        if (!this.renderPass) {
            throw new Error("Render pass not initialized");
        }

        if (!this.commandEncoder || !this.textureView) {
            throw new Error("Command encoder or texture view not initialized");
        }



        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: this.textureView,
                loadOp: 'load',
                storeOp: 'store',
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
            }],
            depthStencilAttachment: {
                view: this.depthTextureView!,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
                depthClearValue: 1.0,
            },

        };

        this.renderPass = this.commandEncoder.beginRenderPass(renderPassDescriptor);

        // Determine which pipeline to use
        const pipelineType = material?.pipelineType ?? PipelineType.BASIC_MESH;
        const pipeline = this.pipelineManager.getPipeline(pipelineType);

        // Set the pipeline
        this.renderPass.setPipeline(pipeline.pipeline);
        // Set the bind group
        this.renderPass.setBindGroup(0, pipeline.bindGroup);


        // Set vertex buffer
        this.renderPass.setVertexBuffer(0, mesh.mesh.vertexBuffer);
        this.renderPass.setIndexBuffer(mesh.mesh.indexBuffer, 'uint32');

        // Update uniforms if needed

        let projection = mat4.identity();
        let view = mat4.identity();
        let model = mat4.identity();
        model = mat4.translate(model, transform.position);
        model = mat4.rotateX(model, transform.rotation[0]);
        model = mat4.rotateY(model, transform.rotation[1]);
        model = mat4.rotateZ(model, transform.rotation[2]);
        model = mat4.scale(model, transform.scale);

        let mvp = mat4.multiply(
            mat4.multiply(projection, view),
            model
        );

        // upload mvp
        this.context.device.queue.writeBuffer(
            pipeline.uniformBuffer,
            0,
            mvp.buffer,
            0,
            mvp.byteLength
        );




        // Draw the mesh
        this.renderPass.drawIndexed(mesh.mesh.vertexCount);

        this.renderPass.end();
        this.context.device.queue.submit([this.commandEncoder.finish()]);
    }



}