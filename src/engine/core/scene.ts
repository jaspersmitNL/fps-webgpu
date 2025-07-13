import Renderer from "../render/renderer";
import { ECS, IDComponent, MeshComponent, TagComponent, TransformComponent, MaterialComponent } from "./ecs";
import Entity from "./entity";

export default class Scene {

    public _ecs: ECS;

    constructor() {
        this._ecs = new ECS();
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


        renderer.beginScene(this);

        {
            var entt = this.getEntity(0);
            if (entt) {
                const transform = entt.getComponent(TransformComponent)!;
                const mesh = entt.getComponent(MeshComponent)!;
                const material = entt.getComponent(MaterialComponent)!;
                renderer.renderMesh(transform, mesh, material);
            }
        }

        {
            var entt = this.getEntity(1);
            if (entt) {
                const transform = entt.getComponent(TransformComponent)!;
                const mesh = entt.getComponent(MeshComponent)!;
                const material = entt.getComponent(MaterialComponent)!;
                renderer.renderMesh(transform, mesh, material);
            }
        }



        // // Render entities with both mesh and material components
        // for (const [, [transform, mesh, material]] of this._ecs.view(TransformComponent, MeshComponent, MaterialComponent)) {

        //     renderer.renderMesh(transform, mesh, material);

        // }
        renderer.endScene(this);


    }
}