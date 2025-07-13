import type { EntityHandle } from "./ecs";
import Scene from "./scene";



export default class Entity {
    private handle: EntityHandle;
    private scene: Scene;

    constructor(handle: EntityHandle, scene: Scene) {
        this.handle = handle;
        this.scene = scene;
    }

    addComponent<T>(component: T): T {
        this.scene._ecs.addComponent(this.handle, component);
        return component;
    }
    getComponent<T>(componentClass: new (...args: any[]) => T): T | undefined {
        return this.scene._ecs.getComponent(this.handle, componentClass);
    }

    public getHandle(): EntityHandle {
        return this.handle;
    }

    public getScene(): Scene {
        return this.scene;
    }

}