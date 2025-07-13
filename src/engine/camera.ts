import { type Vec3, type Mat4, vec3, mat4 } from "wgpu-matrix";
import { Keyboard } from "./keyboard";

export class Camera {
    public position: Vec3;
    public rotation: Vec3;
    public forward: Vec3;
    public up: Vec3;
    public right: Vec3;

    private moveSpeed = 10;
    private rotateSpeed = Math.PI / 1.5;

    constructor() {
        this.position = vec3.create(0, 0, 10);
        this.rotation = vec3.create(0, 0, 0);
        this.forward = vec3.create(0, 0, -1);
        this.up = vec3.create(0, 1, 0);
        this.right = vec3.create(1, 0, 0);
    }
    public update(deltaTime: number) {
        const moveAmount = this.moveSpeed * deltaTime;
        const rotateAmount = this.rotateSpeed * deltaTime;

        if (Keyboard.isKeyDown("w")) this.position = vec3.add(this.position, vec3.scale(this.forward, moveAmount));
        if (Keyboard.isKeyDown("s")) this.position = vec3.subtract(this.position, vec3.scale(this.forward, moveAmount));
        if (Keyboard.isKeyDown("a")) this.position = vec3.subtract(this.position, vec3.scale(this.right, moveAmount));
        if (Keyboard.isKeyDown("d")) this.position = vec3.add(this.position, vec3.scale(this.right, moveAmount));
        if (Keyboard.isKeyDown("q")) this.position = vec3.subtract(this.position, vec3.scale(this.up, moveAmount));
        if (Keyboard.isKeyDown("e")) this.position = vec3.add(this.position, vec3.scale(this.up, moveAmount));

        if (Keyboard.isKeyDown("shift")) this.position = vec3.add(this.position, vec3.scale(this.up, moveAmount));
        if (Keyboard.isKeyDown("control")) this.position = vec3.subtract(this.position, vec3.scale(this.up, moveAmount));


        if (Keyboard.isKeyDown("arrowleft")) this.rotation[1] -= rotateAmount;
        if (Keyboard.isKeyDown("arrowright")) this.rotation[1] += rotateAmount;
        if (Keyboard.isKeyDown("arrowup")) this.rotation[0] -= rotateAmount;
        if (Keyboard.isKeyDown("arrowdown")) this.rotation[0] += rotateAmount;

        // Clamp pitch (rotation[0]) to prevent flipping
        const pitchLimit = 1.55; // ~89 degrees in radians
        this.rotation[0] = Math.max(-pitchLimit, Math.min(pitchLimit, this.rotation[0]));

        this.updateDirectionVectors();
    }



    private updateDirectionVectors() {
        const pitch = this.rotation[0];
        const yaw = this.rotation[1];

        this.forward = vec3.normalize(vec3.create(
            Math.cos(pitch) * Math.sin(yaw),
            Math.sin(pitch),
            -Math.cos(pitch) * Math.cos(yaw)
        ));

        this.right = vec3.normalize(vec3.cross(this.forward, vec3.create(0, 1, 0)));
        this.up = vec3.normalize(vec3.cross(this.right, this.forward));
    }

    public setPosition(x: number, y: number, z: number) {
        this.position = vec3.create(x, y, z);
    }

    public getViewMatrix(): Mat4 {
        const target = vec3.add(this.position, this.forward);
        return mat4.lookAt(this.position, target, this.up);
    }
}
