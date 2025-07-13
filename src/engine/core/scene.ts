import Renderer from "../render/renderer";
import type { Camera } from "./camera";
import { ECS, IDComponent, MeshComponent, TagComponent, TransformComponent, MaterialComponent } from "./ecs";
import Entity from "./entity";

export default class Scene {

    public _ecs: ECS;
    public camera: Camera;

    constructor(camera: Camera) {
        this._ecs = new ECS();
        this.camera = camera;
    }


    addEntity(tag: string): Entity {
        const entity = new Entity(this._ecs.createEntity(), this);
        entity.addComponent(new IDComponent(crypto.randomUUID()));
        entity.addComponent(new TagComponent(tag));
        entity.addComponent(new TransformComponent());
        return entity;
    }

    getEntity(handle: number): Entity | undefined {
        return new Entity(handle, this);
    }



    update(renderer: Renderer, deltaTime: number): void {

        this.camera.update(deltaTime);


        renderer.clear([0, 0, 0, 1]);


        this.getEntity(0)!.getComponent(TransformComponent)!.position[1] = Math.sin(Date.now() / 1000) * 0.5 + 0.5;


        this.getEntity(0)!.getComponent(TransformComponent)!.rotation[2] += 0.01;



        // Render entities with both mesh and material components
        for (const [, [transform, mesh, material]] of this._ecs.view(TransformComponent, MeshComponent, MaterialComponent)) {

            renderer.renderMesh(this, transform, mesh, material);

        }


    }
}