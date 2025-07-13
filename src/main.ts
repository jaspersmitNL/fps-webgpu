import { Camera } from "./engine/core/camera";
import { initializeContext } from "./engine/core/context";
import { MaterialComponent, MeshComponent, TransformComponent } from "./engine/core/ecs";
import { Keyboard } from "./engine/core/keyboard";
import Mesh from "./engine/core/mesh";
import Scene from "./engine/core/scene";
import Renderer from "./engine/render/renderer";
import { parseOBJ } from "./engine_old/parser/obj";
import monkey from "./monkey.obj?raw";
import plane from "./plane.obj?raw";
import './style.css'
async function main() {


    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    Keyboard.initialize();

    const context = await initializeContext(canvas)
    const renderer = new Renderer(context);
    const camera = new Camera();
    const scene = new Scene(camera);

    window.addEventListener('resize', () => {
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;
        renderer.setup();
    });




    const triangle = Mesh.create(context, [
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0],
        [0, 1, 2]
    );




    {
        let triangleEntity = scene.addEntity("triangle");
        triangleEntity.addComponent(new MeshComponent(triangle));
        triangleEntity.addComponent(new MaterialComponent('basic_mesh'));

        triangleEntity.getComponent(TransformComponent)!
            .setScaleScalar(0.5)
            .setPosition(-0.5, 0.5, 0);
    }

    {
        const monkeyOBJ = parseOBJ(monkey);


        let monkeyEntity = scene.addEntity("monkey");
        monkeyEntity.addComponent(new MeshComponent(Mesh.create(context, monkeyOBJ.vertices.flat(), monkeyOBJ.faces.flatMap((face) => face.vertexIndices))));
        monkeyEntity.addComponent(new MaterialComponent('basic_mesh'));

        monkeyEntity.getComponent(TransformComponent)!
            .setScaleScalar(0.5)
            .setPosition(0.5, 0.8, 0);
    }

    {
        const planeOBJ = parseOBJ(plane);


        let planeEntity = scene.addEntity("plane");
        planeEntity.addComponent(new MeshComponent(Mesh.create(context, planeOBJ.vertices.flat(), planeOBJ.faces.flatMap((face) => face.vertexIndices))));
        planeEntity.addComponent(new MaterialComponent('basic_mesh'));

        planeEntity.getComponent(TransformComponent)!
            .setScaleScalar(2w)
            .setPosition(0, 0, 0);
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