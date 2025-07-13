import RAPIER from "@dimforge/rapier3d";
import { Camera } from "./engine/core/camera";
import { initializeContext } from "./engine/core/context";
import { MaterialComponent, MeshComponent, RigidBodyComponent, TransformComponent } from "./engine/core/ecs";
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
            .setPosition(-2.5, 0.5, 0);
    }

    {
        const monkeyOBJ = parseOBJ(monkey);


        let monkeyEntity = scene.addEntity("monkey");
        monkeyEntity.addComponent(new MeshComponent(Mesh.create(context, monkeyOBJ.vertices.flat(), monkeyOBJ.faces.flatMap((face) => face.vertexIndices))));
        monkeyEntity.addComponent(new MaterialComponent('basic_mesh'));

        monkeyEntity.getComponent(TransformComponent)!
            .setPosition(0.2, 4, 0);

        monkeyEntity.addComponent(new RigidBodyComponent('dynamic'));

    }

    {
        const planeOBJ = parseOBJ(plane);


        let planeEntity = scene.addEntity("plane");
        planeEntity.addComponent(new MeshComponent(Mesh.create(context, planeOBJ.vertices.flat(), planeOBJ.faces.flatMap((face) => face.vertexIndices))));
        planeEntity.addComponent(new MaterialComponent('basic_mesh'));

        planeEntity.getComponent(TransformComponent)!
            .setPosition(0, 0, 0);

        planeEntity.addComponent(new RigidBodyComponent('static'));

    }

    // on pressing 'r' put the monkey back to its original position
    window.addEventListener('keydown', (event) => {
        if (event.key === 'r') {
            const monkeyEntity = scene.getEntity(1);
            if (monkeyEntity) {
                monkeyEntity.getComponent(TransformComponent)!.setPosition(0.2, 4, 0);
                let rigidBodyComponent = monkeyEntity.getComponent(RigidBodyComponent)!;
                let rigidBody = scene.world.getRigidBody(rigidBodyComponent.rigidBodyHandle!)!;

                rigidBody.setTranslation(new RAPIER.Vector3(0.2, 4, 0), true);
                rigidBody.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
                rigidBody.setAngvel(new RAPIER.Vector3(0, 0, 0), true);


            }
        }
    });

    let lastTime = 0;
    const loop = () => {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        scene.update(renderer, deltaTime);
        lastTime = currentTime;






        requestAnimationFrame(loop);
    }


    scene.onStart();

    loop();

}

main().catch((err) => {
    console.error('Error:', err);
});