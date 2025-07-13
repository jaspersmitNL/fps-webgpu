import type Context from "./context";

export default class Mesh {
    public vertexBuffer: GPUBuffer;
    public indexBuffer: GPUBuffer;
    public vertexCount: number;

    public vertices: Float32Array;
    public indices: Uint32Array;

    constructor(context: Context, vertices: Float32Array, indices: Uint32Array) {
        this.vertexCount = indices.length;
        this.vertices = vertices;
        this.indices = indices;


        this.vertexBuffer = context.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.indexBuffer = context.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });

        // Upload vertex data
        context.device.queue.writeBuffer(this.vertexBuffer, 0, vertices);
        // Upload index data
        context.device.queue.writeBuffer(this.indexBuffer, 0, indices);

    }
    static create(context: Context, vertices: number[], indices: number[]): Mesh {
        return new Mesh(context, new Float32Array(vertices), new Uint32Array(indices));
    }
}