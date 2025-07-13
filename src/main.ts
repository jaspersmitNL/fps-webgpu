import { initializeContext } from './engine/context';
import { Renderer } from './engine/renderer';
import './style.css'


async function main() {
    console.log('hello world');
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
    if (!canvas) {
        throw new Error('Canvas element not found');
    }

    canvas.width = 1080;
    canvas.height = 720;

    const context = await initializeContext(canvas);
    const renderer = new Renderer(context);
    await renderer.setup();




    renderer.render();


}


main().catch((err) => {
    console.error('Error:', err);
})
