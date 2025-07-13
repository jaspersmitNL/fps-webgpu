import { Camera } from './engine/camera';
import { initializeContext } from './engine/context';
import { Keyboard } from './engine/keyboard';
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

    Keyboard.initialize();

    const context = await initializeContext(canvas);
    const renderer = new Renderer(context);
    await renderer.setup();

    const camera = new Camera();




    renderer.render(camera);


}


main().catch((err) => {
    console.error('Error:', err);
})
