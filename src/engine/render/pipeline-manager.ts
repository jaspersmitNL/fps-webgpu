import { mat4 } from "wgpu-matrix";
import type Context from "../core/context";
import basicMeshShaderCode from "./shaders/basic_mesh.wgsl?raw";
import type Scene from "../core/scene";
import type { TransformComponent } from "../core/ecs";

export const PipelineType = {
    BASIC_MESH: 'basic_mesh',
} as const;

export type PipelineType = typeof PipelineType[keyof typeof PipelineType];


class Pipeline {
    public type: PipelineType;
    public pipeline: GPURenderPipeline;
    public uniformBuffer: GPUBuffer;
    public bindGroup: GPUBindGroup;

    constructor(type: PipelineType, pipeline: GPURenderPipeline, uniformBuffer: GPUBuffer, bindGroup: GPUBindGroup) {
        this.type = type;
        this.pipeline = pipeline;
        this.uniformBuffer = uniformBuffer;
        this.bindGroup = bindGroup;
    }



    uploadUniforms(context: Context, scene: Scene, transform: TransformComponent) {
        switch (this.type) {
            case PipelineType.BASIC_MESH:
                this.uploadBassicMeshUniforms(context, scene, transform);
                break;
            default:
                throw new Error(`Pipeline type ${this.type} not implemented for uploadUniforms`);

        }
    }

    private uploadBassicMeshUniforms(context: Context, scene: Scene, transform: TransformComponent) {
        let projection = mat4.perspective(
            Math.PI / 4, // 45 degrees
            context.canvas.width / context.canvas.height,
            0.1, // near plane
            1000 // far plane
        );
        let view = scene.camera.getViewMatrix();
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
        context.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            mvp.buffer,
            0,
            mvp.byteLength
        );


    }


}

// type Pipeline = {
//     type: PipelineType;
//     pipeline: GPURenderPipeline;

// };

export default class PipelineManager {
    private context: Context;
    private pipelines: Map<PipelineType, Pipeline> = new Map();

    constructor(context: Context) {
        this.context = context;
        this.initializePipelines();
    }

    private initializePipelines() {
        // Basic mesh pipeline
        this.pipelines.set(PipelineType.BASIC_MESH, this.createBasicMeshPipeline());

    }

    private createBasicMeshPipeline(): Pipeline {


        const vertexModule = this.context.device.createShaderModule({ code: basicMeshShaderCode });
        const fragmentModule = this.context.device.createShaderModule({ code: basicMeshShaderCode });

        let pipeline = this.context.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: vertexModule,
                entryPoint: 'vs_main',
                buffers: [{
                    arrayStride: 3 * 4, // 3 floats * 4 bytes
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3'
                    }]
                }]
            },
            fragment: {
                module: fragmentModule,
                entryPoint: 'fs_main',
                targets: [{
                    format: this.context.format
                }]
            },
            primitive: {
                topology: 'triangle-list',
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            }
        });


        const uniformBuffer = this.context.device.createBuffer({
            size: (4 * 4 * 4) * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const bindGroup = this.context.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer
                }
            }]
        });

        return new Pipeline(PipelineType.BASIC_MESH, pipeline, uniformBuffer, bindGroup);


    }

    getPipeline(type: PipelineType): Pipeline {
        const pipeline = this.pipelines.get(type);
        if (!pipeline) {
            throw new Error(`Pipeline ${type} not found`);
        }
        return pipeline;
    }

    // Method to add custom pipelines at runtime
    addPipeline(type: PipelineType, pipeline: Pipeline) {
        this.pipelines.set(type, pipeline);
    }
}
