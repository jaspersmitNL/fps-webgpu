import { initializeContext } from "./engine/core/context";
import { MaterialComponent, MeshComponent, TransformComponent } from "./engine/core/ecs";
import { Keyboard } from "./engine/core/keyboard";
import Mesh from "./engine/core/mesh";
import Scene from "./engine/core/scene";
import Renderer from "./engine/render/renderer";

async function main() {


    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
    canvas.width = 1080;
    canvas.height = 720;
    Keyboard.initialize();

    const context = await initializeContext(canvas)
    const renderer = new Renderer(context);
    const scene = new Scene();




    const mesh = Mesh.create(context, [
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0],
        [0, 1, 2]
    );




    {
        let testEntity = scene.addEntity("test");
        testEntity.addComponent(new MeshComponent(mesh));
        testEntity.addComponent(new MaterialComponent('basic_mesh'));

        testEntity.getComponent(TransformComponent)!
            .setScaleScalar(0.5)
            .setPosition(-0.5, 0, 0);
    }

    {
        let testEntity2 = scene.addEntity("test2");
        testEntity2.addComponent(new MeshComponent(mesh));
        testEntity2.addComponent(new MaterialComponent('basic_mesh'));

        testEntity2.getComponent(TransformComponent)!
            .setScaleScalar(0.5)
            .setPosition(0.5, 0, 0);
    }

    let lastTime = 0;
    const loop = () => {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        scene.update(renderer, deltaTime);
        lastTime = currentTime;

        requestAnimationFrame(loop);
    }

    loop();

}

main().catch((err) => {
    console.error('Error:', err);
});