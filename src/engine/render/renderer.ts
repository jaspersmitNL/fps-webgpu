import { mat4 } from "wgpu-matrix";
import type Context from "../core/context";
import type { TransformComponent, MeshComponent, MaterialComponent } from "../core/ecs";
import PipelineManager, { PipelineType } from "./pipeline-manager";
import type Scene from "../core/scene";

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


    setRenderPass(renderPass: GPURenderPassEncoder) {

    }



    renderMesh(scene: Scene, transform: TransformComponent, mesh: MeshComponent, material?: MaterialComponent) {
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



        // Upload uniforms
        pipeline.uploadUniforms(this.context, scene, transform);






        // Draw the mesh
        this.renderPass.drawIndexed(mesh.mesh.vertexCount);

        this.renderPass.end();
        this.context.device.queue.submit([this.commandEncoder.finish()]);
    }



}