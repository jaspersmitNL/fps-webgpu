export class Context {
    public canvas: HTMLCanvasElement;
    public context: GPUCanvasContext;
    public format: GPUTextureFormat;
    public device: GPUDevice;

    constructor(canvas: HTMLCanvasElement, context: GPUCanvasContext, format: GPUTextureFormat, device: GPUDevice) {
        this.canvas = canvas;
        this.context = context;
        this.format = format;
        this.device = device;
    }
}

export async function initializeContext(canvas: HTMLCanvasElement): Promise<Context> {

    if (!navigator.gpu) {
        throw new Error('WebGPU not supported');
    }

    const context = canvas.getContext('webgpu') as GPUCanvasContext;

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
        throw new Error('No WebGPU adapter found');
    }

    const device = await adapter.requestDevice();


    const format = await navigator.gpu.getPreferredCanvasFormat();

    await context.configure({
        device,
        format,
        alphaMode: 'opaque',
    });

    return new Context(canvas, context, format, device);
}