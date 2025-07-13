import { Context, initializeContext } from "./context";

export class Engine {

    private context?: Context;



    async setup(canvas: HTMLCanvasElement) {
        this.context = await initializeContext(canvas);
        console.log('Engine initialized with context:', this.context);
    }
}