import { vec3, type Vec3 } from "wgpu-matrix";
import Mesh from "../mesh";
import type { PipelineType } from "../../render/pipeline-manager";

export class TagComponent {
    public name: string;
    constructor(name: string) {
        this.name = name;
    }
}
export class IDComponent {
    public id: string;
    constructor(id: string) {
        this.id = id;
    }
}

export class TransformComponent {
    public position: Vec3;
    public rotation: Vec3;
    public scale: Vec3;

    constructor() {
        this.position = vec3.zero();
        this.rotation = vec3.zero();
        this.scale = vec3.create(1, 1, 1);
    }

    public setPosition(x: number, y: number, z: number) {
        this.position = vec3.create(x, y, z);
        return this;
    }
    public setRotation(x: number, y: number, z: number) {
        this.rotation = vec3.create(x, y, z);
        return this;
    }
    public setScaleScalar(scale: number) {
        this.scale = vec3.create(scale, scale, scale);
        return this;
    }
    public setScale(x: number, y: number, z: number) {
        this.scale = vec3.create(x, y, z);
        return this;
    }


}

export class MaterialComponent {
    public pipelineType: PipelineType;
    public uniforms?: any; // You can make this more specific based on your needs
    public texture?: GPUTexture;

    constructor(pipelineType: PipelineType, uniforms?: any, texture?: GPUTexture) {
        this.pipelineType = pipelineType;
        this.uniforms = uniforms;
        this.texture = texture;
    }
}

export class MeshComponent {
    public mesh: Mesh;

    constructor(mesh: Mesh) {
        this.mesh = mesh;
    }

    public setMesh(mesh: Mesh): void {
        this.mesh = mesh;
    }
}