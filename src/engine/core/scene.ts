import RAPIER, { RigidBody } from "@dimforge/rapier3d";
import Renderer from "../render/renderer";
import type { Camera } from "./camera";
import { ECS, IDComponent, MeshComponent, TagComponent, TransformComponent, MaterialComponent, RigidBodyComponent, } from "./ecs";
import Entity from "./entity";

export default class Scene {

    public _ecs: ECS;
    public camera: Camera;
    public world: RAPIER.World;

    constructor(camera: Camera,) {
        this._ecs = new ECS();
        this.camera = camera;
        let gravity = { x: 0.0, y: -0.25, z: 0.0 };
        this.world = new RAPIER.World(gravity);
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


    onStart() {


        for (const [entt, [tag, transform, rigidBodyComponent]] of this._ecs.view(TagComponent, TransformComponent, RigidBodyComponent)) {
            console.log(tag.name, transform, rigidBodyComponent);

            let rigidBodyDesc = rigidBodyComponent.type == 'dynamic' ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();

            rigidBodyDesc
                .setTranslation(
                    transform.position[0],
                    transform.position[1],
                    transform.position[2]);
            let rigidBody = this.world.createRigidBody(rigidBodyDesc);
            let mesh = this._ecs.getComponent<MeshComponent>(entt, MeshComponent)
            let colliderDesc: RAPIER.ColliderDesc | null = null;
            if (mesh != null) {
                colliderDesc = RAPIER.ColliderDesc.trimesh(
                    mesh.mesh.vertices,
                    mesh.mesh.indices
                );
                console.log("Mesh collider for mesh", mesh.mesh);
            }

            let collider = this.world.createCollider(colliderDesc!, rigidBody);

            rigidBodyComponent.rigidBodyHandle = rigidBody.handle;
            rigidBodyComponent.coliderHandle = collider.handle;
        }



    }



    update(renderer: Renderer, deltaTime: number): void {

        this.camera.update(deltaTime);
        this.world.step();


        renderer.clear([0, 0, 0, 1]);


        this.getEntity(0)!.getComponent(TransformComponent)!.position[1] = Math.sin(Date.now() / 1000) * 0.5 + 0.5;


        this.getEntity(0)!.getComponent(TransformComponent)!.rotation[2] += 0.01;



        // Render entities with both mesh and material components
        for (const [, [transform, mesh, material]] of this._ecs.view(TransformComponent, MeshComponent, MaterialComponent)) {
            renderer.renderMesh(this, transform, mesh, material);
        }

        this.world.step();


        for (const [_entt, [transform, rigidBodyComponent]] of this._ecs.view(TransformComponent, RigidBodyComponent)) {
            let body = this.world.getRigidBody(rigidBodyComponent.rigidBodyHandle!)!;
            const translation = body.translation();
            transform.setPosition(translation.x, translation.y, translation.z);
        }

    }
}