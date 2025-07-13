export type EntityHandle = number;



export class ECS {
    private nextEntityId: EntityHandle;
    private components: Map<string, Map<EntityHandle, any>>;


    constructor() {
        this.nextEntityId = 0;
        this.components = new Map();
    }

    createEntity(): EntityHandle {
        return this.nextEntityId++;
    }


    addComponent<T>(entity: EntityHandle, component: T): T {
        const componentName = this.getComponentName(component);
        console.log(`Adding component ${componentName} to entity ${entity}`);
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map());
        }
        this.components.get(componentName)!.set(entity, component);
        return component;
    }

    getComponent<T>(entity: EntityHandle, componentClass: new (...args: any[]) => T): T | undefined {
        const componentName = componentClass.name;
        return this.components.get(componentName)?.get(entity)
    }


    view<T extends object[]>(...types: { [K in keyof T]: new (...args: any[]) => T[K] }): [EntityHandle, T][] {
        if (types.length === 0) return [];

        const [firstType, ...restTypes] = types;
        const baseMap = this.components.get(firstType.name);
        if (!baseMap) return [];

        return Array.from(baseMap.entries())
            .map(([entity, firstComponent]) => {
                const components = [firstComponent];

                // Check if entity has all required components
                for (const type of restTypes) {
                    const component = this.components.get(type.name)?.get(entity);
                    if (!component) return null;
                    components.push(component);
                }

                return [entity, components as T] as [EntityHandle, T];
            })
            .filter((entry): entry is [EntityHandle, T] => entry !== null);
    }



    private getComponentName(component: any): string {
        return component.constructor.name;
    }

}